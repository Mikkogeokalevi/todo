// MUUTOS: Lisätty get ja remove Firebasen tuonteihin
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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
const projektinValintaDiv = document.querySelector('.projekti-valitsin');
const projektinNimiInput = document.getElementById('projektinNimi');
const projektiValikko = document.getElementById('projektiValikko');
const laskuriOsio = document.getElementById('laskuri-osio');
const aktiivinenProjektiNimi = document.getElementById('aktiivinenProjektiNimi');
// MUUTOS: Uudet napit lisätty
const muokkaaProjektinNimeaBtn = document.getElementById('muokkaaProjektinNimeaBtn');
const poistaProjektiBtn = document.getElementById('poistaProjektiBtn');
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
const tulostaBtn = document.getElementById('tulostaBtn');
const suoraLinkkiDiv = document.getElementById('suoraLinkki');
const kopioiLinkkiBtn = document.getElementById('kopioiLinkkiBtn');

let currentProject = null;
let entries = [];
let activeEntry = null;

const toLocalISOString = (date) => {
    if (!date) return '';
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, -1);
    return localISOTime.slice(0, 16);
};

const loadProject = (projectName) => {
    if (!projectName || projectName.trim() === '') return;
    const normalizedProjectName = projectName.trim().toLowerCase().replace(/\s+/g, '-');
    currentProject = normalizedProjectName;
    const newUrl = `${window.location.pathname}?projekti=${currentProject}`;
    history.pushState({ path: newUrl }, '', newUrl);
    projektinValintaDiv.classList.add('hidden');
    laskuriOsio.classList.remove('hidden');
    const displayName = currentProject.replace(/-/g, ' ');
    aktiivinenProjektiNimi.textContent = `Projekti: ${displayName}`;
    projektiValikko.value = currentProject;
    suoraLinkkiDiv.querySelector('input').value = window.location.href;
    suoraLinkkiDiv.classList.remove('hidden');
    loadProjectData();
};

const loadProjectData = () => {
    if (!currentProject) return;
    const projectRef = ref(database, `tyoaikaprojektit/${currentProject}/kirjaukset`);
    onValue(projectRef, (snapshot) => {
        const data = snapshot.val();
        entries = data ? Object.values(data) : [];
        activeEntry = entries.find(e => !e.loppuAika) || null;
        renderAll();
    });
};

const saveState = () => {
    if (!currentProject) return;
    const dataToSave = {};
    entries.forEach(entry => { dataToSave[entry.id] = entry; });
    set(ref(database, `tyoaikaprojektit/${currentProject}/kirjaukset`), dataToSave);
};

projektinNimiInput.addEventListener('change', () => loadProject(projektinNimiInput.value));
projektiValikko.addEventListener('change', () => loadProject(projektiValikko.value));

const loadProjectList = () => {
    const projectsRef = ref(database, 'tyoaikaprojektit');
    onValue(projectsRef, (snapshot) => {
        projektiValikko.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Valitse projekti...';
        projektiValikko.appendChild(placeholder);
        if (snapshot.exists()) {
            const projects = snapshot.val();
            Object.keys(projects).forEach(projectName => {
                const option = document.createElement('option');
                option.value = projectName;
                option.textContent = projectName.replace(/-/g, ' ');
                projektiValikko.appendChild(option);
            });
            if (currentProject) { projektiValikko.value = currentProject; }
        }
    });
};

const initializePage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectFromUrl = urlParams.get('projekti');
    loadProjectList();
    if (projectFromUrl) {
        loadProject(projectFromUrl);
    } else {
        projektinValintaDiv.classList.remove('hidden');
        laskuriOsio.classList.add('hidden');
    }
};

// UUSI OMINAISUUS: Projektin poistaminen
const handleDeleteProject = () => {
    if (!currentProject) return;
    const displayName = currentProject.replace(/-/g, ' ');
    if (confirm(`Haluatko varmasti poistaa koko projektin "${displayName}" ja kaikki sen kirjaukset? Tätä ei voi perua.`)) {
        const projectRef = ref(database, `tyoaikaprojektit/${currentProject}`);
        remove(projectRef).then(() => {
            alert(`Projekti "${displayName}" poistettu.`);
            // Palautetaan sivu aloitustilaan
            window.location.href = window.location.pathname;
        }).catch((error) => {
            alert("Projektin poisto epäonnistui: " + error.message);
        });
    }
};

// UUSI OMINAISUUS: Projektin nimen muokkaaminen
const handleEditProjectName = () => {
    if (!currentProject) return;
    const oldName = currentProject;
    const oldDisplayName = oldName.replace(/-/g, ' ');
    const newDisplayName = prompt("Anna uusi nimi projektille:", oldDisplayName);

    if (!newDisplayName || newDisplayName.trim() === '' || newDisplayName === oldDisplayName) {
        return; // Käyttäjä peruutti tai ei muuttanut nimeä
    }

    const newName = newDisplayName.trim().toLowerCase().replace(/\s+/g, '-');
    const oldRef = ref(database, `tyoaikaprojektit/${oldName}`);
    const newRef = ref(database, `tyoaikaprojektit/${newName}`);

    // 1. Lue vanhan projektin data
    get(oldRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            // 2. Kirjoita data uuteen sijaintiin
            set(newRef, data).then(() => {
                // 3. Poista vanha projekti
                remove(oldRef).then(() => {
                    // 4. Lataa sivu uudella projektinimellä
                    loadProject(newName);
                });
            });
        }
    }).catch((error) => {
        alert("Nimen muokkaus epäonnistui: " + error.message);
    });
};

// Lisätään kuuntelijat uusille napeille
muokkaaProjektinNimeaBtn.addEventListener('click', handleEditProjectName);
poistaProjektiBtn.addEventListener('click', handleDeleteProject);

// Muut toiminnot pysyvät ennallaan...
aloitaLopetaBtn.addEventListener('click', () => { if (activeEntry) { activeEntry.loppuAika = new Date().toISOString(); saveState(); } else { const tehtava = aktiivinenTehtavaInput.value.trim(); const newEntry = { id: Date.now().toString(), tehtava: tehtava, alkuAika: new Date().toISOString(), loppuAika: null }; entries.push(newEntry); saveState(); } });
lisaaManuaalisestiBtn.addEventListener('click', () => { const tehtava = manuaalinenTehtavaInput.value.trim(); const alku = manuaalinenAlkuInput.value; const loppu = manuaalinenLoppuInput.value; if (!alku || !loppu) { alert("Anna vähintään aloitus- ja lopetusaika."); return; } if (new Date(alku) >= new Date(loppu)) { alert("Lopetusajan on oltava aloitusajan jälkeen."); return; } const newEntry = { id: new Date(alku).getTime().toString(), tehtava: tehtava, alkuAika: new Date(alku).toISOString(), loppuAika: new Date(loppu).toISOString() }; entries.push(newEntry); saveState(); manuaalinenTehtavaInput.value = ''; manuaalinenAlkuInput.value = ''; manuaalinenLoppuInput.value = ''; });
tulostaBtn.addEventListener('click', () => { window.print(); });
kopioiLinkkiBtn.addEventListener('click', () => { const linkInput = suoraLinkkiDiv.querySelector('input'); linkInput.select(); linkInput.setSelectionRange(0, 99999); try { document.execCommand('copy'); kopioiLinkkiBtn.textContent = 'Kopioitu!'; setTimeout(() => { kopioiLinkkiBtn.textContent = 'Kopioi'; }, 2000); } catch (err) { alert('Linkin kopiointi epäonnistui'); } });
const renderAll = () => { renderActiveEntry(); renderEntriesList(); renderSummary(); };
const renderActiveEntry = () => { if (activeEntry) { aloitaLopetaBtn.textContent = 'Lopeta Ajanotto'; aloitaLopetaBtn.classList.add('aktiivinen'); aktiivinenKirjausDiv.classList.add('highlight-active'); aktiivinenTehtavaInput.value = activeEntry.tehtava; aktiivinenTehtavaInput.disabled = true; alkuAikaNaytto.textContent = new Date(activeEntry.alkuAika).toLocaleString('fi-FI'); } else { aloitaLopetaBtn.textContent = 'Aloita Ajanotto'; aloitaLopetaBtn.classList.remove('aktiivinen'); aktiivinenKirjausDiv.classList.remove('highlight-active'); aktiivinenTehtavaInput.value = ''; aktiivinenTehtavaInput.disabled = false; alkuAikaNaytto.textContent = '--:--'; } };
const renderEntriesList = () => { kirjauksetLista.innerHTML = ''; const sortedEntries = [...entries].sort((a, b) => new Date(b.alkuAika) - new Date(a.alkuAika)); sortedEntries.forEach(entry => { if (activeEntry && entry.id === activeEntry.id) return; const clone = kirjausTemplate.content.cloneNode(true); const li = clone.querySelector('.kirjaus-item'); li.dataset.id = entry.id; const tehtavaInput = li.querySelector('.tehtava-input'); const alkuInput = li.querySelector('.alku-input'); const loppuInput = li.querySelector('.loppu-input'); const kestoDiv = li.querySelector('.kesto strong'); const muokkaaBtn = li.querySelector('.muokkaa-btn'); const tallennaBtn = li.querySelector('.tallenna-btn'); const poistaBtn = li.querySelector('.poista-btn'); tehtavaInput.value = entry.tehtava; tehtavaInput.placeholder = "Nimetön tehtävä"; alkuInput.value = toLocalISOString(new Date(entry.alkuAika)); loppuInput.value = entry.loppuAika ? toLocalISOString(new Date(entry.loppuAika)) : ''; kestoDiv.textContent = calculateDuration(entry.alkuAika, entry.loppuAika); muokkaaBtn.addEventListener('click', () => { tehtavaInput.disabled = false; alkuInput.disabled = false; loppuInput.disabled = false; muokkaaBtn.classList.add('hidden'); tallennaBtn.classList.remove('hidden'); }); poistaBtn.addEventListener('click', () => { if (confirm(`Haluatko varmasti poistaa kirjauksen "${entry.tehtava || 'Nimetön'}"?`)) { entries = entries.filter(e => e.id !== entry.id); saveState(); } }); tallennaBtn.addEventListener('click', () => { entry.tehtava = tehtavaInput.value.trim(); entry.alkuAika = new Date(alkuInput.value).toISOString(); entry.loppuAika = new Date(loppuInput.value).toISOString(); tehtavaInput.disabled = true; alkuInput.disabled = true; loppuInput.disabled = true; muokkaaBtn.classList.remove('hidden'); tallennaBtn.classList.add('hidden'); saveState(); }); kirjauksetLista.appendChild(li); }); };
const renderSummary = () => { const dailyTotals = {}; let totalMinutes = 0; entries.forEach(entry => { if (!entry.loppuAika) return; const durationMinutes = (new Date(entry.loppuAika) - new Date(entry.alkuAika)) / 60000; totalMinutes += durationMinutes; const dateKey = new Date(entry.alkuAika).toLocaleDateString('fi-FI'); if (!dailyTotals[dateKey]) { dailyTotals[dateKey] = 0; } dailyTotals[dateKey] += durationMinutes; }); paivittaisetSummatDiv.innerHTML = ''; Object.keys(dailyTotals).sort((a, b) => new Date(b.split('.').reverse().join('-')) - new Date(a.split('.').reverse().join('-'))).forEach(date => { const p = document.createElement('p'); p.textContent = `${date}: ${formatDuration(dailyTotals[date])}`; paivittaisetSummatDiv.appendChild(p); }); kokonaisAikaSumma.textContent = formatDuration(totalMinutes); };
const calculateDuration = (start, end) => { if (!start || !end) return 'Keskeneräinen'; const minutes = (new Date(end) - new Date(start)) / 60000; return formatDuration(minutes); };
const formatDuration = (totalMinutes) => { if (isNaN(totalMinutes)) return '0h 0min'; const hours = Math.floor(totalMinutes / 60); const minutes = Math.round(totalMinutes % 60); return `${hours}h ${minutes}min`; };

initializePage();
