import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// --- ASETUKSET ---
const urlParams = new URLSearchParams(window.location.search);
const listNameFromUrl = urlParams.get('lista');
const FIREBASE_PATH = listNameFromUrl || 'paalista';

const LOGGERS = ["Toni", "Jukka", "Riikka", "Vesa"];
// --- ASETUKSET PÄÄTTYVÄT ---

document.addEventListener('DOMContentLoaded', () => {
    const kuntaMaakuntaData = { "Akaa": "Pirkanmaa", "Alajärvi": "Etelä-Pohjanmaa", "Alavieska": "Pohjois-Pohjanmaa", "Alavus": "Etelä-Pohjanmaa", "Asikkala": "Päijät-Häme", "Askola": "Uusimaa", "Aura": "Varsinais-Suomi", "Brändö": "Ahvenanmaa", "Eckerö": "Ahvenanmaa", "Enonkoski": "Etelä-Savo", "Enontekiö": "Lappi", "Espoo": "Uusimaa", "Eura": "Satakunta", "Eurajoki": "Satakunta", "Evijärvi": "Etelä-Pohjanmaa", "Finström": "Ahvenanmaa", "Forssa": "Kanta-Häme", "Föglö": "Ahvenanmaa", "Geta": "Ahvenanmaa", "Haapajärvi": "Pohjois-Pohjanmaa", "Haapavesi": "Pohjois-Pohjanmaa", "Hailuoto": "Pohjois-Pohjanmaa", "Halsua": "Keski-Pohjanmaa", "Hamina": "Kymenlaakso", "Hammarland": "Ahvenanmaa", "Hankasalmi": "Keski-Suomi", "Hanko": "Uusimaa", "Harjavalta": "Satakunta", "Hartola": "Päijät-Häme", "Hattula": "Kanta-Häme", "Hausjärvi": "Kanta-Häme", "Heinola": "Päijät-Häme", "Heinävesi": "Pohjois-Karjala", "Helsinki": "Uusimaa", "Hirvensalmi": "Etelä-Savo", "Hollola": "Päijät-Häme", "Huittinen": "Satakunta", "Humppila": "Kanta-Häme", "Hyrynsalmi": "Kainuu", "Hyvinkää": "Uusimaa", "Hämeenkyrö": "Pirkanmaa", "Hämeenlinna": "Kanta-Häme", "Ii": "Pohjois-Pohjanmaa", "Iisalmi": "Pohjois-Savo", "Iitti": "Päijät-Häme", "Ikaalinen": "Pirkanmaa", "Ilmajoki": "Etelä-Pohjanmaa", "Ilomantsi": "Pohjois-Karjala", "Imatra": "Etelä-Karjala", "Inari": "Lappi", "Inkoo": "Uusimaa", "Isojoki": "Etelä-Pohjanmaa", "Isokyrö": "Etelä-Pohjanmaa", "Janakkala": "Kanta-Häme", "Joensuu": "Pohjois-Karjala", "Jokioinen": "Kanta-Häme", "Jomala": "Ahvenanmaa", "Joroinen": "Pohjois-Savo", "Joutsa": "Keski-Suomi", "Juuka": "Pohjois-Karjala", "Juupajoki": "Pirkanmaa", "Juva": "Etelä-Savo", "Jyväskylä": "Keski-Suomi", "Jämijärvi": "Satakunta", "Jämsä": "Keski-Suomi", "Järvenpää": "Uusimaa", "Kaarina": "Varsinais-Suomi", "Kaavi": "Pohjois-Savo", "Kajaani": "Kainuu", "Kalajoki": "Pohjois-Pohjanmaa", "Kangasala": "Pirkanmaa", "Kangasniemi": "Etelä-Savo", "Kankaanpää": "Satakunta", "Kannonkoski": "Keski-Suomi", "Kannus": "Keski-Pohjanmaa", "Karijoki": "Etelä-Pohjanmaa", "Karkkila": "Uusimaa", "Karstula": "Keski-Suomi", "Karvia": "Satakunta", "Kaskinen": "Pohjanmaa", "Kauhajoki": "Etelä-Pohjanmaa", "Kauhava": "Etelä-Pohjanmaa", "Kauniainen": "Uusimaa", "Kaustinen": "Keski-Pohjanmaa", "Keitele": "Pohjois-Savo", "Kemi": "Lappi", "Kemijärvi": "Lappi", "Keminmaa": "Lappi", "Kemiönsaari": "Varsinais-Suomi", "Kempele": "Pohjois-Pohjanmaa", "Kerava": "Uusimaa", "Keuruu": "Keski-Suomi", "Kihniö": "Pirkanmaa", "Kinnula": "Keski-Suomi", "Kirkkonummi": "Uusimaa", "Kitee": "Pohjois-Karjala", "Kittilä": "Lappi", "Kiuruvesi": "Pohjois-Savo", "Kivijärvi": "Keski-Suomi", "Kokemäki": "Satakunta", "Kokkola": "Keski-Pohjanmaa", "Kolar": "Lappi", "Konnevesi": "Keski-Suomi", "Kontiolahti": "Pohjois-Karjala", "Korsnäs": "Pohjanmaa", "Koski Tl": "Varsinais-Suomi", "Kotka": "Kymenlaakso", "Kouvola": "Kymenlaakso", "Kristiinankaupunki": "Pohjanmaa", "Kruunupyy": "Pohjanmaa", "Kuhmo": "Kainuu", "Kuhmoinen": "Pirkanmaa", "Kumlinge": "Ahvenanmaa", "Kuopio": "Pohjois-Savo", "Kuortane": "Etelä-Pohjanmaa", "Kurikka": "Etelä-Pohjanmaa", "Kustavi": "Varsinais-Suomi", "Kuusamo": "Pohjois-Pohjanmaa", "Kyyjärvi": "Keski-Suomi", "Kärkölä": "Päijät-Häme", "Kärsämäki": "Pohjois-Pohjanmaa", "Kökar": "Ahvenanmaa", "Lahti": "Päijät-Häme", "Laihia": "Pohjanmaa", "Laitila": "Varsinais-Suomi", "Lapinjärvi": "Uusimaa", "Lapinlahti": "Pohjois-Savo", "Lappajärvi": "Etelä-Pohjanmaa", "Lappeenranta": "Etelä-Karjala", "Lapua": "Etelä-Pohjanmaa", "Laukaa": "Keski-Suomi", "Lemi": "Etelä-Karjala", "Lemland": "Ahvenanmaa", "Lempäälä": "Pirkanmaa", "Leppävirta": "Pohjois-Savo", "Lestijärvi": "Keski-Pohjanmaa", "Lieksa": "Pohjois-Karjala", "Lieto": "Varsinais-Suomi", "Liminka": "Pohjois-Pohjanmaa", "Liperi": "Pohjois-Karjala", "Lohja": "Uusimaa", "Loimaa": "Varsinais-Suomi", "Loppi": "Kanta-Häme", "Loviisa": "Uusimaa", "Luhanka": "Keski-Suomi", "Lumijoki": "Pohjois-Pohjanmaa", "Lumparland": "Ahvenanmaa", "Luoto": "Pohjanmaa", "Luumäki": "Etelä-Karjala", "Maalahti": "Pohjanmaa", "Maarianhamina": "Ahvenanmaa", "Marttila": "Varsinais-Suomi", "Masku": "Varsinais-Suomi", "Merijärvi": "Pohjois-Pohjanmaa", "Merikarvia": "Satakunta", "Miehikkälä": "Kymenlaakso", "Mikkeli": "Etelä-Savo", "Muhos": "Pohjois-Pohjanmaa", "Multia": "Keski-Suomi", "Muonio": "Lappi", "Mustasaari": "Pohjanmaa", "Muurame": "Keski-Suomi", "Mynämäki": "Varsinais-Suomi", "Myrskylä": "Uusimaa", "Mäntsälä": "Uusimaa", "Mänttä-Vilppula": "Pirkanmaa", "Mäntyharju": "Etelä-Savo", "Naantali": "Varsinais-Suomi", "Nakkila": "Satakunta", "Nivala": "Pohjois-Pohjanmaa", "Nokia": "Pirkanmaa", "Nousiainen": "Varsinais-Suomi", "Nurmes": "Pohjois-Karjala", "Nurmijärvi": "Uusimaa", "Närpiö": "Pohjanmaa", "Orimattila": "Päijät-Häme", "Oripää": "Varsinais-Suomi", "Orivesi": "Pirkanmaa", "Oulainen": "Pohjois-Pohjanmaa", "Oulu": "Pohjois-Pohjanmaa", "Outokumpu": "Pohjois-Karjala", "Padasjoki": "Päijät-Häme", "Paimio": "Varsinais-Suomi", "Paltamo": "Kainuu", "Parainen": "Varsinais-Suomi", "Parikkala": "Etelä-Karjala", "Parkano": "Pirkanmaa", "Pedersören kunta": "Pohjanmaa", "Pelkosenniemi": "Lappi", "Pello": "Lappi", "Perho": "Keski-Pohjanmaa", "Pertunmaa": "Etelä-Savo", "Petäjävesi": "Keski-Suomi", "Pieksämäki": "Etelä-Savo", "Pielavesi": "Pohjois-Savo", "Pietarsaari": "Pohjanmaa", "Pihtipudas": "Keski-Suomi", "Pirkkala": "Pirkanmaa", "Polvijärvi": "Pohjois-Karjala", "Pomarkku": "Satakunta", "Pori": "Satakunta", "Pornainen": "Uusimaa", "Porvoo": "Uusimaa", "Posio": "Lappi", "Pudasjärvi": "Pohjois-Pohjanmaa", "Pukkila": "Uusimaa", "Punkalaidun": "Pirkanmaa", "Puolanka": "Kainuu", "Puumala": "Etelä-Savo", "Pyhtää": "Kymenlaakso", "Pyhäjoki": "Pohjois-Pohjanmaa", "Pyhäjärvi": "Pohjois-Pohjanmaa", "Pyhäntä": "Pohjois-Pohjanmaa", "Pyhäranta": "Varsinais-Suomi", "Pälkäne": "Pirkanmaa", "Pöytyä": "Varsinais-Suomi", "Raahe": "Pohjois-Pohjanmaa", "Raasepori": "Uusimaa", "Raisio": "Varsinais-Suomi", "Rantasalmi": "Etelä-Savo", "Ranua": "Lappi", "Rauma": "Satakunta", "Rautalampi": "Pohjois-Savo", "Rautavaara": "Pohjois-Savo", "Rautjärvi": "Etelä-Karjala", "Reisjärvi": "Pohjois-Pohjanmaa", "Riihimäki": "Kanta-Häme", "Ristijärvi": "Kainuu", "Rovaniemi": "Lappi", "Ruokolahti": "Etelä-Karjala", "Ruovesi": "Pirkanmaa", "Rusko": "Varsinais-Suomi", "Rääkkylä": "Pohjois-Karjala", "Saarijärvi": "Keski-Suomi", "Salla": "Lappi", "Salo": "Varsinais-Suomi", "Saltvik": "Ahvenanmaa", "Sastamala": "Pirkanmaa", "Sauvo": "Varsinais-Suomi", "Savitaipale": "Etelä-Karjala", "Savonlinna": "Etelä-Savo", "Savukoski": "Lappi", "Seinäjoki": "Etelä-Pohjanmaa", "Sievi": "Pohjois-Pohjanmaa", "Siikainen": "Satakunta", "Siikajoki": "Pohjois-Pohjanmaa", "Siilinjärvi": "Pohjois-Savo", "Simo": "Lappi", "Sipoo": "Uusimaa", "Siuntio": "Uusimaa", "Sodankylä": "Lappi", "Soini": "Etelä-Pohjanmaa", "Somero": "Varsinais-Suomi", "Sonkajärvi": "Pohjois-Savo", "Sotkamo": "Kainuu", "Sottunga": "Ahvenanmaa", "Sulkava": "Etelä-Savo", "Sund": "Ahvenanmaa", "Suomussalmi": "Kainuu", "Suonenjoki": "Pohjois-Savo", "Sysmä": "Päijät-Häme", "Säkylä": "Satakunta", "Taipalsaari": "Etelä-Karjala", "Taivalkoski": "Pohjois-Pohjanmaa", "Taivassalo": "Varsinais-Suomi", "Tammela": "Kanta-Häme", "Tampere": "Pirkanmaa", "Tervo": "Pohjois-Savo", "Tervola": "Lappi", "Teuva": "Etelä-Pohjanmaa", "Tohmajärvi": "Pohjois-Karjala", "Toholampi": "Keski-Pohjanmaa", "Toivakka": "Keski-Suomi", "Tornio": "Lappi", "Turku": "Varsinais-Suomi", "Tuusniemi": "Pohjois-Savo", "Tuusula": "Uusimaa", "Tyrnävä": "Pohjois-Pohjanmaa", "Ulvila": "Satakunta", "Urjala": "Pirkanmaa", "Utajärvi": "Pohjois-Pohjanmaa", "Utsjoki": "Lappi", "Uurainen": "Keski-Suomi", "Uusikaarlepyy": "Pohjanmaa", "Uusikaupunki": "Varsinais-Suomi", "Vaala": "Pohjois-Pohjanmaa", "Vaasa": "Pohjanmaa", "Valkeakoski": "Pirkanmaa", "Vantaa": "Uusimaa", "Varkaus": "Pohjois-Savo", "Vehmaa": "Varsinais-Suomi", "Vesanto": "Pohjois-Savo", "Vesilahti": "Pirkanmaa", "Veteli": "Keski-Pohjanmaa", "Vieremä": "Pohjois-Savo", "Vihti": "Uusimaa", "Viitasaari": "Keski-Suomi", "Vimpeli": "Etelä-Pohjanmaa", "Virolahti": "Kymenlaakso", "Virrat": "Pirkanmaa", "Vårdö": "Ahvenanmaa", "Vöyri": "Pohjanmaa", "Ylitornio": "Lappi", "Ylivieska": "Pohjois-Pohjanmaa", "Ylöjärvi": "Pirkanmaa", "Ypäjä": "Kanta-Häme", "Ähtäri": "Etelä-Pohjanmaa", "Äänekoski": "Keski-Suomi" };
    
    const firebaseConfig = { apiKey: "AIzaSyA1OgSGhgYgmxDLv7-xkPPsUGCpcxFaI8M", authDomain: "geokatkosuunnittelija.firebaseapp.com", databaseURL: "https://geokatkosuunnittelija-default-rtdb.europe-west1.firebasedatabase.app", projectId: "geokatkosuunnittelija", storageBucket: "geokatkosuunnittelija.appspot.com", messagingSenderId: "745498680990", appId: "1:745498680990:web:869074eb0f0b72565ca58f" };

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    const pgcProfileNameInput = document.getElementById('pgcProfileName');
    const bulkAddInput = document.getElementById('bulkAddMunicipalities');
    const bulkAddBtn = document.getElementById('bulkAddBtn');
    const municipalityList = document.getElementById('municipalityList');
    const cacheTypeSelectorTemplate = document.getElementById('cacheTypeSelector');
    const toggleBulkAddBtn = document.getElementById('toggleBulkAddBtn');
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
    
    // UUDEN MUOKKAUSIKKUNAN ELEMENTIT
    const editCacheModal = document.getElementById('editCacheModal');
    const editCacheForm = document.getElementById('editCacheForm');
    const modalCancelBtn = document.querySelector('.modal-cancel-btn');
    const editMunIndexInput = document.getElementById('editMunIndex');
    const editCacheIndexInput = document.getElementById('editCacheIndex');
    const editGcCodeInput = document.getElementById('editGcCode');
    const editNameInput = document.getElementById('editName');
    const editTypeInput = document.getElementById('editType');
    const editSizeInput = document.getElementById('editSize');
    const editDifficultyInput = document.getElementById('editDifficulty');
    const editTerrainInput = document.getElementById('editTerrain');
    const editFpInput = document.getElementById('editFp');
    const editCoordsInput = document.getElementById('editCoords');


    let municipalities = [];
    let foundCaches = [];
    let map;
    let userMarker;
    let trackingWatcher = null;
    let lastCheckedMunicipality = null;
    let municipalityMarkers = [];
    let cacheMarkers = [];
    let clickMarker = null;
    let lastCheckedCoords = null;
    let wakeLock = null;

    const ALERT_APPROACH_DISTANCE = 1500;
    const ALERT_TARGET_DISTANCE = 200;

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; const φ1 = lat1 * Math.PI / 180; const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180; const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    const parseCoordinates = (str) => {
        if (!str) return null;
        let cleaned = str.toString().trim().toUpperCase().replace(/,/g, '.').replace(/°|´|`|'/g, ' ');
        const ddParts = cleaned.split(/\s+/).filter(Boolean);
        if (ddParts.length === 2 && !isNaN(ddParts[0]) && !isNaN(ddParts[1])) {
            const lat = parseFloat(ddParts[0]); const lon = parseFloat(ddParts[1]);
            if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) return { lat, lon };
        }
        cleaned = cleaned.replace(/([NSEW])/g, ' $1 ').replace(/\s+/g, ' ').trim();
        const latRegex = /([NS])\s*(\d{1,2})\s+([\d\.]+)/;
        const lonRegex = /([EW])\s*(\d{1,3})\s+([\d\.]+)/;
        let latMatch = cleaned.match(latRegex);
        const lonMatch = cleaned.match(lonRegex);
        if (!latMatch && lonMatch) {
            const potentialLatStr = cleaned.split(lonMatch[0])[0].trim();
            const latParts = potentialLatStr.split(/\s+/);
            if (latParts.length === 2) {
                const latDeg = parseFloat(latParts[0]); const latMin = parseFloat(latParts[1]);
                if (!isNaN(latDeg) && !isNaN(latMin)) latMatch = ["", 'N', latDeg.toString(), latMin.toString()];
            }
        }
        if (!latMatch || !lonMatch) return null;
        try {
          let lat = parseFloat(latMatch[2]) + parseFloat(latMatch[3]) / 60.0; if (latMatch[1] === 'S') lat = -lat;
          let lon = parseFloat(lonMatch[2]) + parseFloat(lonMatch[3]) / 60.0; if (lonMatch[1] === 'W') lon = -lon;
          if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
          return { lat, lon };
        } catch (e) { return null; }
    };

    const getMunicipalityFromResponse = (data) => {
        const address = data.address;
        if (!address) return null;
        const candidates = [
            address.municipality,
            address.city,
            address.town,
            address.village,
            address.county
        ].filter(Boolean);
        for (const candidate of candidates) {
            const foundMunicipality = Object.keys(kuntaMaakuntaData).find(
                (kunta) => kunta.toLowerCase() === candidate.toLowerCase()
            );
            if (foundMunicipality) {
                return foundMunicipality;
            }
        }
        return null;
    };
    
    const getMunicipalityForCoordinates = async (lat, lon) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`);
            if (!response.ok) return null;
            const data = await response.json();
            return getMunicipalityFromResponse(data);
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            return null;
        }
    };

    const handleMapClick = async (e) => {
        if (trackingWatcher) return;
        const { lat, lng } = e.latlng;
        if (clickMarker) clickMarker.removeFrom(map);
        clickMarker = L.marker([lat, lng]).addTo(map);
        clickMarker.bindPopup('Haetaan kuntaa...').openPopup();
        try {
            const municipalityName = await getMunicipalityForCoordinates(lat, lng);
            clickMarker.getPopup().setContent(`<b>${municipalityName || 'Tuntematon sijainti'}</b>`);
        } catch (error) {
            clickMarker.getPopup().setContent('Kunnan haku epäonnistui.');
            console.error(error);
        }
    };
    const initMap = () => {
        map = L.map('map').setView([61.9, 25.7], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        const userIcon = L.divIcon({className: 'user-marker'});
        userMarker = L.marker([0, 0], { icon: userIcon }).addTo(map);
        map.on('click', handleMapClick);
    };
    const showNotification = (message, type = 'info') => {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => { notification.remove(); }, 8000);
    };
    const updateStatusDisplay = (data) => {
        if (!data) {
            locationStatusDisplay.innerHTML = `<p>Aloita seuranta tai klikkaa karttaa.</p>`;
            return;
        }
        const kuntaText = data.municipality ? `<strong>${data.municipality}</strong>` : 'Haetaan kuntaa...';
        const koordinaatitText = `N: ${data.lat.toFixed(5)}, E: ${data.lon.toFixed(5)}`;
        locationStatusDisplay.innerHTML = `<p class="status-kunta">${kuntaText}</p><p class="status-koordinaatit">${koordinaatitText}</p>`;
    };
    const updateAllMarkers = () => {
        municipalityMarkers.forEach(marker => marker.removeFrom(map)); municipalityMarkers = [];
        cacheMarkers.forEach(marker => marker.removeFrom(map)); cacheMarkers = [];
        const bounds = [];
        municipalities.forEach(mun => {
            if (mun.lat && mun.lon) {
                const markerIcon = L.divIcon({ className: 'municipality-marker', html: `<span>${mun.name}</span>`, iconSize: 'auto' });
                const marker = L.marker([mun.lat, mun.lon], { icon: markerIcon }).addTo(map);
                municipalityMarkers.push(marker);
                bounds.push([mun.lat, mun.lon]);
            }
            (mun.caches || []).forEach(cache => {
                if (cache.lat && cache.lon) {
                    const cacheIcon = L.divIcon({className: 'cache-marker'});
                    const marker = L.marker([cache.lat, cache.lon], { icon: cacheIcon }).addTo(map).bindTooltip(cache.name);
                    cacheMarkers.push(marker);
                    bounds.push([cache.lat, cache.lon]);
                }
            });
        });
        if (bounds.length > 0 && !trackingWatcher) map.fitBounds(bounds, { padding: [50, 50] });
    };
    const checkCacheProximity = (userLat, userLon) => {
        let needsSave = false;
        municipalities.forEach(mun => {
            (mun.caches || []).forEach(cache => {
                if (cache.lat && cache.lon && !cache.done) {
                    const distance = getDistance(userLat, userLon, cache.lat, cache.lon);
                    if (distance <= ALERT_APPROACH_DISTANCE && !cache.alert_approach_given) {
                        showNotification(`Lähestyt kätköä: ${cache.name} (${Math.round(distance)}m)`, 'approach');
                        try { new Audio('approach.mp3').play(); } catch (e) { console.warn("Ei voitu soittaa ääntä approach.mp3"); }
                        cache.alert_approach_given = true; needsSave = true;
                    }
                    if (distance <= ALERT_TARGET_DISTANCE && !cache.alert_target_given) {
                        showNotification(`Olet lähellä kätköä: ${cache.name} (${Math.round(distance)}m)`, 'target');
                        try { new Audio('target.mp3').play(); } catch (e) { console.warn("Ei voitu soittaa ääntä target.mp3"); }
                        cache.alert_target_given = true; needsSave = true;
                    }
                }
            });
        });
        if (needsSave) saveMunicipalities();
    };
    const checkCurrentMunicipality = async (lat, lon) => {
        try {
            const currentMunicipality = await getMunicipalityForCoordinates(lat, lon);
            updateStatusDisplay({ municipality: currentMunicipality || 'Tuntematon sijainti', lat, lon });
            
            if (currentMunicipality && currentMunicipality !== lastCheckedMunicipality) {
                lastCheckedMunicipality = currentMunicipality;
                const foundMunIndex = municipalities.findIndex(m => m.name.toLowerCase() === currentMunicipality.toLowerCase());
                document.querySelectorAll('.municipality-item.highlight').forEach(el => el.classList.remove('highlight'));
                if (foundMunIndex !== -1) {
                    showNotification(`Saavuit kuntaan: ${currentMunicipality}!`, 'info');
                    const munElement = document.getElementById(`mun-item-${foundMunIndex}`);
                    if (munElement) munElement.classList.add('highlight');
                }
            }
        } catch (error) { console.error("Kuntatarkistusvirhe:", error); }
    };
    const getZoomLevelForSpeed = (speedKmh) => {
        if (speedKmh < 10) return 16; if (speedKmh < 30) return 15;
        if (speedKmh < 60) return 14; if (speedKmh < 90) return 13;
        return 12;
    };
    const requestWakeLock = async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock aktivoitu.');
            } catch (err) { console.error(`${err.name}, ${err.message}`); }
        }
    };
    const toggleTracking = async () => {
        if (clickMarker) { clickMarker.removeFrom(map); clickMarker = null; }
        if (trackingWatcher) {
            navigator.geolocation.clearWatch(trackingWatcher);
            trackingWatcher = null; lastCheckedCoords = null;
            if (wakeLock) {
                wakeLock.release().then(() => { wakeLock = null; console.log('Wake Lock vapautettu.'); });
            }
            toggleTrackingBtn.textContent = '🛰️ Aloita seuranta';
            toggleTrackingBtn.classList.remove('tracking-active');
            speedDisplay.textContent = '-- km/h';
            lastCheckedMunicipality = null;
            updateStatusDisplay(null);
            updateAllMarkers();
        } else {
            if (!("geolocation" in navigator)) return alert("Selaimesi ei tue paikannusta.");
            await requestWakeLock();
            const CHECK_MUNICIPALITY_INTERVAL_METERS = 500;
            trackingWatcher = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, speed } = position.coords;
                    const speedKmh = speed ? Math.round(speed * 3.6) : 0;
                    speedDisplay.textContent = `${speedKmh} km/h`;
                    if (map && userMarker) {
                        userMarker.setLatLng([latitude, longitude]);
                        const newZoom = getZoomLevelForSpeed(speedKmh);
                        if(map.getZoom() !== newZoom) map.setZoom(newZoom);
                        if (!map.getBounds().pad(-0.2).contains(userMarker.getLatLng())) map.panTo([latitude, longitude]);
                        checkCacheProximity(latitude, longitude);
                        if (!lastCheckedCoords || getDistance(lastCheckedCoords.lat, lastCheckedCoords.lon, latitude, longitude) > CHECK_MUNICIPALITY_INTERVAL_METERS) {
                            lastCheckedCoords = { lat: latitude, lon: longitude };
                            checkCurrentMunicipality(latitude, longitude);
                        } else {
                             updateStatusDisplay({ municipality: lastCheckedMunicipality, lat: latitude, lon: longitude });
                        }
                    }
                },
                (error) => { console.error("Paikannusvirhe:", error); alert("Paikannus epäonnistui."); updateStatusDisplay(null); },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
            );
            toggleTrackingBtn.textContent = '🛑 Lopeta seuranta';
            toggleTrackingBtn.classList.add('tracking-active');
        }
    };

    const render = () => {
        municipalityList.innerHTML = '';
        if (!municipalities) municipalities = [];
        municipalities.forEach((municipality, munIndex) => {
            const munItem = document.createElement('li');
            munItem.className = 'municipality-item';
            munItem.draggable = true;
            munItem.dataset.munIndex = munIndex;
            munItem.id = `mun-item-${munIndex}`;
            
            let cacheHtml = (municipality.caches || []).map((cache, cacheIndex) => {
                const gcCodeLink = cache.gcCode ? `<a href="https://coord.info/${cache.gcCode}" target="_blank" rel="noopener noreferrer">${cache.gcCode}</a>` : '';
                const detailsHtml = `
                    <span class="cache-detail-tag type">${cache.type || 'Muu'}</span>
                    <span class="cache-detail-tag size">${cache.size || ''}</span>
                    <span class="cache-detail-tag dt">D ${cache.difficulty || '?'} / T ${cache.terrain || '?'}</span>
                    ${cache.fp ? `<span class="cache-detail-tag fp">${cache.fp}</span>` : ''}
                `;
                const coordsSetClass = (cache.lat && cache.lon) ? 'coords-set' : '';
                return `
                    <li class="cache-item">
                        <input type="checkbox" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">
                        <div class="cache-info">
                            <div class="cache-name">
                                ${gcCodeLink} ${cache.name}
                            </div>
                            <div class="cache-details">
                                ${detailsHtml}
                            </div>
                        </div>
                        <div class="cache-actions">
                            <button class="set-coords-btn ${coordsSetClass}" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">📍</button>
                            <button class="edit-cache-btn" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">✏️</button>
                            <button class="delete-cache-btn" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">🗑️</button>
                        </div>
                    </li>`;
            }).join('');

            const kunnanNimi = municipality.name;
            const pgcProfileName = pgcProfileNameInput.value.trim();
            const oikeaAvain = Object.keys(kuntaMaakuntaData).find(key => key.toLowerCase() === kunnanNimi.toLowerCase());
            const maakunta = oikeaAvain ? kuntaMaakuntaData[oikeaAvain] : undefined;
            let pgcLinkHtml = '';
            if (maakunta && pgcProfileName) {
                const pgcUrl = `https://project-gc.com/Tools/MapCompare?profile_name=${pgcProfileName}&country[]=Finland&region[]=${encodeURIComponent(maakunta)}&county[]=${encodeURIComponent(oikeaAvain)}&nonefound=on&submit=Filter`;
                pgcLinkHtml = `<a href="${pgcUrl}" target="_blank" rel="noopener noreferrer" title="Avaa ${kunnanNimi} Project-GC:ssä" class="pgc-link">🗺️</a>`;
            }
            munItem.innerHTML = `<div class="municipality-header"><a class="municipality-name-link" href="https://www.geocache.fi/stat/other/jakauma.php?kuntalista=${encodeURIComponent(kunnanNimi)}" target="_blank" rel="noopener noreferrer">${kunnanNimi}</a><div class="actions">${pgcLinkHtml}<button class="edit-municipality-btn" title="Muokkaa kunnan nimeä" data-mun-index="${munIndex}">✏️</button><button class="delete-municipality-btn" title="Poista kunta" data-mun-index="${munIndex}">🗑️</button></div></div><ul class="cache-list">${cacheHtml}</ul><div class="add-cache"><input type="text" class="new-cache-name" placeholder="Kätkön nimi tai GC-koodi..."><button class="add-cache-btn" data-mun-index="${munIndex}">+</button></div>`;
            municipalityList.appendChild(munItem);
        });
    };
    
    const renderFoundList = () => {
        foundCachesList.innerHTML = '';
        const sortedCaches = [...foundCaches].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        sortedCaches.forEach((cache) => {
            const li = document.createElement('li');
            li.className = 'found-cache-item';
            const date = new Date(cache.timestamp);
            const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} klo ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            const loggersHtml = LOGGERS.map(logger => `<label><input type="checkbox" data-cache-id="${cache.id}" data-logger="${logger}" ${cache.loggers[logger] ? 'checked' : ''}>${logger}</label>`).join('');
            li.innerHTML = `
                <div class="found-cache-header">
                    <a href="https://coord.info/${cache.gcCode}" target="_blank" class="found-cache-name">${cache.name}</a>
                    <div class="found-cache-actions">
                        <button class="edit-found-btn" data-cache-id="${cache.id}" title="Muokkaa">✏️</button>
                        <button class="delete-found-btn" data-cache-id="${cache.id}" title="Poista">🗑️</button>
                    </div>
                </div>
                <div class="timestamp">${formattedDate}</div>
                <div class="loggers">${loggersHtml}</div>
            `;
            foundCachesList.appendChild(li);
        });
    };

    const ensureAllCoordsAreFetched = async (munis) => {
        let didChange = false;
        for (const mun of munis) {
            if (!mun.lat || !mun.lon) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(mun.name + ', Finland')}&format=json&limit=1`);
                    const data = await response.json();
                    if (data && data.length > 0) {
                        mun.lat = parseFloat(data[0].lat); mun.lon = parseFloat(data[0].lon); didChange = true;
                    }
                } catch (error) { console.error("Koordinaattien haku epäonnistui kunnalle:", mun.name, error); }
            }
        }
        if (didChange) {
            console.log("Paikannettiin puuttuvia koordinaatteja, tallennetaan...");
            saveMunicipalities(); return true;
        }
        return false;
    };
    
    initMap();

    onValue(ref(database, FIREBASE_PATH), async (snapshot) => {
        const data = snapshot.val();
        municipalities = (data && data.municipalities) ? data.municipalities : [];
        foundCaches = (data && data.foundCaches) ? data.foundCaches : [];
        pgcProfileNameInput.value = data ? data.pgcProfileName || '' : '';
        render();
        renderFoundList();
        const changed = await ensureAllCoordsAreFetched(municipalities);
        if (changed) render();
        updateAllMarkers();
    });

    const saveMunicipalities = () => set(ref(database, `${FIREBASE_PATH}/municipalities`), municipalities);
    const saveFoundCaches = () => set(ref(database, `${FIREBASE_PATH}/foundCaches`), foundCaches);
    const savePgcProfileName = () => set(ref(database, `${FIREBASE_PATH}/pgcProfileName`), pgcProfileNameInput.value);

    const handleBulkAdd = async () => {
        const text = bulkAddInput.value.trim(); if (!text) return;
        bulkAddBtn.disabled = true; bulkAddBtn.textContent = 'Haetaan...';
        const newNames = text.split(/[\n,]/).map(name => name.trim()).filter(Boolean);
        let notFound = [];
        for (const name of newNames) {
            if (!municipalities.some(m => m.name.toLowerCase() === name.toLowerCase())) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name + ', Finland')}&format=json&limit=1`);
                    const data = await response.json();
                    if (data && data.length > 0) {
                        municipalities.push({ name: name, caches: [], lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
                    } else { notFound.push(name); }
                } catch (error) { console.error("Virhe haettaessa kuntaa:", name, error); notFound.push(name); }
            }
        }
        if (notFound.length > 0) alert(`Seuraavia kuntia ei löytynyt: ${notFound.join(', ')}`);
        bulkAddInput.value = ''; bulkAddBtn.disabled = false; bulkAddBtn.textContent = 'Lisää listasta';
        saveMunicipalities();
    };

    toggleBulkAddBtn.addEventListener('click', () => {
        const isHidden = bulkAddContainer.classList.toggle('hidden');
        toggleBulkAddBtn.textContent = isHidden ? 'Lisää kunnat listana' : 'Piilota lisäysalue';
    });
    bulkAddBtn.addEventListener('click', handleBulkAdd);
    
    globalAddFromPgcBtn.addEventListener('click', async () => {
        const text = globalPgcPasteArea.value.trim();
        if (!text) return;
        
        globalAddFromPgcBtn.disabled = true;
        globalAddFromPgcBtn.textContent = "Käsitellään...";

        const lines = text.split('\n').filter(Boolean);
        let cachesAddedCount = 0;

        for (let i = 0; i < lines.length; i += 3) {
            const line1 = lines[i];
            const line2 = lines[i + 1];
            const line3 = lines[i + 2];

            if (!line1 || !line2 || !line3) continue;

            try {
                const frontParts = line1.split(/\s*-\s*/);
                const gcCode = frontParts[0]?.trim();
                const cacheName = frontParts[1]?.trim();
                const fpInfo = frontParts.length > 2 ? frontParts.slice(2).join(' - ').trim() : '';

                const detailsParts = line2.split('/');
                const cacheType = detailsParts[0]?.trim();
                const cacheSize = detailsParts[1]?.trim();
                const difficulty = detailsParts[2]?.trim();
                const terrain = detailsParts[3]?.trim();

                const coords = parseCoordinates(line3);

                if (!gcCode || !cacheName || !cacheType || !coords) {
                    continue;
                }

                const munName = await getMunicipalityForCoordinates(coords.lat, coords.lon);
                if (!munName) {
                    console.warn(`Ei löytynyt kuntaa koordinaateille: ${coords.lat}, ${coords.lon}`);
                    continue;
                }
                
                const cacheData = {
                    id: Date.now() + Math.random(), name: cacheName, gcCode, fp: fpInfo, type: cacheType, size: cacheSize,
                    difficulty, terrain, lat: coords.lat, lon: coords.lon, alert_approach_given: false, alert_target_given: false
                };

                let munIndex = municipalities.findIndex(m => m.name.toLowerCase() === munName.toLowerCase());

                if (munIndex === -1) {
                    municipalities.push({ name: munName, caches: [cacheData] });
                } else {
                    if (!municipalities[munIndex].caches) {
                        municipalities[munIndex].caches = [];
                    }
                    municipalities[munIndex].caches.push(cacheData);
                }
                cachesAddedCount++;

            } catch (e) {
                console.error("Lohkon jäsentäminen epäonnistui:", [line1, line2, line3], e);
            }
        }
        
        if (cachesAddedCount > 0) {
            await ensureAllCoordsAreFetched(municipalities);
            saveMunicipalities();
            globalPgcPasteArea.value = '';
        } else {
            alert("Ei voitu jäsentää kelvollisia kätkötietoja syötetystä tekstistä.");
        }
        
        globalAddFromPgcBtn.disabled = false;
        globalAddFromPgcBtn.textContent = "Lisää ja paikanna";
    });

    municipalityList.addEventListener('click', (e) => {
        const button = e.target.closest('button, input[type="checkbox"]');
        if (!button) return;

        let needsSave = false;
        let needsRender = false;
        const munIndex = parseInt(button.dataset.munIndex, 10);
        if (isNaN(munIndex)) return;
        
        if (button.type === 'checkbox') {
            const cacheIndex = parseInt(button.dataset.cacheIndex, 10);
            const [cacheToMove] = municipalities[munIndex].caches.splice(cacheIndex, 1);

            const loggers = {};
            LOGGERS.forEach(name => { loggers[name] = false; });
            
            const newFoundCache = {
                id: cacheToMove.id || Date.now(),
                name: cacheToMove.name,
                gcCode: cacheToMove.gcCode || '',
                timestamp: new Date().toISOString(),
                loggers: loggers
            };

            foundCaches.push(newFoundCache);
            needsSave = true;
            needsRender = true;

        } else {
            const cacheIndex = parseInt(button.dataset.cacheIndex, 10);
            if (button.classList.contains('set-coords-btn')) {
                const cache = municipalities[munIndex].caches[cacheIndex];
                const currentCoords = cache.lat ? `${cache.lat.toFixed(6)} ${cache.lon.toFixed(6)}` : '';
                const input = prompt(`Syötä kätkön "${cache.name}" koordinaatit:`, currentCoords);
                if(input !== null) {
                    const coords = parseCoordinates(input);
                    if(coords) {
                        cache.lat = coords.lat; cache.lon = coords.lon;
                    } else if (input.trim() === '') {
                        delete cache.lat; delete cache.lon;
                    } else {
                        alert("Virheellinen koordinaattimuoto.\nEsimerkki: N 60 58.794 E 26 11.341");
                    }
                    needsSave = true; needsRender = true;
                }
            } else if (button.classList.contains('edit-municipality-btn')) {
                const oldName = municipalities[munIndex].name;
                const newName = prompt("Muokkaa kunnan nimeä:", oldName);
                if (newName && newName.trim() && newName.trim().toLowerCase() !== oldName.toLowerCase()) {
                    municipalities[munIndex].name = newName.trim();
                    delete municipalities[munIndex].lat; delete municipalities[munIndex].lon;
                    needsSave = true; needsRender = true;
                    ensureAllCoordsAreFetched(municipalities);
                }
            } else if (button.classList.contains('delete-municipality-btn')) {
                if (confirm(`Haluatko poistaa kunnan "${municipalities[munIndex].name}"?`)) {
                    municipalities.splice(munIndex, 1);
                    needsSave = true; needsRender = true;
                }
            } else if (button.classList.contains('add-cache-btn')) {
                const container = button.closest('.add-cache');
                const nameInput = container.querySelector('.new-cache-name');
                if (nameInput.value.trim()) {
                    if (!municipalities[munIndex].caches) municipalities[munIndex].caches = [];
                    const name = nameInput.value.trim();
                    const gcCodeMatch = name.match(/(GC[A-Z0-9]+)/i);
                    municipalities[munIndex].caches.push({ 
                        id: Date.now(), 
                        name: gcCodeMatch ? name.replace(gcCodeMatch[0], '').trim() : name,
                        gcCode: gcCodeMatch ? gcCodeMatch[0].toUpperCase() : '',
                        type: 'Muu'
                    });
                    nameInput.value = '';
                    needsSave = true; needsRender = true;
                }
            } else if (button.classList.contains('delete-cache-btn')) {
                if (confirm(`Poistetaanko kätkö "${municipalities[munIndex].caches[cacheIndex].name}"?`)) {
                    municipalities[munIndex].caches.splice(cacheIndex, 1);
                    needsSave = true; needsRender = true;
                }
            } else if (button.classList.contains('edit-cache-btn')) {
                // UUSI LOGIIKKA: AVAA MUOKKAUSIKKUNA
                const cache = municipalities[munIndex].caches[cacheIndex];
                
                editMunIndexInput.value = munIndex;
                editCacheIndexInput.value = cacheIndex;

                editGcCodeInput.value = cache.gcCode || '';
                editNameInput.value = cache.name || '';
                editTypeInput.value = cache.type || '';
                editSizeInput.value = cache.size || '';
                editDifficultyInput.value = cache.difficulty || '';
                editTerrainInput.value = cache.terrain || '';
                editFpInput.value = cache.fp || '';
                editCoordsInput.value = (cache.lat && cache.lon) ? `N ${cache.lat.toFixed(5)} E ${cache.lon.toFixed(5)}` : '';
                
                editCacheModal.classList.remove('hidden');
            }
        }
        
        if (needsSave) {
            saveMunicipalities();
            saveFoundCaches();
        }
        if (needsRender) {
            render();
            renderFoundList();
            updateAllMarkers();
        }
    });

    // MUOKKAUSIKKUNAN TAPAHTUMANKÄSITTELIJÄT
    editCacheForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const munIndex = parseInt(editMunIndexInput.value, 10);
        const cacheIndex = parseInt(editCacheIndexInput.value, 10);

        if (isNaN(munIndex) || isNaN(cacheIndex)) return;

        const cache = municipalities[munIndex].caches[cacheIndex];

        cache.gcCode = editGcCodeInput.value.trim().toUpperCase();
        cache.name = editNameInput.value.trim();
        cache.type = editTypeInput.value.trim();
        cache.size = editSizeInput.value.trim();
        cache.difficulty = editDifficultyInput.value.trim();
        cache.terrain = editTerrainInput.value.trim();
        cache.fp = editFpInput.value.trim();
        
        const coords = parseCoordinates(editCoordsInput.value);
        if (coords) {
            cache.lat = coords.lat;
            cache.lon = coords.lon;
        } else if(editCoordsInput.value.trim() === '') {
            delete cache.lat;
            delete cache.lon;
        }

        saveMunicipalities();
        render();
        updateAllMarkers();
        editCacheModal.classList.add('hidden');
    });

    modalCancelBtn.addEventListener('click', () => {
        editCacheModal.classList.add('hidden');
    });
    
    editCacheModal.addEventListener('click', (e) => {
        if (e.target === editCacheModal) {
            editCacheModal.classList.add('hidden');
        }
    });


    directAddBtn.addEventListener('click', () => {
        const input = directAddInput.value.trim(); if (!input) return;
        const gcCodeMatch = input.match(/(GC[A-Z0-9]+)/i);
        if (!gcCodeMatch) return alert("Syötteestä ei löytynyt GC-koodia.");
        const gcCode = gcCodeMatch[0].toUpperCase();
        const loggers = {};
        LOGGERS.forEach(name => { loggers[name] = false; });
        foundCaches.push({
            id: Date.now(), name: gcCode, gcCode: gcCode,
            timestamp: new Date().toISOString(), loggers: loggers
        });
        saveFoundCaches();
        directAddInput.value = '';
    });

    foundCachesList.addEventListener('click', (e) => {
        const target = e.target;
        const cacheItem = target.closest('.found-cache-item');
        if (!cacheItem) return;
        const cacheId = parseInt(target.closest('button, label > input')?.dataset.cacheId, 10);
        if (isNaN(cacheId)) return;
        
        const cacheIndex = foundCaches.findIndex(c => c.id === cacheId);
        if (cacheIndex === -1) return;
        const cache = foundCaches[cacheIndex];
        
        if (target.type === 'checkbox') {
            const loggerName = target.dataset.logger;
            cache.loggers[loggerName] = target.checked;
            saveFoundCaches();
        } else if (target.classList.contains('edit-found-btn')) {
            const newName = prompt("Muokkaa nimeä/GC-koodia:", cache.name);
            if (newName && newName.trim()) {
                cache.name = newName.trim();
                const gcCodeMatch = newName.match(/(GC[A-Z0-9]+)/i);
                cache.gcCode = gcCodeMatch ? gcCodeMatch[0].toUpperCase() : newName;
                saveFoundCaches();
            }
        } else if (target.classList.contains('delete-found-btn')) {
            if (confirm(`Haluatko varmasti poistaa lokista kätkön "${cache.name}"?`)) {
                foundCaches.splice(cacheIndex, 1);
                saveFoundCaches();
            }
        }
    });

    showTripListBtn.addEventListener('click', () => {
        tripListView.classList.remove('hidden');
        foundLogView.classList.add('hidden');
        globalPgcAddContainer.classList.remove('hidden');
        showTripListBtn.classList.add('active');
        showFoundLogBtn.classList.remove('active');
    });
    showFoundLogBtn.addEventListener('click', () => {
        tripListView.classList.add('hidden');
        foundLogView.classList.remove('hidden');
        globalPgcAddContainer.classList.add('hidden');
        showTripListBtn.classList.remove('active');
        showFoundLogBtn.classList.add('active');
    });

    pgcProfileNameInput.addEventListener('change', savePgcProfileName);
    toggleTrackingBtn.addEventListener('click', toggleTracking);
    
    let draggedIndex = null;
    municipalityList.addEventListener('dragstart', (e) => {
        const munItem = e.target.closest('.municipality-item');
        if (munItem) { draggedIndex = parseInt(munItem.dataset.munIndex, 10); setTimeout(() => munItem.classList.add('dragging'), 0); } 
        else { e.preventDefault(); }
    });
    municipalityList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(municipalityList, e.clientY);
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement) {
            if (afterElement == null) municipalityList.appendChild(draggingElement);
            else municipalityList.insertBefore(draggingElement, afterElement);
        }
    });
    municipalityList.addEventListener('dragend', (e) => {
        const munItem = e.target.closest('.municipality-item');
        if (munItem) munItem.classList.remove('dragging');
    });
    municipalityList.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement) {
            const newIndex = Array.from(municipalityList.children).indexOf(draggingElement);
            if (newIndex > -1 && draggedIndex !== null) {
                const [removed] = municipalities.splice(draggedIndex, 1);
                municipalities.splice(newIndex, 0, removed);
                saveMunicipalities();
            }
        }
    });
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.municipality-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
            else return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});
