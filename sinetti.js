import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA1OgSGhgYgmxDLv7-xkPPsUGCpcxFaI8M",
    authDomain: "geokatkosuunnittelija.firebaseapp.com",
    databaseURL: "https://geokatkosuunnittelija-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "geokatkosuunnittelija",
    storageBucket: "geokatkosuunnittelija.appspot.com",
    messagingSenderId: "745498680990",
    appId: "1:745498680990:web:869074eb0f0b72565ca58f"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM-elementit
const kontinNimiInput = document.getElementById('kontinNimi');
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

// Sovelluksen tila
let currentContainerId = null;
let containerData = {
    activeSeals: [],
    log: []
};

const handleContainerSelection = (containerName) => {
    if (!containerName || containerName.trim() === '') return;
    const normalizedId = containerName.trim().toLowerCase().replace(/\s+/g, '-');
    currentContainerId = normalizedId;

    const newUrl = `${window.location.pathname}?kontti=${currentContainerId}`;
    history.pushState({ path: newUrl }, '', newUrl);

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
            // Kontti on uusi, nollataan tiedot
            containerData = { activeSeals: [], log: [] };
        }
        renderAll();
    });
};

const saveState = () => {
    if (!currentContainerId) return;
    const containerRef = ref(database, `sinettiloki/${currentContainerId}`);
    set(containerRef, containerData);
};

const renderAll = () => {
    renderActiveSeals();
    renderHistory();
};

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
    // Järjestetään historia uusimmasta vanhimpaan
    const sortedLog = [...containerData.log].sort((a, b) => b.id - a.id);
    sortedLog.forEach(logEntry => {
        const clone = historiaTemplate.content.cloneNode(true);
        const item = clone.querySelector('.historia-item');
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

lisaaEnsimmainenBtn.addEventListener('click', () => {
    const sealNumber = ensimmainenSinetinNumeroInput.value.trim();
    if (sealNumber) {
        containerData.activeSeals.push(sealNumber);
        ensimmainenSinetinNumeroInput.value = '';
        saveState();
    }
});

suoritaVaihtoBtn.addEventListener('click', () => {
    const newSeal = uusiSinetinNumeroInput.value.trim();
    if (!newSeal) {
        alert("Anna uuden sinetin numero.");
        return;
    }
    if (containerData.activeSeals.length === 0) {
        alert("Kontissa ei ole yhtään aktiivista sinettiä, jota poistaa. Lisää ensin sinetti yläpuolelta.");
        return;
    }

    const newLogEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        removedSeals: [...containerData.activeSeals], // Kopioidaan vanhat sinetit
        newSeal: newSeal
    };

    containerData.log.push(newLogEntry);
    containerData.activeSeals = [newSeal]; // Asetetaan uusi sinetti aktiiviseksi

    uusiSinetinNumeroInput.value = '';
    saveState();
});

// Sivun alustus
const initializePage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const containerFromUrl = urlParams.get('kontti');

    if (containerFromUrl) {
        kontinNimiInput.value = containerFromUrl;
        handleContainerSelection(containerFromUrl);
    }
};

initializePage();
