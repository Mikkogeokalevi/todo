import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set, get, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Firebase-konfiguraatiosi pysyy samana
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

let currentListId = null;
let listDataUnsubscribe = null;

// Ajan muotoilufunktio
const formatSuomalainenAika = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('fi-FI');
};

// Listan nimen normalisointi ID:ksi
const normalizeListName = (listName) => listName.trim().toLowerCase().replace(/\s+/g, '-');

// Käsittelee aktiivisen listan vaihdon
function handleListSelection(listName) {
    if (!listName || listName.trim() === '') return;
    currentListId = normalizeListName(listName);
    
    // Näytä käyttäjälle siistitty nimi
    const displayName = listName.trim().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const newUrl = `${window.location.pathname}?lista=${currentListId}`;
    history.pushState({ path: newUrl }, '', newUrl);

    listanvalintaOsio.classList.add('hidden');
    kirjausOsio.classList.remove('hidden');
    aktiivinenListaNimi.textContent = displayName;
    
    // Varmista, että elementit ovat oikeassa tilassa
    otsikkoContainer.classList.remove('hidden');
    muokkaaNimeaContainer.style.display = 'none'; // KÄYTÄ STYLE.DISPLAY
    
    loadListData();
}

// Lataa valitun listan tiedot
function loadListData() {
    if (!currentListId) return;
    if (listDataUnsubscribe) listDataUnsubscribe();
    
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    
    listDataUnsubscribe = onValue(kirjauksetRef, (snapshot) => {
        kirjausLista.innerHTML = '';
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Järjestä kirjaukset uusimmasta vanhimpaan
            const kirjaukset = Object.entries(data).map(([id, value]) => ({ id, ...value })).reverse();
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

// Lataa kaikki listat valikkoon
function loadListMenu() {
    const allListsRef = ref(database, 'kirjaukset');
    onValue(allListsRef, (snapshot) => {
        const selectedValue = listaValikko.value;
        listaValikko.innerHTML = '<option value="">Valitse olemassa oleva...</option>';
        if (snapshot.exists()) {
            Object.keys(snapshot.val()).forEach(listId => {
                const option = document.createElement('option');
                option.value = listId;
                option.textContent = listId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                listaValikko.appendChild(option);
            });
            listaValikko.value = selectedValue;
        }
    });
}

// **KORJATTU LOGIIKKA**
// Nimen muokkauskentän näyttäminen
muokkaaListaaBtn.addEventListener('click', () => {
    otsikkoContainer.classList.add('hidden');
    muokkaaNimeaContainer.style.display = 'flex'; // NÄYTÄ FLEXBOXINA
    muokkaaNimeaInput.value = aktiivinenListaNimi.textContent;
    muokkaaNimeaInput.focus();
});

// Nimen muokkauksen peruutus
peruutaNimiBtn.addEventListener('click', () => {
    otsikkoContainer.classList.remove('hidden');
    muokkaaNimeaContainer.style.display = 'none'; // PIILOTA
});

// Nimen tallennus
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
    // Päivitä sivu uudella ID:llä ilman täyttä latausta
    handleListSelection(newId); 
});


// **KORJATTU JA PARANNETTU LOGIIKKA**
// Koko listan poistaminen
poistaListaBtn.addEventListener('click', async () => {
    if (!currentListId) return;
    const confirmation = confirm(`Haluatko varmasti poistaa koko listan "${aktiivinenListaNimi.textContent}" ja kaikki sen tiedot? Tätä toimintoa ei voi peruuttaa.`);
    
    if (confirmation) {
        const listRef = ref(database, `kirjaukset/${currentListId}`);
        try {
            await remove(listRef);
            alert(`Lista "${aktiivinenListaNimi.textContent}" on poistettu.`);
            
            // Palauta näkymä alkutilaan ilman sivun uudelleenlatausta
            kirjausOsio.classList.add('hidden');
            listanvalintaOsio.classList.remove('hidden');
            
            // Poista listan <option> valikosta
            const optionToRemove = listaValikko.querySelector(`option[value="${currentListId}"]`);
            if (optionToRemove) {
                optionToRemove.remove();
            }
            listaValikko.value = "";
            uusiListaNimiInput.value = "";
            currentListId = null;

            // Nollaa URL
            history.pushState(null, '', window.location.pathname);

        } catch (error) {
            console.error("Virhe listan poistossa:", error);
            alert('Listan poistossa tapahtui virhe. Tarkista Firebasen säännöt ja konsoli (F12) saadaksesi lisätietoja.');
        }
    }
});


// Tapahtumankuuntelijat
listaValikko.addEventListener('change', () => handleListSelection(listaValikko.options[listaValikko.selectedIndex].textContent));
uusiListaNimiInput.addEventListener('change', () => handleListSelection(uusiListaNimiInput.value));

materiaaliTyyppiSelect.addEventListener('change', () => {
    const isMuu = materiaaliTyyppiSelect.value === 'Muu';
    muuMateriaaliInput.classList.toggle('hidden', !isMuu);
    muuMateriaaliInput.required = isMuu;
    if (isMuu) muuMateriaaliInput.focus();
});

lomake.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentListId) {
        alert("Virhe: Yhtään listaa ei ole valittu.");
        return;
    }
    let materiaali = materiaaliTyyppiSelect.value === 'Muu' 
        ? muuMateriaaliInput.value.trim() 
        : materiaaliTyyppiSelect.value;
    const kilomäärä = parseFloat(kiloMaaraInput.value);

    if (!materiaali || isNaN(kilomäärä) || kilomäärä <= 0) {
        alert('Tarkista, että kaikki tiedot on syötetty oikein.');
        return;
    }

    const uusiKirjaus = {
        materiaali,
        kilomäärä,
        aikaleima: new Date().toISOString()
    };
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    push(kirjauksetRef)
        .then(() => {
            lomake.reset();
            muuMateriaaliInput.classList.add('hidden');
            materiaaliTyyppiSelect.value = "";
        })
        .catch((error) => console.error("Virhe tallennuksessa: ", error));
});


// Sivun alustusfunktio
function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const listFromUrl = urlParams.get('lista');
    
    // Varmista, että muokkauskenttä on piilossa alussa
    muokkaaNimeaContainer.style.display = 'none';

    loadListMenu();
    if (listFromUrl) {
        handleListSelection(listFromUrl);
    }
}

// Käynnistä sovellus
initializePage();
