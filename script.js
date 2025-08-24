import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update, get, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// --- ASETUKSET ---
const urlParams = new URLSearchParams(window.location.search);
const listNameFromUrl = urlParams.get('lista');
const FIREBASE_PATH = listNameFromUrl || 'paalista';
const OFFLINE_KEY = `georeissu-offline-${FIREBASE_PATH}`;
// --- ASETUKSET w2 PÄÄTTYVÄT ---

document.addEventListener('DOMContentLoaded', () => {
    document.title = `${FIREBASE_PATH} — MK Reissuapuri —`;
    const listNameDisplay = document.getElementById('listNameDisplay');
    if (listNameDisplay) {
        listNameDisplay.textContent = FIREBASE_PATH;
    }
    
    const kuntaMaakuntaData = { "Akaa": "Pirkanmaa", "Alajärvi": "Etelä-Pohjanmaa", "Alavieska": "Pohjois-Pohjanmaa", "Alavus": "Etelä-Pohjanmaa", "Asikkala": "Päijät-Häme", "Askola": "Uusimaa", "Aura": "Varsinais-Suomi", "Brändö": "Ahvenanmaa", "Eckerö": "Ahvenanmaa", "Enonkoski": "Etelä-Savo", "Enontekiö": "Lappi", "Espoo": "Uusimaa", "Eura": "Satakunta", "Eurajoki": "Satakunta", "Evijärvi": "Etelä-Pohjanmaa", "Finström": "Ahvenanmaa", "Forssa": "Kanta-Häme", "Föglö": "Ahvenanmaa", "Geta": "Ahvenanmaa", "Haapajärvi": "Pohjois-Pohjanmaa", "Haapavesi": "Pohjois-Pohjanmaa", "Hailuoto": "Pohjois-Pohjanmaa", "Halsua": "Keski-Pohjanmaa", "Hamina": "Kymenlaakso", "Hammarland": "Ahvenanmaa", "Hankasalmi": "Keski-Suomi", "Hanko": "Uusimaa", "Harjavalta": "Satakunta", "Hartola": "Päijät-Häme", "Hattula": "Kanta-Häme", "Hausjärvi": "Kanta-Häme", "Heinola": "Päijät-Häme", "Heinävesi": "Pohjois-Karjala", "Helsinki": "Uusimaa", "Hirvensalmi": "Etelä-Savo", "Hollola": "Päijät-Häme", "Huittinen": "Satakunta", "Humppila": "Kanta-Häme", "Hyrynsalmi": "Kainuu", "Hyvinkää": "Uusimaa", "Hämeenkyrö": "Pirkanmaa", "Hämeenlinna": "Kanta-Häme", "Ii": "Pohjois-Pohjanmaa", "Iisalmi": "Pohjois-Savo", "Iitti": "Päijät-Häme", "Ikaalinen": "Pirkanmaa", "Ilmajoki": "Etelä-Pohjanmaa", "Ilomantsi": "Pohjois-Karjala", "Imatra": "Etelä-Karjala", "Inari": "Lappi", "Inkoo": "Uusimaa", "Isojoki": "Etelä-Pohjanmaa", "Isokyrö": "Etelä-Pohjanmaa", "Janakkala": "Kanta-Häme", "Joensuu": "Pohjois-Karjala", "Jokioinen": "Kanta-Häme", "Jomala": "Ahvenanmaa", "Joroinen": "Pohjois-Savo", "Joutsa": "Keski-Suomi", "Juuka": "Pohjois-Karjala", "Juupajoki": "Pirkanmaa", "Juva": "Etelä-Savo", "Jyväskylä": "Keski-Suomi", "Jämijärvi": "Satakunta", "Jämsä": "Keski-Suomi", "Järvenpää": "Uusimaa", "Kaarina": "Varsinais-Suomi", "Kaavi": "Pohjois-Savo", "Kajaani": "Kainuu", "Kalajoki": "Pohjois-Pohjanmaa", "Kangasala": "Pirkanmaa", "Kangasniemi": "Etelä-Savo", "Kankaanpää": "Satakunta", "Kannonkoski": "Keski-Suomi", "Kannus": "Keski-Pohjanmaa", "Karijoki": "Etelä-Pohjanmaa", "Karkkila": "Uusimaa", "Karstula": "Keski-Suomi", "Karvia": "Satakunta", "Kaskinen": "Pohjanmaa", "Kauhajoki": "Etelä-Pohjanmaa", "Kauhava": "Etelä-Pohjanmaa", "Kauniainen": "Uusimaa", "Kaustinen": "Keski-Pohjanmaa", "Keitele": "Pohjois-Savo", "Kemi": "Lappi", "Kemijärvi": "Lappi", "Keminmaa": "Lappi", "Kemiönsaari": "Varsinais-Suomi", "Kempele": "Pohjois-Pohjanmaa", "Kerava": "Uusimaa", "Keuruu": "Keski-Suomi", "Kihniö": "Pirkanmaa", "Kinnula": "Keski-Suomi", "Kirkkonummi": "Uusimaa", "Kitee": "Pohjois-Karjala", "Kittilä": "Lappi", "Kiuruvesi": "Pohjois-Savo", "Kivijärvi": "Keski-Suomi", "Kokemäki": "Satakunta", "Kokkola": "Keski-Pohjanmaa", "Kolar": "Lappi", "Konnevesi": "Keski-Suomi", "Kontiolahti": "Pohjois-Karjala", "Korsnäs": "Pohjanmaa", "Koski Tl": "Varsinais-Suomi", "Kotka": "Kymenlaakso", "Kouvola": "Kymenlaakso", "Kristiinankaupunki": "Pohjanmaa", "Kruunupyy": "Pohjanmaa", "Kuhmo": "Kainuu", "Kuhmoinen": "Pirkanmaa", "Kumlinge": "Ahvenanmaa", "Kuopio": "Pohjois-Savo", "Kuortane": "Etelä-Pohjanmaa", "Kurikka": "Etelä-Pohjanmaa", "Kustavi": "Varsinais-Suomi", "Kuusamo": "Pohjois-Pohjanmaa", "Kyyjärvi": "Keski-Suomi", "Kärkölä": "Päijät-Häme", "Kärsämäki": "Pohjois-Pohjanmaa", "Kökar": "Ahvenanmaa", "Lahti": "Päijät-Häme", "Laihia": "Pohjanmaa", "Laitila": "Varsinais-Suomi", "Lapinjärvi": "Uusimaa", "Lapinlahti": "Pohjois-Savo", "Lappajärvi": "Etelä-Pohjanmaa", "Lappeenranta": "Etelä-Karjala", "Lapua": "Etelä-Pohjanmaa", "Laukaa": "Keski-Suomi", "Lemi": "Etelä-Karjala", "Lemland": "Ahvenanmaa", "Lempäälä": "Pirkanmaa", "Leppävirta": "Pohjois-Savo", "Lestijärvi": "Keski-Pohjanmaa", "Lieksa": "Pohjois-Karjala", "Lieto": "Varsinais-Suomi", "Liminka": "Pohjois-Pohjanmaa", "Liperi": "Pohjois-Karjala", "Lohja": "Uusimaa", "Loimaa": "Varsinais-Suomi", "Loppi": "Kanta-Häme", "Loviisa": "Uusimaa", "Luhanka": "Keski-Suomi", "Lumijoki": "Pohjois-Pohjanmaa", "Lumparland": "Ahvenanmaa", "Luoto": "Pohjanmaa", "Luumäki": "Etelä-Karjala", "Maalahti": "Pohjanmaa", "Maarianhamina": "Ahvenanmaa", "Marttila": "Varsinais-Suomi", "Masku": "Varsinais-Suomi", "Merijärvi": "Pohjois-Pohjanmaa", "Merikarvia": "Satakunta", "Miehikkälä": "Kymenlaakso", "Mikkeli": "Etelä-Savo", "Muhos": "Pohjois-Pohjanmaa", "Multia": "Keski-Suomi", "Muonio": "Lappi", "Mustasaari": "Pohjanmaa", "Muurame": "Keski-Suomi", "Mynämäki": "Varsinais-Suomi", "Myrskylä": "Uusimaa", "Mäntsälä": "Uusimaa", "Mänttä-Vilppula": "Pirkanmaa", "Mäntyharju": "Etelä-Savo", "Naantali": "Varsinais-Suomi", "Nakkila": "Satakunta", "Nivala": "Pohjois-Pohjanmaa", "Nokia": "Pirkanmaa", "Nousiainen": "Varsinais-Suomi", "Nurmes": "Pohjois-Karjala", "Nurmijärvi": "Uusimaa", "Närpiö": "Pohjanmaa", "Orimattila": "Päijät-Häme", "Oripää": "Varsinais-Suomi", "Orivesi": "Pirkanmaa", "Oulainen": "Pohjois-Pohjanmaa", "Oulu": "Pohjois-Pohjanmaa", "Outokumpu": "Pohjois-Karjala", "Padasjoki": "Päijät-Häme", "Paimio": "Varsinais-Suomi", "Paltamo": "Kainuu", "Parainen": "Varsinais-Suomi", "Parikkala": "Etelä-Karjala", "Parkano": "Pirkanmaa", "Pedersören kunta": "Pohjanmaa", "Pelkosenniemi": "Lappi", "Pello": "Lappi", "Perho": "Keski-Pohjanmaa", "Pertunmaa": "Etelä-Savo", "Petäjävesi": "Keski-Suomi", "Pieksämäki": "Etelä-Savo", "Pielavesi": "Pohjois-Savo", "Pietarsaari": "Pohjanmaa", "Pihtipudas": "Keski-Suomi", "Pirkkala": "Pirkanmaa", "Polvijärvi": "Pohjois-Karjala", "Pomarkku": "Satakunta", "Pori": "Satakunta", "Pornainen": "Uusimaa", "Porvoo": "Uusimaa", "Posio": "Lappi", "Pudasjärvi": "Pohjois-Pohjanmaa", "Pukkila": "Uusimaa", "Punkalaidun": "Pirkanmaa", "Puolanka": "Kainuu", "Puumala": "Etelä-Savo", "Pyhtää": "Kymenlaakso", "Pyhäjoki": "Pohjois-Pohjanmaa", "Pyhäjärvi": "Pohjois-Pohjanmaa", "Pyhäntä": "Pohjois-Pohjanmaa", "Pyhäranta": "Varsinais-Suomi", "Pälkäne": "Pirkanmaa", "Pöytyä": "Varsinais-Suomi", "Raahe": "Pohjois-Pohjanmaa", "Raasepori": "Uusimaa", "Raisio": "Varsinais-Suomi", "Rantasalmi": "Etelä-Savo", "Ranua": "Lappi", "Rauma": "Satakunta", "Rautalampi": "Pohjois-Savo", "Rautavaara": "Pohjois-Savo", "Rautjärvi": "Etelä-Karjala", "Reisjärvi": "Pohjois-Pohjanmaa", "Riihimäki": "Kanta-Häme", "Ristijärvi": "Kainuu", "Rovaniemi": "Lappi", "Ruokolahti": "Etelä-Karjala", "Ruovesi": "Pirkanmaa", "Rusko": "Varsinais-Suomi", "Rääkkylä": "Pohjois-Karjala", "Saarijärvi": "Keski-Suomi", "Salla": "Lappi", "Salo": "Varsinais-Suomi", "Saltvik": "Ahvenanmaa", "Sastamala": "Pirkanmaa", "Sauvo": "Varsinais-Suomi", "Savitaipale": "Etelä-Karjala", "Savonlinna": "Etelä-Savo", "Savukoski": "Lappi", "Seinäjoki": "Etelä-Pohjanmaa", "Sievi": "Pohjois-Pohjanmaa", "Siikainen": "Satakunta", "Siikajoki": "Pohjois-Pohjanmaa", "Siilinjärvi": "Pohjois-Savo", "Simo": "Lappi", "Sipoo": "Uusimaa", "Siuntio": "Uusimaa", "Sodankylä": "Lappi", "Soini": "Etelä-Pohjanmaa", "Somero": "Varsinais-Suomi", "Sonkajärvi": "Pohjois-Savo", "Sotkamo": "Kainuu", "Sottunga": "Ahvenanmaa", "Sulkava": "Etelä-Savo", "Sund": "Ahvenanmaa", "Suomussalmi": "Kainuu", "Suonenjoki": "Pohjois-Savo", "Sysmä": "Päijät-Häme", "Säkylä": "Satakunta", "Taipalsaari": "Etelä-Karjala", "Taivalkoski": "Pohjois-Pohjanmaa", "Taivassalo": "Varsinais-Suomi", "Tammela": "Kanta-Häme", "Tampere": "Pirkanmaa", "Tervo": "Pohjois-Savo", "Tervola": "Lappi", "Teuva": "Etelä-Pohjanmaa", "Tohmajärvi": "Pohjois-Karjala", "Toholampi": "Keski-Pohjanmaa", "Toivakka": "Keski-Suomi", "Tornio": "Lappi", "Turku": "Varsinais-Suomi", "Tuusniemi": "Pohjois-Savo", "Tuusula": "Uusimaa", "Tyrnävä": "Pohjois-Pohjanmaa", "Ulvila": "Satakunta", "Urjala": "Pirkanmaa", "Utajärvi": "Pohjois-Pohjanmaa", "Utsjoki": "Lappi", "Uurainen": "Keski-Suomi", "Uusikaarlepyy": "Pohjanmaa", "Uusikaupunki": "Varsinais-Suomi", "Vaala": "Pohjois-Pohjanmaa", "Vaasa": "Pohjanmaa", "Valkeakoski": "Pirkanmaa", "Vantaa": "Uusimaa", "Varkaus": "Pohjois-Savo", "Vehmaa": "Varsinais-Suomi", "Vesanto": "Pohjois-Savo", "Vesilahti": "Pirkanmaa", "Veteli": "Keski-Pohjanmaa", "Vieremä": "Pohjois-Savo", "Vihti": "Uusimaa", "Viitasaari": "Keski-Suomi", "Vimpeli": "Etelä-Pohjanmaa", "Virolahti": "Kymenlaakso", "Virrat": "Pirkanmaa", "Vårdö": "Ahvenanmaa", "Vöyri": "Pohjanmaa", "Ylitornio": "Lappi", "Ylivieska": "Pohjois-Pohjanmaa", "Ylöjärvi": "Pirkanmaa", "Ypäjä": "Kanta-Häme", "Ähtäri": "Etelä-Pohjanmaa", "Äänekoski": "Keski-Suomi" };
    
    const firebaseConfig = { apiKey: "AIzaSyA1OgSGhgYgmxDLv7-xkPPsUGCpcxFaI8M", authDomain: "geokatkosuunnittelija.firebaseapp.com", databaseURL: "https://geokatkosuunnittelija-default-rtdb.europe-west1.firebasedatabase.app", projectId: "geokatkosuunnittelija", storageBucket: "geokatkosuunnittelija.appspot.com", messagingSenderId: "745498680990", appId: "1:745498680990:web:869074eb0f0b72565ca58f" };
    
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    
    const pgcProfileNameInput = document.getElementById('pgcProfileName');
    const pgcMapCountiesLink = document.getElementById('pgcMapCountiesLink');
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
    const toggleGpxAddBtn = document.getElementById('toggleGpxAddBtn');
    const gpxAddContainer = document.getElementById('gpxAddContainer');
    const selectGpxFileBtn = document.getElementById('selectGpxFileBtn');
    const gpxFileInput = document.getElementById('gpxFileInput');
    const gpxFileName = document.getElementById('gpxFileName');
    const importGpxBtn = document.getElementById('importGpxBtn');
    const logPgcPasteArea = document.getElementById('logPgcPasteArea');
    const logAddFromPgcBtn = document.getElementById('logAddFromPgcBtn');
    const loggerList = document.getElementById('loggerList');
    const newLoggerInput = document.getElementById('newLoggerInput');
    const addLoggerBtn = document.getElementById('addLoggerBtn');
    const editCacheModal = document.getElementById('editCacheModal');
    const editCacheForm = document.getElementById('editCacheForm');
    const modalCancelBtn = document.querySelector('.modal-cancel-btn');
    const editSourceInput = document.getElementById('editSource');
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
    const activeMunicipalityContainer = document.getElementById('activeMunicipalityContainer');
    const logSortControls = document.getElementById('logSortControls');
    const settingsAndHelpContainer = document.getElementById('settingsAndHelpContainer');
    const tripIndexContainer = document.getElementById('tripIndexContainer');
    const tripIndexList = document.getElementById('tripIndexList');
    
    let municipalities = [];
    let foundCaches = [];
    let loggers = [];
    let currentLogSort = 'timestamp';
    let map;
    let userMarker;
    let trackingWatcher = null;
    let lastCheckedMunicipality = null;
    let currentBoundaryLayer = null;
    let municipalityMarkers = [];
    let cacheMarkers = [];
    let clickMarker = null;
    let lastCheckedCoords = null;
    let wakeLock = null;
    // --- UUSI LISÄYS: Tila kuntamerkkien näkyvyydelle ---
    let showMunicipalityMarkers = true; 
    // --- LOPPU ---

    const ALERT_APPROACH_DISTANCE = 1500;
    const ALERT_TARGET_DISTANCE = 200;

    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    const loadStateFromOffline = () => {
        const offlineData = localStorage.getItem(OFFLINE_KEY);
        if (offlineData) {
            console.log("Ladataan data offline-muistista...");
            const data = JSON.parse(offlineData);
            municipalities = data.municipalities || [];
            foundCaches = data.foundCaches || [];
            loggers = data.loggers || [];
            pgcProfileNameInput.value = data.pgcProfileName || '';
            
            render();
            renderLoggers();
            renderFoundList();
        }
    };
    
    const fetchAndDrawBoundary = async (municipalityName) => {
        if (currentBoundaryLayer) {
            map.removeLayer(currentBoundaryLayer);
            currentBoundaryLayer = null;
        }
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(municipalityName)}&format=geojson&polygon_geojson=1&limit=1`);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
                    currentBoundaryLayer = L.geoJSON(feature, {
                        style: {
                            className: 'municipality-boundary'
                        }
                    }).addTo(map);
                }
            }
        } catch (error) {
            console.error(`Virhe haettaessa kunnan ${municipalityName} rajoja:`, error);
        }
    };

    const updatePgcLink = () => {
        const profileName = pgcProfileNameInput.value.trim();
        let href = "#";
        if (profileName && pgcMapCountiesLink) {
            // Myös tässä päivitetään profiilinimen parametri
            href = `https://project-gc.com/Tools/MapCounties?player_prc_profileName=${encodeURIComponent(profileName)}&country=Finland&submit=Filter`;
        }
        pgcMapCountiesLink.href = href;
    };

    const getPGCLinkHtml = (municipalityName, cssClass = 'pgc-link') => {
        if (!municipalityName) return '';

        const pgcProfileName = pgcProfileNameInput.value.trim();
        const officialName = Object.keys(kuntaMaakuntaData).find(key => key.toLowerCase() === municipalityName.toLowerCase());
        const region = officialName ? kuntaMaakuntaData[officialName] : undefined;

        if (region && pgcProfileName && officialName) {
            // Tässä luodaan uudenmallinen URL-osoite
            const pgcUrl = `https://project-gc.com/Tools/MapCompare?player_prc_profileName=${pgcProfileName}&geocache_mc_show[]=found-none&geocache_mc_ownedAsFound=on&geocache_crc_country=Finland&geocache_crc_region=${encodeURIComponent(region)}&geocache_crc_county=${encodeURIComponent(officialName)}&submit=Filter`;
            return `<a href="${pgcUrl}" target="_blank" rel="noopener noreferrer" title="Avaa ${officialName} Project-GC:ssä" class="${cssClass}">🗺️</a>`;
        }
        return '';
    };

    const getCacheTypeClass = (typeName) => {
        if (!typeName) return 'type-default';
        const lowerTypeName = typeName.toLowerCase();

        if (lowerTypeName.includes('traditional')) return 'type-traditional';
        if (lowerTypeName.includes('multi-cache')) return 'type-multi';
        if (lowerTypeName.includes('mystery') || lowerTypeName.includes('unknown')) return 'type-mystery';
        if (lowerTypeName.includes('earthcache')) return 'type-earthcache';
        if (lowerTypeName.includes('letterbox')) return 'type-letterbox';
        if (lowerTypeName.includes('wherigo')) return 'type-wherigo';
        if (lowerTypeName.includes('cito')) return 'type-cito';
        if (lowerTypeName.includes('event') || lowerTypeName.includes('mega') || lowerTypeName.includes('giga')) return 'type-event';
        if (lowerTypeName.includes('virtual')) return 'type-virtual';
        if (lowerTypeName.includes('webcam')) return 'type-webcam';
        if (lowerTypeName.includes('adventure lab')) return 'type-lab';
        
        return 'type-default';
    };

    const getCacheIconPath = (typeName) => {
        let iconUrl = 'icons/unknown.svg'; // UUSI OLETUSIKONI
        if (typeName) {
            const lowerTypeName = typeName.toLowerCase();
            if (lowerTypeName.includes('traditional')) iconUrl = 'icons/tradi.svg';
            else if (lowerTypeName.includes('multi-cache')) iconUrl = 'icons/multi.svg';
            else if (lowerTypeName.includes('mystery') || lowerTypeName.includes('unknown')) iconUrl = 'icons/mysse.svg';
            else if (lowerTypeName.includes('earthcache')) iconUrl = 'icons/earth.svg';
            else if (lowerTypeName.includes('letterbox')) iconUrl = 'icons/letteri.svg';
            else if (lowerTypeName.includes('wherigo')) iconUrl = 'icons/wherigo.svg';
            else if (lowerTypeName.includes('cito')) iconUrl = 'icons/cito.svg';
            else if (lowerTypeName.includes('mega')) iconUrl = 'icons/mega.svg';
            else if (lowerTypeName.includes('event')) iconUrl = 'icons/event.svg';
            else if (lowerTypeName.includes('virtual')) iconUrl = 'icons/virtual.svg';
        }
        return iconUrl;
    };

    const getCacheIcon = (typeName) => {
        const iconUrl = getCacheIconPath(typeName);
        return L.icon({
            iconUrl: iconUrl,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            className: 'cache-marker-icon'
        });
    };
    
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; const φ1 = lat1 * Math.PI / 180; const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180; const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    
    const formatCoordinates = (lat, lon) => {
        if (typeof lat !== 'number' || typeof lon !== 'number') return '';
        const formatPart = (coord, hemiPositive, hemiNegative) => {
            const hemi = coord >= 0 ? hemiPositive : hemiNegative;
            const coordAbs = Math.abs(coord);
            const deg = Math.floor(coordAbs);
            const min = (coordAbs - deg) * 60;
            const minStr = min < 10 ? '0' + min.toFixed(3) : min.toFixed(3);
            return `${hemi} ${deg}° ${minStr}`;
        };
        const latFormatted = formatPart(lat, 'N', 'S');
        const lonFormatted = formatPart(lon, 'E', 'W');
        return `${latFormatted} ${lonFormatted}`;
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
            const pgcLink = getPGCLinkHtml(municipalityName, 'pgc-link-popup');

            const popupContent = `
                <div class="map-popup-content">
                    <b>${municipalityName || 'Tuntematon sijainti'}</b>
                    ${pgcLink}
                </div>`;
            clickMarker.getPopup().setContent(popupContent);

            if (municipalityName) {
                fetchAndDrawBoundary(municipalityName);
            } else {
                if (currentBoundaryLayer) {
                    map.removeLayer(currentBoundaryLayer);
                    currentBoundaryLayer = null;
                }
            }

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
        
        // --- UUSI LISÄYS: Lisätään kartalle nappi, jolla voi piilottaa kuntien nimet ---
        const ToggleMarkersControl = L.Control.extend({
            onAdd: function(map) {
                const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
                btn.innerHTML = 'Piilota kunnat'; // Alkuteksti
                btn.title = 'Näytä/Piilota kuntien nimet kartalla';

                btn.onclick = (e) => {
                    L.DomEvent.stopPropagation(e); // Estää kartan klikkaus-eventin
                    showMunicipalityMarkers = !showMunicipalityMarkers; // Vaihda tilaa
                    btn.innerHTML = showMunicipalityMarkers ? 'Piilota kunnat' : 'Näytä kunnat'; // Päivitä napin teksti
                    updateAllMarkers(); // Päivitä kartan merkit
                };
                return btn;
            },
            onRemove: function(map) { }
        });

        new ToggleMarkersControl({ position: 'topleft' }).addTo(map);
        // --- LOPPU ---

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
        const koordinaatitText = formatCoordinates(data.lat, data.lon);
        locationStatusDisplay.innerHTML = `<p class="status-kunta">${kuntaText}</p><p class="status-koordinaatit">${koordinaatitText}</p>`;
    };

    const updateAllMarkers = () => {
        municipalityMarkers.forEach(marker => marker.removeFrom(map)); municipalityMarkers = [];
        cacheMarkers.forEach(marker => marker.removeFrom(map)); cacheMarkers = [];
        const bounds = [];
        
        // --- MUOKATTU KOHTA: Kuntamerkit piirretään vain jos asetus on päällä ---
        if (showMunicipalityMarkers) {
            municipalities.forEach(mun => {
                if (mun.lat && mun.lon) {
                    const markerIcon = L.divIcon({ className: 'municipality-marker', html: `<span>${mun.name}</span>`, iconSize: 'auto' });
                    const marker = L.marker([mun.lat, mun.lon], { icon: markerIcon }).addTo(map);
                    municipalityMarkers.push(marker);
                    bounds.push([mun.lat, mun.lon]);
                }
            });
        }
        // --- LOPPU ---

        municipalities.forEach(mun => {
            (mun.caches || []).forEach(cache => {
                if (cache.lat && cache.lon) {
                    const cacheIcon = getCacheIcon(cache.type);
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
        if (needsSave) saveState();
    };

    const checkCurrentMunicipality = async (lat, lon) => {
        try {
            const currentMunicipality = await getMunicipalityForCoordinates(lat, lon);
            updateStatusDisplay({ municipality: currentMunicipality || 'Tuntematon sijainti', lat, lon });
            
            if (currentMunicipality && currentMunicipality !== lastCheckedMunicipality) {
                lastCheckedMunicipality = currentMunicipality;
                
                if (currentBoundaryLayer) {
                    map.removeLayer(currentBoundaryLayer);
                    currentBoundaryLayer = null;
                }

                const foundMunIndex = municipalities.findIndex(m => m.name.toLowerCase() === currentMunicipality.toLowerCase());
                
                document.querySelectorAll('.municipality-item.highlight').forEach(el => el.classList.remove('highlight'));
                
                if (foundMunIndex !== -1) {
                    showNotification(`Saavuit kuntaan: ${currentMunicipality}!`, 'info');
                    try { new Audio('new_municipality.mp3').play(); } catch (e) { console.warn("Ei voitu soittaa ääntä new_municipality.mp3"); }
                    
                    const munElement = document.getElementById(`mun-item-${foundMunIndex}`);
                    if (munElement) munElement.classList.add('highlight');
                    
                    activeMunicipalityContainer.innerHTML = munElement.innerHTML;
                    activeMunicipalityContainer.classList.remove('hidden');

                    fetchAndDrawBoundary(currentMunicipality);

                } else {
                    activeMunicipalityContainer.classList.add('hidden');
                    activeMunicipalityContainer.innerHTML = '';
                }
            } else if (!currentMunicipality) {
                lastCheckedMunicipality = null;
                if (currentBoundaryLayer) map.removeLayer(currentBoundaryLayer);
                activeMunicipalityContainer.classList.add('hidden');
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
        if (currentBoundaryLayer) {
            map.removeLayer(currentBoundaryLayer);
            currentBoundaryLayer = null;
        }

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
            activeMunicipalityContainer.classList.add('hidden');
            activeMunicipalityContainer.innerHTML = '';
            settingsAndHelpContainer.classList.remove('hidden');
        } else {
            settingsAndHelpContainer.classList.add('hidden');
            if (!("geolocation" in navigator)) return alert("Selaimesi ei tue paikannusta.");
            await requestWakeLock();
            const CHECK_MUNICipality_INTERVAL_METERS = 500;
            trackingWatcher = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, speed } = position.coords;
                    const speedKmh = speed ? (speed * 3.6).toFixed(1) : '0.0';
                    speedDisplay.textContent = `${speedKmh} km/h`;
                    if (map && userMarker) {
                        userMarker.setLatLng([latitude, longitude]);
                        const newZoom = getZoomLevelForSpeed(parseFloat(speedKmh));
                        if(map.getZoom() !== newZoom) map.setZoom(newZoom);
                        if (!map.getBounds().pad(-0.2).contains(userMarker.getLatLng())) map.panTo([latitude, longitude]);
                        checkCacheProximity(latitude, longitude);
                        if (!lastCheckedCoords || getDistance(lastCheckedCoords.lat, lastCheckedCoords.lon, latitude, longitude) > CHECK_MUNICipality_INTERVAL_METERS) {
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

            const hasCaches = municipality.caches && municipality.caches.length > 0;
            if (municipality.isDone) {
                munItem.classList.add('status-completed');
            } else if (!hasCaches) {
                munItem.classList.add('status-empty');
            }
            
            let cacheHtml = (municipality.caches || []).map((cache, cacheIndex) => {
                const gcCodeLink = cache.gcCode ? `<a href="https://coord.info/${cache.gcCode}" target="_blank" rel="noopener noreferrer">${cache.gcCode}</a>` : '';
                const typeClass = getCacheTypeClass(cache.type);

                const detailsHtml = `
                    <img src="${getCacheIconPath(cache.type)}" class="cache-type-icon-list" alt="${cache.type || ''}">
                    <span class="cache-detail-tag type ${typeClass}">${cache.type || 'Muu'}</span>
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
            const pgcLinkHtml = getPGCLinkHtml(kunnanNimi);

            munItem.innerHTML = `
                <div class="municipality-header">
                    <div class="municipality-header-main">
                        <input type="checkbox" class="municipality-done-checkbox" data-mun-index="${munIndex}" ${municipality.isDone ? 'checked' : ''}>
                        <a class="municipality-name-link" href="https://www.geocache.fi/stat/other/jakauma.php?kuntalista=${encodeURIComponent(kunnanNimi)}" target="_blank" rel="noopener noreferrer">${kunnanNimi}</a>
                    </div>
                    <div class="actions">${pgcLinkHtml}<button class="edit-municipality-btn" title="Muokkaa kunnan nimeä" data-mun-index="${munIndex}">✏️</button><button class="delete-municipality-btn" title="Poista kunta" data-mun-index="${munIndex}">🗑️</button></div>
                </div>
                <ul class="cache-list">${cacheHtml}</ul>
                <div class="add-cache"><input type="text" class="new-cache-name" placeholder="Kätkön nimi tai GC-koodi..."><button class="add-cache-btn" data-mun-index="${munIndex}">+</button></div>`;
            municipalityList.appendChild(munItem);
        });
    };
    
    const renderFoundList = () => {
        foundCachesList.innerHTML = '';
        let sortedCaches = [...foundCaches];

        if (currentLogSort === 'timestamp') {
            sortedCaches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else if (currentLogSort === 'municipality') {
            sortedCaches.sort((a, b) => {
                const munA = a.municipalityName || '';
                const munB = b.municipalityName || '';
                const munCompare = munA.localeCompare(munB);
                if (munCompare !== 0) {
                    return munCompare;
                }
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
        }

        sortedCaches.forEach((cache) => {
            const li = document.createElement('li');
            li.className = 'found-cache-item';
            const date = new Date(cache.timestamp);
            const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} klo ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            const loggersHtml = loggers.map(logger => `<label><input type="checkbox" data-cache-id="${cache.id}" data-logger="${logger}" ${cache.loggers && cache.loggers[logger] ? 'checked' : ''}>${logger}</label>`).join('');
            
            const typeClass = getCacheTypeClass(cache.type);

            const detailsHtml = `
                <img src="${getCacheIconPath(cache.type)}" class="cache-type-icon-list" alt="${cache.type || ''}">
                <span class="cache-detail-tag type ${typeClass}">${cache.type || 'Muu'}</span>
                <span class="cache-detail-tag size">${cache.size || ''}</span>
                <span class="cache-detail-tag dt">D ${cache.difficulty || '?'} / T ${cache.terrain || '?'}</span>
                ${cache.fp ? `<span class="cache-detail-tag fp">${cache.fp}</span>` : ''}
            `;

            const municipalityInfoHtml = cache.municipalityName ? `<div class="municipality-info">Kunnasta: ${cache.municipalityName}</div>` : '';

            li.innerHTML = `
                <div class="found-cache-header">
                    <a href="https://coord.info/${cache.gcCode}" target="_blank" class="found-cache-name">${cache.gcCode ? cache.gcCode + ' - ' : ''}${cache.name}</a>
                    <div class="found-cache-actions">
                        <button class="edit-found-btn" data-cache-id="${cache.id}" title="Muokkaa">✏️</button>
                        <button class="delete-found-btn" data-cache-id="${cache.id}" title="Poista">🗑️</button>
                    </div>
                </div>
                <div class="cache-details">${detailsHtml}</div>
                ${municipalityInfoHtml}
                <div class="timestamp">${formattedDate}</div>
                <div class="loggers">${loggersHtml}</div>
            `;
            foundCachesList.appendChild(li);
        });
    };

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

    const ensureAllCoordsAreFetched = async (munis) => {
        let didChange = false;
        const munisToFetch = munis.filter(mun => !mun.lat || !mun.lon);
        if (munisToFetch.length === 0) return false;

        for (const mun of munisToFetch) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(mun.name + ', Finland')}&format=json&limit=1`);
                const data = await response.json();
                if (data && data.length > 0) {
                    mun.lat = parseFloat(data[0].lat); mun.lon = parseFloat(data[0].lon); didChange = true;
                }
                await delay(1000);
            } catch (error) { console.error("Koordinaattien haku epäonnistui kunnalle:", mun.name, error); }
        }

        if (didChange) {
            console.log("Paikannettiin puuttuvia koordinaatteja, tallennetaan...");
            saveState();
        }
        return didChange;
    };
    
    loadStateFromOffline();
    initMap();

    // LISÄTTY OSUUS: Hae ja näytä kaikki reissulistat, JOS ollaan pääsivulla
    if (!listNameFromUrl) {
        const allListsRef = ref(database, '/'); // Viittaus tietokannan juureen
        onValue(allListsRef, (snapshot) => {
            const allData = snapshot.val();
            if (allData) {
                const listNames = Object.keys(allData);
                
                const filteredNames = listNames
                    .filter(name => name !== 'paalista')
                    .sort((a, b) => a.localeCompare(b));

                if (filteredNames.length > 0) {
                    tripIndexList.innerHTML = filteredNames
                        .map(name => `
                            <li class="trip-index-item">
                                <a href="?lista=${encodeURIComponent(name)}">${name}</a>
                                <div class="actions">
                                    <button class="edit-list-name-btn" data-list-name="${name}" title="Muokkaa nimeä">✏️</button>
                                    <button class="delete-list-btn" data-list-name="${name}" title="Poista lista">🗑️</button>
                                </div>
                            </li>
                        `)
                        .join('');
                    tripIndexContainer.classList.remove('hidden');
                } else {
                    tripIndexContainer.classList.add('hidden');
                }
            }
        });
    }

    // Tämä on ALKUPERÄINEN datan kuuntelija, joka pysyy ennallaan ja toimii kaikilla sivuilla
    onValue(ref(database, FIREBASE_PATH), async (snapshot) => {
        console.log("Haetaan dataa Firebasesta polusta:", FIREBASE_PATH);
        const data = snapshot.val() || {};
        municipalities = data.municipalities || [];
        foundCaches = data.foundCaches || [];

        let needsSaveAfterMigration = false;
        foundCaches.forEach(cache => {
            if (!cache.id) {
                cache.id = Date.now() + Math.random();
                needsSaveAfterMigration = true;
            }
        });
        if (needsSaveAfterMigration) {
            console.log("Vanhoja lokitietoja päivitetty ID-tunnisteilla. Tallennetaan...");
            saveState(); 
        }

        pgcProfileNameInput.value = data.pgcProfileName || '';
        loggers = data.loggers || [];

        render();
        renderLoggers();
        renderFoundList();
        
        await ensureAllCoordsAreFetched(municipalities);
        updateAllMarkers();
    });

    const saveState = () => {
        const dataToSave = {
            municipalities,
            foundCaches,
            loggers,
            pgcProfileName: pgcProfileNameInput.value
        };
        
        localStorage.setItem(OFFLINE_KEY, JSON.stringify(dataToSave));
        return update(ref(database, FIREBASE_PATH), dataToSave);
    };

    const handleBulkAdd = async () => {
        const text = bulkAddInput.value.trim();
        if (!text) return;

        const newNames = text.split(/[\n,]/).map(name => name.trim()).filter(Boolean);
        const uniqueNewNames = newNames.filter(name => 
            !municipalities.some(m => m.name.toLowerCase() === name.toLowerCase())
        );

        if (uniqueNewNames.length === 0) {
            alert("Kaikki syötetyt kunnat ovat jo listalla.");
            return;
        }

        bulkAddBtn.disabled = true;
        let notFound = [];
        let addedCount = 0;

        for (let i = 0; i < uniqueNewNames.length; i++) {
            const name = uniqueNewNames[i];
            bulkAddBtn.textContent = `Haetaan ${i + 1} / ${uniqueNewNames.length}...`;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name + ', Finland')}&format=json&limit=1`);
                const data = await response.json();
                
                if (data && data.length > 0) {
                    municipalities.push({
                        name: name,
                        caches: [],
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon),
                        isDone: false
                    });
                    addedCount++;
                } else {
                    notFound.push(name);
                }
            } catch (error) {
                console.error("Virhe haettaessa kuntaa:", name, error);
                notFound.push(name);
            }
            await delay(1000); 
        }

        if (notFound.length > 0) {
            alert(`Seuraavia kuntia ei löytynyt: ${notFound.join(', ')}`);
        }
        
        bulkAddInput.value = '';
        bulkAddBtn.disabled = false;
        bulkAddBtn.textContent = 'Lisää listasta';

        if (addedCount > 0) {
            saveState();
        }
    };

    toggleBulkAddBtn.addEventListener('click', () => {
        const isHidden = bulkAddContainer.classList.toggle('hidden');
        toggleBulkAddBtn.textContent = isHidden ? 'Lisää kunnat listana' : 'Piilota lisäysalue';
    });

    togglePgcAddBtn.addEventListener('click', () => {
        const isHidden = globalPgcAddContainer.classList.toggle('hidden');
        togglePgcAddBtn.textContent = isHidden ? 'Lisää PGC-datalla' : 'Piilota PGC-lisäys';
    });

    toggleGpxAddBtn.addEventListener('click', () => {
        const isHidden = gpxAddContainer.classList.toggle('hidden');
        toggleGpxAddBtn.textContent = isHidden ? 'Tuo GPX-tiedosto' : 'Piilota GPX-tuonti';
    });

    selectGpxFileBtn.addEventListener('click', () => gpxFileInput.click());

    gpxFileInput.addEventListener('change', () => {
        if (gpxFileInput.files.length > 0) {
            const file = gpxFileInput.files[0];
            gpxFileName.textContent = `Valittu: ${file.name}`;
            importGpxBtn.classList.remove('hidden');
        } else {
            gpxFileName.textContent = '';
            importGpxBtn.classList.add('hidden');
        }
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
                
                if (munIndex === -1) {
                    const newMunicipality = {
                        name: munName,
                        caches: [cacheData],
                        lat: coords.lat,
                        lon: coords.lon,
                        isDone: false,
                        hadCaches: true
                    };
                    municipalities.push(newMunicipality);
                } else { 
                    if (!municipalities[munIndex].caches) {
                        municipalities[munIndex].caches = [];
                    }
                    municipalities[munIndex].caches.push(cacheData);
                    municipalities[munIndex].hadCaches = true;
                }
                cachesAddedCount++;
            } catch (e) { console.error("Lohkon jäsentäminen epäonnistui:", [line1, line2, line3], e); }
        }
        if (cachesAddedCount > 0) {
            saveState();
            globalPgcPasteArea.value = '';
        } else {
             alert("Ei voitu jäsentää kelvollisia kätkötietoja syötetystä tekstistä.");
        }
        globalAddFromPgcBtn.disabled = false; globalAddFromPgcBtn.textContent = "Lisää ja paikanna";
    });

    const handleGpxImport = async () => {
        if (gpxFileInput.files.length === 0) {
            alert("Valitse ensin GPX-tiedosto.");
            return;
        }

        importGpxBtn.disabled = true;
        importGpxBtn.textContent = "Käsitellään...";

        const file = gpxFileInput.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const gpxText = event.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(gpxText, "text/xml");

            const waypoints = xmlDoc.getElementsByTagName('wpt');
            let cachesAddedCount = 0;
            let cachesAlreadyExist = 0;

            for (let i = 0; i < waypoints.length; i++) {
                try {
                    const wpt = waypoints[i];
                    const lat = parseFloat(wpt.getAttribute('lat'));
                    const lon = parseFloat(wpt.getAttribute('lon'));

                    const getElementText = (parent, tagName) => {
                        const element = parent.getElementsByTagName(tagName)[0];
                        return element ? element.textContent.trim() : '';
                    };
                    
                    const groundspeakCache = wpt.getElementsByTagName('groundspeak:cache')[0];
                    if (!groundspeakCache) continue; // Ei ole geokätkö-waypoint

                    const gcCode = getElementText(wpt, 'name');

                    // Tarkista, onko kätkö jo olemassa missään kunnassa
                    const cacheExists = municipalities.some(mun =>
                        mun.caches && mun.caches.some(cache => cache.gcCode === gcCode)
                    );

                    if (cacheExists) {
                        cachesAlreadyExist++;
                        continue;
                    }

                    const cacheName = getElementText(groundspeakCache, 'groundspeak:name');
                    const cacheType = getElementText(groundspeakCache, 'groundspeak:type');
                    const cacheSize = getElementText(groundspeakCache, 'groundspeak:container');
                    const difficulty = getElementText(groundspeakCache, 'groundspeak:difficulty');
                    const terrain = getElementText(groundspeakCache, 'groundspeak:terrain');

                    if (!gcCode || !cacheName || !cacheType || isNaN(lat) || isNaN(lon)) {
                        console.warn("Ohitetaan puutteellinen kätkötieto:", wpt);
                        continue;
                    }
                    
                    const munName = await getMunicipalityForCoordinates(lat, lon);
                    if (!munName) {
                        console.warn(`Ei löytynyt kuntaa kätkölle ${gcCode} koordinaateilla: ${lat}, ${lon}`);
                        continue;
                    }

                    const cacheData = {
                        id: Date.now() + Math.random(),
                        name: cacheName,
                        gcCode: gcCode,
                        fp: '', // GPX-tiedostossa ei ole FP-tietoa
                        type: cacheType,
                        size: cacheSize,
                        difficulty: difficulty,
                        terrain: terrain,
                        lat: lat,
                        lon: lon,
                        alert_approach_given: false,
                        alert_target_given: false
                    };

                    let munIndex = municipalities.findIndex(m => m.name.toLowerCase() === munName.toLowerCase());

                    if (munIndex === -1) {
                        const newMunicipality = {
                            name: munName,
                            caches: [cacheData],
                            lat: lat,
                            lon: lon,
                            isDone: false,
                            hadCaches: true
                        };
                        municipalities.push(newMunicipality);
                    } else {
                        if (!municipalities[munIndex].caches) {
                            municipalities[munIndex].caches = [];
                        }
                        municipalities[munIndex].caches.push(cacheData);
                        municipalities[munIndex].hadCaches = true;
                    }
                    cachesAddedCount++;
                    importGpxBtn.textContent = `Käsitellään... ${i + 1} / ${waypoints.length}`;
                    await delay(50); // Pieni viive estämään UI:n jumiutumista ja API-kutsujen tulvaa
                } catch (e) {
                    console.error("GPX-waypointin jäsentäminen epäonnistui:", e);
                }
            }

            if (cachesAddedCount > 0) {
                saveState();
                alert(`Lisättiin ${cachesAddedCount} uutta kätköä. ${cachesAlreadyExist} kätköä oli jo listalla.`);
            } else {
                alert(`Ei lisätty uusia kätköjä. ${cachesAlreadyExist} kätköä oli jo ennestään listalla.`);
            }

            // Nollaa tila
            gpxFileInput.value = '';
            gpxFileName.textContent = '';
            importGpxBtn.classList.add('hidden');
            importGpxBtn.disabled = false;
            importGpxBtn.textContent = "Tuo kätköt";
        };

        reader.onerror = () => {
            alert("Virhe tiedoston lukemisessa.");
            importGpxBtn.disabled = false;
            importGpxBtn.textContent = "Tuo kätköt";
        };

        reader.readAsText(file);
    };

    importGpxBtn.addEventListener('click', handleGpxImport);

    logAddFromPgcBtn.addEventListener('click', async () => {
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
                
                const munName = await getMunicipalityForCoordinates(coords.lat, coords.lon);

                const loggerCheckboxes = {};
                loggers.forEach(name => { loggerCheckboxes[name] = false; });

                const newFoundCache = { id: Date.now() + Math.random(), name: cacheName, gcCode, fp: fpInfo, type: cacheType, size: cacheSize, difficulty, terrain, lat: coords.lat, lon: coords.lon, timestamp: new Date().toISOString(), loggers: loggerCheckboxes, municipalityName: munName || 'Tuntematon' };
                foundCaches.push(newFoundCache);
                cachesAddedCount++;
            } catch (e) { console.error("Lohkon jäsentäminen epäonnistui:", [line1, line2, line3], e); }
        }
        if (cachesAddedCount > 0) { saveState(); logPgcPasteArea.value = ''; } 
        else { alert("Ei voitu jäsentää kelvollisia kätkötietoja syötetystä tekstistä."); }
        logAddFromPgcBtn.disabled = false; logAddFromPgcBtn.textContent = "Lisää löydetyt lokiin";
    });

    municipalityList.addEventListener('click', (e) => {
        const button = e.target.closest('button, input[type="checkbox"]');
        if (!button) return;
        
        const munIndex = parseInt(button.dataset.munIndex, 10);
        if (isNaN(munIndex)) return;
        
        let needsSave = false;

        if (button.classList.contains('municipality-done-checkbox')) {
            municipalities[munIndex].isDone = button.checked;
            needsSave = true;
        } else if (button.type === 'checkbox') {
            const cacheIndex = parseInt(button.dataset.cacheIndex, 10);
            const munName = municipalities[munIndex].name;
            const [cacheToMove] = municipalities[munIndex].caches.splice(cacheIndex, 1);
            
            const loggerCheckboxes = {};
            loggers.forEach(name => { loggerCheckboxes[name] = false; });
            
            const newFoundCache = { ...cacheToMove, municipalityName: munName, timestamp: new Date().toISOString(), loggers: loggerCheckboxes };
            foundCaches.push(newFoundCache);
            needsSave = true;
        } else {
            const cacheIndex = parseInt(button.dataset.cacheIndex, 10);
            if (button.classList.contains('edit-cache-btn')) {
                const cache = municipalities[munIndex].caches[cacheIndex];
                editSourceInput.value = 'trip';
                editMunIndexInput.value = munIndex;
                editCacheIndexInput.value = cacheIndex;
                editGcCodeInput.value = cache.gcCode || '';
                editNameInput.value = cache.name || '';
                editTypeInput.value = cache.type || '';
                editSizeInput.value = cache.size || '';
                editDifficultyInput.value = cache.difficulty || '';
                editTerrainInput.value = cache.terrain || '';
                editFpInput.value = cache.fp || '';
                editCoordsInput.value = formatCoordinates(cache.lat, cache.lon);
                editCacheModal.classList.remove('hidden');
            } else if (button.classList.contains('set-coords-btn')) {
                const cache = municipalities[munIndex].caches[cacheIndex];
                const currentCoords = cache.lat ? `${cache.lat.toFixed(6)} ${cache.lon.toFixed(6)}` : '';
                const input = prompt(`Syötä kätkön "${cache.name}" koordinaatit:`, currentCoords);
                if(input !== null) {
                    const coords = parseCoordinates(input);
                    if(coords) { cache.lat = coords.lat; cache.lon = coords.lon; } 
                    else if (input.trim() === '') { delete cache.lat; delete cache.lon; } 
                    else { alert("Virheellinen koordinaattimuoto.\nEsimerkki: N 60 58.794 E 26 11.341"); }
                    needsSave = true;
                }
            } else if (button.classList.contains('edit-municipality-btn')) {
                const oldName = municipalities[munIndex].name;
                const newName = prompt("Muokkaa kunnan nimeä:", oldName);
                if (newName && newName.trim() && newName.trim().toLowerCase() !== oldName.toLowerCase()) {
                    municipalities[munIndex].name = newName.trim();
                    delete municipalities[munIndex].lat; delete municipalities[munIndex].lon;
                    ensureAllCoordsAreFetched(municipalities);
                }
            } else if (button.classList.contains('delete-municipality-btn')) {
                if (confirm(`Haluatko poistaa kunnan "${municipalities[munIndex].name}"?`)) {
                    municipalities.splice(munIndex, 1);
                    needsSave = true;
                }
            } else if (button.classList.contains('add-cache-btn')) {
                const container = button.closest('.add-cache');
                const nameInput = container.querySelector('.new-cache-name');
                if (nameInput.value.trim()) {
                    if (!municipalities[munIndex].caches) municipalities[munIndex].caches = [];
                    const name = nameInput.value.trim();
                    const gcCodeMatch = name.match(/(GC[A-Z0-9]+)/i);
                    municipalities[munIndex].caches.push({ id: Date.now() + Math.random(), name: gcCodeMatch ? name.replace(gcCodeMatch[0], '').trim() : name, gcCode: gcCodeMatch ? gcCodeMatch[0].toUpperCase() : '', type: 'Muu' });
                    municipalities[munIndex].hadCaches = true;
                    nameInput.value = '';
                    needsSave = true;
                }
            } else if (button.classList.contains('delete-cache-btn')) {
                if (confirm(`Poistetaanko kätkö "${municipalities[munIndex].caches[cacheIndex].name}"?`)) {
                    municipalities[munIndex].caches.splice(cacheIndex, 1);
                    needsSave = true;
                }
            }
        }
        
        if (needsSave) saveState();
    });

    editCacheForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const source = editSourceInput.value;
        let cache;

        if (source === 'trip') {
            const munIndex = parseInt(editMunIndexInput.value, 10);
            const cacheIndex = parseInt(editCacheIndexInput.value, 10);
            if (isNaN(munIndex) || isNaN(cacheIndex)) return;
            cache = municipalities[munIndex].caches[cacheIndex];
        } else if (source === 'log') {
            const cacheId = parseFloat(editCacheIndexInput.value);
            if (isNaN(cacheId)) return;
            cache = foundCaches.find(c => c.id === cacheId);
        }

        if (cache) {
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
            } else if (editCoordsInput.value.trim() === '') { 
                delete cache.lat; 
                delete cache.lon; 
            }
            saveState();
            editCacheModal.classList.add('hidden');
        }
    });

    modalCancelBtn.addEventListener('click', () => editCacheModal.classList.add('hidden'));
    editCacheModal.addEventListener('click', (e) => { if (e.target === editCacheModal) editCacheModal.classList.add('hidden'); });

    directAddBtn.addEventListener('click', async () => {
        const input = directAddInput.value.trim(); if (!input) return;
        const gcCodeMatch = input.match(/(GC[A-Z0-9]+)/i);
        let munName = 'Tuntematon';

        const coords = parseCoordinates(input);
        if (coords) {
            munName = await getMunicipalityForCoordinates(coords.lat, coords.lon) || 'Tuntematon';
        }

        const name = gcCodeMatch ? input.replace(gcCodeMatch[0], '').trim() : input;
        const gcCode = gcCodeMatch ? gcCodeMatch[0].toUpperCase() : '';
        
        const loggerCheckboxes = {};
        loggers.forEach(l => { loggerCheckboxes[l] = false; });
        
        foundCaches.push({ id: Date.now() + Math.random(), name, gcCode, timestamp: new Date().toISOString(), loggers: loggerCheckboxes, type: 'Muu', municipalityName: munName });
        saveState();
        directAddInput.value = '';
    });

    foundCachesList.addEventListener('click', (e) => {
        const target = e.target;
        const cacheId = parseFloat(target.closest('[data-cache-id]')?.dataset.cacheId);
        if (isNaN(cacheId)) return;
        
        const cache = foundCaches.find(c => c.id === cacheId);
        if (!cache) return;
        
        if (target.type === 'checkbox') {
            if (!cache.loggers) cache.loggers = {};
            const loggerName = target.dataset.logger;
            cache.loggers[loggerName] = target.checked;
            saveState();
        } else if (target.classList.contains('edit-found-btn')) {
            editSourceInput.value = 'log';
            editCacheIndexInput.value = cache.id;
            editMunIndexInput.value = '';
            
            editGcCodeInput.value = cache.gcCode || '';
            editNameInput.value = cache.name || '';
            editTypeInput.value = cache.type || '';
            editSizeInput.value = cache.size || '';
            editDifficultyInput.value = cache.difficulty || '';
            editTerrainInput.value = cache.terrain || '';
            editFpInput.value = cache.fp || '';
            editCoordsInput.value = formatCoordinates(cache.lat, cache.lon);
            
            editCacheModal.classList.add('hidden');
        } else if (target.classList.contains('delete-found-btn')) {
            if (confirm(`Haluatko varmasti poistaa lokista kätkön "${cache.name}"?`)) {
                const cacheIndex = foundCaches.findIndex(c => c.id === cacheId);
                if(cacheIndex > -1) {
                    foundCaches.splice(cacheIndex, 1);
                    saveState();
                }
            }
        }
    });

    addLoggerBtn.addEventListener('click', () => {
        const newName = newLoggerInput.value.trim();
        if (newName && !loggers.find(l => l.toLowerCase() === newName.toLowerCase())) {
            const newLoggers = [...loggers, newName];
            
            const updates = {};
            updates[`${FIREBASE_PATH}/loggers`] = newLoggers;
            update(ref(database), updates)
                .then(() => {
                    console.log("Lokittajat tallennettu onnistuneesti!");
                    newLoggerInput.value = '';
                })
                .catch((error) => {
                    console.error("Virhe tallennettaessa lokittajia:", error);
                    alert("Lokittajien tallennus epäonnistui! Tarkista konsoli.");
                });
        }
    });

    loggerList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-logger-btn')) {
            const nameToDelete = e.target.dataset.loggerName;
            const newLoggers = loggers.filter(l => l !== nameToDelete);

            const updates = {};
            updates[`${FIREBASE_PATH}/loggers`] = newLoggers;
            update(ref(database), updates)
                .then(() => {
                    console.log("Lokittaja poistettu onnistuneesti!");
                })
                .catch((error) => {
                    console.error("Virhe poistettaessa lokittajaa:", error);
                    alert("Lokittajan poisto epäonnistui! Tarkista konsoli.");
                });
        }
    });

    tripIndexList.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const oldListName = button.dataset.listName;

        if (button.classList.contains('delete-list-btn')) {
            if (confirm(`Haluatko varmasti poistaa reissulistan "${oldListName}"?\nTätä toimintoa ei voi perua.`)) {
                try {
                    await remove(ref(database, oldListName));
                    alert(`Lista "${oldListName}" poistettu.`);
                } catch (error) {
                    console.error("Virhe listan poistossa:", error);
                    alert("Listan poisto epäonnistui.");
                }
            }
        } else if (button.classList.contains('edit-list-name-btn')) {
            const newListName = prompt("Anna uusi nimi reissulistalle:", oldListName);
            if (newListName && newListName.trim() && newListName.trim() !== oldListName) {
                const oldListRef = ref(database, oldListName);
                const newListRef = ref(database, newListName.trim());

                try {
                    const snapshot = await get(oldListRef);
                    if (snapshot.exists()) {
                        await set(newListRef, snapshot.val());
                        await remove(oldListRef);
                        alert(`Lista "${oldListName}" on nyt nimetty uudelleen: "${newListName.trim()}"`);
                    }
                } catch (error) {
                    console.error("Virhe listan nimen muokkauksessa:", error);
                    alert("Nimen muokkaus epäonnistui.");
                }
            }
        }
    });

    showTripListBtn.addEventListener('click', () => {
        tripListView.classList.remove('hidden');
        foundLogView.classList.add('hidden');
        showTripListBtn.classList.add('active');
        showFoundLogBtn.classList.remove('active');
    });
    showFoundLogBtn.addEventListener('click', () => {
        tripListView.classList.add('hidden');
        foundLogView.classList.remove('hidden');
        showTripListBtn.classList.remove('active');
        showFoundLogBtn.classList.add('active');
    });

    updatePgcLink();
    pgcProfileNameInput.addEventListener('input', updatePgcLink);
    pgcProfileNameInput.addEventListener('change', saveState);
    toggleTrackingBtn.addEventListener('click', toggleTracking);
    
    logSortControls.addEventListener('click', (e) => {
        const target = e.target.closest('.sort-btn');
        if (!target) return;

        const sortBy = target.dataset.sort;
        if (sortBy === currentLogSort) return;

        currentLogSort = sortBy;

        logSortControls.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        target.classList.add('active');

        renderFoundList();
    });

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
                saveState();
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
