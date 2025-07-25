import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// TÄRKEÄÄ: Kopioi Firebase-konfiguraatiosi tähän reissuapurin script.js-tiedostosta
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
const projektinNimiInput = document.getElementById('projektinNimi');
const laskuriOsio = document.getElementById('laskuri-osio');
const aktiivinenProjektiNimi = document.getElementById('aktiivinenProjektiNimi');
const aloitaLopetaBtn = document.getElementById('aloitaLopetaBtn');
const aktiivinenTehtavaInput = document.getElementById('aktiivinenTehtava');
const alkuAikaNaytto = document.getElementById('alkuAikaNaytto');
const kirjauksetLista = document.getElementById('kirjauksetLista');
const kirjausTemplate = document.getElementById('kirjaus-template');
const lisaaManuaalisestiBtn = document.getElementById('lisaaManuaalisestiBtn');
const manuaalinenTehtavaInput = document.getElementById('manuaalinenTehtava');
const manuaalinenAlkuInput = document.getElementById('manuaalinenAlku');
const manuaalinenLoppuInput = document.getElementById('manuaalinenLoppu');
const paivittaisetSummatDiv = document.getElementById('paivittaisetSummat');
const kokonaisAikaSumma = document.getElementById('kokonaisAikaSumma');

// Sovelluksen tila
let currentProject = null;
let entries = [];
let activeEntry = null;

// Alustaa projektinäkymän
projektinNimiInput.addEventListener('change', () => {
    const projectName = projektinNimiInput.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (projectName) {
        currentProject = projectName;
        laskuriOsio.classList.remove('hidden');
        aktiivinenProjektiNimi.textContent = `Projekti: ${projektinNimiInput.value.trim()}`;
        loadProjectData();
    } else {
        currentProject = null;
        laskuriOsio.classList.add('hidden');
    }
});

// Lataa tiedot Firebasesta
const loadProjectData = () => {
    const projectRef = ref(database, `tyoaikaprojektit/${currentProject}/kirjaukset`);
    onValue(projectRef, (snapshot) => {
        const data = snapshot.val();
        entries = data ? Object.values(data) : [];
        // Etsi keskeneräinen kirjaus
        activeEntry = entries.find(e => e.loppuAika === null) || null;
        renderAll();
    });
};

// Tallentaa koko tilan Firebaseen
const saveState = () => {
    if (!currentProject) return;
    const dataToSave = {};
    entries.forEach(entry => {
        dataToSave[entry.id] = entry;
    });
    set(ref(database, `tyoaikaprojektit/${currentProject}/kirjaukset`), dataToSave);
};

// Aloita/Lopeta-napin logiikka
aloitaLopetaBtn.addEventListener('click', () => {
    if (activeEntry) { // Lopetetaan ajanotto
        activeEntry.loppuAika = new Date().toISOString();
        saveState();
    } else { // Aloitetaan ajanotto
        const tehtava = aktiivinenTehtavaInput.value.trim();
        if (!tehtava) {
            alert("Anna tehtävälle kuvaus ennen ajanoton aloittamista.");
            return;
        }
        const newEntry = {
            id: Date.now().toString(),
            tehtava: tehtava,
            alkuAika: new Date().toISOString(),
            loppuAika: null
        };
        entries.push(newEntry);
        saveState();
    }
});

// Manuaalisen kirjauksen lisäys
lisaaManuaalisestiBtn.addEventListener('click', () => {
    const tehtava = manuaalinenTehtavaInput.value.trim();
    const alku = manuaalinenAlkuInput.value;
    const loppu = manuaalinenLoppuInput.value;

    if (!tehtava || !alku || !loppu) {
        alert("Täytä kaikki kentät manuaaliselle kirjaukselle.");
        return;
    }
    if (new Date(alku) >= new Date(loppu)) {
        alert("Lopetusajan on oltava aloitusajan jälkeen.");
        return;
    }

    const newEntry = {
        id: new Date(alku).getTime().toString(),
        tehtava: tehtava,
        alkuAika: new Date(alku).toISOString(),
        loppuAika: new Date(loppu).toISOString()
    };
    entries.push(newEntry);
    saveState();
    
    // Tyhjennetään kentät
    manuaalinenTehtavaInput.value = '';
    manuaalinenAlkuInput.value = '';
    manuaalinenLoppuInput.value = '';
});


// Kaiken renderöinti
const renderAll = () => {
    renderActiveEntry();
    renderEntriesList();
    renderSummary();
};

// Päivittää aktiivisen kirjauksen näkymän
const renderActiveEntry = () => {
    if (activeEntry) {
        aloitaLopetaBtn.textContent = 'Lopeta Ajanotto';
        aloitaLopetaBtn.classList.add('aktiivinen');
        aktiivinenTehtavaInput.value = activeEntry.tehtava;
        aktiivinenTehtavaInput.disabled = true;
        alkuAikaNaytto.textContent = new Date(activeEntry.alkuAika).toLocaleTimeString('fi-FI');
    } else {
        aloitaLopetaBtn.textContent = 'Aloita Ajanotto';
        aloitaLopetaBtn.classList.remove('aktiivinen');
        aktiivinenTehtavaInput.value = '';
        aktiivinenTehtavaInput.disabled = false;
        alkuAikaNaytto.textContent = '--:--';
    }
};

// Renderöi kirjauslistan
const renderEntriesList = () => {
    kirjauksetLista.innerHTML = '';
    const sortedEntries = [...entries].sort((a, b) => new Date(b.alkuAika) - new Date(a.alkuAika));

    sortedEntries.forEach(entry => {
        if (entry.id === activeEntry?.id) return; // Älä näytä aktiivista tässä listassa

        const clone = kirjausTemplate.content.cloneNode(true);
        const li = clone.querySelector('.kirjaus-item');
        li.dataset.id = entry.id;

        const tehtavaInput = li.querySelector('.tehtava-input');
        const alkuInput = li.querySelector('.alku-input');
        const loppuInput = li.querySelector('.loppu-input');
        const kestoDiv = li.querySelector('.kesto strong');
        
        const muokkaaBtn = li.querySelector('.muokkaa-btn');
        const tallennaBtn = li.querySelector('.tallenna-btn');
        const poistaBtn = li.querySelector('.poista-btn');

        tehtavaInput.value = entry.tehtava;
        alkuInput.value = entry.alkuAika.slice(0, 16); // Muoto YYYY-MM-DDTHH:mm
        loppuInput.value = entry.loppuAika ? entry.loppuAika.slice(0, 16) : '';
        kestoDiv.textContent = calculateDuration(entry.alkuAika, entry.loppuAika);
        
        muokkaaBtn.addEventListener('click', () => {
            tehtavaInput.disabled = false;
            alkuInput.disabled = false;
            loppuInput.disabled = false;
            muokkaaBtn.classList.add('hidden');
            tallennaBtn.classList.remove('hidden');
        });

        poistaBtn.addEventListener('click', () => {
            if (confirm(`Haluatko varmasti poistaa kirjauksen "${entry.tehtava}"?`)) {
                entries = entries.filter(e => e.id !== entry.id);
                saveState();
            }
        });

        tallennaBtn.addEventListener('click', () => {
            entry.tehtava = tehtavaInput.value;
            entry.alkuAika = new Date(alkuInput.value).toISOString();
            entry.loppuAika = new Date(loppuInput.value).toISOString();
            
            tehtavaInput.disabled = true;
            alkuInput.disabled = true;
            loppuInput.disabled = true;
            muokkaaBtn.classList.remove('hidden');
            tallennaBtn.classList.add('hidden');

            saveState();
        });

        kirjauksetLista.appendChild(li);
    });
};

// Renderöi yhteenvedon
const renderSummary = () => {
    const dailyTotals = {};
    let totalMinutes = 0;

    entries.forEach(entry => {
        if (!entry.loppuAika) return;

        const durationMinutes = (new Date(entry.loppuAika) - new Date(entry.alkuAika)) / 60000;
        totalMinutes += durationMinutes;

        const dateKey = new Date(entry.alkuAika).toLocaleDateString('fi-FI');
        if (!dailyTotals[dateKey]) {
            dailyTotals[dateKey] = 0;
        }
        dailyTotals[dateKey] += durationMinutes;
    });

    paivittaisetSummatDiv.innerHTML = '';
    Object.keys(dailyTotals).sort().reverse().forEach(date => {
        const p = document.createElement('p');
        p.textContent = `${date}: ${formatDuration(dailyTotals[date])}`;
        paivittaisetSummatDiv.appendChild(p);
    });
    
    kokonaisAikaSumma.textContent = formatDuration(totalMinutes);
};

// Apufunktiot
const calculateDuration = (start, end) => {
    if (!start || !end) return 'Keskeneräinen';
    const minutes = (new Date(end) - new Date(start)) / 60000;
    return formatDuration(minutes);
};

const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${minutes}min`;
};
