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

// DOM-elementit er
const kontinValitsinDiv = document.querySelector('.kontti-valitsin');
const kontinNimiInput = document.getElementById('kontinNimi');
const konttiValikko = document.getElementById('konttiValikko');
const lokiOsio = document.getElementById('loki-osio');
const aktiivinenKonttiNimi = document.getElementById('aktiivinenKonttiNimi');
const aktiivisetSinetitLista = document.getElementById('aktiivisetSinetitLista');
const uusiSinetinNumeroInput = document.getElementById('uusiSinetinNumero');
const lisaaSinetBtn = document.getElementById('lisaaSinetBtn');
const historiaLista = document.getElementById('historiaLista');
const historiaTemplate = document.getElementById('historia-template');
const tulostaBtn = document.getElementById('tulostaBtn');

// Sovelluksen tila
let currentContainerId = null;
let containerSeals = [];

const parseFinnishDateTime = (str) => { if (!str || str.trim() === '') { return null; } const parts = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s*(\d{1,2}):(\d{1,2})/); if (parts) { return new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5]); } return null; };
const handleContainerSelection = (containerName) => { if (!containerName || containerName.trim() === '') return; const normalizedId = containerName.trim().toLowerCase().replace(/\s+/g, '-'); currentContainerId = normalizedId; const newUrl = `${window.location.pathname}?kontti=${currentContainerId}`; history.pushState({ path: newUrl }, '', newUrl); kontinValitsinDiv.classList.add('hidden'); lokiOsio.classList.remove('hidden'); aktiivinenKonttiNimi.textContent = `Kontti: ${containerName.trim()}`; loadContainerData(); };

// KORJATTU DATAN LATAUSFUNKTIO
const loadContainerData = () => {
    if (!currentContainerId) return;
    const containerRef = ref(database, `sinettiloki/${currentContainerId}`);
    onValue(containerRef, (snapshot) => {
        if (snapshot.exists()) {
            const sealsData = snapshot.child('seals').val();
            containerSeals = sealsData ? Object.values(sealsData) : [];
        } else {
            // Konttia ei ole olemassa, alustetaan se tyhjänä ja tallennetaan.
            containerSeals = [];
            saveState();
        }
        renderAll();
    });
};

const saveState = () => { if (!currentContainerId) return; const dataToSave = {}; containerSeals.forEach(seal => { dataToSave[seal.id] = seal; }); const containerRef = ref(database, `sinettiloki/${currentContainerId}/seals`); set(containerRef, dataToSave); };
const renderAll = () => { const activeSeals = containerSeals.filter(seal => !seal.removedTimestamp); renderActiveSeals(activeSeals); renderHistory(); };

const renderActiveSeals = (activeSeals) => {
    aktiivisetSinetitLista.innerHTML = '';
    if (activeSeals.length === 0) {
        aktiivisetSinetitLista.innerHTML = '<li>Ei aktiivisia sinettejä.</li>';
    } else {
        activeSeals.forEach(seal => {
            const li = document.createElement('li');
            li.textContent = seal.sealNumber;
            aktiivisetSinetitLista.appendChild(li);
        });
    }
};

const renderHistory = () => {
    historiaLista.innerHTML = '';
    const sortedSeals = [...containerSeals].sort((a, b) => new Date(b.addedTimestamp) - new Date(a.addedTimestamp));
    
    sortedSeals.forEach(seal => {
        const clone = historiaTemplate.content.cloneNode(true);
        const item = clone.querySelector('.historia-item');
        item.dataset.id = seal.id;

        const statusSpan = item.querySelector('.sinetin-status');
        if (seal.removedTimestamp) {
            statusSpan.textContent = 'POISTETTU';
            statusSpan.classList.add('poistettu');
        } else {
            statusSpan.textContent = 'AKTIIVINEN';
            statusSpan.classList.remove('poistettu');
        }

        item.querySelector('.sinetin-numero').textContent = seal.sealNumber;
        item.querySelector('.lisatty-aika').textContent = new Date(seal.addedTimestamp).toLocaleString('fi-FI');
        item.querySelector('.poistettu-aika').textContent = seal.removedTimestamp ? new Date(seal.removedTimestamp).toLocaleString('fi-FI') : ' - ';
        
        historiaLista.appendChild(item);
    });
};

kontinNimiInput.addEventListener('change', () => handleContainerSelection(kontinNimiInput.value));
konttiValikko.addEventListener('change', () => handleContainerSelection(konttiValikko.value));

lisaaSinetBtn.addEventListener('click', () => { const newSealNumber = uusiSinetinNumeroInput.value.trim(); if (!newSealNumber) { alert("Anna uuden sinetin numero."); return; } const now = new Date().toISOString(); containerSeals.forEach(seal => { if (!seal.removedTimestamp) { seal.removedTimestamp = now; } }); const newSeal = { id: Date.now(), sealNumber: newSealNumber, addedTimestamp: now, removedTimestamp: null }; containerSeals.push(newSeal); uusiSinetinNumeroInput.value = ''; saveState(); });
tulostaBtn.addEventListener('click', () => window.print());

historiaLista.addEventListener('click', (e) => {
    const sealId = e.target.closest('.historia-item')?.dataset.id;
    if (!sealId) return;
    const sealIndex = containerSeals.findIndex(s => s.id == sealId);
    if (sealIndex === -1) return;
    const seal = containerSeals[sealIndex];

    if (e.target.closest('.poista-btn')) {
        if (confirm(`Haluatko varmasti poistaa sinetin "${seal.sealNumber}" ja kaikki sen tiedot?`)) {
            containerSeals.splice(sealIndex, 1);
            saveState();
        }
    }

    if (e.target.closest('.muokkaa-btn')) {
        const newSealNumber = prompt("Muokkaa sinetin numeroa:", seal.sealNumber);
        if (newSealNumber === null) return;
        const newAddedTimeStr = prompt("Muokkaa lisäysaikaa (muodossa pp.kk.vvvv hh:mm):", new Date(seal.addedTimestamp).toLocaleString('fi-FI'));
        if (newAddedTimeStr === null) return;
        const currentRemovedTimeStr = seal.removedTimestamp ? new Date(seal.removedTimestamp).toLocaleString('fi-FI') : '';
        const newRemovedTimeStr = prompt("Muokkaa poistoaikaa (tyhjä = aktiivinen):", currentRemovedTimeStr);
        if (newRemovedTimeStr === null) return;
        
        const newAddedDate = parseFinnishDateTime(newAddedTimeStr);
        const newRemovedDate = parseFinnishDateTime(newRemovedTimeStr);

        if (newAddedTimeStr.trim() !== '' && !newAddedDate) { alert("Virheellinen lisäysajan muoto. Käytä muotoa pp.kk.vvvv hh:mm"); return; }
        if (newRemovedTimeStr.trim() !== '' && !newRemovedDate) { alert("Virheellinen poistoajan muoto. Käytä muotoa pp.kk.vvvv hh:mm"); return; }

        seal.sealNumber = newSealNumber.trim();
        seal.addedTimestamp = newAddedDate.toISOString();
        seal.removedTimestamp = newRemovedDate ? newRemovedDate.toISOString() : null;
        saveState();
    }
});

const loadContainerList = () => { const containerListRef = ref(database, 'sinettiloki'); onValue(containerListRef, (snapshot) => { konttiValikko.innerHTML = ''; const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Valitse kontti...'; konttiValikko.appendChild(placeholder); if (snapshot.exists()) { const containers = snapshot.val(); Object.keys(containers).forEach(containerId => { const option = document.createElement('option'); option.value = containerId; option.textContent = containerId.replace(/-/g, ' '); konttiValikko.appendChild(option); }); } }, (error) => { console.error("Virhe konttilistan haussa:", error); konttiValikko.innerHTML = '<option value="">Virhe latauksessa</option>'; }); };

const initializePage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const containerFromUrl = urlParams.get('kontti');
    loadContainerList();
    if (containerFromUrl) {
        // Asetetaan arvo sekä tekstikenttään että valikkoon.
        kontinNimiInput.value = containerFromUrl.replace(/-/g, ' ');
        konttiValikko.value = containerFromUrl;
        handleContainerSelection(containerFromUrl);
    } else {
        kontinValitsinDiv.classList.remove('hidden');
        lokiOsio.classList.add('hidden');
    }
};

initializePage();
