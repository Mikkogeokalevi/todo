import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// VAIHE 1: VAIHDA TÄMÄ OMAAN FIREBASE-KONFIGURAATIOOSI!
const firebaseConfig = {

  apiKey: "AIzaSyCM3qiQ7AZephMovMnRcaCy_KzAVUkpXw0",

  authDomain: "materiaalikirjanpito.firebaseapp.com",

  projectId: "materiaalikirjanpito",

  storageBucket: "materiaalikirjanpito.firebasestorage.app",

  messagingSenderId: "1007127105198",

  appId: "1:1007127105198:web:57b5e46dda5b879efc673f"

};

// Alustetaan Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const kirjauksetRef = ref(database, 'kirjaukset');

// Haetaan HTML-elementit
const lomake = document.getElementById('materiaali-lomake');
const materiaaliTyyppiSelect = document.getElementById('materiaali-tyyppi');
const muuMateriaaliInput = document.getElementById('muu-materiaali-syotto');
const kiloMaaraInput = document.getElementById('kilo-maara');
const kirjausLista = document.getElementById('kirjaus-lista');

// --- Tapahtumankäsittelijät ---

// Näytetään tai piilotetaan "Muu"-kenttä valinnan mukaan
materiaaliTyyppiSelect.addEventListener('change', () => {
    if (materiaaliTyyppiSelect.value === 'Muu') {
        muuMateriaaliInput.classList.remove('hidden');
        muuMateriaaliInput.required = true;
    } else {
        muuMateriaaliInput.classList.add('hidden');
        muuMateriaaliInput.required = false;
    }
});

// Lomakkeen lähetys
lomake.addEventListener('submit', (e) => {
    e.preventDefault(); // Estää sivun uudelleenlatautumisen

    // Haetaan arvot kentistä
    let materiaali = materiaaliTyyppiSelect.value;
    if (materiaali === 'Muu') {
        materiaali = muuMateriaaliInput.value.trim();
    }
    const kilomäärä = parseFloat(kiloMaaraInput.value);

    // Varmistetaan, että tiedot ovat kunnossa
    if (!materiaali || isNaN(kilomäärä) || kilomäärä <= 0) {
        alert('Tarkista, että kaikki tiedot on syötetty oikein.');
        return;
    }

    // Luodaan tallennettava objekti
    const uusiKirjaus = {
        materiaali: materiaali,
        kilomäärä: kilomäärä,
        aikaleima: new Date().toISOString() // Tallennetaan universaalissa aikamuodossa
    };

    // Lähetetään data Firebaseen käyttämällä push-funktiota, joka luo uniikin avaimen
    push(kirjauksetRef, uusiKirjaus)
        .then(() => {
            // Tyhjennetään lomake onnistuneen tallennuksen jälkeen
            lomake.reset();
            muuMateriaaliInput.classList.add('hidden');
        })
        .catch((error) => {
            console.error("Virhe tallennuksessa: ", error);
            alert("Tietojen tallennus epäonnistui.");
        });
});

// --- Datan näyttäminen ---

// Funktio, joka muotoilee päivämäärän luettavaksi
const formatSuomalainenAika = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('fi-FI');
};

// Kuunnellaan muutoksia tietokannassa ja päivitetään lista
onValue(kirjauksetRef, (snapshot) => {
    kirjausLista.innerHTML = ''; // Tyhjennetään lista ennen uusien lisäämistä
    if (snapshot.exists()) {
        const data = snapshot.val();
        // Muutetaan objekti taulukoksi ja käännetään järjestys, jotta uusin on ylimpänä
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
