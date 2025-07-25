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
const projektinNimiInput = document.getElementById('projektinNimi');
const projektiValikko = document.getElementById('projektiValikko');
const laskuriOsio = document.getElementById('laskuri-osio');
const aktiivinenProjektiNimi = document.getElementById('aktiivinenProjektiNimi');
const aktiivinenKirjausDiv = document.querySelector('.aktiivinen-kirjaus');
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

let currentProject = null;
let entries = [];
let activeEntry = null;

// KORJAUS: Apufunktio, joka muuntaa Date-objektin paikalliseksi YYYY-MM-DDTHH:mm -merkkijonoksi
const toLocalISOString = (date) => {
    if (!date) return '';
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; // Aikavyöhykkeen ero millisekunteina
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, -1);
    return localISOTime.slice(0, 16);
};

projektinNimiInput.addEventListener('change', () => {
    const projectName = projektinNimiInput.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (projectName) {
        currentProject = projectName;
        laskuriOsio.classList.remove('hidden');
        aktiivinenProjektiNimi.textContent = `Projekti: ${projektinNimiInput.value.trim()}`;
        if (projektiValikko.value !== projectName) {
            projektiValikko.value = projectName;
        }
        loadProjectData();
    } else {
        currentProject = null;
        laskuriOsio.classList.add('hidden');
    }
});

projektiValikko.addEventListener('change', () => {
    const selectedProject = projektiValikko.value;
    if (selectedProject) {
        projektinNimiInput.value = selectedProject;
        projektinNimiInput.dispatchEvent(new Event('change'));
    }
});

const loadProjectData = () => {
    const projectRef = ref(database, `tyoaikaprojektit/${currentProject}/kirjaukset`);
    onValue(projectRef, (snapshot) => {
        const data = snapshot.val();
        entries = data ? Object.values(data) : [];
        // KORJAUS: Tunnistetaan keskeneräinen kirjaus luotettavammin
        activeEntry = entries.find(e => !e.loppuAika) || null;
        renderAll();
    });
};

const saveState = () => {
    if (!currentProject) return;
    const dataToSave = {};
    entries.forEach(entry => {
        dataToSave[entry.id] = entry;
    });
    set(ref(database, `tyoaikaprojektit/${currentProject}/kirjaukset`), dataToSave);
};

aloitaLopetaBtn.addEventListener('click', () => {
    if (activeEntry) {
        activeEntry.loppuAika = new Date().toISOString();
        saveState();
    } else {
        const tehtava = aktiivinenTehtavaInput.value.trim();
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

lisaaManuaalisestiBtn.addEventListener('click', () => {
    const tehtava = manuaalinenTehtavaInput.value.trim(); 
    const alku = manuaalinenAlkuInput.value;
    const loppu = manuaalinenLoppuInput.value;

    if (!alku || !loppu) {
        alert("Anna vähintään aloitus- ja lopetusaika.");
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
    
    manuaalinenTehtavaInput.value = '';
    manuaalinenAlkuInput.value = '';
    manuaalinenLoppuInput.value = '';
});

const renderAll = () => {
    renderActiveEntry();
    renderEntriesList();
    renderSummary();
};

const renderActiveEntry = () => {
    if (activeEntry) {
        aloitaLopetaBtn.textContent = 'Lopeta Ajanotto';
        aloitaLopetaBtn.classList.add('aktiivinen');
        aktiivinenKirjausDiv.classList.add('highlight-active'); // MUUTOS: Lisätään korostusluokka
        aktiivinenTehtavaInput.value = activeEntry.tehtava;
        aktiivinenTehtavaInput.disabled = true;
        alkuAikaNaytto.textContent = new Date(activeEntry.alkuAika).toLocaleString('fi-FI');
    } else {
        aloitaLopetaBtn.textContent = 'Aloita Ajanotto';
        aloitaLopetaBtn.classList.remove('aktiivinen');
        aktiivinenKirjausDiv.classList.remove('highlight-active'); // MUUTOS: Poistetaan korostusluokka
        aktiivinenTehtavaInput.value = '';
        aktiivinenTehtavaInput.disabled = false;
        alkuAikaNaytto.textContent = '--:--';
    }
};

const renderEntriesList = () => {
    kirjauksetLista.innerHTML = '';
    const sortedEntries = [...entries].sort((a, b) => new Date(b.alkuAika) - new Date(a.alkuAika));

    sortedEntries.forEach(entry => {
        // KORJAUS: Varmistetaan, että aktiivinen entry ei tule tähän listaan
        if (activeEntry && entry.id === activeEntry.id) return;

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
        tehtavaInput.placeholder = "Nimetön tehtävä";
        
        // KORJAUS: Käytetään apufunktiota aikavyöhykkeen korjaamiseksi
        alkuInput.value = toLocalISOString(new Date(entry.alkuAika));
        loppuInput.value = entry.loppuAika ? toLocalISOString(new Date(entry.loppuAika)) : '';
        kestoDiv.textContent = calculateDuration(entry.alkuAika, entry.loppuAika);
        
        muokkaaBtn.addEventListener('click', () => {
            tehtavaInput.disabled = false;
            alkuInput.disabled = false;
            loppuInput.disabled = false;
            muokkaaBtn.classList.add('hidden');
            tallennaBtn.classList.remove('hidden');
        });

        poistaBtn.addEventListener('click', () => {
            if (confirm(`Haluatko varmasti poistaa kirjauksen "${entry.tehtava || 'Nimetön'}"?`)) {
                entries = entries.filter(e => e.id !== entry.id);
                saveState();
            }
        });

        tallennaBtn.addEventListener('click', () => {
            entry.tehtava = tehtavaInput.value.trim();
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
    Object.keys(dailyTotals).sort((a, b) => new Date(b.split('.').reverse().join('-')) - new Date(a.split('.').reverse().join('-'))).forEach(date => {
        const p = document.createElement('p');
        p.textContent = `${date}: ${formatDuration(dailyTotals[date])}`;
        paivittaisetSummatDiv.appendChild(p);
    });
    
    kokonaisAikaSumma.textContent = formatDuration(totalMinutes);
};

const calculateDuration = (start, end) => {
    if (!start || !end) return 'Keskeneräinen';
    const minutes = (new Date(end) - new Date(start)) / 60000;
    return formatDuration(minutes);
};

const formatDuration = (totalMinutes) => {
    if (isNaN(totalMinutes)) return '0h 0min';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${minutes}min`;
};

const loadProjectList = () => {
    const projectsRef = ref(database, 'tyoaikaprojektit');
    onValue(projectsRef, (snapshot) => {
        projektiValikko.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Valitse projekti...';
        projektiValikko.appendChild(placeholder);

        if (snapshot.exists()) {
            console.log("Projektit löytyivät, ladataan valikkoon.");
            const projects = snapshot.val();
            Object.keys(projects).forEach(projectName => {
                const option = document.createElement('option');
                option.value = projectName;
                option.textContent = projectName.replace(/-/g, ' ');
                projektiValikko.appendChild(option);
            });
        } else {
             console.log("Yhtään projektia ei löytynyt tietokannasta.");
        }
    }, (error) => {
        console.error("Virhe projektilistan haussa:", error);
    });
};

loadProjectList();
