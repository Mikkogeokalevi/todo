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

// --- DOM-ELEMENTIT ---
const uusiListaSijaintiSelect = document.getElementById('uusiListaSijainti');
const lisaaMateriaaliLomake = document.getElementById('lisaa-materiaali-lomake');
const uusiMateriaaliNimiInput = document.getElementById('uusiMateriaaliNimi');
const uusiMateriaaliSijaintiSelect = document.getElementById('uusiMateriaaliSijainti');
const materiaaliHallintaLista = document.getElementById('materiaali-hallinta-lista');
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
const materiaaliTyyppiSelect = document.getElementById('materiaali-tyyppi');
const muuMateriaaliInput = document.getElementById('muu-materiaali-syotto');
// Kirjauksen muokkaus
const editModal = document.getElementById('edit-modal');
const editMateriaaliNimi = document.getElementById('edit-materiaali-nimi');
const editKiloMaara = document.getElementById('edit-kilo-maara');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
// Materiaalin muokkaus
const editMaterialModal = document.getElementById('edit-material-modal');
const editMaterialName = document.getElementById('edit-material-name');
const editMaterialLocation = document.getElementById('edit-material-location');
const saveMaterialEditBtn = document.getElementById('save-material-edit-btn');
const cancelMaterialEditBtn = document.getElementById('cancel-material-edit-btn');

// --- GLOBAALIT MUUTTUJAT ---
let currentListId = null;
let listDataUnsubscribe = null;
let currentEditingEntryId = null;
let currentEditingMaterialId = null; // Materiaalin muokkausta varten

const formatSuomalainenAika = (isoString) => isoString ? new Date(isoString).toLocaleString('fi-FI', { dateStyle: 'short', timeStyle: 'short' }) : '';
const normalizeListName = (listName) => listName.trim().toLowerCase().replace(/\s+/g, '-');

async function lataaSijainninMateriaalit(sijainti) {
    materiaaliTyyppiSelect.innerHTML = '<option value="" disabled selected>Valitse tyyppi...</option>';
    
    const materiaalitRef = ref(database, 'materiaalit');
    const snapshot = await get(materiaalitRef);

    if (snapshot.exists()) {
        const materiaalit = snapshot.val();
        Object.values(materiaalit)
            // PÄIVITETTY LOGIIKKA:
            // 1. Jos listalla ei ole sijaintia (!sijainti), näytä kaikki.
            // 2. Jos listalla on sijainti, näytä sen sijainnin materiaalit.
            // 3. Näytä AINA myös "Yleinen"-sijainnin materiaalit.
            .filter(m => !sijainti || m.sijainti === sijainti || m.sijainti === 'Yleinen')
            .sort((a, b) => a.nimi.localeCompare(b.nimi))
            .forEach(m => {
                const option = document.createElement('option');
                option.value = m.nimi;
                option.textContent = m.nimi;
                materiaaliTyyppiSelect.appendChild(option);
            });
    }

    const muuOption = document.createElement('option');
    muuOption.value = 'Muu';
    muuOption.textContent = 'Muu, mikä?';
    materiaaliTyyppiSelect.appendChild(muuOption);
}

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
    
    await lataaSijainninMateriaalit(meta.sijainti);

    const onArkistoitu = meta.status === 'archived';
    const sijaintiText = meta.sijainti ? `Sijainti: ${meta.sijainti}` : 'Ei sijaintia';
    listaStatusBadge.textContent = onArkistoitu ? `Arkistoitu: ${formatSuomalainenAika(meta.arkistoituAika)}` : sijaintiText;
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
    // ... (Tämä funktio pysyy ennallaan)
    if (!currentListId) return;
    if (listDataUnsubscribe) listDataUnsubscribe();
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    listDataUnsubscribe = onValue(kirjauksetRef, (snapshot) => {
        kirjausLista.innerHTML = '';
        yhteenvetoLista.innerHTML = '';
        if (snapshot.exists()) {
            const data = snapshot.val();
            const sums = {};
            const sortedEntries = Object.entries(data).sort((a, b) => new Date(b[1].aikaleima) - new Date(a[1].aikaleima));

            sortedEntries.forEach(([key, kirjaus]) => {
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
            const listat = snapshot.val();
            const sortedLists = Object.entries(listat).sort((a, b) => (a[1]?.nimi || '').localeCompare(b[1]?.nimi || ''));
            
            sortedLists.forEach(([listId, meta]) => {
                const sijaintiTeksti = meta.sijainti ? `[${meta.sijainti}]` : '[Ei sijaintia]';
                const displayText = `${meta.nimi} ${sijaintiTeksti}`;
                
                if (meta.status === 'active') {
                    const nappi = document.createElement('button');
                    nappi.textContent = displayText;
                    nappi.className = 'aktiivinen-lista-nappi';
                    nappi.onclick = () => handleListSelection(listId);
                    aktiivisetListatContainer.appendChild(nappi);
                } else if (meta.status === 'archived') {
                    const option = document.createElement('option');
                    option.value = listId;
                    option.textContent = displayText;
                    arkistoValikko.appendChild(option);
                }
            });
            if (aktiivisetListatContainer.innerHTML === '') aktiivisetListatContainer.innerHTML = '<p>Ei aktiivisia listoja.</p>';
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

luoUusiListaBtn.addEventListener('click', () => {
    const listName = uusiListaNimiInput.value.trim();
    const sijainti = uusiListaSijaintiSelect.value;
    if (!listName) return alert('Anna uudelle listalle nimi.');
    
    // ID luodaan nyt nimestä ja sijainnista, jotta se on uniikimpi
    const listId = normalizeListName(`${sijainti || 'sijainniton'}-${listName}`);
    
    const uusiListaMeta = { nimi: listName, status: 'active', sijainti: sijainti };

    const listRef = ref(database, `listat/${listId}`);
    get(listRef).then((snapshot) => {
        if (snapshot.exists()) {
            alert('Virhe: Vastaava lista on jo olemassa. Valitse uniikki nimi tai sijainti.');
        } else {
             set(listRef, uusiListaMeta).then(() => handleListSelection(listId));
        }
    });
});

function lataaMateriaalienHallinta() {
    onValue(ref(database, 'materiaalit'), (snapshot) => {
        materiaaliHallintaLista.innerHTML = '';
        if (snapshot.exists()) {
            const materiaalit = snapshot.val();
            const sorted = Object.entries(materiaalit).sort((a, b) => {
                if (a[1].sijainti < b[1].sijainti) return -1;
                if (a[1].sijainti > b[1].sijainti) return 1;
                return a[1].nimi.localeCompare(b[1].nimi);
            });

            sorted.forEach(([key, value]) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span><strong>${value.nimi}</strong> (${value.sijainti})</span>
                    <div class="material-actions">
                        <button class="edit-material-btn" data-id="${key}" title="Muokkaa">✏️</button>
                        <button class="delete-material-btn" data-id="${key}" title="Poista">🗑️</button>
                    </div>
                `;
                materiaaliHallintaLista.appendChild(li);
            });
        } else {
            materiaaliHallintaLista.innerHTML = '<li>Ei määriteltyjä materiaaleja.</li>';
        }
    });
}

lisaaMateriaaliLomake.addEventListener('submit', (e) => {
    e.preventDefault();
    const nimi = uusiMateriaaliNimiInput.value.trim();
    const sijainti = uusiMateriaaliSijaintiSelect.value;
    if (!nimi) return;
    push(ref(database, 'materiaalit'), { nimi, sijainti });
    lisaaMateriaaliLomake.reset();
});

materiaaliHallintaLista.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const materiaaliId = button.dataset.id;
    
    if (button.classList.contains('delete-material-btn')) {
        if (confirm('Haluatko varmasti poistaa tämän materiaalityypin?')) {
            remove(ref(database, `materiaalit/${materiaaliId}`));
        }
    } else if (button.classList.contains('edit-material-btn')) {
        const snapshot = await get(ref(database, `materiaalit/${materiaaliId}`));
        if (snapshot.exists()) {
            const data = snapshot.val();
            currentEditingMaterialId = materiaaliId;
            editMaterialName.value = data.nimi;
            editMaterialLocation.value = data.sijainti;
            editMaterialModal.classList.remove('hidden');
        }
    }
});

saveMaterialEditBtn.addEventListener('click', () => {
    if (!currentEditingMaterialId) return;
    const newName = editMaterialName.value.trim();
    if (!newName) return alert("Materiaalin nimi ei voi olla tyhjä.");

    const updatedData = {
        nimi: newName,
        sijainti: editMaterialLocation.value
    };

    update(ref(database, `materiaalit/${currentEditingMaterialId}`), updatedData);
    editMaterialModal.classList.add('hidden');
    currentEditingMaterialId = null;
});

cancelMaterialEditBtn.addEventListener('click', () => {
    editMaterialModal.classList.add('hidden');
    currentEditingMaterialId = null;
});

// Kaikki muut event listenerit (palaa, tulosta, arkistoi, poista, muokkaa kirjausta jne.)
// pysyvät ennallaan, joten ne on kopioitu alle sellaisenaan.

palaaTakaisinBtn.addEventListener('click', palaaAlkuun);
tulostaBtn.addEventListener('click', () => window.print());
arkistoValikko.addEventListener('change', () => { if (arkistoValikko.value) handleListSelection(arkistoValikko.value) });
materiaaliTyyppiSelect.addEventListener('change', () => {
    const onMuu = materiaaliTyyppiSelect.value === 'Muu';
    muuMateriaaliInput.classList.toggle('hidden', !onMuu);
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
    const uusiKirjaus = { materiaali, kilomäärä, aikaleima: new Date().toISOString() };
    push(ref(database, `kirjaukset/${currentListId}`), uusiKirjaus);
    lomake.reset();
    muuMateriaaliInput.classList.add('hidden');
    materiaaliTyyppiSelect.value = "";
});
arkistoiListaBtn.addEventListener('click', () => {
    if (!currentListId) return;
    update(ref(database, `listat/${currentListId}`), { status: 'archived', arkistoituAika: new Date().toISOString() }).then(() => {
        alert('Lista arkistoitu.');
        palaaAlkuun();
    });
});
poistaArkistointiBtn.addEventListener('click', () => {
    if (!currentListId) return;
    update(ref(database, `listat/${currentListId}`), { status: 'active', arkistoituAika: null }).then(() => {
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
        kilomäärä: parseFloat(editKiloMaara.value),
    };
    if (isNaN(paivitetytTiedot.kilomäärä)) {
        return alert("Tarkista muokatut tiedot.");
    }
    await update(ref(database, `kirjaukset/${currentListId}/${currentEditingEntryId}`), {
        ...paivitetytTiedot,
        muokattuAikaleima: new Date().toISOString()
    });
    editModal.classList.add('hidden');
    currentEditingEntryId = null;
});
cancelEditBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
    currentEditingEntryId = null;
});
muokkaaListaaBtn.addEventListener('click', () => {
    muokkaaNimeaContainer.style.display = 'flex';
    document.getElementById('muokkaa-nimea-input').value = aktiivinenListaNimi.textContent;
    document.getElementById('muokkaa-nimea-input').focus();
});
document.getElementById('peruuta-nimi-btn').addEventListener('click', () => {
    muokkaaNimeaContainer.style.display = 'none';
});
document.getElementById('tallenna-nimi-btn').addEventListener('click', async () => {
    // Listan nimen muokkauslogiikka säilyy ennallaan
    const muokkaaNimeaInput = document.getElementById('muokkaa-nimea-input');
    const newName = muokkaaNimeaInput.value.trim();
    if (!newName || !currentListId) return document.getElementById('peruuta-nimi-btn').click();
    await update(ref(database, `listat/${currentListId}`), { nimi: newName });
    aktiivinenListaNimi.textContent = newName;
    document.getElementById('peruuta-nimi-btn').click();
    alert('Nimi päivitetty!');
});

function initializePage() {
    const listFromUrl = new URLSearchParams(window.location.search).get('lista');
    lataaListat();
    lataaMateriaalienHallinta();
    if (listFromUrl) {
        get(ref(database, `listat/${listFromUrl}`)).then(snapshot => {
            if (snapshot.exists()) {
                handleListSelection(listFromUrl);
            }
        });
    }
}

initializePage();
