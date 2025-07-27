import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Firebase-konfiguraatio pysyy samana
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

// --- UUSI APUFUNKTIO PÄIVÄMÄÄRÄN MUOTOILUUN HTML-INPUTTIA VARTEN (YYYY-MM-DDTHH:mm) ---
const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    // Siirretään paikalliseen aikaan ennen muotoilua
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

// Aiemmat apufunktiot pysyvät ennallaan
const parseFinnishDateTime = (str) => {
    if (!str || str.trim() === '') return null;
    const parts = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s*(\d{1,2}):(\d{1,2})/);
    if (parts) return new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5]);
    return null;
};
const formatFinnishDateTime = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Kuukaudet ovat 0-11
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

// Datan käsittely ja renderöinti pysyvät ennallaan
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
        const item = historiaTemplate.content.cloneNode(true).querySelector('.historia-item');
        item.dataset.id = seal.id;
        item.querySelector('.sinetin-numero').textContent = seal.sealNumber;
        const statusSpan = item.querySelector('.sinetin-status');
        if (seal.removedTimestamp) {
            statusSpan.textContent = 'POISTETTU'; statusSpan.classList.add('poistettu');
        } else {
            statusSpan.textContent = 'AKTIIVINEN'; statusSpan.classList.remove('poistettu');
        }
        item.querySelector('.lisatty-aika').textContent = formatFinnishDateTime(seal.addedTimestamp) || 'Aika puuttuu';
        item.querySelector('.poistettu-aika').textContent = formatFinnishDateTime(seal.removedTimestamp) || ' - ';
        historiaLista.appendChild(item);
    });
};
const renderAll = () => { renderActiveSeals(containerSeals.filter(s => !s.removedTimestamp)); renderHistory(); };

// --- TÄYSIN UUSITTU TAPAHTUMANKÄSITTELIJÄ MUOKKAUSTA VARTEN ---

historiaLista.addEventListener('click', (e) => {
    const target = e.target;
    const item = target.closest('.historia-item');
    if (!item) return;

    const sealId = item.dataset.id;
    const seal = containerSeals.find(s => s.id == sealId);
    if (!seal) return;

    // Poistopainikkeen logiikka
    if (target.closest('.poista-btn')) {
        if (confirm(`Haluatko varmasti poistaa sinetin "${seal.sealNumber}"?`)) {
            containerSeals = containerSeals.filter(s => s.id != sealId);
            saveState();
        }
        return;
    }
    
    // Peruutuspainikkeen logiikka
    if (target.closest('.cancel-btn')) {
        renderAll(); // Piirretään koko lista uudelleen, mikä peruuttaa kaikki muutokset
        return;
    }

    // Tallenna-painikkeen logiikka
    if (target.closest('.save-btn')) {
        const newSealNumber = item.querySelector('input[name="sealNumber"]').value;
        const newAddedTime = item.querySelector('input[name="addedTime"]').value;
        const newRemovedTime = item.querySelector('input[name="removedTime"]').value;

        if (!newSealNumber) {
            alert("Sinetin numero ei voi olla tyhjä.");
            return;
        }
        if (!newAddedTime) {
            alert("Lisäysaika ei voi olla tyhjä.");
            return;
        }

        seal.sealNumber = newSealNumber.trim();
        seal.addedTimestamp = new Date(newAddedTime).toISOString();
        seal.removedTimestamp = newRemovedTime ? new Date(newRemovedTime).toISOString() : null;
        
        saveState(); // Tämä tallentaa ja käynnistää renderAll-funktion onValue-kuuntelijan kautta
        return;
    }

    // Kynä-painikkeen logiikka: näytä muokkauslomake
    if (target.closest('.muokkaa-btn')) {
        // Varmuuden vuoksi peruutetaan muut mahdolliset avoimet muokkaukset
        renderAll();

        // Haetaan uudelleen oikea elementti DOM:sta renderöinnin jälkeen
        const currentItem = document.querySelector(`.historia-item[data-id="${sealId}"]`);
        
        // Luodaan muokkauslomakkeen HTML-sisältö
        const formHTML = `
            <div class="edit-form-container">
                <label for="sealNumber-${sealId}">Sinetin numero</label>
                <input type="text" name="sealNumber" id="sealNumber-${sealId}" class="edit-input" value="${seal.sealNumber || ''}">

                <label for="addedTime-${sealId}">Lisätty</label>
                <input type="datetime-local" name="addedTime" id="addedTime-${sealId}" class="edit-input" value="${formatDateForInput(seal.addedTimestamp)}">
                
                <label for="removedTime-${sealId}">Poistettu (tyhjä = aktiivinen)</label>
                <input type="datetime-local" name="removedTime" id="removedTime-${sealId}" class="edit-input" value="${formatDateForInput(seal.removedTimestamp)}">

                <div class="edit-form-actions">
                    <button class="save-btn">Tallenna</button>
                    <button class="cancel-btn">Peruuta</button>
                </div>
            </div>
        `;
        // Korvataan historiarivin sisältö lomakkeella
        currentItem.innerHTML = formHTML;
    }
});

// Alustussivun koodi pysyy ennallaan
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
const loadContainerList = () => {
    const containerListRef = ref(database, 'sinettiloki');
    onValue(containerListRef, (snapshot) => {
        konttiValikko.innerHTML = '<option value="">Valitse kontti...</option>';
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
const initializePage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const containerFromUrl = urlParams.get('kontti');
    loadContainerList();
    if (containerFromUrl) {
        handleContainerSelection(containerFromUrl);
    }
};

initializePage();
