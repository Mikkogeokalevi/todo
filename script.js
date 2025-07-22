import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// --- ASETUKSET ---
const urlParams = new URLSearchParams(window.location.search);
const listNameFromUrl = urlParams.get('lista');
const FIREBASE_PATH = listNameFromUrl || 'paalista';
const OFFLINE_KEY = `georeissu-offline-${FIREBASE_PATH}`;
// --- ASETUKSET 2 PÄÄTTYVÄT ---

document.addEventListener('DOMContentLoaded', () => {
    document.title = `${FIREBASE_PATH} — MK Reissuapuri —`;
    const listNameDisplay = document.getElementById('listNameDisplay');
    if (listNameDisplay) {
        listNameDisplay.textContent = FIREBASE_PATH;
    }
    
    // ... (kuntadata ja firebaseConfig pysyvät samoina) ...
    const kuntaMaakuntaData = { "Akaa": "Pirkanmaa", "Alajärvi": "Etelä-Pohjanmaa", "Alavieska": "Pohjois-Pohjanmaa", "Alavus": "Etelä-Pohjanmaa", "Asikkala": "Päijät-Häme", "Askola": "Uusimaa", "Aura": "Varsinais-Suomi", "Brändö": "Ahvenanmaa", "Eckerö": "Ahvenanmaa", "Enonkoski": "Etelä-Savo", "Enontekiö": "Lappi", "Espoo": "Uusimaa", "Eura": "Satakunta", "Eurajoki": "Satakunta", "Evijärvi": "Etelä-Pohjanmaa", "Finström": "Ahvenanmaa", "Forssa": "Kanta-Häme", "Föglö": "Ahvenanmaa", "Geta": "Ahvenanmaa", "Haapajärvi": "Pohjois-Pohjanmaa", "Haapavesi": "Pohjois-Pohjanmaa", "Hailuoto": "Pohjois-Pohjanmaa", "Halsua": "Keski-Pohjanmaa", "Hamina": "Kymenlaakso", "Hammarland": "Ahvenanmaa", "Hankasalmi": "Keski-Suomi", "Hanko": "Uusimaa", "Harjavalta": "Satakunta", "Hartola": "Päijät-Häme", "Hattula": "Kanta-Häme", "Hausjärvi": "Kanta-Häme", "Heinola": "Päijät-Häme", "Heinävesi": "Pohjois-Karjala", "Helsinki": "Uusimaa", "Hirvensalmi": "Etelä-Savo", "Hollola": "Päijät-Häme", "Huittinen": "Satakunta", "Humppila": "Kanta-Häme", "Hyrynsalmi": "Kainuu", "Hyvinkää": "Uusimaa", "Hämeenkyrö": "Pirkanmaa", "Hämeenlinna": "Kanta-Häme", "Ii": "Pohjois-Pohjanmaa", "Iisalmi": "Pohjois-Savo", "Iitti": "Päijät-Häme", "Ikaalinen": "Pirkanmaa", "Ilmajoki": "Etelä-Pohjanmaa", "Ilomantsi": "Pohjois-Karjala", "Imatra": "Etelä-Karjala", "Inari": "Lappi", "Inkoo": "Uusimaa", "Isojoki": "Etelä-Pohjanmaa", "Isokyrö": "Etelä-Pohjanmaa", "Janakkala": "Kanta-Häme", "Joensuu": "Pohjois-Karjala", "Jokioinen": "Kanta-Häme", "Jomala": "Ahvenanmaa", "Joroinen": "Pohjois-Savo", "Joutsa": "Keski-Suomi", "Juuka": "Pohjois-Karjala", "Juupajoki": "Pirkanmaa", "Juva": "Etelä-Savo", "Jyväskylä": "Keski-Suomi", "Jämijärvi": "Satakunta", "Jämsä": "Keski-Suomi", "Järvenpää": "Uusimaa", "Kaarina": "Varsinais-Suomi", "Kaavi": "Pohjois-Savo", "Kajaani": "Kainuu", "Kalajoki": "Pohjois-Pohjanmaa", "Kangasala": "Pirkanmaa", "Kangasniemi": "Etelä-Savo", "Kankaanpää": "Satakunta", "Kannonkoski": "Keski-Suomi", "Kannus": "Keski-Pohjanmaa", "Karijoki": "Etelä-Pohjanmaa", "Karkkila": "Uusimaa", "Karstula": "Keski-Suomi", "Karvia": "Satakunta", "Kaskinen": "Pohjanmaa", "Kauhajoki": "Etelä-Pohjanmaa", "Kauhava": "Etelä-Pohjanmaa", "Kauniainen": "Uusimaa", "Kaustinen": "Keski-Pohjanmaa", "Keitele": "Pohjois-Savo", "Kemi": "Lappi", "Kemijärvi": "Lappi", "Keminmaa": "Lappi", "Kemiönsaari": "Varsinais-Suomi", "Kempele": "Pohjois-Pohjanmaa", "Kerava": "Uusimaa", "Keuruu": "Keski-Suomi", "Kihniö": "Pirkanmaa", "Kinnula": "Keski-Suomi", "Kirkkonummi": "Uusimaa", "Kitee": "Pohjois-Karjala", "Kittilä": "Lappi", "Kiuruvesi": "Pohjois-Savo", "Kivijärvi": "Keski-Suomi", "Kokemäki": "Satakunta", "Kokkola": "Keski-Pohjanmaa", "Kolar": "Lappi", "Konnevesi": "Keski-Suomi", "Kontiolahti": "Pohjois-Karjala", "Korsnäs": "Pohjanmaa", "Koski Tl": "Varsinais-Suomi", "Kotka": "Kymenlaakso", "Kouvola": "Kymenlaakso", "Kristiinankaupunki": "Pohjanmaa", "Kruunupyy": "Pohjanmaa", "Kuhmo": "Kainuu", "Kuhmoinen": "Pirkanmaa", "Kumlinge": "Ahvenanmaa", "Kuopio": "Pohjois-Savo", "Kuortane": "Etelä-Pohjanmaa", "Kurikka": "Etelä-Pohjanmaa", "Kustavi": "Varsinais-Suomi", "Kuusamo": "Pohjois-Pohjanmaa", "Kyyjärvi": "Keski-Suomi", "Kärkölä": "Päijät-Häme", "Kärsämäki": "Pohjois-Pohjanmaa", "Kökar": "Ahvenanmaa", "Lahti": "Päijät-Häme", "Laihia": "Pohjanmaa", "Laitila": "Varsinais-Suomi", "Lapinjärvi": "Uusimaa", "Lapinlahti": "Pohjois-Savo", "Lappajärvi": "Etelä-Pohjanmaa", "Lappeenranta": "Etelä-Karjala", "Lapua": "Etelä-Pohjanmaa", "Laukaa": "Keski-Suomi", "Lemi": "Etelä-Karjala", "Lemland": "Ahvenanmaa", "Lempäälä": "Pirkanmaa", "Leppävirta": "Pohjois-Savo", "Lestijärvi": "Keski-Pohjanmaa", "Lieksa": "Pohjois-Karjala", "Lieto": "Varsinais-Suomi", "Liminka": "Pohjois-Pohjanmaa", "Liperi": "Pohjois-Karjala", "Lohja": "Uusimaa", "Loimaa": "Varsinais-Suomi", "Loppi": "Kanta-Häme", "Loviisa": "Uusimaa", "Luhanka": "Keski-Suomi", "Lumijoki": "Pohjois-Pohjanmaa", "Lumparland": "Ahvenanmaa", "Luoto": "Pohjanmaa", "Luumäki": "Etelä-Karjala", "Maalahti": "Pohjanmaa", "Maarianhamina": "Ahvenanmaa", "Marttila": "Varsinais-Suomi", "Masku": "Varsinais-Suomi", "Merijärvi": "Pohjois-Pohjanmaa", "Merikarvia": "Satakunta", "Miehikkälä": "Kymenlaakso", "Mikkeli": "Etelä-Savo", "Muhos": "Pohjois-Pohjanmaa", "Multia": "Keski-Suomi", "Muonio": "Lappi", "Mustasaari": "Pohjanmaa", "Muurame": "Keski-Suomi", "Mynämäki": "Varsinais-Suomi", "Myrskylä": "Uusimaa", "Mäntsälä": "Uusimaa", "Mänttä-Vilppula": "Pirkanmaa", "Mäntyharju": "Etelä-Savo", "Naantali": "Varsinais-Suomi", "Nakkila": "Satakunta", "Nivala": "Pohjois-Pohjanmaa", "Nokia": "Pirkanmaa", "Nousiainen": "Varsinais-Suomi", "Nurmes": "Pohjois-Karjala", "Nurmijärvi": "Uusimaa", "Närpiö": "Pohjanmaa", "Orimattila": "Päijät-Häme", "Oripää": "Varsinais-Suomi", "Orivesi": "Pirkanmaa", "Oulainen": "Pohjois-Pohjanmaa", "Oulu": "Pohjois-Pohjanmaa", "Outokumpu": "Pohjois-Karjala", "Padasjoki": "Päijät-Häme", "Paimio": "Varsinais-Suomi", "Paltamo": "Kainuu", "Parainen": "Varsinais-Suomi", "Parikkala": "Etelä-Karjala", "Parkano": "Pirkanmaa", "Pedersören kunta": "Pohjanmaa", "Pelkosenniemi": "Lappi", "Pello": "Lappi", "Perho": "Keski-Pohjanmaa", "Pertunmaa": "Etelä-Savo", "Petäjävesi": "Keski-Suomi", "Pieksämäki": "Etelä-Savo", "Pielavesi": "Pohjois-Savo", "Pietarsaari": "Pohjanmaa", "Pihtipudas": "Keski-Suomi", "Pirkkala": "Pirkanmaa", "Polvijärvi": "Pohjois-Karjala", "Pomarkku": "Satakunta", "Pori": "Satakunta", "Pornainen": "Uusimaa", "Porvoo": "Uusimaa", "Posio": "Lappi", "Pudasjärvi": "Pohjois-Pohjanmaa", "Pukkila": "Uusimaa", "Punkalaidun": "Pirkanmaa", "Puolanka": "Kainuu", "Puumala": "Etelä-Savo", "Pyhtää": "Kymenlaakso", "Pyhäjoki": "Pohjois-Pohjanmaa", "Pyhäjärvi": "Pohjois-Pohjanmaa", "Pyhäntä": "Pohjois-Pohjanmaa", "Pyhäranta": "Varsinais-Suomi", "Pälkäne": "Pirkanmaa", "Pöytyä": "Varsinais-Suomi", "Raahe": "Pohjois-Pohjanmaa", "Raasepori": "Uusimaa", "Raisio": "Varsinais-Suomi", "Rantasalmi": "Etelä-Savo", "Ranua": "Lappi", "Rauma": "Satakunta", "Rautalampi": "Pohjois-Savo", "Rautavaara": "Pohjois-Savo", "Rautjärvi": "Etelä-Karjala", "Reisjärvi": "Pohjois-Pohjanmaa", "Riihimäki": "Kanta-Häme", "Ristijärvi": "Kainuu", "Rovaniemi": "Lappi", "Ruokolahti": "Etelä-Karjala", "Ruovesi": "Pirkanmaa", "Rusko": "Varsinais-Suomi", "Rääkkylä": "Pohjois-Karjala", "Saarijärvi": "Keski-Suomi", "Salla": "Lappi", "Salo": "Varsinais-Suomi", "Saltvik": "Ahvenanmaa", "Sastamala": "Pirkanmaa", "Sauvo": "Varsinais-Suomi", "Savitaipale": "Etelä-Karjala", "Savonlinna": "Etelä-Savo", "Savukoski": "Lappi", "Seinäjoki": "Etelä-Pohjanmaa", "Sievi": "Pohjois-Pohjanmaa", "Siikainen": "Satakunta", "Siikajoki": "Pohjois-Pohjanmaa", "Siilinjärvi": "Pohjois-Savo", "Simo": "Lappi", "Sipoo": "Uusimaa", "Siuntio": "Uusimaa", "Sodankylä": "Lappi", "Soini": "Etelä-Pohjanmaa", "Somero": "Varsinais-Suomi", "Sonkajärvi": "Pohjois-Savo", "Sotkamo": "Kainuu", "Sottunga": "Ahvenanmaa", "Sulkava": "Etelä-Savo", "Sund": "Ahvenanmaa", "Suomussalmi": "Kainuu", "Suonenjoki": "Pohjois-Savo", "Sysmä": "Päijät-Häme", "Säkylä": "Satakunta", "Taipalsaari": "Etelä-Karjala", "Taivalkoski": "Pohjois-Pohjanmaa", "Taivassalo": "Varsinais-Suomi", "Tammela": "Kanta-Häme", "Tampere": "Pirkanmaa", "Tervo": "Pohjois-Savo", "Tervola": "Lappi", "Teuva": "Etelä-Pohjanmaa", "Tohmajärvi": "Pohjois-Karjala", "Toholampi": "Keski-Pohjanmaa", "Toivakka": "Keski-Suomi", "Tornio": "Lappi", "Turku": "Varsinais-Suomi", "Tuusniemi": "Pohjois-Savo", "Tuusula": "Uusimaa", "Tyrnävä": "Pohjois-Pohjanmaa", "Ulvila": "Satakunta", "Urjala": "Pirkanmaa", "Utajärvi": "Pohjois-Pohjanmaa", "Utsjoki": "Lappi", "Uurainen": "Keski-Suomi", "Uusikaarlepyy": "Pohjanmaa", "Uusikaupunki": "Varsinais-Suomi", "Vaala": "Pohjois-Pohjanmaa", "Vaasa": "Pohjanmaa", "Valkeakoski": "Pirkanmaa", "Vantaa": "Uusimaa", "Varkaus": "Pohjois-Savo", "Vehmaa": "Varsinais-Suomi", "Vesanto": "Pohjois-Savo", "Vesilahti": "Pirkanmaa", "Veteli": "Keski-Pohjanmaa", "Vieremä": "Pohjois-Savo", "Vihti": "Uusimaa", "Viitasaari": "Keski-Suomi", "Vimpeli": "Etelä-Pohjanmaa", "Virolahti": "Kymenlaakso", "Virrat": "Pirkanmaa", "Vårdö": "Ahvenanmaa", "Vöyri": "Pohjanmaa", "Ylitornio": "Lappi", "Ylivieska": "Pohjois-Pohjanmaa", "Ylöjärvi": "Pirkanmaa", "Ypäjä": "Kanta-Häme", "Ähtäri": "Etelä-Pohjanmaa", "Äänekoski": "Keski-Suomi" };
    
    const firebaseConfig = { apiKey: "AIzaSyA1OgSGhgYgmxDLv7-xkPPsUGCpcxFaI8M", authDomain: "geokatkosuunnittelija.firebaseapp.com", databaseURL: "https://geokatkosuunnittelija-default-rtdb.europe-west1.firebasedatabase.app", projectId: "geokatkosuunnittelija", storageBucket: "geokatkosuunnittelija.appspot.com", messagingSenderId: "745498680990", appId: "1:745498680990:web:869074eb0f0b72565ca58f" };
    
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    
    // DOM-elementit
    const pgcProfileNameInput = document.getElementById('pgcProfileName');
    const pgcMapCountiesLink = document.getElementById('pgcMapCountiesLink'); // UUSI
    const bulkAddInput = document.getElementById('bulkAddMunicipalities');
    // ...
    // Muut DOM-elementtimääritykset pysyvät ennallaan
    // ...
    const activeMunicipalityContainer = document.getElementById('activeMunicipalityContainer');
    
    let municipalities = [];
    let foundCaches = [];
    let loggers = [];
    let map;
    let userMarker;
    let trackingWatcher = null;
    let lastCheckedMunicipality = null;
    let currentBoundaryLayer = null; // UUSI: Tähän tallennetaan nykyinen kuntaraja
    let municipalityMarkers = [];
    // ...
    // Muut tilamuuttujat pysyvät ennallaan
    // ...
    
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
    
    // --- UUSI FUNKTIO: Kuntarajojen haku ja piirto ---
    const fetchAndDrawBoundary = async (municipalityName) => {
        if (currentBoundaryLayer) {
            map.removeLayer(currentBoundaryLayer);
            currentBoundaryLayer = null;
        }
        try {
            // Käytetään Nominatim-hakua, joka osaa hakea myös polygon-muotoja
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(municipalityName)}&format=geojson&polygon_geojson=1&limit=1`);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                // Varmistetaan, että saimme polygonin tai multipolygonin
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

    // --- UUSI FUNKTIO: PGC-linkin päivitys ---
    const updatePgcLink = () => {
        const profileName = pgcProfileNameInput.value.trim();
        if (profileName && pgcMapCountiesLink) {
            pgcMapCountiesLink.href = `https://project-gc.com/Tools/MapCounties?profile_name=${encodeURIComponent(profileName)}&country=Finland&submit=Filter`;
        }
    };


    const checkCurrentMunicipality = async (lat, lon) => {
        try {
            const currentMunicipality = await getMunicipalityForCoordinates(lat, lon);
            updateStatusDisplay({ municipality: currentMunicipality || 'Tuntematon sijainti', lat, lon });
            
            if (currentMunicipality && currentMunicipality !== lastCheckedMunicipality) {
                // Kunta on vaihtunut
                lastCheckedMunicipality = currentMunicipality;
                
                // Poistetaan vanha kuntaraja kartalta
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

                    // Ladataan ja piirretään uusi kuntaraja
                    fetchAndDrawBoundary(currentMunicipality);

                } else {
                    // Kunta ei ole listalla, piilotetaan aktiivisen kunnan laatikko
                    activeMunicipalityContainer.classList.add('hidden');
                    activeMunicipalityContainer.innerHTML = '';
                }
            } else if (!currentMunicipality) {
                lastCheckedMunicipality = null;
                // Ei olla tunnetussa kunnassa, poistetaan raja ja piilotetaan laatikko
                if (currentBoundaryLayer) map.removeLayer(currentBoundaryLayer);
                activeMunicipalityContainer.classList.add('hidden');
            }

        } catch (error) { console.error("Kuntatarkistusvirhe:", error); }
    };

    const toggleTracking = async () => {
        if (clickMarker) { clickMarker.removeFrom(map); clickMarker = null; }
        if (trackingWatcher) {
            // ... (seurannan lopetuslogiikka pysyy samana)
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
            // Poistetaan kuntaraja kartalta, kun seuranta lopetetaan
            if (currentBoundaryLayer) {
                map.removeLayer(currentBoundaryLayer);
                currentBoundaryLayer = null;
            }
        } else {
            // ... (seurannan aloituslogiikka pysyy samana)
            // ...
        }
    };

    // ...
    // Kaikki muut funktiot (render, renderFoundList, saveState, jne.) pysyvät ennallaan
    // Kopioi ne edellisestä vastauksesta tai käytä nykyisiäsi.
    // Tässä on vain ne, joihin tuli muutoksia, selkeyden vuoksi.
    // HUOM: Koko tiedosto on kyllä saatavilla yllä olevasta koodilohkosta.
    // ...

    // --- LISÄTTY: Alustetaan ja päivitetään PGC-linkki ---
    updatePgcLink();
    pgcProfileNameInput.addEventListener('input', updatePgcLink);
    pgcProfileNameInput.addEventListener('change', saveState); // Pidetään myös vanha tallennuslogiikka

    // ... loppuosa tiedostosta ...

});
