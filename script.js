import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// --- ASETUKSET ---
const FIREBASE_PATH = 'paalista';
const LOGGERS = ["Toni", "Jukka", "Riikka", "Vesa"];
// --- ASETUKSET PÄÄTTYVÄT ---

document.addEventListener('DOMContentLoaded', () => {
    // Kuntadata pysyy ennallaan...
    const kuntaMaakuntaData = { "Akaa": "Pirkanmaa", "Alajärvi": "Etelä-Pohjanmaa", "Alavieska": "Pohjois-Pohjanmaa", "Alavus": "Etelä-Pohjanmaa", "Asikkala": "Päijät-Häme", "Askola": "Uusimaa", "Aura": "Varsinais-Suomi", "Brändö": "Ahvenanmaa", "Eckerö": "Ahvenanmaa", "Enonkoski": "Etelä-Savo", "Enontekiö": "Lappi", "Espoo": "Uusimaa", "Eura": "Satakunta", "Eurajoki": "Satakunta", "Evijärvi": "Etelä-Pohjanmaa", "Finström": "Ahvenanmaa", "Forssa": "Kanta-Häme", "Föglö": "Ahvenanmaa", "Geta": "Ahvenanmaa", "Haapajärvi": "Pohjois-Pohjanmaa", "Haapavesi": "Pohjois-Pohjanmaa", "Hailuoto": "Pohjois-Pohjanmaa", "Halsua": "Keski-Pohjanmaa", "Hamina": "Kymenlaakso", "Hammarland": "Ahvenanmaa", "Hankasalmi": "Keski-Suomi", "Hanko": "Uusimaa", "Harjavalta": "Satakunta", "Hartola": "Päijät-Häme", "Hattula": "Kanta-Häme", "Hausjärvi": "Kanta-Häme", "Heinola": "Päijät-Häme", "Heinävesi": "Pohjois-Karjala", "Helsinki": "Uusimaa", "Hirvensalmi": "Etelä-Savo", "Hollola": "Päijät-Häme", "Huittinen": "Satakunta", "Humppila": "Kanta-Häme", "Hyrynsalmi": "Kainuu", "Hyvinkää": "Uusimaa", "Hämeenkyrö": "Pirkanmaa", "Hämeenlinna": "Kanta-Häme", "Ii": "Pohjois-Pohjanmaa", "Iisalmi": "Pohjois-Savo", "Iitti": "Päijät-Häme", "Ikaalinen": "Pirkanmaa", "Ilmajoki": "Etelä-Pohjanmaa", "Ilomantsi": "Pohjois-Karjala", "Imatra": "Etelä-Karjala", "Inari": "Lappi", "Inkoo": "Uusimaa", "Isojoki": "Etelä-Pohjanmaa", "Isokyrö": "Etelä-Pohjanmaa", "Janakkala": "Kanta-Häme", "Joensuu": "Pohjois-Karjala", "Jokioinen": "Kanta-Häme", "Jomala": "Ahvenanmaa", "Joroinen": "Pohjois-Savo", "Joutsa": "Keski-Suomi", "Juuka": "Pohjois-Karjala", "Juupajoki": "Pirkanmaa", "Juva": "Etelä-Savo", "Jyväskylä": "Keski-Suomi", "Jämijärvi": "Satakunta", "Jämsä": "Keski-Suomi", "Järvenpää": "Uusimaa", "Kaarina": "Varsinais-Suomi", "Kaavi": "Pohjois-Savo", "Kajaani": "Kainuu", "Kalajoki": "Pohjois-Pohjanmaa", "Kangasala": "Pirkanmaa", "Kangasniemi": "Etelä-Savo", "Kankaanpää": "Satakunta", "Kannonkoski": "Keski-Suomi", "Kannus": "Keski-Pohjanmaa", "Karijoki": "Etelä-Pohjanmaa", "Karkkila": "Uusimaa", "Karstula": "Keski-Suomi", "Karvia": "Satakunta", "Kaskinen": "Pohjanmaa", "Kauhajoki": "Etelä-Pohjanmaa", "Kauhava": "Etelä-Pohjanmaa", "Kauniainen": "Uusimaa", "Kaustinen": "Keski-Pohjanmaa", "Keitele": "Pohjois-Savo", "Kemi": "Lappi", "Kemijärvi": "Lappi", "Keminmaa": "Lappi", "Kemiönsaari": "Varsinais-Suomi", "Kempele": "Pohjois-Pohjanmaa", "Kerava": "Uusimaa", "Keuruu": "Keski-Suomi", "Kihniö": "Pirkanmaa", "Kinnula": "Keski-Suomi", "Kirkkonummi": "Uusimaa", "Kitee": "Pohjois-Karjala", "Kittilä": "Lappi", "Kiuruvesi": "Pohjois-Savo", "Kivijärvi": "Keski-Suomi", "Kokemäki": "Satakunta", "Kokkola": "Keski-Pohjanmaa", "Kolar": "Lappi", "Konnevesi": "Keski-Suomi", "Kontiolahti": "Pohjois-Karjala", "Korsnäs": "Pohjanmaa", "Koski Tl": "Varsinais-Suomi", "Kotka": "Kymenlaakso", "Kouvola": "Kymenlaakso", "Kristiinankaupunki": "Pohjanmaa", "Kruunupyy": "Pohjanmaa", "Kuhmo": "Kainuu", "Kuhmoinen": "Pirkanmaa", "Kumlinge": "Ahvenanmaa", "Kuopio": "Pohjois-Savo", "Kuortane": "Etelä-Pohjanmaa", "Kurikka": "Etelä-Pohjanmaa", "Kustavi": "Varsinais-Suomi", "Kuusamo": "Pohjois-Pohjanmaa", "Kyyjärvi": "Keski-Suomi", "Kärkölä": "Päijät-Häme", "Kärsämäki": "Pohjois-Pohjanmaa", "Kökar": "Ahvenanmaa", "Lahti": "Päijät-Häme", "Laihia": "Pohjanmaa", "Laitila": "Varsinais-Suomi", "Lapinjärvi": "Uusimaa", "Lapinlahti": "Pohjois-Savo", "Lappajärvi": "Etelä-Pohjanmaa", "Lappeenranta": "Etelä-Karjala", "Lapua": "Etelä-Pohjanmaa", "Laukaa": "Keski-Suomi", "Lemi": "Etelä-Karjala", "Lemland": "Ahvenanmaa", "Lempäälä": "Pirkanmaa", "Leppävirta": "Pohjois-Savo", "Lestijärvi": "Keski-Pohjanmaa", "Lieksa": "Pohjois-Karjala", "Lieto": "Varsinais-Suomi", "Liminka": "Pohjois-Pohjanmaa", "Liperi": "Pohjois-Karjala", "Lohja": "Uusimaa", "Loimaa": "Varsinais-Suomi", "Loppi": "Kanta-Häme", "Loviisa": "Uusimaa", "Luhanka": "Keski-Suomi", "Lumijoki": "Pohjois-Pohjanmaa", "Lumparland": "Ahvenanmaa", "Luoto": "Pohjanmaa", "Luumäki": "Etelä-Karjala", "Maalahti": "Pohjanmaa", "Maarianhamina": "Ahvenanmaa", "Marttila": "Varsinais-Suomi", "Masku": "Varsinais-Suomi", "Merijärvi": "Pohjois-Pohjanmaa", "Merikarvia": "Satakunta", "Miehikkälä": "Kymenlaakso", "Mikkeli": "Etelä-Savo", "Muhos": "Pohjois-Pohjanmaa", "Multia": "Keski-Suomi", "Muonio": "Lappi", "Mustasaari": "Pohjanmaa", "Muurame": "Keski-Suomi", "Mynämäki": "Varsinais-Suomi", "Myrskylä": "Uusimaa", "Mäntsälä": "Uusimaa", "Mänttä-Vilppula": "Pirkanmaa", "Mäntyharju": "Etelä-Savo", "Naantali": "Varsinais-Suomi", "Nakkila": "Satakunta", "Nivala": "Pohjois-Pohjanmaa", "Nokia": "Pirkanmaa", "Nousiainen": "Varsinais-Suomi", "Nurmes": "Pohjois-Karjala", "Nurmijärvi": "Uusimaa", "Närpiö": "Pohjanmaa", "Orimattila": "Päijät-Häme", "Oripää": "Varsinais-Suomi", "Orivesi": "Pirkanmaa", "Oulainen": "Pohjois-Pohjanmaa", "Oulu": "Pohjois-Pohjanmaa", "Outokumpu": "Pohjois-Karjala", "Padasjoki": "Päijät-Häme", "Paimio": "Varsinais-Suomi", "Paltamo": "Kainuu", "Parainen": "Varsinais-Suomi", "Parikkala": "Etelä-Karjala", "Parkano": "Pirkanmaa", "Pedersören kunta": "Pohjanmaa", "Pelkosenniemi": "Lappi", "Pello": "Lappi", "Perho": "Keski-Pohjanmaa", "Pertunmaa": "Etelä-Savo", "Petäjävesi": "Keski-Suomi", "Pieksämäki": "Etelä-Savo", "Pielavesi": "Pohjois-Savo", "Pietarsaari": "Pohjanmaa", "Pihtipudas": "Keski-Suomi", "Pirkkala": "Pirkanmaa", "Polvijärvi": "Pohjois-Karjala", "Pomarkku": "Satakunta", "Pori": "Satakunta", "Pornainen": "Uusimaa", "Porvoo": "Uusimaa", "Posio": "Lappi", "Pudasjärvi": "Pohjois-Pohjanmaa", "Pukkila": "Uusimaa", "Punkalaidun": "Pirkanmaa", "Puolanka": "Kainuu", "Puumala": "Etelä-Savo", "Pyhtää": "Kymenlaakso", "Pyhäjoki": "Pohjois-Pohjanmaa", "Pyhäjärvi": "Pohjois-Pohjanmaa", "Pyhäntä": "Pohjois-Pohjanmaa", "Pyhäranta": "Varsinais-Suomi", "Pälkäne": "Pirkanmaa", "Pöytyä": "Varsinais-Suomi", "Raahe": "Pohjois-Pohjanmaa", "Raasepori": "Uusimaa", "Raisio": "Varsinais-Suomi", "Rantasalmi": "Etelä-Savo", "Ranua": "Lappi", "Rauma": "Satakunta", "Rautalampi": "Pohjois-Savo", "Rautavaara": "Pohjois-Savo", "Rautjärvi": "Etelä-Karjala", "Reisjärvi": "Pohjois-Pohjanmaa", "Riihimäki": "Kanta-Häme", "Ristijärvi": "Kainuu", "Rovaniemi": "Lappi", "Ruokolahti": "Etelä-Karjala", "Ruovesi": "Pirkanmaa", "Rusko": "Varsinais-Suomi", "Rääkkylä": "Pohjois-Karjala", "Saarijärvi": "Keski-Suomi", "Salla": "Lappi", "Salo": "Varsinais-Suomi", "Saltvik": "Ahvenanmaa", "Sastamala": "Pirkanmaa", "Sauvo": "Varsinais-Suomi", "Savitaipale": "Etelä-Karjala", "Savonlinna": "Etelä-Savo", "Savukoski": "Lappi", "Seinäjoki": "Etelä-Pohjanmaa", "Sievi": "Pohjois-Pohjanmaa", "Siikainen": "Satakunta", "Siikajoki": "Pohjois-Pohjanmaa", "Siilinjärvi": "Pohjois-Savo", "Simo": "Lappi", "Sipoo": "Uusimaa", "Siuntio": "Uusimaa", "Sodankylä": "Lappi", "Soini": "Etelä-Pohjanmaa", "Somero": "Varsinais-Suomi", "Sonkajärvi": "Pohjois-Savo", "Sotkamo": "Kainuu", "Sottunga": "Ahvenanmaa", "Sulkava": "Etelä-Savo", "Sund": "Ahvenanmaa", "Suomussalmi": "Kainuu", "Suonenjoki": "Pohjois-Savo", "Sysmä": "Päijät-Häme", "Säkylä": "Satakunta", "Taipalsaari": "Etelä-Karjala", "Taivalkoski": "Pohjois-Pohjanmaa", "Taivassalo": "Varsinais-Suomi", "Tammela": "Kanta-Häme", "Tampere": "Pirkanmaa", "Tervo": "Pohjois-Savo", "Tervola": "Lappi", "Teuva": "Etelä-Pohjanmaa", "Tohmajärvi": "Pohjois-Karjala", "Toholampi": "Keski-Pohjanmaa", "Toivakka": "Keski-Suomi", "Tornio": "Lappi", "Turku": "Varsinais-Suomi", "Tuusniemi": "Pohjois-Savo", "Tuusula": "Uusimaa", "Tyrnävä": "Pohjois-Pohjanmaa", "Ulvila": "Satakunta", "Urjala": "Pirkanmaa", "Utajärvi": "Pohjois-Pohjanmaa", "Utsjoki": "Lappi", "Uurainen": "Keski-Suomi", "Uusikaarlepyy": "Pohjanmaa", "Uusikaupunki": "Varsinais-Suomi", "Vaala": "Pohjois-Pohjanmaa", "Vaasa": "Pohjanmaa", "Valkeakoski": "Pirkanmaa", "Vantaa": "Uusimaa", "Varkaus": "Pohjois-Savo", "Vehmaa": "Varsinais-Suomi", "Vesanto": "Pohjois-Savo", "Vesilahti": "Pirkanmaa", "Veteli": "Keski-Pohjanmaa", "Vieremä": "Pohjois-Savo", "Vihti": "Uusimaa", "Viitasaari": "Keski-Suomi", "Vimpeli": "Etelä-Pohjanmaa", "Virolahti": "Kymenlaakso", "Virrat": "Pirkanmaa", "Vårdö": "Ahvenanmaa", "Vöyri": "Pohjanmaa", "Ylitornio": "Lappi", "Ylivieska": "Pohjois-Pohjanmaa", "Ylöjärvi": "Pirkanmaa", "Ypäjä": "Kanta-Häme", "Ähtäri": "Etelä-Pohjanmaa", "Äänekoski": "Keski-Suomi" };
    
    const firebaseConfig = { apiKey: "AIzaSyA1OgSGhgYgmxDLv7-xkPPsUGCpcxFaI8M", authDomain: "geokatkosuunnittelija.firebaseapp.com", databaseURL: "https://geokatkosuunnittelija-default-rtdb.europe-west1.firebasedatabase.app", projectId: "geokatkosuunnittelija", storageBucket: "geokatkosuunnittelija.appspot.com", messagingSenderId: "745498680990", appId: "1:745498680990:web:869074eb0f0b72565ca58f" };

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    const pgcProfileNameInput = document.getElementById('pgcProfileName');
    const municipalityList = document.getElementById('municipalityList');
    const cacheTypeSelectorTemplate = document.getElementById('cacheTypeSelector');
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
    const pgcInput = document.getElementById('pgcInput');
    const addFromPgcBtn = document.getElementById('addFromPgcBtn');


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
        const nameCandidates = [address.municipality, address.city, address.town, address.village];
        return nameCandidates.find(name => name && !name.toLowerCase().includes('seutukunta')) || null;
    };
    const formatCoordinatesToDDM = (lat, lon) => {
        const latHemi = lat >= 0 ? 'N' : 'S';
        const lonHemi = lon >= 0 ? 'E' : 'W';
        const formatPart = (val, hemi) => {
            const absVal = Math.abs(val);
            const deg = Math.floor(absVal);
            const min = ((absVal - deg) * 60).toFixed(3);
            return `${hemi} ${deg}° ${min.padStart(6, '0')}'`;
        };
        return `${formatPart(lat, latHemi)} ${formatPart(lon, lonHemi)}`;
    };
    const unlockAudio = () => {
        const sound = new Audio("data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzU0UFRNRAAAACgAAAZwYWdlIChNaWNyb2xhYiBBRDIpAAAAAOutlAJsAQAAAAgAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-");
        sound.volume = 0;
        sound.play().catch(e => console.warn("Audio unlock failed."));
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
        const koordinaatitText = formatCoordinatesToDDM(data.lat, data.lon);
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
                        try { new Audio('approach.mp3').play(); } catch (e) { console.warn("Ei voitu soittaa ääntä: approach.mp3", e); }
                        cache.alert_approach_given = true; needsSave = true;
                    }
                    if (distance <= ALERT_TARGET_DISTANCE && !cache.alert_target_given) {
                        showNotification(`Olet lähellä kätköä: ${cache.name} (${Math.round(distance)}m)`, 'target');
                        try { new Audio('target.mp3').play(); } catch (e) { console.warn("Ei voitu soittaa ääntä: target.mp3", e); }
                        cache.alert_target_given = true; needsSave = true;
                    }
                }
            });
        });
        if (needsSave) saveMunicipalities();
    };

    const checkCurrentMunicipality = async (lat, lon) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`);
            if (!response.ok) return;
            const data = await response.json();
            const currentMunicipality = getMunicipalityFromResponse(data) || 'Tuntematon sijainti';
            updateStatusDisplay({ municipality: currentMunicipality, lat, lon });
            if (currentMunicipality && currentMunicipality !== lastCheckedMunicipality) {
                lastCheckedMunicipality = currentMunicipality;
                const foundMunIndex = municipalities.findIndex(m => m.name.toLowerCase() === currentMunicipality.toLowerCase());
                document.querySelectorAll('.municipality-item.highlight').forEach(el => el.classList.remove('highlight'));
                if (foundMunIndex !== -1) {
                    showNotification(`Saavuit kuntaan: ${currentMunicipality}!`, 'info');
                    try { new Audio('kunta.mp3').play(); } catch(e) { console.warn("Ei voitu soittaa ääntä: kunta.mp3", e); }
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
            speedDisplay.textContent = '--,- km/h';
            lastCheckedMunicipality = null;
            updateStatusDisplay(null);
            updateAllMarkers();
        } else {
            if (!("geolocation" in navigator)) return alert("Selaimesi ei tue paikannusta.");
            unlockAudio();
            await requestWakeLock();
            const CHECK_MUNICIPALITY_INTERVAL_METERS = 500;
            trackingWatcher = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, speed } = position.coords;
                    const speedKmh = speed ? (speed * 3.6) : 0;
                    speedDisplay.textContent = `${speedKmh.toFixed(1)} km/h`;
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
                const cacheName = cache.name.trim();
                let cacheNameDisplay;
                if (cacheName.toUpperCase().startsWith('GC')) {
                    const spaceIndex = cacheName.indexOf(' ');
                    const gcCode = spaceIndex === -1 ? cacheName : cacheName.substring(0, spaceIndex);
                    const description = spaceIndex === -1 ? '' : cacheName.substring(spaceIndex);
                    cacheNameDisplay = `<a href="https://coord.info/${gcCode}" target="_blank" rel="noopener noreferrer">${gcCode}</a>${description}`;
                } else { cacheNameDisplay = cacheName; }
                const coordsSetClass = (cache.lat && cache.lon) ? 'coords-set' : '';
                return `<li class="cache-item"><input type="checkbox" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}"><div class="cache-info"><div><span class="cache-type">${cache.type}</span><span>${cacheNameDisplay}</span></div></div><div class="cache-actions"><button class="set-coords-btn ${coordsSetClass}" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">📍</button><button class="edit-cache-btn" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">✏️</button><button class="delete-cache-btn" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">🗑️</button></div></li>`;
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
            munItem.innerHTML = `<div class="municipality-header"><a class="municipality-name-link" href="https://www.geocache.fi/stat/other/jakauma.php?kuntalista=${encodeURIComponent(kunnanNimi)}" target="_blank" rel="noopener noreferrer">${kunnanNimi}</a><div class="actions">${pgcLinkHtml}<button class="edit-municipality-btn" title="Muokkaa kunnan nimeä" data-mun-index="${munIndex}">✏️</button><button class="delete-municipality-btn" title="Poista kunta" data-mun-index="${munIndex}">🗑️</button></div></div><ul class="cache-list">${cacheHtml}</ul>`;
            municipalityList.appendChild(munItem);
        });
    };
    
    const renderFoundList = () => {
        foundCachesList.innerHTML = '';
        const sortedCaches = [...foundCaches].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        sortedCaches.forEach((cache) => {
            const li = document.createElement('li');
            li.className = 'found-cache-item';
            li.dataset.cacheId = cache.id; // Lisätään data-attribuutti
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

    addFromPgcBtn.addEventListener('click', async () => {
        const text = pgcInput.value;
        const lines = text.split('\n').filter(line => line.trim().startsWith('GC'));
        if (lines.length === 0) return alert("Syötteestä ei löytynyt GC-alkuisia rivejä.");

        addFromPgcBtn.disabled = true;
        addFromPgcBtn.textContent = 'Lisätään...';

        for (const line of lines) {
            const gcCodeMatch = line.match(/^(GC[A-Z0-9]+)/);
            if (!gcCodeMatch) continue;

            const coordsStringMatch = line.match(/(N\s+.*)$/);
            if (!coordsStringMatch) continue;

            const coords = parseCoordinates(coordsStringMatch[0]);
            if (!coords) continue;
            
            const DTRatingMatch = line.match(/(\d\.\d)\s*\/\s*(\d\.\d)/);
            const typeMatch = line.match(/(Traditional|Unknown|Multi|Letterbox|Event|Wherigo)/i);
            const sizeMatch = line.match(/\/(Micro|Small|Regular|Large|Other|Not Chosen)\//i);
            const namePart = line.substring(gcCodeMatch[0].length, line.indexOf(typeMatch ? typeMatch[0] : (DTRatingMatch ? DTRatingMatch[0] : ''))).replace(/-\s*.*FP.*/, '').replace(/-/g, ' ').trim();

            const newCache = {
                id: Date.now() + Math.random(),
                name: `${gcCodeMatch[0]} ${namePart}`,
                type: typeMatch ? typeMatch[0].replace(' Cache', '') : 'Muu',
                size: sizeMatch ? sizeMatch[1] : '',
                difficulty: DTRatingMatch ? DTRatingMatch[1] : '',
                terrain: DTRatingMatch ? DTRatingMatch[2] : '',
                lat: coords.lat,
                lon: coords.lon,
            };
            
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lon}&zoom=10`);
            const data = await response.json();
            const munName = getMunicipalityFromResponse(data) || "Tuntematon";
            
            let mun = municipalities.find(m => m.name.toLowerCase() === munName.toLowerCase());
            if (!mun) {
                mun = { name: munName, caches: [] };
                municipalities.push(mun);
            }
            if (!mun.caches) mun.caches = [];
            
            if (!mun.caches.some(c => c.name.startsWith(newCache.name.split(' ')[0]))) {
                 mun.caches.push(newCache);
            }
        }
        await ensureAllCoordsAreFetched(municipalities);
        saveMunicipalities();
        pgcInput.value = '';
        addFromPgcBtn.disabled = false;
        addFromPgcBtn.textContent = 'Lisää kätköt reissulistalle';
    });

    municipalityList.addEventListener('click', (e) => {
        const button = e.target.closest('button, input[type="checkbox"]');
        if (!button) return;
        const munIndex = parseInt(button.dataset.munIndex, 10);
        if (isNaN(munIndex)) return;
        
        // KORJATTU: Varmistetaan, että UI päivittyy aina oikein
        let needsImmediateRender = false;

        if (button.type === 'checkbox') {
            const cacheIndex = parseInt(button.dataset.cacheIndex, 10);
            const cacheToMove = municipalities[munIndex].caches[cacheIndex];
            const loggers = {};
            LOGGERS.forEach(name => { loggers[name] = false; });
            const gcCodeMatch = cacheToMove.name.match(/(GC[A-Z0-9]+)/i);
            const newFoundCache = {
                id: cacheToMove.id || Date.now(), name: cacheToMove.name,
                gcCode: gcCodeMatch ? gcCodeMatch[0].toUpperCase() : cacheToMove.name,
                timestamp: new Date().toISOString(), loggers: loggers
            };
            foundCaches.push(newFoundCache);
            municipalities[munIndex].caches.splice(cacheIndex, 1);
            saveMunicipalities();
            saveFoundCaches();
            needsImmediateRender = true; // Pakotetaan välitön päivitys
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
                    saveMunicipalities();
                    needsImmediateRender = true;
                }
            } else if (button.classList.contains('edit-municipality-btn')) {
                const oldName = municipalities[munIndex].name;
                const newName = prompt("Muokkaa kunnan nimeä:", oldName);
                if (newName && newName.trim() && newName.trim().toLowerCase() !== oldName.toLowerCase()) {
                    municipalities[munIndex].name = newName.trim();
                    delete municipalities[munIndex].lat; delete municipalities[munIndex].lon;
                    saveMunicipalities();
                    ensureAllCoordsAreFetched(municipalities);
                    needsImmediateRender = true;
                }
            } else if (button.classList.contains('delete-municipality-btn')) {
                if (confirm(`Haluatko poistaa kunnan "${municipalities[munIndex].name}"?`)) {
                    municipalities.splice(munIndex, 1);
                    saveMunicipalities();
                    needsImmediateRender = true;
                }
            } else if (button.classList.contains('delete-cache-btn')) {
                if (confirm(`Poistetaanko kätkö "${municipalities[munIndex].caches[cacheIndex].name}"?`)) {
                    municipalities[munIndex].caches.splice(cacheIndex, 1);
                    saveMunicipalities();
                    needsImmediateRender = true;
                }
            } else if (button.classList.contains('edit-cache-btn')) {
                const cache = municipalities[munIndex].caches[cacheIndex];
                const newName = prompt("Muokkaa kätkön nimeä:", cache.name);
                if (newName && newName.trim()) {
                    cache.name = newName.trim();
                    saveMunicipalities();
                    needsImmediateRender = true;
                }
            }
        }
        if (needsImmediateRender) {
            render();
            renderFoundList();
            updateAllMarkers();
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
        const button = target.closest('button');
        const cacheItem = target.closest('.found-cache-item');
        if (!cacheItem) return;
        const cacheId = parseInt(cacheItem.dataset.cacheId, 10);
        if (isNaN(cacheId)) return;
        
        const cacheIndex = foundCaches.findIndex(c => c.id === cacheId);
        if (cacheIndex === -1) return;
        const cache = foundCaches[cacheIndex];
        
        if (target.type === 'checkbox') {
            const loggerName = target.dataset.logger;
            cache.loggers[loggerName] = target.checked;
            saveFoundCaches();
        } else if (button && button.classList.contains('edit-found-btn')) {
            const newName = prompt("Muokkaa nimeä/GC-koodia:", cache.name);
            if (newName && newName.trim()) {
                cache.name = newName.trim();
                const gcCodeMatch = newName.match(/(GC[A-Z0-9]+)/i);
                cache.gcCode = gcCodeMatch ? gcCodeMatch[0].toUpperCase() : newName;
                saveFoundCaches();
            }
        } else if (button && button.classList.contains('delete-found-btn')) {
            if (confirm(`Haluatko varmasti poistaa lokista kätkön "${cache.name}"?`)) {
                foundCaches.splice(cacheIndex, 1);
                saveFoundCaches();
            }
        }
    });

    showTripListBtn.addEventListener('click', () => {
        tripListView.classList.remove('hidden'); foundLogView.classList.add('hidden');
        showTripListBtn.classList.add('active'); showFoundLogBtn.classList.remove('active');
    });
    showFoundLogBtn.addEventListener('click', () => {
        tripListView.classList.add('hidden'); foundLogView.classList.remove('hidden');
        showTripListBtn.classList.remove('active'); showFoundLogBtn.classList.add('active');
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
