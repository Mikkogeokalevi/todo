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

// === MUUTETUT JA UUDET DOM-ELEMENTIT ===
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

// UUDET: Modal-ikkunan elementit
const muokkausModal = document.getElementById('muokkausModal');
const muokkausLomake = document.getElementById('muokkausLomake');
const muokattavanIdInput = document.getElementById('muokattavanId');
const modalSinetinNumeroInput = document.getElementById('modalSinetinNumero');
const modalLisattyAikaInput = document.getElementById('modalLisattyAika');
const modalPoistettuAikaInput = document.getElementById('modalPoistettuAika');
const peruutaMuokkausBtn = document.getElementById('peruutaMuokkausBtn');
// ===================================

let currentContainerId = null;
let containerSeals = [];

// === HELPER-FUNKTIOT (samat kuin ennen) ===
const parseFinnishDateTime = (str) => {
    if (!str || str.trim() === '') return null;
    const parts = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s*(\d{1,2}):(\d{1,2})/);
    if (parts) return new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5]);
    return null;
};

const formatToFinnishDateTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('fi-FI', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
};

const handleContainerSelection = (containerName) => {
    if (!containerName || containerName.trim() === '') return;
    const normalizedId = containerName.trim().toLowerCase().replace(/\s+/g, '-');
    currentContainerId = normalizedId;
    const newUrl = `${window.location.pathname}?kontti=${currentContainerId}`;
    history.pushState({ path: newUrl }, '', newUrl);
    kontinValitsinDiv.classList.add('hidden');
    lokiOsio.classList.remove('hidden');
    aktiivinenKonttiNimi.textContent = `Kontti: ${containerName.trim()}`;
    loadContainerData();
};

const loadContainerData = () => {
    if (!currentContainerId) return;
    const containerRef = ref(database, `sinettiloki/${currentContainerId}`);
    onValue(containerRef, (snapshot) => {
        if (snapshot.exists()) {
            const sealsData = snapshot.child('seals').val();
            containerSeals = sealsData ? Object.values(sealsData) : [];
        } else {
            containerSeals = [];
            saveState();
        }
        renderAll();
    });
};

const saveState = () => {
    if (!currentContainerId) return;
    const dataToSave = {};
    containerSeals.forEach(seal => { dataToSave[seal.id] = seal; });
    const containerRef = ref(database, `sinettiloki/${currentContainerId}/seals`);
    set(containerRef, dataToSave);
};

// === RENDERÖINTIFUNKTIOT (samat kuin ennen) ===
const renderAll = () => {
    const activeSeals = containerSeals.filter(seal => !seal.removedTimestamp);
    renderActiveSeals(activeSeals);
    renderHistory();
};

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
        item.querySelector('.lisatty-aika').textContent = formatToFinnishDateTime(seal.addedTimestamp);
        item.querySelector('.poistettu-aika').textContent = seal.removedTimestamp ? formatToFinnishDateTime(seal.removedTimestamp) : ' - ';
        historiaLista.appendChild(item);
    });
};

// === EVENT LISTENERS (osa muokattu, osa uusia) ===
kontinNimiInput.addEventListener('change', () => handleContainerSelection(kontinNimiInput.value));
konttiValikko.addEventListener('change', () => handleContainerSelection(konttiValikko.value));

lisaaSinetBtn.addEventListener('click', () => {
    const newSealNumber = uusiSinetinNumeroInput.value.trim();
    if (!newSealNumber) { alert("Anna uuden sinetin numero."); return; }
    const now = new Date().toISOString();
    containerSeals.forEach(seal => { if (!seal.removedTimestamp) { seal.removedTimestamp = now; } });
    const newSeal = { id: Date.now(), sealNumber: newSealNumber, addedTimestamp: now, removedTimestamp: null };
    containerSeals.push(newSeal);
    uusiSinetinNumeroInput.value = '';
    saveState();
});

tulostaBtn.addEventListener('click', () => window.print());

// MUOKATTU: Historialistan klikkausten käsittely
historiaLista.addEventListener('click', (e) => {
    const item = e.target.closest('.historia-item');
    if (!item) return;
    const sealId = item.dataset.id;
    const seal = containerSeals.find(s => s.id == sealId);
    if (!seal) return;

    // Poiston logiikka
    if (e.target.closest('.poista-btn')) {
        if (confirm(`Haluatko varmasti poistaa sinetin "${seal.sealNumber}" ja kaikki sen tiedot?`)) {
            containerSeals = containerSeals.filter(s => s.id != sealId);
            saveState();
        }
    }

    // UUSI: Muokkausnappia painettaessa avataan modal
    if (e.target.closest('.muokkaa-btn')) {
        openEditModal(seal);
    }
});

// UUSI: Modal-ikkunan logiikka
const openEditModal = (seal) => {
    muokattavanIdInput.value = seal.id;
    modalSinetinNumeroInput.value = seal.sealNumber;
    modalLisattyAikaInput.value = formatToFinnishDateTime(seal.addedTimestamp);
    modalPoistettuAikaInput.value = seal.removedTimestamp ? formatToFinnishDateTime(seal.removedTimestamp) : '';
    muokkausModal.classList.remove('hidden');
};

const closeEditModal = () => {
    muokkausModal.classList.add('hidden');
};

peruutaMuokkausBtn.addEventListener('click', closeEditModal);

muokkausLomake.addEventListener('submit', (e) => {
    e.preventDefault(); // Estää lomakkeen oletustoiminnan
    
    const sealId = muokattavanIdInput.value;
    const sealToUpdate = containerSeals.find(s => s.id == sealId);
    if (!sealToUpdate) {
        alert("Virhe: Muokattavaa sinettiä ei löytynyt.");
        return;
    }

    // Hae ja validoi arvot
    const newSealNumber = modalSinetinNumeroInput.value.trim();
    const newAddedDate = parseFinnishDateTime(modalLisattyAikaInput.value);
    const newRemovedDate = parseFinnishDateTime(modalPoistettuAikaInput.value);

    if (!newSealNumber) {
        alert("Sinetin numero ei voi olla tyhjä.");
        return;
    }
    if (!newAddedDate) {
        alert("Virheellinen lisäysajan muoto. Se ei voi olla tyhjä. Käytä muotoa pp.kk.vvvv hh:mm");
        return;
    }
    if (modalPoistettuAikaInput.value.trim() !== '' && !newRemovedDate) {
        alert("Virheellinen poistoajan muoto. Käytä muotoa pp.kk.vvvv hh:mm tai jätä kenttä tyhjäksi.");
        return;
    }
    
    // Päivitä tiedot
    sealToUpdate.sealNumber = newSealNumber;
    sealToUpdate.addedTimestamp = newAddedDate.toISOString();
    sealToUpdate.removedTimestamp = newRemovedDate ? newRemovedDate.toISOString() : null;
    
    saveState();
    closeEditModal();
});

// === ALUSTUSFUNKTIOT (samat kuin ennen) ===
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
    }, (error) => {
        console.error("Virhe konttilistan haussa:", error);
        konttiValikko.innerHTML = '<option value="">Virhe latauksessa</option>';
    });
};

const initializePage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const containerFromUrl = urlParams.get('kontti');
    loadContainerList();
    if (containerFromUrl) {
        kontinNimiInput.value = containerFromUrl.replace(/-/g, ' ');
        konttiValikko.value = containerFromUrl;
        handleContainerSelection(containerFromUrl);
    } else {
        kontinValitsinDiv.classList.remove('hidden');
        lokiOsio.classList.add('hidden');
    }
};

initializePage();
