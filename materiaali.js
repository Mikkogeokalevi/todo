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
const listaValikko = document.getElementById('listaValikko');
const uusiListaNimiInput = document.getElementById('uusiListaNimi');
const kirjausOsio = document.getElementById('kirjaus-osio');
const aktiivinenListaNimi = document.getElementById('aktiivinenListaNimi');
const otsikkoContainer = document.getElementById('otsikko-container');
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

// Sovelluksen tila
let currentListId = null;
let listDataUnsubscribe = null;

const formatSuomalainenAika = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('fi-FI');
};

const normalizeListName = (listName) => listName.trim().toLowerCase().replace(/\s+/g, '-');

function handleListSelection(listName) {
    if (!listName || listName.trim() === '') return;
    currentListId = normalizeListName(listName);
    
    const displayName = listName.trim().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const newUrl = `${window.location.pathname}?lista=${currentListId}`;
    history.pushState({ path: newUrl }, '', newUrl);

    listanvalintaOsio.classList.add('hidden');
    kirjausOsio.classList.remove('hidden');
    aktiivinenListaNimi.textContent = displayName;
    
    // Varmistetaan, että oikeat elementit näkyvät ja piilotetaan
    otsikkoContainer.classList.remove('hidden');
    muokkaaNimeaContainer.classList.add('hidden');
    
    loadListData();
}

function loadListData() {
    if (!currentListId) return;
    if (listDataUnsubscribe) listDataUnsubscribe();
    
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    
    listDataUnsubscribe = onValue(kirjauksetRef, (snapshot) => {
        kirjausLista.innerHTML = '';
        if (snapshot.exists()) {
            const data = snapshot.val();
            const kirjaukset = Object.entries(data).map(([id, value]) => ({ id, ...value }));
            kirjaukset.reverse();
            kirjaukset.forEach(kirjaus => {
                const li = document.createElement('li');
                li.dataset.id = kirjaus.id;
                li.innerHTML = `<span class="kirjaus-tiedot">${kirjaus.kilomäärä} kg - ${kirjaus.materiaali}</span><span class="kirjaus-aika">${formatSuomalainenAika(kirjaus.aikaleima)}</span>`;
                kirjausLista.appendChild(li);
            });
        } else {
            kirjausLista.innerHTML = '<li>Ei vielä kirjauksia tällä listalla.</li>';
        }
    });
}

function loadListMenu() {
    const allListsRef = ref(database, 'kirjaukset');
    onValue(allListsRef, (snapshot) => {
        listaValikko.innerHTML = '<option value="">Valitse olemassa oleva...</option>';
        if (snapshot.exists()) {
            Object.keys(snapshot.val()).forEach(listId => {
                const option = document.createElement('option');
                option.value = listId;
                option.textContent = listId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                listaValikko.appendChild(option);
            });
        }
    });
}

muokkaaListaaBtn.addEventListener('click', () => {
    otsikkoContainer.classList.add('hidden');
    muokkaaNimeaContainer.classList.remove('hidden');
    muokkaaNimeaInput.value = aktiivinenListaNimi.textContent;
    muokkaaNimeaInput.focus();
});

peruutaNimiBtn.addEventListener('click', () => {
    otsikkoContainer.classList.remove('hidden');
    muokkaaNimeaContainer.classList.add('hidden');
});

tallennaNimiBtn.addEventListener('click', async () => {
    const newName = muokkaaNimeaInput.value.trim();
    if (!newName || newName === aktiivinenListaNimi.textContent) {
        peruutaNimiBtn.click();
        return;
    }

    const newId = normalizeListName(newName);
    if (newId === currentListId) return;

    const oldRef = ref(database, `kirjaukset/${currentListId}`);
    const snapshot = await get(oldRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        const newRef = ref(database, `kirjaukset/${newId}`);
        await set(newRef, data);
        await remove(oldRef);
    }
    window.location.href = `${window.location.pathname}?lista=${newId}`;
});

poistaListaBtn.addEventListener('click', () => {
    if (!currentListId) return;
    const confirmation = confirm(`Haluatko varmasti poistaa koko listan "${aktiivinenListaNimi.textContent}" ja kaikki sen tiedot? Tätä toimintoa ei voi peruuttaa.`);
    if (confirmation) {
        console.log(`Yritetään poistaa lista ID:llä: ${currentListId}`);
        const listRef = ref(database, `kirjaukset/${currentListId}`);
        remove(listRef)
            .then(() => {
                console.log('Lista poistettu onnistuneesti.');
                alert(`Lista "${aktiivinenListaNimi.textContent}" on poistettu.`);
                window.location.href = window.location.pathname;
            })
            .catch(error => {
                console.error("Virhe listan poistossa:", error);
                alert('Listan poistossa tapahtui virhe. Tarkista konsoli (F12) saadaksesi lisätietoja.');
            });
    }
});

listaValikko.addEventListener('change', () => handleListSelection(listaValikko.value));
uusiListaNimiInput.addEventListener('change', () => handleListSelection(uusiListaNimiInput.value));

materiaaliTyyppiSelect.addEventListener('change', () => {
    if (materiaaliTyyppiSelect.value === 'Muu') {
        muuMateriaaliInput.classList.remove('hidden');
        muuMateriaaliInput.required = true;
        muuMateriaaliInput.focus();
    } else {
        muuMateriaaliInput.classList.add('hidden');
        muuMateriaaliInput.required = false;
    }
});

lomake.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentListId) { alert("Virhe: Yhtään listaa ei ole valittu."); return; }
    let materiaali = materiaaliTyyppiSelect.value;
    if (materiaali === 'Muu') { materiaali = muuMateriaaliInput.value.trim(); }
    const kilomäärä = parseFloat(kiloMaaraInput.value);
    if (!materiaali || isNaN(kilomäärä) || kilomäärä <= 0) { alert('Tarkista, että kaikki tiedot on syötetty oikein.'); return; }
    const uusiKirjaus = { materiaali, kilomäärä, aikaleima: new Date().toISOString() };
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    push(kirjauksetRef, uusiKirjaus)
        .then(() => { lomake.reset(); muuMateriaaliInput.classList.add('hidden'); })
        .catch((error) => console.error("Virhe tallennuksessa: ", error));
});

function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const listFromUrl = urlParams.get('lista');
    loadListMenu();
    if (listFromUrl) {
        handleListSelection(listFromUrl);
    }
}

initializePage();
