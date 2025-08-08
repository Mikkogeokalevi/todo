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
const listaStatusBadge = document.getElementById('lista-status-badge');
const otsikkoContainer = document.getElementById('otsikko-container');
const palaaTakaisinBtn = document.getElementById('palaa-takaisin-btn');
const poistaArkistointiBtn = document.getElementById('poista-arkistointi-btn');
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

async function handleListSelection(listId) {
    if (!listId) return;
    currentListId = listId;

    // Hae listan metatiedot (nimi ja status)
    const metaRef = ref(database, `listat/${listId}`);
    const metaSnapshot = await get(metaRef);

    if (!metaSnapshot.exists()) {
        alert("Virhe: Listan tietoja ei löytynyt. Se on saatettu poistaa.");
        palaaAlkuun();
        return;
    }

    const meta = metaSnapshot.val();
    aktiivinenListaNimi.textContent = meta.nimi;

    // Aseta näkymä tilan (status) mukaan
    const onArkistoitu = meta.status === 'archived';

    // Näytä tai piilota "(Arkistoitu)"-merkintä
    listaStatusBadge.textContent = onArkistoitu ? "(Arkistoitu)" : "";

    // Säädä nappien ja lomakkeen näkyvyyttä
    lomake.classList.toggle('hidden', onArkistoitu);
    muokkaaListaaBtn.classList.toggle('hidden', onArkistoitu);
    poistaListaBtn.classList.toggle('hidden', onArkistoitu);
    arkistoiListaBtn.classList.toggle('hidden', onArkistoitu);
    poistaArkistointiBtn.classList.toggle('hidden', !onArkistoitu);

    // Siirry listanäkymään
    listanvalintaOsio.classList.add('hidden');
    kirjausOsio.classList.remove('hidden');
    muokkaaNimeaContainer.style.display = 'none';
    
    history.pushState({ path: `${window.location.pathname}?lista=${currentListId}` }, '', `${window.location.pathname}?lista=${currentListId}`);
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
            const kirjaukset = Object.values(data).reverse();
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
            let activeCount = 0;
            Object.entries(listat).forEach(([listId, meta]) => {
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
            if (activeCount === 0) {
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

// Tapahtumankuuntelijat
palaaTakaisinBtn.addEventListener('click', palaaAlkuun);
arkistoValikko.addEventListener('change', () => {
    if(arkistoValikko.value) handleListSelection(arkistoValikko.value)
});

luoUusiListaBtn.addEventListener('click', () => {
    const listName = uusiListaNimiInput.value.trim();
    if (!listName) return alert('Anna uudelle listalle nimi.');
    const listId = normalizeListName(listName);
    const uusiListaMeta = { nimi: listName, status: 'active' };
    set(ref(database, `listat/${listId}`), uusiListaMeta).then(() => handleListSelection(listId));
});

arkistoiListaBtn.addEventListener('click', () => {
    if (!currentListId) return;
    const statusRef = ref(database, `listat/${currentListId}/status`);
    set(statusRef, 'archived').then(() => {
        alert('Lista arkistoitu.');
        palaaAlkuun();
    });
});

poistaArkistointiBtn.addEventListener('click', () => {
    if (!currentListId) return;
    const statusRef = ref(database, `listat/${currentListId}/status`);
    set(statusRef, 'active').then(() => {
        alert('Arkistointi poistettu. Lista on taas aktiivinen.');
        handleListSelection(currentListId); // Ladataan lista uudelleen aktiivisena
    });
});

poistaListaBtn.addEventListener('click', async () => {
    if (!currentListId) return;
    if (!confirm(`POISTO ON LOPULLINEN! Haluatko varmasti poistaa listan "${aktiivinenListaNimi.textContent}"?`)) return;
    
    await remove(ref(database, `listat/${currentListId}`));
    await remove(ref(database, `kirjaukset/${currentListId}`));
    alert('Lista ja sen tiedot on poistettu pysyvästi.');
    palaaAlkuun();
});

lomake.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentListId) return;
    let materiaali = materiaaliTyyppiSelect.value === 'Muu' ? muuMateriaaliInput.value.trim() : materiaaliTyyppiSelect.value;
    const kilomäärä = parseFloat(kiloMaaraInput.value);
    if (!materiaali || isNaN(kilomäärä) || kilomäärä <= 0) return alert('Tarkista syötteet.');
    
    const uusiKirjaus = { materiaali, kilomäärä, aikaleima: new Date().toISOString() };
    push(ref(database, `kirjaukset/${currentListId}`), uusiKirjaus).then(() => {
        lomake.reset();
        muuMateriaaliInput.classList.add('hidden');
        materiaaliTyyppiSelect.value = "";
    });
});

muokkaaListaaBtn.addEventListener('click', () => {
    muokkaaNimeaContainer.style.display = 'flex';
    muokkaaNimeaInput.value = aktiivinenListaNimi.textContent;
    muokkaaNimeaInput.focus();
});

peruutaNimiBtn.addEventListener('click', () => {
    muokkaaNimeaContainer.style.display = 'none';
});

tallennaNimiBtn.addEventListener('click', async () => {
    const newName = muokkaaNimeaInput.value.trim();
    if (!newName || !currentListId) return peruutaNimiBtn.click();
    
    await set(ref(database, `listat/${currentListId}/nimi`), newName);
    aktiivinenListaNimi.textContent = newName;
    peruutaNimiBtn.click();
    alert('Nimi päivitetty!');
});

function initializePage() {
    const listFromUrl = new URLSearchParams(window.location.search).get('lista');
    lataaListat();
    if (listFromUrl) {
        handleListSelection(listFromUrl);
    }
}

initializePage();
