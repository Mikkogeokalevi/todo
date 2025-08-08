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

// --- UUDET DOM-ELEMENTIT ---
const uusiListaSijaintiSelect = document.getElementById('uusiListaSijainti');
const lisaaMateriaaliLomake = document.getElementById('lisaa-materiaali-lomake');
const uusiMateriaaliNimiInput = document.getElementById('uusiMateriaaliNimi');
const uusiMateriaaliSijaintiSelect = document.getElementById('uusiMateriaaliSijainti');
const materiaaliHallintaLista = document.getElementById('materiaali-hallinta-lista');

// --- VANHAT DOM-ELEMENTIT ---
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
const editModal = document.getElementById('edit-modal');
const editMateriaaliNimi = document.getElementById('edit-materiaali-nimi');
const editKiloMaara = document.getElementById('edit-kilo-maara');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

let currentListId = null;
let currentListSijainti = null; // Tallennetaan aktiivisen listan sijainti
let listDataUnsubscribe = null;
let currentEditingEntryId = null;

const formatSuomalainenAika = (isoString) => isoString ? new Date(isoString).toLocaleString('fi-FI', { dateStyle: 'short', timeStyle: 'short' }) : '';
const normalizeListName = (listName) => listName.trim().toLowerCase().replace(/\s+/g, '-');

async function lataaSijainninMateriaalit(sijainti) {
    materiaaliTyyppiSelect.innerHTML = '<option value="" disabled selected>Valitse tyyppi...</option>';
    
    const materiaalitRef = ref(database, 'materiaalit');
    const snapshot = await get(materiaalitRef);

    if (snapshot.exists()) {
        const materiaalit = snapshot.val();
        Object.values(materiaalit)
            .filter(m => m.sijainti === sijainti)
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
    currentListSijainti = meta.sijainti; // Tallennetaan sijainti muuttujaan

    if (meta.sijainti) {
        await lataaSijainninMateriaalit(meta.sijainti);
    } else {
        materiaaliTyyppiSelect.innerHTML = '<option value="" disabled selected>Ei sijaintia</option><option value="Muu">Muu, mikä?</option>';
    }

    const onArkistoitu = meta.status === 'archived';
    listaStatusBadge.textContent = onArkistoitu ? `Arkistoitu: ${formatSuomalainenAika(meta.arkistoituAika)}` : `Sijainti: ${meta.sijainti}`;
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
            let activeCount = 0;
            const sortedLists = Object.entries(listat).sort((a, b) => {
                const nameA = a[1]?.nimi || '';
                const nameB = b[1]?.nimi || '';
                return nameA.localeCompare(nameB);
            });
            sortedLists.forEach(([listId, meta]) => {
                const sijaintiTeksti = meta.sijainti ? `[${meta.sijainti}]` : '[Ei sijaintia]';
                if (meta.status === 'active') {
                    activeCount++;
                    const nappi = document.createElement('button');
                    nappi.textContent = `${meta.nimi} ${sijaintiTeksti}`;
                    nappi.className = 'aktiivinen-lista-nappi';
                    nappi.onclick = () => handleListSelection(listId);
                    aktiivisetListatContainer.appendChild(nappi);
                } else if (meta.status === 'archived') {
                    const option = document.createElement('option');
                    option.value = listId;
                    option.textContent = `${meta.nimi} ${sijaintiTeksti}`;
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
    currentListSijainti = null;
    history.pushState(null, '', window.location.pathname);
    uusiListaNimiInput.value = "";
    arkistoValikko.value = "";
}

palaaTakaisinBtn.addEventListener('click', palaaAlkuun);
tulostaBtn.addEventListener('click', () => window.print());
arkistoValikko.addEventListener('change', () => { if (arkistoValikko.value) handleListSelection(arkistoValikko.value) });

luoUusiListaBtn.addEventListener('click', () => {
    const listName = uusiListaNimiInput.value.trim();
    const sijainti = uusiListaSijaintiSelect.value;
    if (!listName) return alert('Anna uudelle listalle nimi.');
    
    const listId = normalizeListName(`${sijainti}-${listName}`);
    
    const uusiListaMeta = {
        nimi: listName,
        status: 'active',
        sijainti: sijainti
    };

    const listRef = ref(database, `listat/${listId}`);
    get(listRef).then((snapshot) => {
        if (snapshot.exists()) {
            alert('Virhe: Tämän niminen lista on jo olemassa tälle sijainnille. Valitse uniikki nimi.');
        } else {
             set(listRef, uusiListaMeta).then(() => handleListSelection(listId));
        }
    });
});

materiaaliTyyppiSelect.addEventListener('change', () => {
    const onMuu = materiaaliTyyppiSelect.value === 'Muu';
    muuMateriaaliInput.classList.toggle('hidden', !onMuu);
    muuMateriaaliInput.required = onMuu;
    if (onMuu) {
        muuMateriaaliInput.focus();
    }
});

lomake.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentListId) return;
    const kiloMaaraInput = document.getElementById('kilo-maara');
    let materiaali = (materiaaliTyyppiSelect.value === 'Muu' ? muuMateriaaliInput.value.trim() : materiaaliTyyppiSelect.value);
    const kilomäärä = parseFloat(kiloMaaraInput.value);
    if (!materiaali || isNaN(kilomäärä) || kilomäärä <= 0) return alert('Tarkista syötteet.');
    const uusiKirjaus = { materiaali, kilomäärä, aikaleima: new Date().toISOString() };
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    push(kirjauksetRef, uusiKirjaus);
    lomake.reset();
    muuMateriaaliInput.classList.add('hidden');
    materiaaliTyyppiSelect.value = "";
});

function lataaMateriaalienHallinta() {
    const materiaalitRef = ref(database, 'materiaalit');
    onValue(materiaalitRef, (snapshot) => {
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
                    <button data-id="${key}">Poista</button>
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

    const uusiMateriaali = { nimi, sijainti };
    push(ref(database, 'materiaalit'), uusiMateriaali);
    lisaaMateriaaliLomake.reset();
});

materiaaliHallintaLista.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const materiaaliId = e.target.dataset.id;
        if (confirm('Haluatko varmasti poistaa tämän materiaalityypin?')) {
            remove(ref(database, `materiaalit/${materiaaliId}`));
        }
    }
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
    
    const oldMetaRef = ref(database, `listat/${currentListId}`);
    const snapshot = await get(oldMetaRef);
    if(!snapshot.exists()) return alert("Virhe: vanhaa listaa ei löytynyt nimenmuutosta varten.");
    const oldMeta = snapshot.val();
    
    // Tarkistetaan, että uusi nimi ei ole jo käytössä samalla sijainnilla
    const newId = normalizeListName(`${oldMeta.sijainti}-${newName}`);
    if (newId === currentListId) { // Nimi ei muuttunut oleellisesti
        await set(ref(database, `listat/${currentListId}/nimi`), newName);
        document.getElementById('aktiivinenListaNimi').textContent = newName;
        document.getElementById('peruuta-nimi-btn').click();
        alert('Nimi päivitetty!');
        return;
    }

    const newMetaRef = ref(database, `listat/${newId}`);
    const newSnapshot = await get(newMetaRef);
    if(newSnapshot.exists()){
        return alert("Virhe: uusi nimi on jo käytössä tällä sijainnilla.");
    }

    // Luodaan uusi listatietue ja siirretään kirjaukset
    const newMeta = { ...oldMeta, nimi: newName };
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    const kirjauksetSnapshot = await get(kirjauksetRef);
    const kirjaukset = kirjauksetSnapshot.val();
    
    const updates = {};
    updates[`/listat/${currentListId}`] = null; // Poista vanha
    updates[`/kirjaukset/${currentListId}`] = null; // Poista vanhat kirjaukset
    updates[`/listat/${newId}`] = newMeta; // Lisää uusi
    if(kirjaukset) {
        updates[`/kirjaukset/${newId}`] = kirjaukset; // Lisää kirjaukset uuteen
    }

    await update(ref(database), updates);

    alert('Nimi päivitetty ja tiedot siirretty!');
    document.getElementById('peruuta-nimi-btn').click();
    handleListSelection(newId); // Avaa lista uudella ID:llä
});

function initializePage() {
    const params = new URLSearchParams(window.location.search);
    const listFromUrl = params.get('lista');
    
    lataaListat();
    lataaMateriaalienHallinta();
    
    if (listFromUrl) {
        // Varmistetaan, ettei sivu jää jumiin, jos URL:n lista on poistettu
        get(ref(database, `listat/${listFromUrl}`)).then(snapshot => {
            if (snapshot.exists()) {
                handleListSelection(listFromUrl);
            } else {
                palaaAlkuun();
            }
        });
    }
}

initializePage();
