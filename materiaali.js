// Tuodaan tarvittavat osat Firebase-kirjastosta
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Täydellinen ja korjattu Firebase-konfiguraatio sinun projektillesi
const firebaseConfig = {
  apiKey: "AIzaSyCM3qiQ7AZephMovMnRcaCy_KzAVUkpXw0",
  authDomain: "materiaalikirjanpito.firebaseapp.com",
  databaseURL: "https://materiaalikirjanpito-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "materiaalikirjanpito",
  storageBucket: "materiaalikirjanpito.firebasestorage.app",
  messagingSenderId: "1007127105198",
  appId: "1:1007127105198:web:57b5e46dda5b879efc673f"
};

// Alustetaan Firebase-yhteys
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const kirjauksetRef = ref(database, 'kirjaukset');

// Haetaan HTML-elementit, joita käsitellään
const lomake = document.getElementById('materiaali-lomake');
const materiaaliTyyppiSelect = document.getElementById('materiaali-tyyppi');
const muuMateriaaliInput = document.getElementById('muu-materiaali-syotto');
const kiloMaaraInput = document.getElementById('kilo-maara');
const kirjausLista = document.getElementById('kirjaus-lista');

// --- Tapahtumankäsittelijät ---

// Kuunnellaan materiaalityypin valikon muutoksia.
// Näytetään tai piilotetaan "Muu"-tekstikenttä valinnan mukaan.
materiaaliTyyppiSelect.addEventListener('change', () => {
    if (materiaaliTyyppiSelect.value === 'Muu') {
        muuMateriaaliInput.classList.remove('hidden');
        muuMateriaaliInput.required = true;
    } else {
        muuMateriaaliInput.classList.add('hidden');
        muuMateriaaliInput.required = false;
    }
});

// Kuunnellaan lomakkeen lähetystä (Tallenna-painikkeen klikkaus).
lomake.addEventListener('submit', (e) => {
    e.preventDefault(); // Estää sivun oletusarvoisen uudelleenlatautumisen

    // Haetaan arvot syöttökentistä
    let materiaali = materiaaliTyyppiSelect.value;
    if (materiaali === 'Muu') {
        materiaali = muuMateriaaliInput.value.trim();
    }
    const kilomäärä = parseFloat(kiloMaaraInput.value);

    // Varmistetaan, että tiedot ovat kelvollisia ennen tallennusta
    if (!materiaali || isNaN(kilomäärä) || kilomäärä <= 0) {
        alert('Tarkista, että kaikki tiedot on syötetty oikein.');
        return;
    }

    // Luodaan objekti, joka tallennetaan tietokantaan
    const uusiKirjaus = {
        materiaali: materiaali,
        kilomäärä: kilomäärä,
        aikaleima: new Date().toISOString() // Aikaleima tallennetaan universaalissa aikamuodossa
    };

    // Lähetetään data Firebaseen. `push` luo automaattisesti uniikin avaimen.
    push(kirjauksetRef, uusiKirjaus)
        .then(() => {
            // Tyhjennetään lomake, kun tallennus on onnistunut
            lomake.reset();
            muuMateriaaliInput.classList.add('hidden');
        })
        .catch((error) => {
            console.error("Virhe tietoja tallennettaessa: ", error);
            alert("Tietojen tallennus epäonnistui. Tarkista konsoli.");
        });
});

// --- Datan näyttäminen ---

// Apufunktio, joka muotoilee aikaleiman suomalaiseen muotoon
const formatSuomalainenAika = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('fi-FI');
};

// Kuunnellaan muutoksia tietokannan 'kirjaukset'-polussa reaaliaikaisesti.
// Tämä funktio suoritetaan aina, kun data muuttuu.
onValue(kirjauksetRef, (snapshot) => {
    kirjausLista.innerHTML = ''; // Tyhjennetään nykyinen lista ensin

    if (snapshot.exists()) {
        const data = snapshot.val();
        // Muutetaan saatu data-objekti taulukoksi ja käännetään se,
        // jotta uusin kirjaus näytetään aina ylimpänä.
        const kirjaukset = Object.values(data).reverse();

        kirjaukset.forEach(kirjaus => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="kirjaus-tiedot">${kirjaus.kilomäärä} kg - ${kirjaus.materiaali}</span>
                <span class="kirjaus-aika">${formatSuomalainenAika(kirjaus.aikaleima)}</span>
            `;
            kirjausLista.appendChild(li);
        });
    } else {
        kirjausLista.innerHTML = '<li>Ei vielä kirjauksia.</li>';
    }
});
