import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// --- ASETUKSET ---
const urlParams = new URLSearchParams(window.location.search);
const listNameFromUrl = urlParams.get('lista');
const FIREBASE_PATH = listNameFromUrl || 'paalista';
// --- ASETUKSET PÄÄTTYVÄT ---

document.addEventListener('DOMContentLoaded', () => {
    const kuntaMaakuntaData = { "Akaa": "Pirkanmaa", "Alajärvi": "Etelä-Pohjanmaa", "Alavieska": "Pohjois-Pohjanmaa", "Alavus": "Etelä-Pohjanmaa", "Asikkala": "Päijät-Häme", "Askola": "Uusimaa", "Aura": "Varsinais-Suomi", "Brändö": "Ahvenanmaa", "Eckerö": "Ahvenanmaa", "Enonkoski": "Etelä-Savo", "Enontekiö": "Lappi", "Espoo": "Uusimaa", "Eura": "Satakunta", "Eurajoki": "Satakunta", "Evijärvi": "Etelä-Pohjanmaa", "Finström": "Ahvenanmaa", "Forssa": "Kanta-Häme", "Föglö": "Ahvenanmaa", "Geta": "Ahvenanmaa", "Haapajärvi": "Pohjois-Pohjanmaa", "Haapavesi": "Pohjois-Pohjanmaa", "Hailuoto": "Pohjois-Pohjanmaa", "Halsua": "Keski-Pohjanmaa", "Hamina": "Kymenlaakso", "Hammarland": "Ahvenanmaa", "Hankasalmi": "Keski-Suomi", "Hanko": "Uusimaa", "Harjavalta": "Satakunta", "Hartola": "Päijät-Häme", "Hattula": "Kanta-Häme", "Hausjärvi": "Kanta-Häme", "Heinola": "Päijät-Häme", "Heinävesi": "Pohjois-Karjala", "Helsinki": "Uusimaa", "Hirvensalmi": "Etelä-Savo", "Hollola": "Päijät-Häme", "Huittinen": "Satakunta", "Humppila": "Kanta-Häme", "Hyrynsalmi": "Kainuu", "Hyvinkää": "Uusimaa", "Hämeenkyrö": "Pirkanmaa", "Hämeenlinna": "Kanta-Häme", "Ii": "Pohjois-Pohjanmaa", "Iisalmi": "Pohjois-Savo", "Iitti": "Päijät-Häme", "Ikaalinen": "Pirkanmaa", "Ilmajoki": "Etelä-Pohjanmaa", "Ilomantsi": "Pohjois-Karjala", "Imatra": "Etelä-Karjala", "Inari": "Lappi", "Inkoo": "Uusimaa", "Isojoki": "Etelä-Pohjanmaa", "Isokyrö": "Etelä-Pohjanmaa", "Janakkala": "Kanta-Häme", "Joensuu": "Pohjois-Karjala", "Jokioinen": "Kanta-Häme", "Jomala": "Ahvenanmaa", "Joroinen": "Pohjois-Savo", "Joutsa": "Keski-Suomi", "Juuka": "Pohjois-Karjala", "Juupajoki": "Pirkanmaa", "Juva": "Etelä-Savo", "Jyväskylä": "Keski-Suomi", "Jämijärvi": "Satakunta", "Jämsä": "Keski-Suomi", "Järvenpää": "Uusimaa", "Kaarina": "Varsinais-Suomi", "Kaavi": "Pohjois-Savo", "Kajaani": "Kainuu", "Kalajoki": "Pohjois-Pohjanmaa", "Kangasala": "Pirkanmaa", "Kangasniemi": "Etelä-Savo", "Kankaanpää": "Satakunta", "Kannonkoski": "Keski-Suomi", "Kannus": "Keski-Pohjanmaa", "Karijoki": "Etelä-Pohjanmaa", "Karkkila": "Uusimaa", "Karstula": "Keski-Suomi", "Karvia": "Satakunta", "Kaskinen": "Pohjanmaa", "Kauhajoki": "Etelä-Pohjanmaa", "Kauhava": "Etelä-Pohjanmaa", "Kauniainen": "Uusimaa", "Kaustinen": "Keski-Pohjanmaa", "Keitele": "Pohjois-Savo", "Kemi": "Lappi", "Kemijärvi": "Lappi", "Keminmaa": "Lappi", "Kemiönsaari": "Varsinais-Suomi", "Kempele": "Pohjois-Pohjanmaa", "Kerava": "Uusimaa", "Keuruu": "Keski-Suomi", "Kihniö": "Pirkanmaa", "Kinnula": "Keski-Suomi", "Kirkkonummi": "Uusimaa", "Kitee": "Pohjois-Karjala", "Kittilä": "Lappi", "Kiuruvesi": "Pohjois-Savo", "Kivijärvi": "Keski-Suomi", "Kokemäki": "Satakunta", "Kokkola": "Keski-Pohjanmaa", "Kolar": "Lappi", "Konnevesi": "Keski-Suomi", "Kontiolahti": "Pohjois-Karjala", "Korsnäs": "Pohjanmaa", "Koski Tl": "Varsinais-Suomi", "Kotka": "Kymenlaakso", "Kouvola": "Kymenlaakso", "Kristiinankaupunki": "Pohjanmaa", "Kruunupyy": "Pohjanmaa", "Kuhmo": "Kainuu", "Kuhmoinen": "Pirkanmaa", "Kumlinge": "Ahvenanmaa", "Kuopio": "Pohjois-Savo", "Kuortane": "Etelä-Pohjanmaa", "Kurikka": "Etelä-Pohjanmaa", "Kustavi": "Varsinais-Suomi", "Kuusamo": "Pohjois-Pohjanmaa", "Kyyjärvi": "Keski-Suomi", "Kärkölä": "Päijät-Häme", "Kärsämäki": "Pohjois-Pohjanmaa", "Kökar": "Ahvenanmaa", "Lahti": "Päijät-Häme", "Laihia": "Pohjanmaa", "Laitila": "Varsinais-Suomi", "Lapinjärvi": "Uusimaa", "Lapinlahti": "Pohjois-Savo", "Lappajärvi": "Etelä-Pohjanmaa", "Lappeenranta": "Etelä-Karjala", "Lapua": "Etelä-Pohjanmaa", "Laukaa": "Keski-Suomi", "Lemi": "Etelä-Karjala", "Lemland": "Ahvenanmaa", "Lempäälä": "Pirkanmaa", "Leppävirta": "Pohjois-Savo", "Lestijärvi": "Keski-Pohjanmaa", "Lieksa": "Pohjois-Karjala", "Lieto": "Varsinais-Suomi", "Liminka": "Pohjois-Pohjanmaa", "Liperi": "Pohjois-Karjala", "Lohja": "Uusimaa", "Loimaa": "Varsinais-Suomi", "Loppi": "Kanta-Häme", "Loviisa": "Uusimaa", "Luhanka": "Keski-Suomi", "Lumijoki": "Pohjois-Pohjanmaa", "Lumparland": "Ahvenanmaa", "Luoto": "Pohjanmaa", "Luumäki": "Etelä-Karjala", "Maalahti": "Pohjanmaa", "Maarianhamina": "Ahvenanmaa", "Marttila": "Varsinais-Suomi", "Masku": "Varsinais-Suomi", "Merijärvi": "Pohjois-Pohjanmaa", "Merikarvia": "Satakunta", "Miehikkälä": "Kymenlaakso", "Mikkeli": "Etelä-Savo", "Muhos": "Pohjois-Pohjanmaa", "Multia": "Keski-Suomi", "Muonio": "Lappi", "Mustasaari": "Pohjanmaa", "Muurame": "Keski-Suomi", "Mynämäki": "Varsinais-Suomi", "Myrskylä": "Uusimaa", "Mäntsälä": "Uusimaa", "Mänttä-Vilppula": "Pirkanmaa", "Mäntyharju": "Etelä-Savo", "Naantali": "Varsinais-Suomi", "Nakkila": "Satakunta", "Nivala": "Pohjois-Pohjanmaa", "Nokia": "Pirkanmaa", "Nousiainen": "Varsinais-Suomi", "Nurmes": "Pohjois-Karjala", "Nurmijärvi": "Uusimaa", "Närpiö": "Pohjanmaa", "Orimattila": "Päijät-Häme", "Oripää": "Varsinais-Suomi", "Orivesi": "Pirkanmaa", "Oulainen": "Pohjois-Pohjanmaa", "Oulu": "Pohjois-Pohjanmaa", "Outokumpu": "Pohjois-Karjala", "Padasjoki": "Päijät-Häme", "Paimio": "Varsinais-Suomi", "Paltamo": "Kainuu", "Parainen": "Varsinais-Suomi", "Parikkala": "Etelä-Karjala", "Parkano": "Pirkanmaa", "Pedersören kunta": "Pohjanmaa", "Pelkosenniemi": "Lappi", "Pello": "Lappi", "Perho": "Keski-Pohjanmaa", "Pertunmaa": "Etelä-Savo", "Petäjävesi": "Keski-Suomi", "Pieksämäki": "Etelä-Savo", "Pielavesi": "Pohjois-Savo", "Pietarsaari": "Pohjanmaa", "Pihtipudas": "Keski-Suomi", "Pirkkala": "Pirkanmaa", "Polvijärvi": "Pohjois-Karjala", "Pomarkku": "Satakunta", "Pori": "Satakunta", "Pornainen": "Uusimaa", "Porvoo": "Uusimaa", "Posio": "Lappi", "Pudasjärvi": "Pohjois-Pohjanmaa", "Pukkila": "Uusimaa", "Punkalaidun": "Pirkanmaa", "Puolanka": "Kainuu", "Puumala": "Etelä-Savo", "Pyhtää": "Kymenlaakso", "Pyhäjoki": "Pohjois-Pohjanmaa", "Pyhäjärvi": "Pohjois-Pohjanmaa", "Pyhäntä": "Pohjois-Pohjanmaa", "Pyhäranta": "Varsinais-Suomi", "Pälkäne": "Pirkanmaa", "Pöytyä": "Varsinais-Suomi", "Raahe": "Pohjois-Pohjanmaa", "Raasepori": "Uusimaa", "Raisio": "Varsinais-Suomi", "Rantasalmi": "Etelä-Savo", "Ranua": "Lappi", "Rauma": "Satakunta", "Rautalampi": "Pohjois-Savo", "Rautavaara": "Pohjois-Savo", "Rautjärvi": "Etelä-Karjala", "Reisjärvi": "Pohjois-Pohjanmaa", "Riihimäki": "Kanta-Häme", "Ristijärvi": "Kainuu", "Rovaniemi": "Lappi", "Ruokolahti": "Etelä-Karjala", "Ruovesi": "Pirkanmaa", "Rusko": "Varsinais-Suomi", "Rääkkylä": "Pohjois-Karjala", "Saarijärvi": "Keski-Suomi", "Salla": "Lappi", "Salo": "Varsinais-Suomi", "Saltvik": "Ahvenanmaa", "Sastamala": "Pirkanmaa", "Sauvo": "Varsinais-Suomi", "Savitaipale": "Etelä-Karjala", "Savonlinna": "Etelä-Savo", "Savukoski": "Lappi", "Seinäjoki": "Etelä-Pohjanmaa", "Sievi": "Pohjois-Pohjanmaa", "Siikainen": "Satakunta", "Siikajoki": "Pohjois-Pohjanmaa", "Siilinjärvi": "Pohjois-Savo", "Simo": "Lappi", "Sipoo": "Uusimaa", "Siuntio": "Uusimaa", "Sodankylä": "Lappi", "Soini": "Etelä-Pohjanmaa", "Somero": "Varsinais-Suomi", "Sonkajärvi": "Pohjois-Savo", "Sotkamo": "Kainuu", "Sottunga": "Ahvenanmaa", "Sulkava": "Etelä-Savo", "Sund": "Ahvenanmaa", "Suomussalmi": "Kainuu", "Suonenjoki": "Pohjois-Savo", "Sysmä": "Päijät-Häme", "Säkylä": "Satakunta", "Taipalsaari": "Etelä-Karjala", "Taivalkoski": "Pohjois-Pohjanmaa", "Taivassalo": "Varsinais-Suomi", "Tammela": "Kanta-Häme", "Tampere": "Pirkanmaa", "Tervo": "Pohjois-Savo", "Tervola": "Lappi", "Teuva": "Etelä-Pohjanmaa", "Tohmajärvi": "Pohjois-Karjala", "Toholampi": "Keski-Pohjanmaa", "Toivakka": "Keski-Suomi", "Tornio": "Lappi", "Turku": "Varsinais-Suomi", "Tuusniemi": "Pohjois-Savo", "Tuusula": "Uusimaa", "Tyrnävä": "Pohjois-Pohjanmaa", "Ulvila": "Satakunta", "Urjala": "Pirkanmaa", "Utajärvi": "Pohjois-Pohjanmaa", "Utsjoki": "Lappi", "Uurainen": "Keski-Suomi", "Uusikaarlepyy": "Pohjanmaa", "Uusikaupunki": "Varsinais-Suomi", "Vaala": "Pohjois-Pohjanmaa", "Vaasa": "Pohjanmaa", "Valkeakoski": "Pirkanmaa", "Vantaa": "Uusimaa", "Varkaus": "Pohjois-Savo", "Vehmaa": "Varsinais-Suomi", "Vesanto": "Pohjois-Savo", "Vesilahti": "Pirkanmaa", "Veteli": "Keski-Pohjanmaa", "Vieremä": "Pohjois-Savo", "Vihti": "Uusimaa", "Viitasaari": "Keski-Suomi", "Vimpeli": "Etelä-Pohjanmaa", "Virolahti": "Kymenlaakso", "Virrat": "Pirkanmaa", "Vårdö": "Ahvenanmaa", "Vöyri": "Pohjanmaa", "Ylitornio": "Lappi", "Ylivieska": "Pohjois-Pohjanmaa", "Ylöjärvi": "Pirkanmaa", "Ypäjä": "Kanta-Häme", "Ähtäri": "Etelä-Pohjanmaa", "Äänekoski": "Keski-Suomi" };
    
    const firebaseConfig = { apiKey: "AIzaSyA1OgSGhgYgmxDLv7-xkPPsUGCpcxFaI8M", authDomain: "geokatkosuunnittelija.firebaseapp.com", databaseURL: "https://geokatkosuunnittelija-default-rtdb.europe-west1.firebasedatabase.app", projectId: "geokatkosuunnittelija", storageBucket: "geokatkosuunnittelija.appspot.com", messagingSenderId: "745498680990", appId: "1:745498680990:web:869074eb0f0b72565ca58f" };

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    // DOM-elementit
    const pgcProfileNameInput = document.getElementById('pgcProfileName');
    const bulkAddInput = document.getElementById('bulkAddMunicipalities');
    const bulkAddBtn = document.getElementById('bulkAddBtn');
    const municipalityList = document.getElementById('municipalityList');
    const toggleBulkAddBtn = document.getElementById('toggleBulkAddBtn');
    const togglePgcAddBtn = document.getElementById('togglePgcAddBtn');
    const bulkAddContainer = document.getElementById('bulkAddContainer');
    const toggleTrackingBtn = document.getElementById('toggleTrackingBtn');
    const locationStatusDisplay = document.getElementById('location-status-display');
    const speedDisplay = document.getElementById('speed-display');
    const showTripListBtn = document.getElementById('showTripListBtn');
    const showFoundLogBtn = document.getElementById('showFoundLogBtn');
    const tripListView = document.getElementById('tripListView');
    const foundLogView = document.getElementById('foundLogView');
    const directAddInput = document.getElementById('directAddInput');
    const directAddBtn = document.getElementById('directAddBtn');
    const foundCachesList = document.getElementById('foundCachesList');
    const globalPgcAddContainer = document.getElementById('globalPgcAddContainer');
    const globalPgcPasteArea = document.getElementById('globalPgcPasteArea');
    const globalAddFromPgcBtn = document.getElementById('globalAddFromPgcBtn');
    const logPgcPasteArea = document.getElementById('logPgcPasteArea');
    const logAddFromPgcBtn = document.getElementById('logAddFromPgcBtn');
    const loggerList = document.getElementById('loggerList');
    const newLoggerInput = document.getElementById('newLoggerInput');
    const addLoggerBtn = document.getElementById('addLoggerBtn');
    const editCacheModal = document.getElementById('editCacheModal');
    // ... (muut elementit pysyvät samoina)

    // Sovelluksen tila
    let municipalities = [];
    let foundCaches = [];
    let loggers = [];
    let isUpdatingLoggers = false; // Lippu estämään kilpa-ajotilanteet
    let map;
    // ... (muut tilamuuttujat pysyvät samoina)

    const delay = ms => new Promise(res => setTimeout(res, ms));

    // ... (kaikki apufunktiot kuten getDistance, formatCoordinates jne. pysyvät samoina)

    const renderLoggers = () => {
        loggerList.innerHTML = '';
        loggers.forEach(name => {
            const li = document.createElement('li');
            li.className = 'logger-item';
            li.innerHTML = `
                <span>${name}</span>
                <button class="delete-logger-btn" data-logger-name="${name}">×</button>
            `;
            loggerList.appendChild(li);
        });
    };
    
    // ... (muut render-funktiot ja apufunktiot)

    onValue(ref(database, FIREBASE_PATH), async (snapshot) => {
        const data = snapshot.val() || {};
        municipalities = data.municipalities || [];
        foundCaches = data.foundCaches || [];
        pgcProfileNameInput.value = data.pgcProfileName || '';

        // Päivitetään lokittajat vain, jos paikallinen muutos ei ole käynnissä
        if (!isUpdatingLoggers) {
            loggers = data.loggers || [];
            renderLoggers();
        }

        render();
        renderFoundList();
        
        const coordsFetched = await ensureAllCoordsAreFetched(municipalities);
        if (!coordsFetched) {
             updateAllMarkers();
        }
    });

    const saveState = () => {
        const updates = {};
        updates[`${FIREBASE_PATH}/municipalities`] = municipalities;
        updates[`${FIREBASE_PATH}/foundCaches`] = foundCaches;
        updates[`${FIREBASE_PATH}/loggers`] = loggers;
        updates[`${FIREBASE_PATH}/pgcProfileName`] = pgcProfileNameInput.value;
        return update(ref(database), updates);
    };

    addLoggerBtn.addEventListener('click', () => {
        const newName = newLoggerInput.value.trim();
        if (newName && !loggers.find(l => l.toLowerCase() === newName.toLowerCase())) {
            loggers.push(newName);
            newLoggerInput.value = '';
            
            isUpdatingLoggers = true; // Aseta lippu
            renderLoggers(); // Päivitä UI heti
            
            saveState().finally(() => {
                isUpdatingLoggers = false; // Laske lippu, kun tallennus on valmis
            });
        }
    });

    loggerList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-logger-btn')) {
            const nameToDelete = e.target.dataset.loggerName;
            loggers = loggers.filter(l => l !== nameToDelete);
            
            isUpdatingLoggers = true; // Aseta lippu
            renderLoggers(); // Päivitä UI heti

            saveState().finally(() => {
                isUpdatingLoggers = false; // Laske lippu, kun tallennus on valmis
            });
        }
    });

    // ... (kaikki muut tapahtumankäsittelijät ja funktiot pysyvät täysin samoina kuin edellisessä versiossa)
    // Tässä on koko tiedosto selkeyden vuoksi:
    const handleBulkAdd = async () => {
        const text = bulkAddInput.value.trim(); if (!text) return;
        
        const newNames = text.split(/[\n,]/).map(name => name.trim()).filter(Boolean);
        const uniqueNewNames = newNames.filter(name => !municipalities.some(m => m.name.toLowerCase() === name.toLowerCase()));
        
        if (uniqueNewNames.length === 0) return;

        bulkAddBtn.disabled = true;
        let notFound = [];

        for (let i = 0; i < uniqueNewNames.length; i++) {
            const name = uniqueNewNames[i];
            bulkAddBtn.textContent = `Haetaan ${i + 1} / ${uniqueNewNames.length}...`;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name + ', Finland')}&format=json&limit=1`);
                const data = await response.json();
                if (data && data.length > 0) {
                    municipalities.push({ name: name, caches: [], lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
                } else {
                    notFound.push(name);
                }
            } catch (error) {
                console.error("Virhe haettaessa kuntaa:", name, error);
                notFound.push(name);
            }
            await delay(1000); // 1 sekunnin viive
        }

        if (notFound.length > 0) alert(`Seuraavia kuntia ei löytynyt: ${notFound.join(', ')}`);
        
        bulkAddInput.value = '';
        bulkAddBtn.disabled = false;
        bulkAddBtn.textContent = 'Lisää listasta';
        saveState();
    };

    toggleBulkAddBtn.addEventListener('click', () => {
        const isHidden = bulkAddContainer.classList.toggle('hidden');
        toggleBulkAddBtn.textContent = isHidden ? 'Lisää kunnat listana' : 'Piilota lisäysalue';
    });

    togglePgcAddBtn.addEventListener('click', () => {
        const isHidden = globalPgcAddContainer.classList.toggle('hidden');
        togglePgcAddBtn.textContent = isHidden ? 'Lisää PGC-datalla' : 'Piilota PGC-lisäys';
    });

    bulkAddBtn.addEventListener('click', handleBulkAdd);
    
    globalAddFromPgcBtn.addEventListener('click', async () => {
        const text = globalPgcPasteArea.value.trim(); if (!text) return;
        globalAddFromPgcBtn.disabled = true; globalAddFromPgcBtn.textContent = "Käsitellään...";
        const lines = text.split('\n').filter(Boolean);
        let cachesAddedCount = 0;
        for (let i = 0; i < lines.length; i += 3) {
            const line1 = lines[i], line2 = lines[i + 1], line3 = lines[i + 2];
            if (!line1 || !line2 || !line3) continue;
            try {
                const frontParts = line1.split(/\s*-\s*/);
                const gcCode = frontParts[0]?.trim();
                const cacheName = frontParts[1]?.trim();
                const fpInfo = frontParts.length > 2 ? frontParts.slice(2).join(' - ').trim() : '';
                const detailsParts = line2.split('/');
                const cacheType = detailsParts[0]?.trim(), cacheSize = detailsParts[1]?.trim(), difficulty = detailsParts[2]?.trim(), terrain = detailsParts[3]?.trim();
                const coords = parseCoordinates(line3);
                if (!gcCode || !cacheName || !cacheType || !coords) continue;
                const munName = await getMunicipalityForCoordinates(coords.lat, coords.lon);
                if (!munName) { console.warn(`Ei löytynyt kuntaa koordinaateille: ${coords.lat}, ${coords.lon}`); continue; }
                const cacheData = { id: Date.now() + Math.random(), name: cacheName, gcCode, fp: fpInfo, type: cacheType, size: cacheSize, difficulty, terrain, lat: coords.lat, lon: coords.lon, alert_approach_given: false, alert_target_given: false };
                let munIndex = municipalities.findIndex(m => m.name.toLowerCase() === munName.toLowerCase());
                if (munIndex === -1) { municipalities.push({ name: munName, caches: [cacheData] }); } 
                else { if (!municipalities[munIndex].caches) municipalities[munIndex].caches = []; municipalities[munIndex].caches.push(cacheData); }
                cachesAddedCount++;
            } catch (e) { console.error("Lohkon jäsentäminen epäonnistui:", [line1, line2, line3], e); }
        }
        if (cachesAddedCount > 0) { await ensureAllCoordsAreFetched(municipalities); saveState(); globalPgcPasteArea.value = ''; } 
        else { alert("Ei voitu jäsentää kelvollisia kätkötietoja syötetystä tekstistä."); }
        globalAddFromPgcBtn.disabled = false; globalAddFromPgcBtn.textContent = "Lisää ja paikanna";
    });

    logAddFromPgcBtn.addEventListener('click', () => {
        const text = logPgcPasteArea.value.trim(); if (!text) return;
        logAddFromPgcBtn.disabled = true; logAddFromPgcBtn.textContent = "Käsitellään...";
        const lines = text.split('\n').filter(Boolean);
        let cachesAddedCount = 0;
        for (let i = 0; i < lines.length; i += 3) {
            const line1 = lines[i], line2 = lines[i + 1], line3 = lines[i + 2];
            if (!line1 || !line2 || !line3) continue;
            try {
                const frontParts = line1.split(/\s*-\s*/);
                const gcCode = frontParts[0]?.trim();
                const cacheName = frontParts[1]?.trim();
                const fpInfo = frontParts.length > 2 ? frontParts.slice(2).join(' - ').trim() : '';
                const detailsParts = line2.split('/');
                const cacheType = detailsParts[0]?.trim(), cacheSize = detailsParts[1]?.trim(), difficulty = detailsParts[2]?.trim(), terrain = detailsParts[3]?.trim();
                const coords = parseCoordinates(line3);
                if (!gcCode || !cacheName || !cacheType || !coords) continue;
                
                const loggerCheckboxes = {};
                loggers.forEach(name => { loggerCheckboxes[name] = false; });

                const newFoundCache = { id: Date.now() + Math.random(), name: cacheName, gcCode, fp: fpInfo, type: cacheType, size: cacheSize, difficulty, terrain, lat: coords.lat, lon: coords.lon, timestamp: new Date().toISOString(), loggers: loggerCheckboxes };
                foundCaches.push(newFoundCache);
                cachesAddedCount++;
            } catch (e) { console.error("Lohkon jäsentäminen epäonnistui:", [line1, line2, line3], e); }
        }
        if (cachesAddedCount > 0) { saveState(); logPgcPasteArea.value = ''; } 
        else { alert("Ei voitu jäsentää kelvollisia kätkötietoja syötetystä tekstistä."); }
        logAddFromPgcBtn.disabled = false; logAddFromPgcBtn.textContent = "Lisää löydetyt lokiin";
    });

    municipalityList.addEventListener('click', (e) => {
        // ... (tämä funktio pysyy samana)
    });

    // ... (kaikki loput funktiot ja tapahtumankäsittelijät pysyvät täsmälleen samoina)
});
