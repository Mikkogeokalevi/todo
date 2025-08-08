import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Tämä pysyy samana
const firebaseConfig = {
  apiKey: "AIzaSyCM3qiQ7AZephMovMnRcaCy_KzAVUkpXw0",
  authDomain: "materiaalikirjanpito.firebaseapp.com",
  databaseURL: "https://materiaalikirjanpito-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "materiaalikirjanpito",
  storageBucket: "materiaalikirjanpito.firebasestorage.app",
  messagingSenderId: "1007127105198",
  appId: "1:1007127105198:web:57b5e46dda5b879efc673f"
};

// Alustukset
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM-elementit
const listanvalintaOsio = document.getElementById('listanvalinta-osio');
const listaValikko = document.getElementById('listaValikko');
const uusiListaNimiInput = document.getElementById('uusiListaNimi');
const kirjausOsio = document.getElementById('kirjaus-osio');
const aktiivinenListaNimi = document.getElementById('aktiivinenListaNimi');
const lomake = document.getElementById('materiaali-lomake');
const materiaaliTyyppiSelect = document.getElementById('materiaali-tyyppi');
const muuMateriaaliInput = document.getElementById('muu-materiaali-syotto');
const kiloMaaraInput = document.getElementById('kilo-maara');
const kirjausLista = document.getElementById('kirjaus-lista');

// Sovelluksen tila
let currentListId = null;
let listDataUnsubscribe = null; // Funktio datan kuuntelun lopettamiseksi

// --- YLEISET FUNKTIOT ---

const formatSuomalainenAika = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('fi-FI');
};

// --- LISTAN HALLINTA ---

function handleListSelection(listName) {
    if (!listName || listName.trim() === '') return;
    
    currentListId = listName.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Päivitetään URL, jotta sivun voi ladata uudelleen samassa näkymässä
    const newUrl = `${window.location.pathname}?lista=${currentListId}`;
    history.pushState({ path: newUrl }, '', newUrl);

    // Vaihdetaan näkymä listanvalinnasta kirjausnäkymään
    listanvalintaOsio.classList.add('hidden');
    kirjausOsio.classList.remove('hidden');
    aktiivinenListaNimi.textContent = `Lista: ${listName.trim()}`;
    
    loadListData();
}

function loadListData() {
    if (!currentListId) return;
    
    // Lopetetaan mahdollinen aiempi kuuntelu
    if (listDataUnsubscribe) listDataUnsubscribe();
    
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    
    // Kuunnellaan muutoksia VALITUN listan alla
    listDataUnsubscribe = onValue(kirjauksetRef, (snapshot) => {
        kirjausLista.innerHTML = ''; // Tyhjennetään lista
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Muunnetaan objekti avain-arvo -pareiksi, jotta ID saadaan mukaan
            const kirjaukset = Object.entries(data).map(([id, value]) => ({ id, ...value }));
            kirjaukset.reverse(); // Uusin ensin

            kirjaukset.forEach(kirjaus => {
                const li = document.createElement('li');
                // Tallennetaan ID elementtiin muokkausta ja poistoa varten
                li.dataset.id = kirjaus.id; 
                li.innerHTML = `
                    <span class="kirjaus-tiedot">${kirjaus.kilomäärä} kg - ${kirjaus.materiaali}</span>
                    <span class="kirjaus-aika">${formatSuomalainenAika(kirjaus.aikaleima)}</span>
                `;
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
            const lists = Object.keys(snapshot.val());
            lists.forEach(listId => {
                const option = document.createElement('option');
                option.value = listId;
                // Muutetaan ID takaisin luettavampaan muotoon
                option.textContent = listId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                listaValikko.appendChild(option);
            });
        }
    });
}

// --- TAPAHTUMANKÄSITTELIJÄT ---

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
    if (!currentListId) {
        alert("Virhe: Yhtään listaa ei ole valittu.");
        return;
    }

    let materiaali = materiaaliTyyppiSelect.value;
    if (materiaali === 'Muu') {
        materiaali = muuMateriaaliInput.value.trim();
    }
    const kilomäärä = parseFloat(kiloMaaraInput.value);

    if (!materiaali || isNaN(kilomäärä) || kilomäärä <= 0) {
        alert('Tarkista, että kaikki tiedot on syötetty oikein.');
        return;
    }

    const uusiKirjaus = {
        materiaali: materiaali,
        kilomäärä: kilomäärä,
        aikaleima: new Date().toISOString()
    };

    // Tallennetaan data oikean listan alle
    const kirjauksetRef = ref(database, `kirjaukset/${currentListId}`);
    push(kirjauksetRef, uusiKirjaus)
        .then(() => {
            lomake.reset();
            muuMateriaaliInput.classList.add('hidden');
        })
        .catch((error) => console.error("Virhe tallennuksessa: ", error));
});

// --- SIVUN ALUSTUS ---

function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const listFromUrl = urlParams.get('lista');

    loadListMenu(); // Ladataan aina valikko

    if (listFromUrl) {
        handleListSelection(listFromUrl);
    }
}

initializePage();
