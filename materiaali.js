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
const muokkaaNimeaContainer = document.getElementById('muokkaa-nimea-container');
const kirjausLista = document.getElementById('kirjaus-lista');
const yhteenvetoLista = document.getElementById('yhteenveto-lista');
const lomake = document.getElementById('materiaali-lomake');
// ...loput vanhat muuttujat...
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
        yhteenvetoLista.innerHTML = ''; // Tyhjennetään myös yhteenveto

        if (snapshot.exists()) {
            const data = snapshot.val();
            const sums = {}; // Objekti summien tallentamiseen

            // Käydään läpi kirjaukset, renderöidään ne ja lasketaan summia
            Object.entries(data).forEach(([key, kirjaus]) => {
                // Renderöi yksittäinen kirjausrivi
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

                // Laske yhteenvetoa
                const materiaaliNimi = kirjaus.materiaali.trim();
                if (sums[materiaaliNimi]) {
                    sums[materiaaliNimi] += kirjaus.kilomäärä;
                } else {
                    sums[materiaaliNimi] = kirjaus.kilomäärä;
                }
            });

            // Renderöi yhteenvetolista
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

// **KORJATTU TALLENNUSLOGIIKKA**
lomake.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentListId) return;
    const materiaaliTyyppiSelect = document.getElementById('materiaali-tyyppi');
    const muuMateriaaliInput = document.getElementById('muu-materiaali-syotto');
    const kiloMaaraInput = document.getElementById('kilo-maara');

    let materiaali = (materiaaliTyyppiSelect.value === 'Muu' ? muuMateriaaliInput.value.trim() : materiaaliTyyppiSelect.value);
    const kilomäärä = parseFloat(kiloMaaraInput.value);

    if (!materiaali || isNaN(kilomäärä) || kilomäärä <= 0) return alert('Tarkista syötteet.');

    // Aina luodaan uusi kirjaus PUSH-komennolla
    const uusiKirjaus = { materiaali, kilomäärä, aikaleima: new Date().toISOString() };
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    push(kirjauksetRef, uusiKirjaus);
    
    lomake.reset();
    muuMateriaaliInput.classList.add('hidden');
    materiaaliTyyppiSelect.value = "";
});

// Kaikki muut funktiot (lataaListat, palaaAlkuun, napit, modaali jne.) pysyvät ennallaan
// ... (liitä aiemman vastauksen loput funktiot tähän)
function lataaListat() {
    onValue(ref(database, 'listat'), (snapshot) => {
        aktiivisetListatContainer.innerHTML = '';
        arkistoValikko.innerHTML = '<option value="">Valitse arkistoitu lista...</option>';
        if (snapshot.exists()) {
            const listat = snapshot.val();
            let activeCount = 0;
            Object.entries(listat).sort((a,b) => a[1].nimi.localeCompare(b[1].nimi)).forEach(([listId, meta]) => {
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
function palaaAlkuun() {
    kirjausOsio.classList.add('hidden');
    listanvalintaOsio.classList.remove('hidden');
    if (listDataUnsubscribe) listDataUnsubscribe();
    currentListId = null;
    history.pushState(null, '', window.location.pathname);
    uusiListaNimiInput.value = "";
    arkistoValikko.value = "";
}
palaaTakaisinBtn.addEventListener('click', palaaAlkuun);
tulostaBtn.addEventListener('click', () => window.print());
arkistoValikko.addEventListener('change', () => { if(arkistoValikko.value) handleListSelection(arkistoValikko.value) });
luoUusiListaBtn.addEventListener('click', () => {
    const listName = uusiListaNimiInput.value.trim();
    if (!listName) return alert('Anna uudelle listalle nimi.');
    const listId = normalizeListName(listName);
    const uusiListaMeta = { nimi: listName, status: 'active' };
    set(ref(database, `listat/${listId}`), uusiListaMeta).then(() => handleListSelection(listId));
});
arkistoiListaBtn.addEventListener('click', () => {
    if (!currentListId) return;
    const metaRef = ref(database, `listat/${currentListId}`);
    update(metaRef, { status: 'archived', arkistoituAika: new Date().toISOString() }).then(() => {
        alert('Lista arkistoitu.');
        palaaAlkuun();
    });
});
poistaArkistointiBtn.addEventListener('click', () => {
    if (!currentListId) return;
    const metaRef = ref(database, `listat/${currentListId}`);
    update(metaRef, { status: 'active', arkistoituAika: null }).then(() => {
        alert('Arkistointi poistettu.');
        handleListSelection(currentListId);
    });
});
poistaListaBtn.addEventListener('click', async () => {
    if (!currentListId || !confirm(`POISTO ON LOPULLINEN! Haluatko varmasti poistaa listan "${aktiivinenListaNimi.textContent}"?`)) return;
    await remove(ref(database, `listat/${currentListId}`));
    await remove(ref(database, `kirjaukset/${currentListId}`));
    alert('Lista ja sen tiedot on poistettu.');
    palaaAlkuun();
});
kirjausLista.addEventListener('click', async (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const entryId = li.dataset.id;
    const entryRef = ref(database, `kirjaukset/${currentListId}/${entryId}`);
    if (e.target.matches('.delete-entry-btn')) {
        if (confirm('Haluatko varmasti poistaa tämän kirjauksen?')) {
            await remove(entryRef);
        }
    } else if (e.target.matches('.edit-entry-btn')) {
        const snapshot = await get(entryRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            currentEditingEntryId = entryId;
            editMateriaaliNimi.value = data.materiaali;
            editKiloMaara.value = data.kilomäärä;
            editModal.classList.remove('hidden');
        }
    }
});
saveEditBtn.addEventListener('click', async () => {
    if (!currentEditingEntryId) return;
    const paivitetytTiedot = {
        materiaali: editMateriaaliNimi.value.trim(),
        kilomäärä: parseFloat(editKiloMaara.value),
        aikaleima: new Date().toISOString()
    };
    if (!paivitetytTiedot.materiaali || isNaN(paivitetytTiedot.kilomäärä)) {
        return alert("Tarkista muokatut tiedot.");
    }
    await update(ref(database, `kirjaukset/${currentListId}/${currentEditingEntryId}`), paivitetytTiedot);
    editModal.classList.add('hidden');
    currentEditingEntryId = null;
});
cancelEditBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
    currentEditingEntryId = null;
});
muokkaaListaaBtn.addEventListener('click', () => {
    const muokkaaNimeaContainer = document.getElementById('muokkaa-nimea-container');
    const muokkaaNimeaInput = document.getElementById('muokkaa-nimea-input');
    muokkaaNimeaContainer.style.display = 'flex';
    muokkaaNimeaInput.value = document.getElementById('aktiivinenListaNimi').textContent;
    muokkaaNimeaInput.focus();
});
document.getElementById('peruuta-nimi-btn').addEventListener('click', () => {
    document.getElementById('muokkaa-nimea-container').style.display = 'none';
});
document.getElementById('tallenna-nimi-btn').addEventListener('click', async () => {
    const muokkaaNimeaInput = document.getElementById('muokkaa-nimea-input');
    const newName = muokkaaNimeaInput.value.trim();
    if (!newName || !currentListId) return document.getElementById('peruuta-nimi-btn').click();
    await set(ref(database, `listat/${currentListId}/nimi`), newName);
    document.getElementById('aktiivinenListaNimi').textContent = newName;
    document.getElementById('peruuta-nimi-btn').click();
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
