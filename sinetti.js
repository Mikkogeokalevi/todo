import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA1OgSGhgYgmxDLv7-xkPPsUGCpcxFaI8M",
    authDomain: "geokatkosunnittelija.firebaseapp.com",
    databaseURL: "https://geokatkosunnittelija-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "geokatkosunnittelija",
    storageBucket: "geokatkosunnittelija.appspot.com",
    messagingSenderId: "745498680990",
    appId: "1:745498680990:web:869074eb0f0b72565ca58f"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM-elementit
const kontinNimiInput = document.getElementById('kontinNimi');
const konttiValikko = document.getElementById('konttiValikko'); // UUSI
const lokiOsio = document.getElementById('loki-osio');
const aktiivinenKonttiNimi = document.getElementById('aktiivinenKonttiNimi');
const nykyisetSinetitLista = document.getElementById('nykyisetSinetitLista');
const lisaaEnsimmainenSinettiDiv = document.getElementById('lisaaEnsimmainenSinetti');
const ensimmainenSinetinNumeroInput = document.getElementById('ensimmainenSinetinNumero');
const lisaaEnsimmainenBtn = document.getElementById('lisaaEnsimmainenBtn');
const uusiSinetinNumeroInput = document.getElementById('uusiSinetinNumero');
const suoritaVaihtoBtn = document.getElementById('suoritaVaihtoBtn');
const historiaLista = document.getElementById('historiaLista');
const historiaTemplate = document.getElementById('historia-template');
const tulostaBtn = document.getElementById('tulostaBtn');

// Sovelluksen tila
let currentContainerId = null;
let containerData = { activeSeals: [], log: [] };

const handleContainerSelection = (containerName) => {
    if (!containerName || containerName.trim() === '') return;
    const normalizedId = containerName.trim().toLowerCase().replace(/\s+/g, '-');
    currentContainerId = normalizedId;

    const newUrl = `${window.location.pathname}?kontti=${currentContainerId}`;
    history.pushState({ path: newUrl }, '', newUrl);

    // Piilotetaan valikko ja näytetään loki
    document.querySelector('.kontti-valitsin').classList.add('hidden');
    lokiOsio.classList.remove('hidden');
    
    aktiivinenKonttiNimi.textContent = `Kontti: ${containerName.trim()}`;
    loadContainerData();
};

const loadContainerData = () => {
    const containerRef = ref(database, `sinettiloki/${currentContainerId}`);
    onValue(containerRef, (snapshot) => {
        if (snapshot.exists()) {
            containerData = snapshot.val();
            if (!containerData.activeSeals) containerData.activeSeals = [];
            if (!containerData.log) containerData.log = [];
        } else {
            containerData = { activeSeals: [], log: [] };
        }
        renderAll();
    });
};

const saveState = () => { if (!currentContainerId) return; const containerRef = ref(database, `sinettiloki/${currentContainerId}`); set(containerRef, containerData); };
const renderAll = () => { renderActiveSeals(); renderHistory(); };

const renderActiveSeals = () => {
    nykyisetSinetitLista.innerHTML = '';
    if (containerData.activeSeals.length === 0) {
        nykyisetSinetitLista.innerHTML = '<li>Ei aktiivisia sinettejä.</li>';
        lisaaEnsimmainenSinettiDiv.classList.remove('hidden');
    } else {
        lisaaEnsimmainenSinettiDiv.classList.add('hidden');
        containerData.activeSeals.forEach(seal => {
            const li = document.createElement('li');
            li.textContent = seal;
            nykyisetSinetitLista.appendChild(li);
        });
    }
};

const renderHistory = () => {
    historiaLista.innerHTML = '';
    const sortedLog = [...containerData.log].sort((a, b) => b.id - a.id);
    sortedLog.forEach(logEntry => {
        const clone = historiaTemplate.content.cloneNode(true);
        const item = clone.querySelector('.historia-item');
        item.dataset.id = logEntry.id;
        const date = new Date(logEntry.timestamp);
        const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}\n${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        item.querySelector('.historia-aikaleima').textContent = formattedDate;
        item.querySelector('.poistetut-sinetit').textContent = logEntry.removedSeals.join(', ');
        item.querySelector('.uusi-sinetti').textContent = logEntry.newSeal;
        historiaLista.appendChild(item);
    });
};

// Tapahtumankäsittelijät
kontinNimiInput.addEventListener('change', () => handleContainerSelection(kontinNimiInput.value));
konttiValikko.addEventListener('change', () => handleContainerSelection(konttiValikko.value));

lisaaEnsimmainenBtn.addEventListener('click', () => { const sealNumber = ensimmainenSinetinNumeroInput.value.trim(); if (sealNumber) { containerData.activeSeals.push(sealNumber); ensimmainenSinetinNumeroInput.value = ''; saveState(); } });
suoritaVaihtoBtn.addEventListener('click', () => { const newSeal = uusiSinetinNumeroInput.value.trim(); if (!newSeal) { alert("Anna uuden sinetin numero."); return; } if (containerData.activeSeals.length === 0) { alert("Kontissa ei ole yhtään aktiivista sinettiä, jota poistaa. Lisää ensin sinetti yläpuolelta."); return; } const newLogEntry = { id: Date.now(), timestamp: new Date().toISOString(), removedSeals: [...containerData.activeSeals], newSeal: newSeal }; containerData.log.push(newLogEntry); containerData.activeSeals = [newSeal]; uusiSinetinNumeroInput.value = ''; saveState(); });
tulostaBtn.addEventListener('click', () => { window.print(); });

historiaLista.addEventListener('click', (e) => {
    const entryId = e.target.closest('.historia-item')?.dataset.id;
    if (!entryId) return;
    const entryIndex = containerData.log.findIndex(entry => entry.id == entryId);
    if (entryIndex === -1) return;
    const entry = containerData.log[entryIndex];

    if (e.target.closest('.poista-btn')) {
        if (confirm(`Haluatko varmasti poistaa kirjauksen?\n\nPoistettu: ${entry.removedSeals.join(', ')}\nUusi: ${entry.newSeal}`)) {
            containerData.log.splice(entryIndex, 1);
            saveState();
        }
    }

    if (e.target.closest('.muokkaa-btn')) {
        const newRemoved = prompt("Muokkaa poistettuja sinettejä:", entry.removedSeals.join(', '));
        if (newRemoved === null) return;
        const newSeal = prompt("Muokkaa uutta sinettiä:", entry.newSeal);
        if (newSeal === null) return;
        entry.removedSeals = newRemoved.split(',').map(s => s.trim()).filter(Boolean);
        entry.newSeal = newSeal.trim();
        saveState();
    }
});

// UUSI FUNKTIO: Konttilistan lataaminen
const loadContainerList = () => {
    const containerListRef = ref(database, 'sinettiloki');
    onValue(containerListRef, (snapshot) => {
        konttiValikko.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Valitse kontti...';
        konttiValikko.appendChild(placeholder);

        if (snapshot.exists()) {
            const containers = snapshot.val();
            Object.keys(containers).forEach(containerId => {
                const option = document.createElement('option');
                option.value = containerId;
                option.textContent = containerId.replace(/-/g, ' ');
                konttiValikko.appendChild(option);
            });
        }
    });
};

// Sivun alustus
const initializePage = () => {
    loadContainerList(); // Ladataan lista heti alussa
    const urlParams = new URLSearchParams(window.location.search);
    const containerFromUrl = urlParams.get('kontti');

    if (containerFromUrl) {
        kontinNimiInput.value = containerFromUrl;
        handleContainerSelection(containerFromUrl);
    }
};

initializePage();
