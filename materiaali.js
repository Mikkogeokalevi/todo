import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set, get, remove, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCM3qiQ7AZephMovMnRcaCy_KzAVUkpXw0",
    authDomain: "materiaalikirjanpito.firebaseapp.com",
    databaseURL: "https://materiaalikirjanpito-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "materiaalikirjanpito",
    storageBucket: "materiaalikirjanpito.firebasestorage.app",
    messagingSenderId: "1007127105198",
    appId: "1:1007127105198:web:57b5e46dda5b879efc673f"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM-elementit
const listanvalintaOsio = document.getElementById('listanvalinta-osio');
const aktiivisetListatContainer = document.getElementById('aktiiviset-listat-container');
const arkistoValikko = document.getElementById('arkistoValikko');
const uusiListaNimiInput = document.getElementById('uusiListaNimi');
const luoUusiListaBtn = document.getElementById('luo-uusi-lista-btn');
const kirjausOsio = document.getElementById('kirjaus-osio');
const aktiivinenListaNimi = document.getElementById('aktiivinenListaNimi');
const listaStatusBadge = document.getElementById('lista-status-badge');
const palaaTakaisinBtn = document.getElementById('palaa-takaisin-btn');
const tulostaBtn = document.getElementById('tulosta-btn');
const poistaArkistointiBtn = document.getElementById('poista-arkistointi-btn');
const arkistoiListaBtn = document.getElementById('arkistoi-lista-btn');
const muokkaaListaaBtn = document.getElementById('muokkaa-listaa-btn');
const poistaListaBtn = document.getElementById('poista-lista-btn');
const kirjausLista = document.getElementById('kirjaus-lista');
const yhteenvetoLista = document.getElementById('yhteenveto-lista');
const lomake = document.getElementById('materiaali-lomake');
const materiaaliTyyppiSelect = document.getElementById('materiaali-tyyppi');
const muuMateriaaliInput = document.getElementById('muu-materiaali-syotto');
const muistaMateriaaliContainer = document.getElementById('muista-materiaali-container');
const muistaMateriaaliCheckbox = document.getElementById('muista-materiaali-checkbox');
const editModal = document.getElementById('edit-modal');
const editMateriaaliNimi = document.getElementById('edit-materiaali-nimi');
const editKiloMaara = document.getElementById('edit-kilo-maara');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

let currentListId = null;
let listDataUnsubscribe = null;
let currentEditingEntryId = null;

const formatSuomalainenAika = (isoString) => isoString ? new Date(isoString).toLocaleString('fi-FI', { dateStyle: 'short', timeStyle: 'short' }) : '';
const normalizeListName = (listName) => listName.trim().toLowerCase().replace(/\s+/g, '-');

async function handleListSelection(listId) {
    if (!listId) return;
    currentListId = listId;
    const metaRef = ref(database, `listat/${listId}`);
    const metaSnapshot = await get(metaRef);
    if (!metaSnapshot.exists()) {
        alert("Virhe: Listan tietoja ei löytynyt.");
        return palaaAlkuun();
    }
    const meta = metaSnapshot.val();
    aktiivinenListaNimi.textContent = meta.nimi;
    const onArkistoitu = meta.status === 'archived';
    listaStatusBadge.textContent = onArkistoitu ? `Arkistoitu: ${formatSuomalainenAika(meta.arkistoituAika)}` : "";
    lomake.classList.toggle('hidden', onArkistoitu);
    muokkaaListaaBtn.classList.toggle('hidden', onArkistoitu);
    arkistoiListaBtn.classList.toggle('hidden', onArkistoitu);
    poistaArkistointiBtn.classList.toggle('hidden', !onArkistoitu);
    listanvalintaOsio.classList.add('hidden');
    kirjausOsio.classList.remove('hidden');
    history.pushState({ path: `${window.location.pathname}?lista=${currentListId}` }, '', `${window.location.pathname}?lista=${currentListId}`);
    loadListData(onArkistoitu);
}

function loadListData(onArkistoitu) {
    if (!currentListId) return;
    if (listDataUnsubscribe) listDataUnsubscribe();
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    listDataUnsubscribe = onValue(kirjauksetRef, (snapshot) => {
        kirjausLista.innerHTML = '';
        yhteenvetoLista.innerHTML = '';
        if (snapshot.exists()) {
            const data = snapshot.val();
            const sums = {};
            Object.entries(data).forEach(([key, kirjaus]) => {
                const li = document.createElement('li');
                li.dataset.id = key;
                li.innerHTML = `
                    <span class="kirjaus-tiedot">${kirjaus.materiaali} - ${kirjaus.kilomäärä} kg</span>
                    <span class="kirjaus-aika">${formatSuomalainenAika(kirjaus.aikaleima)}</span>
                    ${!onArkistoitu ? `
                    <div class="kirjaus-toiminnot no-print">
                        <button class="edit-entry-btn" title="Muokkaa">✏️</button>
                        <button class="delete-entry-btn" title="Poista">🗑️</button>
                    </div>` : ''}
                `;
                kirjausLista.appendChild(li);
                const materiaaliNimi = kirjaus.materiaali.trim();
                sums[materiaaliNimi] = (sums[materiaaliNimi] || 0) + kirjaus.kilomäärä;
            });
            Object.entries(sums).sort().forEach(([materiaali, summa]) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${materiaali} yhteensä:</strong> ${summa.toFixed(1)} kg`;
                yhteenvetoLista.appendChild(li);
            });
        } else {
            kirjausLista.innerHTML = '<li>Ei vielä kirjauksia tällä listalla.</li>';
        }
    });
}

function lataaListat() {
    onValue(ref(database, 'listat'), (snapshot) => {
        aktiivisetListatContainer.innerHTML = '';
        arkistoValikko.innerHTML = '<option value="">Valitse arkistoitu lista...</option>';
        if (snapshot.exists()) {
            let activeCount = 0;
            Object.entries(snapshot.val()).sort((a, b) => a[1].nimi.localeCompare(b[1].nimi)).forEach(([listId, meta]) => {
                if (meta.status === 'active') {
                    activeCount++;
                    const nappi = document.createElement('button');
                    nappi.textContent = meta.nimi;
                    nappi.className = 'aktiivinen-lista-nappi';
                    nappi.onclick = () => handleListSelection(listId);
                    aktiivisetListatContainer.appendChild(nappi);
                } else if (meta.status === 'archived') {
                    const option = document.createElement('option');
                    option.value = listId;
                    option.textContent = meta.nimi;
                    arkistoValikko.appendChild(option);
                }
            });
            if (activeCount === 0) aktiivisetListatContainer.innerHTML = '<p>Ei aktiivisia listoja.</p>';
        } else {
            aktiivisetListatContainer.innerHTML = '<p>Ei listoja. Luo ensimmäinen.</p>';
        }
    });
}

function lataaMateriaalitValikko() {
    const materiaalitRef = ref(database, 'materiaalit');
    onValue(materiaalitRef, (snapshot) => {
        const muuOptio = materiaaliTyyppiSelect.querySelector('option[value="Muu"]');
        // Poistetaan vanhat dynaamiset optiot
        Array.from(materiaaliTyyppiSelect.options).forEach(option => {
            if (option.value && option.value !== 'Muu' && !option.disabled) {
                option.remove();
            }
        });
        if (snapshot.exists()) {
            Object.keys(snapshot.val()).sort().forEach(materiaali => {
                const option = document.createElement('option');
                option.value = materiaali;
                option.textContent = materiaali;
                materiaaliTyyppiSelect.insertBefore(option, muuOptio);
            });
        }
    });
}

function palaaAlkuun() {
    kirjausOsio.classList.add('hidden');
    listanvalintaOsio.classList.remove('hidden');
    if (listDataUnsubscribe) listDataUnsubscribe();
    currentListId = null;
    history.pushState(null, '', window.location.pathname);
    uusiListaNimiInput.value = "";
    arkistoValikko.value = "";
}

// TAPAHTUMANKUUNTELIJAT
palaaTakaisinBtn.addEventListener('click', palaaAlkuun);
tulostaBtn.addEventListener('click', () => window.print());
arkistoValikko.addEventListener('change', () => { if (arkistoValikko.value) handleListSelection(arkistoValikko.value) });

luoUusiListaBtn.addEventListener('click', () => {
    const listName = uusiListaNimiInput.value.trim();
    if (!listName) return alert('Anna uudelle listalle nimi.');
    const listId = normalizeListName(listName);
    const uusiListaMeta = { nimi: listName, status: 'active' };
    set(ref(database, `listat/${listId}`), uusiListaMeta).then(() => handleListSelection(listId));
});

materiaaliTyyppiSelect.addEventListener('change', () => {
    const onMuu = materiaaliTyyppiSelect.value === 'Muu';
    muuMateriaaliInput.classList.toggle('hidden', !onMuu);
    muistaMateriaaliContainer.classList.toggle('hidden', !onMuu);
    muuMateriaaliInput.required = onMuu;
    if (onMuu) muuMateriaaliInput.focus();
});

lomake.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentListId) return;
    const kiloMaaraInput = document.getElementById('kilo-maara');
    let materiaali = (materiaaliTyyppiSelect.value === 'Muu' ? muuMateriaaliInput.value.trim() : materiaaliTyyppiSelect.value);
    const kilomäärä = parseFloat(kiloMaaraInput.value);

    if (!materiaali || isNaN(kilomäärä) || kilomäärä <= 0) return alert('Tarkista syötteet.');

    if (materiaaliTyyppiSelect.value === 'Muu' && muistaMateriaaliCheckbox.checked) {
        set(ref(database, `materiaalit/${materiaali}`), true);
    }

    const uusiKirjaus = { materiaali, kilomäärä, aikaleima: new Date().toISOString() };
    push(ref(database, `kirjaukset/${currentListId}`), uusiKirjaus);
    
    lomake.reset();
    muuMateriaaliInput.classList.add('hidden');
    muistaMateriaaliContainer.classList.add('hidden');
    materiaaliTyyppiSelect.value = "";
});

arkistoiListaBtn.addEventListener('click', () => { /* ...koodi ennallaan... */ });
poistaArkistointiBtn.addEventListener('click', () => { /* ...koodi ennallaan... */ });
poistaListaBtn.addEventListener('click', async () => { /* ...koodi ennallaan... */ });
kirjausLista.addEventListener('click', async (e) => { /* ...koodi ennallaan... */ });
saveEditBtn.addEventListener('click', async () => { /* ...koodi ennallaan... */ });
cancelEditBtn.addEventListener('click', () => { /* ...koodi ennallaan... */ });

function initializePage() {
    const listFromUrl = new URLSearchParams(window.location.search).get('lista');
    lataaListat();
    lataaMateriaalitValikko(); // Ladataan dynaaminen materiaalivalikko
    // Varmistetaan että oletusmateriaalit on olemassa
    const materiaalitRef = ref(database, 'materiaalit');
    get(materiaalitRef).then(snapshot => {
        if (!snapshot.exists()) {
            set(materiaalitRef, { "Muovi SER": true, "Metalli SER": true, "Johdot": true, "Virtalähteet": true });
        }
    });
    if (listFromUrl) {
        handleListSelection(listFromUrl);
    }
}

initializePage();
