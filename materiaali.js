import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set, get, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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
const otsikkoContainer = document.getElementById('otsikko-container');

const palaaTakaisinBtn = document.getElementById('palaa-takaisin-btn');
const arkistoiListaBtn = document.getElementById('arkistoi-lista-btn');
const muokkaaListaaBtn = document.getElementById('muokkaa-listaa-btn');
const poistaListaBtn = document.getElementById('poista-lista-btn');

const muokkaaNimeaContainer = document.getElementById('muokkaa-nimea-container');
const muokkaaNimeaInput = document.getElementById('muokkaa-nimea-input');
const tallennaNimiBtn = document.getElementById('tallenna-nimi-btn');
const peruutaNimiBtn = document.getElementById('peruuta-nimi-btn');

const lomake = document.getElementById('materiaali-lomake');
const materiaaliTyyppiSelect = document.getElementById('materiaali-tyyppi');
const muuMateriaaliInput = document.getElementById('muu-materiaali-syotto');
const kiloMaaraInput = document.getElementById('kilo-maara');
const kirjausLista = document.getElementById('kirjaus-lista');

let currentListId = null;
let listDataUnsubscribe = null;

const formatSuomalainenAika = (isoString) => isoString ? new Date(isoString).toLocaleString('fi-FI') : '';
const normalizeListName = (listName) => listName.trim().toLowerCase().replace(/\s+/g, '-');

function handleListSelection(listId) {
    if (!listId) return;
    currentListId = listId;
    const displayName = listId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    history.pushState({ path: `${window.location.pathname}?lista=${currentListId}` }, '', `${window.location.pathname}?lista=${currentListId}`);

    listanvalintaOsio.classList.add('hidden');
    kirjausOsio.classList.remove('hidden');
    aktiivinenListaNimi.textContent = displayName;
    otsikkoContainer.classList.remove('hidden');
    muokkaaNimeaContainer.style.display = 'none';
    
    loadListData();
}

function loadListData() {
    if (!currentListId) return;
    if (listDataUnsubscribe) listDataUnsubscribe();
    
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    listDataUnsubscribe = onValue(kirjauksetRef, (snapshot) => {
        kirjausLista.innerHTML = '';
        if (snapshot.exists()) {
            const kirjaukset = Object.values(snapshot.val()).reverse();
            kirjaukset.forEach(kirjaus => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="kirjaus-tiedot">${kirjaus.kilomäärä} kg - ${kirjaus.materiaali}</span><span class="kirjaus-aika">${formatSuomalainenAika(kirjaus.aikaleima)}</span>`;
                kirjausLista.appendChild(li);
            });
        } else {
            kirjausLista.innerHTML = '<li>Ei vielä kirjauksia tällä listalla.</li>';
        }
    });
}

function lataaListat() {
    const listatRef = ref(database, 'listat');
    onValue(listatRef, (snapshot) => {
        aktiivisetListatContainer.innerHTML = '';
        arkistoValikko.innerHTML = '<option value="">Valitse arkistoitu lista...</option>';

        if (snapshot.exists()) {
            const listat = snapshot.val();
            let hasActiveLists = false;

            Object.entries(listat).forEach(([listId, meta]) => {
                if (meta.status === 'active') {
                    hasActiveLists = true;
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
            if (!hasActiveLists) {
                aktiivisetListatContainer.innerHTML = '<p>Ei aktiivisia listoja. Luo uusi!</p>';
            }
        } else {
            aktiivisetListatContainer.innerHTML = '<p>Ei listoja. Luo ensimmäinen listasi!</p>';
        }
    });
}

function palaaAlkuun() {
    kirjausOsio.classList.add('hidden');
    listanvalintaOsio.classList.remove('hidden');
    currentListId = null;
    history.pushState(null, '', window.location.pathname);
    uusiListaNimiInput.value = "";
    arkistoValikko.value = "";
}

palaaTakaisinBtn.addEventListener('click', palaaAlkuun);
arkistoValikko.addEventListener('change', () => handleListSelection(arkistoValikko.value));

luoUusiListaBtn.addEventListener('click', () => {
    const listName = uusiListaNimiInput.value.trim();
    if (!listName) {
        alert('Anna uudelle listalle nimi.');
        return;
    }
    const listId = normalizeListName(listName);
    const uusiListaMeta = { nimi: listName, status: 'active' };
    
    set(ref(database, `listat/${listId}`), uusiListaMeta).then(() => {
        handleListSelection(listId);
    }).catch(error => console.error("Virhe uuden listan luonnissa: ", error));
});

arkistoiListaBtn.addEventListener('click', () => {
    if (!currentListId) return;
    const confirmation = confirm(`Haluatko varmasti arkistoida listan "${aktiivinenListaNimi.textContent}"?`);
    if (confirmation) {
        const statusRef = ref(database, `listat/${currentListId}/status`);
        set(statusRef, 'archived').then(() => {
            alert('Lista arkistoitu.');
            palaaAlkuun();
        }).catch(error => console.error("Virhe arkistoinnissa: ", error));
    }
});

poistaListaBtn.addEventListener('click', async () => {
    if (!currentListId) return;
    const confirmation = confirm(`POISTO ON LOPULLINEN! Haluatko varmasti poistaa koko listan "${aktiivinenListaNimi.textContent}"?`);
    if (confirmation) {
        const listMetaRef = ref(database, `listat/${currentListId}`);
        const listDataRef = ref(database, `kirjaukset/${currentListId}`);
        try {
            await remove(listMetaRef);
            await remove(listDataRef);
            alert('Lista ja sen tiedot on poistettu pysyvästi.');
            palaaAlkuun();
        } catch (error) {
            console.error("Virhe poistossa: ", error);
        }
    }
});

lomake.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentListId) return;
    let materiaali = materiaaliTyyppiSelect.value === 'Muu' ? muuMateriaaliInput.value.trim() : materiaaliTyyppiSelect.value;
    const kilomäärä = parseFloat(kiloMaaraInput.value);

    if (!materiaali || isNaN(kilomäärä) || kilomäärä <= 0) {
        alert('Tarkista syötteet.');
        return;
    }

    const uusiKirjaus = { materiaali, kilomäärä, aikaleima: new Date().toISOString() };
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    push(kirjauksetRef, uusiKirjaus)
        .then(() => {
            lomake.reset();
            muuMateriaaliInput.classList.add('hidden');
            materiaaliTyyppiSelect.value = "";
        })
        .catch((error) => console.error("Virhe tallennuksessa: ", error));
});

// Nimenmuokkaus-logiikka pysyy ennallaan...
muokkaaListaaBtn.addEventListener('click', () => { /* ... */ });
peruutaNimiBtn.addEventListener('click', () => { /* ... */ });
tallennaNimiBtn.addEventListener('click', async () => { /* ... */ });


function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const listFromUrl = urlParams.get('lista');
    
    muokkaaNimeaContainer.style.display = 'none';
    lataaListat();

    if (listFromUrl) {
        handleListSelection(listFromUrl);
    }
}

initializePage();
