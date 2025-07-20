import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // KORJATTU JA TÄYDENNETTY KUNTALISTA (säilytetään ennallaan)
    const kuntaMaakuntaData = {
        "Akaa": "Pirkanmaa", "Alajärvi": "Etelä-Pohjanmaa", "Alavieska": "Pohjois-Pohjanmaa", "Alavus": "Etelä-Pohjanmaa", "Asikkala": "Päijät-Häme",
        "Askola": "Uusimaa", "Aura": "Varsinais-Suomi", "Brändö": "Ahvenanmaa", "Eckerö": "Ahvenanmaa", "Enonkoski": "Etelä-Savo", "Enontekiö": "Lappi",
        "Espoo": "Uusimaa", "Eura": "Satakunta", "Eurajoki": "Satakunta", "Evijärvi": "Etelä-Pohjanmaa", "Finström": "Ahvenanmaa", "Forssa": "Kanta-Häme",
        "Föglö": "Ahvenanmaa", "Geta": "Ahvenanmaa", "Haapajärvi": "Pohjois-Pohjanmaa", "Haapavesi": "Pohjois-Pohjanmaa", "Hailuoto": "Pohjois-Pohjanmaa",
        "Halsua": "Keski-Pohjanmaa", "Hamina": "Kymenlaakso", "Hammarland": "Ahvenanmaa", "Hankasalmi": "Keski-Suomi", "Hanko": "Uusimaa",
        "Harjavalta": "Satakunta", "Hartola": "Päijät-Häme", "Hattula": "Kanta-Häme", "Hausjärvi": "Kanta-Häme", "Heinola": "Päijät-Häme", "Heinävesi": "Pohjois-Karjala",
        "Helsinki": "Uusimaa", "Hirvensalmi": "Etelä-Savo", "Hollola": "Päijät-Häme", "Huittinen": "Satakunta",
        "Humppila": "Kanta-Häme", "Hyrynsalmi": "Kainuu", "Hyvinkää": "Uusimaa", "Hämeenkyrö": "Pirkanmaa", "Hämeenlinna": "Kanta-Häme",
        "Ii": "Pohjois-Pohjanmaa", "Iisalmi": "Pohjois-Savo", "Iitti": "Päijät-Häme", "Ikaalinen": "Pirkanmaa", "Ilmajoki": "Etelä-Pohjanmaa",
        "Ilomantsi": "Pohjois-Karjala", "Imatra": "Etelä-Karjala", "Inari": "Lappi", "Inkoo": "Uusimaa", "Isojoki": "Etelä-Pohjanmaa",
        "Isokyrö": "Etelä-Pohjanmaa", "Janakkala": "Kanta-Häme", "Joensuu": "Pohjois-Karjala", "Jokioinen": "Kanta-Häme", "Jomala": "Ahvenanmaa",
        "Joroinen": "Pohjois-Savo", "Joutsa": "Keski-Suomi", "Juuka": "Pohjois-Karjala", "Juupajoki": "Pirkanmaa", "Juva": "Etelä-Savo",
        "Jyväskylä": "Keski-Suomi", "Jämijärvi": "Satakunta", "Jämsä": "Keski-Suomi", "Järvenpää": "Uusimaa", "Kaarina": "Varsinais-Suomi",
        "Kaavi": "Pohjois-Savo", "Kajaani": "Kainuu", "Kalajoki": "Pohjois-Pohjanmaa", "Kangasala": "Pirkanmaa", "Kangasniemi": "Etelä-Savo",
        "Kankaanpää": "Satakunta", "Kannonkoski": "Keski-Suomi", "Kannus": "Keski-Pohjanmaa", "Karijoki": "Etelä-Pohjanmaa", "Karkkila": "Uusimaa",
        "Karstula": "Keski-Suomi", "Karvia": "Satakunta", "Kaskinen": "Pohjanmaa", "Kauhajoki": "Etelä-Pohjanmaa", "Kauhava": "Etelä-Pohjanmaa",
        "Kauniainen": "Uusimaa", "Kaustinen": "Keski-Pohjanmaa", "Keitele": "Pohjois-Savo", "Kemi": "Lappi", "Kemijärvi": "Lappi",
        "Keminmaa": "Lappi", "Kemiönsaari": "Varsinais-Suomi", "Kempele": "Pohjois-Pohjanmaa", "Kerava": "Uusimaa", "Keuruu": "Keski-Suomi",
        "Kihniö": "Pirkanmaa", "Kinnula": "Keski-Suomi", "Kirkkonummi": "Uusimaa", "Kitee": "Pohjois-Karjala", "Kittilä": "Lappi",
        "Kiuruvesi": "Pohjois-Savo", "Kivijärvi": "Keski-Suomi", "Kokemäki": "Satakunta", "Kokkola": "Keski-Pohjanmaa", "Kolar": "Lappi",
        "Konnevesi": "Keski-Suomi", "Kontiolahti": "Pohjois-Karjala", "Korsnäs": "Pohjanmaa", "Koski Tl": "Varsinais-Suomi", "Kotka": "Kymenlaakso",
        "Kouvola": "Kymenlaakso", "Kristiinankaupunki": "Pohjanmaa", "Kruunupyy": "Pohjanmaa", "Kuhmo": "Kainuu", "Kuhmoinen": "Pirkanmaa",
        "Kumlinge": "Ahvenanmaa", "Kuopio": "Pohjois-Savo", "Kuortane": "Etelä-Pohjanmaa", "Kurikka": "Etelä-Pohjanmaa", "Kustavi": "Varsinais-Suomi",
        "Kuusamo": "Pohjois-Pohjanmaa", "Kyyjärvi": "Keski-Suomi", "Kärkölä": "Päijät-Häme", "Kärsämäki": "Pohjois-Pohjanmaa", "Kökar": "Ahvenanmaa",
        "Lahti": "Päijät-Häme", "Laihia": "Pohjanmaa", "Laitila": "Varsinais-Suomi", "Lapinjärvi": "Uusimaa", "Lapinlahti": "Pohjois-Savo",
        "Lappajärvi": "Etelä-Pohjanmaa", "Lappeenranta": "Etelä-Karjala", "Lapua": "Etelä-Pohjanmaa", "Laukaa": "Keski-Suomi", "Lemi": "Etelä-Karjala",
        "Lemland": "Ahvenanmaa", "Lempäälä": "Pirkanmaa", "Leppävirta": "Pohjois-Savo", "Lestijärvi": "Keski-Pohjanmaa", "Lieksa": "Pohjois-Karjala",
        "Lieto": "Varsinais-Suomi", "Liminka": "Pohjois-Pohjanmaa", "Liperi": "Pohjois-Karjala", "Lohja": "Uusimaa", "Loimaa": "Varsinais-Suomi",
        "Loppi": "Kanta-Häme", "Loviisa": "Uusimaa", "Luhanka": "Keski-Suomi", "Lumijoki": "Pohjois-Pohjanmaa", "Lumparland": "Ahvenanmaa",
        "Luoto": "Pohjanmaa", "Luumäki": "Etelä-Karjala", "Maalahti": "Pohjanmaa", "Maarianhamina": "Ahvenanmaa",
        "Marttila": "Varsinais-Suomi", "Masku": "Varsinais-Suomi", "Merijärvi": "Pohjois-Pohjanmaa", "Merikarvia": "Satakunta",
        "Miehikkälä": "Kymenlaakso", "Mikkeli": "Etelä-Savo", "Muhos": "Pohjois-Pohjanmaa", "Multia": "Keski-Suomi", "Muonio": "Lappi",
        "Mustasaari": "Pohjanmaa", "Muurame": "Keski-Suomi", "Mynämäki": "Varsinais-Suomi", "Myrskylä": "Uusimaa", "Mäntsälä": "Uusimaa",
        "Mänttä-Vilppula": "Pirkanmaa", "Mäntyharju": "Etelä-Savo", "Naantali": "Varsinais-Suomi", "Nakkila": "Satakunta", "Nivala": "Pohjois-Pohjanmaa",
        "Nokia": "Pirkanmaa", "Nousiainen": "Varsinais-Suomi", "Nurmes": "Pohjois-Karjala", "Nurmijärvi": "Uusimaa", "Närpiö": "Pohjanmaa",
        "Orimattila": "Päijät-Häme", "Oripää": "Varsinais-Suomi", "Orivesi": "Pirkanmaa", "Oulainen": "Pohjois-Pohjanmaa", "Oulu": "Pohjois-Pohjanmaa",
        "Outokumpu": "Pohjois-Karjala", "Padasjoki": "Päijät-Häme", "Paimio": "Varsinais-Suomi", "Paltamo": "Kainuu", "Parainen": "Varsinais-Suomi",
        "Parikkala": "Etelä-Karjala", "Parkano": "Pirkanmaa", "Pedersören kunta": "Pohjanmaa", "Pelkosenniemi": "Lappi", "Pello": "Lappi",
        "Perho": "Keski-Pohjanmaa", "Pertunmaa": "Etelä-Savo", "Petäjävesi": "Keski-Suomi", "Pieksämäki": "Etelä-Savo",
        "Pielavesi": "Pohjois-Savo", "Pietarsaari": "Pohjanmaa", "Pihtipudas": "Keski-Suomi", "Pirkkala": "Pirkanmaa", "Polvijärvi": "Pohjois-Karjala",
        "Pomarkku": "Satakunta", "Pori": "Satakunta", "Pornainen": "Uusimaa", "Porvoo": "Uusimaa", "Posio": "Lappi", "Pudasjärvi": "Pohjois-Pohjanmaa",
        "Pukkila": "Uusimaa", "Punkalaidun": "Pirkanmaa", "Puolanka": "Kainuu", "Puumala": "Etelä-Savo", "Pyhtää": "Kymenlaakso",
        "Pyhäjoki": "Pohjois-Pohjanmaa", "Pyhäjärvi": "Pohjois-Pohjanmaa", "Pyhäntä": "Pohjois-Pohjanmaa", "Pyhäranta": "Varsinais-Suomi",
        "Pälkäne": "Pirkanmaa", "Pöytyä": "Varsinais-Suomi", "Raahe": "Pohjois-Pohjanmaa", "Raasepori": "Uusimaa", "Raisio": "Varsinais-Suomi",
        "Rantasalmi": "Etelä-Savo", "Ranua": "Lappi", "Rauma": "Satakunta", "Rautalampi": "Pohjois-Savo", "Rautavaara": "Pohjois-Savo",
        "Rautjärvi": "Etelä-Karjala", "Reisjärvi": "Pohjois-Pohjanmaa", "Riihimäki": "Kanta-Häme", "Ristijärvi": "Kainuu", "Rovaniemi": "Lappi",
        "Ruokolahti": "Etelä-Karjala", "Ruovesi": "Pirkanmaa", "Rusko": "Varsinais-Suomi", "Rääkkylä": "Pohjois-Karjala", "Saarijärvi": "Keski-Suomi",
        "Salla": "Lappi", "Salo": "Varsinais-Suomi", "Saltvik": "Ahvenanmaa", "Sastamala": "Pirkanmaa", "Sauvo": "Varsinais-Suomi", "Savitaipale": "Etelä-Karjala",
        "Savonlinna": "Etelä-Savo", "Savukoski": "Lappi", "Seinäjoki": "Etelä-Pohjanmaa", "Sievi": "Pohjois-Pohjanmaa", "Siikainen": "Satakunta",
        "Siikajoki": "Pohjois-Pohjanmaa", "Siilinjärvi": "Pohjois-Savo", "Simo": "Lappi", "Sipoo": "Uusimaa", "Siuntio": "Uusimaa",
        "Sodankylä": "Lappi", "Soini": "Etelä-Pohjanmaa", "Somero": "Varsinais-Suomi", "Sonkajärvi": "Pohjois-Savo", "Sotkamo": "Kainuu",
        "Sottunga": "Ahvenanmaa", "Sulkava": "Etelä-Savo", "Sund": "Ahvenanmaa", "Suomussalmi": "Kainuu", "Suonenjoki": "Pohjois-Savo",
        "Sysmä": "Päijät-Häme", "Säkylä": "Satakunta", "Taipalsaari": "Etelä-Karjala", "Taivalkoski": "Pohjois-Pohjanmaa", "Taivassalo": "Varsinais-Suomi",
        "Tammela": "Kanta-Häme", "Tampere": "Pirkanmaa", "Tervo": "Pohjois-Savo", "Tervola": "Lappi", "Teuva": "Etelä-Pohjanmaa", "Tohmajärvi": "Pohjois-Karjala",
        "Toholampi": "Keski-Pohjanmaa", "Toivakka": "Keski-Suomi", "Tornio": "Lappi", "Turku": "Varsinais-Suomi", "Tuusniemi": "Pohjois-Savo",
        "Tuusula": "Uusimaa", "Tyrnävä": "Pohjois-Pohjanmaa", "Ulvila": "Satakunta", "Urjala": "Pirkanmaa", "Utajärvi": "Pohjois-Pohjanmaa",
        "Utsjoki": "Lappi", "Uurainen": "Keski-Suomi", "Uusikaarlepyy": "Pohjanmaa", "Uusikaupunki": "Varsinais-Suomi", "Vaala": "Pohjois-Pohjanmaa",
        "Vaasa": "Pohjanmaa", "Valkeakoski": "Pirkanmaa", "Vantaa": "Uusimaa", "Varkaus": "Pohjois-Savo",
        "Vehmaa": "Varsinais-Suomi", "Vesanto": "Pohjois-Savo", "Vesilahti": "Pirkanmaa", "Veteli": "Keski-Pohjanmaa", "Vieremä": "Pohjois-Savo",
        "Vihti": "Uusimaa", "Viitasaari": "Keski-Suomi", "Vimpeli": "Etelä-Pohjanmaa", "Virolahti": "Kymenlaakso", "Virrat": "Pirkanmaa",
        "Vårdö": "Ahvenanmaa", "Vöyri": "Pohjanmaa", "Ylitornio": "Lappi", "Ylivieska": "Pohjois-Pohjanmaa", "Ylöjärvi": "Pirkanmaa",
        "Ypäjä": "Kanta-Häme", "Ähtäri": "Etelä-Pohjanmaa", "Äänekoski": "Keski-Suomi"
    };

    const firebaseConfig = {
        apiKey: "AIzaSyA1OgSGhgYgmxDLv7-xkPPsUGCpcxFaI8M",
        authDomain: "geokatkosuunnittelija.firebaseapp.com",
        databaseURL: "https://geokatkosuunnittelija-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "geokatkosuunnittelija",
        storageBucket: "geokatkosuunnittelija.appspot.com",
        messagingSenderId: "745498680990",
        appId: "1:745498680990:web:869074eb0f0b72565ca58f"
    };

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    const startLocationInput = document.getElementById('startLocation');
    const pgcProfileNameInput = document.getElementById('pgcProfileName');
    const bulkAddInput = document.getElementById('bulkAddMunicipalities');
    const bulkAddBtn = document.getElementById('bulkAddBtn');
    const municipalityList = document.getElementById('municipalityList');
    const optimizeRouteBtn = document.getElementById('optimizeRouteBtn');
    const routeResultDiv = document.getElementById('routeResult');
    const cacheTypeSelectorTemplate = document.getElementById('cacheTypeSelector');
    const toggleBulkAddBtn = document.getElementById('toggleBulkAddBtn');
    const bulkAddContainer = document.getElementById('bulkAddContainer');
    const toggleTrackingBtn = document.getElementById('toggleTrackingBtn'); // UUSI

    let municipalities = [];

    // UUDET MUUTTUJAT KARTTAA JA SEURANTAA VARTEN
    let map;
    let userMarker;
    let trackingWatcher = null;
    let lastCheckedMunicipality = null;

    // UUSI: Kartan alustusfunktio
    const initMap = () => {
        map = L.map('map').setView([61.9, 25.7], 6); // Asetetaan Suomen keskelle
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        const userIcon = L.divIcon({className: 'user-marker'});
        userMarker = L.marker([0, 0], { icon: userIcon }).addTo(map);
    };

    // UUSI: Funktio ilmoituksen näyttämiseen
    const showNotification = (message) => {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 5000);
    };
    
    // UUSI: Funktio kuntatarkistukseen ja ilmoitukseen
    const checkCurrentMunicipality = async (lat, lon) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`);
            if (!response.ok) return;
            const data = await response.json();
            const currentMunicipality = data.address.municipality || data.address.town || data.address.village;

            if (currentMunicipality && currentMunicipality !== lastCheckedMunicipality) {
                lastCheckedMunicipality = currentMunicipality;
                
                const foundMunIndex = municipalities.findIndex(m => m.name.toLowerCase() === currentMunicipality.toLowerCase());
                
                // Poistetaan vanha korostus
                document.querySelectorAll('.municipality-item.highlight').forEach(el => el.classList.remove('highlight'));

                if (foundMunIndex !== -1) {
                    showNotification(`Saavuit kuntaan: ${currentMunicipality}!`);
                    const munElement = document.getElementById(`mun-item-${foundMunIndex}`);
                    if (munElement) {
                        munElement.classList.add('highlight');
                        munElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        } catch (error) {
            console.error("Kuntatarkistusvirhe:", error);
        }
    };

    // UUSI: Funktio jatkuvan seurannan aloittamiseen ja lopettamiseen
    const toggleTracking = () => {
        if (trackingWatcher) { // Jos seuranta on päällä, lopetetaan se
            navigator.geolocation.clearWatch(trackingWatcher);
            trackingWatcher = null;
            toggleTrackingBtn.textContent = '🛰️ Aloita seuranta';
            toggleTrackingBtn.classList.remove('tracking-active');
            lastCheckedMunicipality = null; // Nollataan, jotta ilmoitus tulee uudelleen
        } else { // Jos seuranta ei ole päällä, aloitetaan se
            if (!("geolocation" in navigator)) {
                alert("Selaimesi ei tue paikannusta.");
                return;
            }
            trackingWatcher = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (map && userMarker) {
                        userMarker.setLatLng([latitude, longitude]);
                        map.setView([latitude, longitude], 13); // Keskittää kartan käyttäjään
                        checkCurrentMunicipality(latitude, longitude);
                    }
                },
                (error) => {
                    console.error("Paikannusvirhe:", error);
                    alert("Paikannus epäonnistui. Tarkista selaimen luvat.");
                },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
            );
            toggleTrackingBtn.textContent = '🛑 Lopeta seuranta';
            toggleTrackingBtn.classList.add('tracking-active');
        }
    };

    // MUOKATTU: render-funktioon lisätään id ja data-attribuutti kuntalistalle
    const render = () => {
        municipalityList.innerHTML = '';
        if (!municipalities) municipalities = [];
        municipalities.forEach((municipality, munIndex) => {
            const munItem = document.createElement('li');
            munItem.className = 'municipality-item';
            munItem.draggable = true;
            munItem.dataset.munIndex = munIndex;
            munItem.id = `mun-item-${munIndex}`; // UUSI ID korostusta varten

            let cacheHtml = (municipality.caches || []).map((cache, cacheIndex) => {
                const cacheName = cache.name.trim();
                let cacheNameDisplay;
                if (cacheName.toUpperCase().startsWith('GC')) {
                    const spaceIndex = cacheName.indexOf(' ');
                    if (spaceIndex === -1) {
                        cacheNameDisplay = `<a href="https://coord.info/${cacheName}" target="_blank" rel="noopener noreferrer">${cacheName}</a>`;
                    } else {
                        const gcCode = cacheName.substring(0, spaceIndex);
                        const description = cacheName.substring(spaceIndex);
                        cacheNameDisplay = `<a href="https://coord.info/${gcCode}" target="_blank" rel="noopener noreferrer">${gcCode}</a>${description}`;
                    }
                } else {
                    cacheNameDisplay = cacheName;
                }
                return `
                <li class="cache-item">
                    <input type="checkbox" ${cache.done ? 'checked' : ''} data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">
                    <div class="cache-info">
                        <div><span class="cache-type">${cache.type}</span><span class="${cache.done ? 'done' : ''}">${cacheNameDisplay}</span></div>
                    </div>
                    <div class="cache-actions">
                        <button class="edit-cache-btn" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">✏️</button>
                        <button class="delete-cache-btn" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">🗑️</button>
                    </div>
                </li>
                `;
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

            munItem.innerHTML = `
                <div class="municipality-header">
                    <a class="municipality-name-link" href="https://www.geocache.fi/stat/other/jakauma.php?kuntalista=${encodeURIComponent(kunnanNimi)}" target="_blank" rel="noopener noreferrer">
                        ${kunnanNimi}
                    </a>
                    <div class="actions">
                        ${pgcLinkHtml}
                        <button class="edit-municipality-btn" title="Muokkaa kunnan nimeä" data-mun-index="${munIndex}">✏️</button>
                        <button class="delete-municipality-btn" title="Poista kunta" data-mun-index="${munIndex}">🗑️</button>
                    </div>
                </div>
                <ul class="cache-list">${cacheHtml}</ul>
                <div class="add-cache">
                    <input type="text" class="new-cache-name" placeholder="Kätkön nimi tai GC-koodi">
                    ${cacheTypeSelectorTemplate.innerHTML}
                    <button class="add-cache-btn" data-mun-index="${munIndex}">+</button>
                </div>
            `;
            municipalityList.appendChild(munItem);
        });
    };
    
    // Alkuperäinen koodi jatkuu...
    
    initMap(); // UUSI: Kutsutaan kartan alustusta

    onValue(ref(database, 'paalista'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const oldMunicipalities = JSON.stringify(municipalities);
            const newMunicipalities = JSON.stringify(data.municipalities || []);
            
            municipalities = data.municipalities || [];
            startLocationInput.value = data.startLocation || '';
            pgcProfileNameInput.value = data.pgcProfileName || '';

            // Renderöidään vain jos data on muuttunut, vältetään turha uudelleenpiirto
            if (oldMunicipalities !== newMunicipalities) {
                render();
            }
        } else {
             render();
        }
    });

    const saveMunicipalities = () => set(ref(database, 'paalista/municipalities'), municipalities);
    const saveStartLocation = () => set(ref(database, 'paalista/startLocation'), startLocationInput.value);
    const savePgcProfileName = () => {
        set(ref(database, 'paalista/pgcProfileName'), pgcProfileNameInput.value);
        render(); 
    };

    const handleBulkAdd = () => {
        if (!municipalities) municipalities = [];
        const text = bulkAddInput.value.trim();
        if (!text) return;
        const newNames = text.split(/[\n,]/).map(name => name.trim()).filter(Boolean);
        newNames.forEach(name => {
            if (!municipalities.some(m => m.name.toLowerCase() === name.toLowerCase())) {
                municipalities.push({ name: name, caches: [] });
            }
        });
        bulkAddInput.value = '';
        saveMunicipalities();
    };

    toggleBulkAddBtn.addEventListener('click', () => {
        const isHidden = bulkAddContainer.classList.toggle('hidden');
        toggleBulkAddBtn.textContent = isHidden ? 'Lisää kunnat listana' : 'Piilota lisäysalue';
    });

    bulkAddBtn.addEventListener('click', handleBulkAdd);

    municipalityList.addEventListener('click', (e) => {
        if (e.target.matches('a')) {
            e.stopPropagation();
            return;
        }
        const targetButton = e.target.closest('button');
        if (!targetButton && e.target.type !== 'checkbox') return;
        const button = targetButton || e.target;
        const munIndex = button.dataset.munIndex;
        const cacheIndex = button.dataset.cacheIndex;
        e.stopPropagation();
        
        let needsSave = false;
        if (button.classList.contains('edit-municipality-btn')) {
            const newName = prompt("Muokkaa kunnan nimeä:", municipalities[munIndex].name);
            if (newName && newName.trim()) {
                municipalities[munIndex].name = newName.trim();
                needsSave = true;
            }
        } else if (button.classList.contains('delete-municipality-btn')) {
            if (confirm(`Haluatko poistaa kunnan "${municipalities[munIndex].name}"?`)) {
                municipalities.splice(munIndex, 1);
                needsSave = true;
            }
        } else if (button.classList.contains('add-cache-btn')) {
            const container = button.closest('.add-cache');
            const nameInput = container.querySelector('.new-cache-name');
            const typeSelector = container.querySelector('.cache-type-selector');
            if (nameInput.value.trim()) {
                if (!municipalities[munIndex].caches) municipalities[munIndex].caches = [];
                municipalities[munIndex].caches.push({ id: Date.now(), name: nameInput.value.trim(), type: typeSelector.value, done: false });
                nameInput.value = '';
                needsSave = true;
            }
        } else if (button.classList.contains('delete-cache-btn')) {
            const cacheName = municipalities[munIndex].caches[cacheIndex].name;
            if (confirm(`Poistetaanko kätkö "${cacheName}"?`)) {
                municipalities[munIndex].caches.splice(cacheIndex, 1);
                needsSave = true;
            }
        } else if (button.classList.contains('edit-cache-btn')) {
            const oldCache = municipalities[munIndex].caches[cacheIndex];
            const newName = prompt("Muokkaa kätkön nimeä:", oldCache.name);
            if (newName && newName.trim()) {
                oldCache.name = newName.trim();
                needsSave = true;
            }
        } else if (button.type === 'checkbox') {
            municipalities[munIndex].caches[cacheIndex].done = button.checked;
            needsSave = true;
        }

        if (needsSave) {
            saveMunicipalities();
        }
    });

    startLocationInput.addEventListener('change', saveStartLocation);
    pgcProfileNameInput.addEventListener('change', savePgcProfileName);
    toggleTrackingBtn.addEventListener('click', toggleTracking); // UUSI

    let draggedIndex = null;
    municipalityList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('municipality-item')) {
            draggedIndex = parseInt(e.target.dataset.munIndex, 10);
            setTimeout(() => e.target.classList.add('dragging'), 0);
        } else {
            e.preventDefault();
        }
    });
    municipalityList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(municipalityList, e.clientY);
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement) {
            if (afterElement == null) {
                municipalityList.appendChild(draggingElement);
            } else {
                municipalityList.insertBefore(draggingElement, afterElement);
            }
        }
    });
    municipalityList.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('municipality-item')) {
            e.target.classList.remove('dragging');
        }
    });
    municipalityList.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement) {
            const newIndex = Array.from(municipalityList.children).indexOf(draggingElement);
            if (newIndex > -1 && draggedIndex !== null) { // Varmistetaan että draggedIndex ei ole null
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
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    optimizeRouteBtn.addEventListener('click', async () => {
        const startLoc = startLocationInput.value.trim();
        if (!startLoc) return alert('Syötä lähtöpaikka!');
        if (!municipalities || municipalities.length === 0) return alert('Lisää vähintään yksi kunta.');
        routeResultDiv.style.display = 'block';
        routeResultDiv.textContent = 'Haetaan koordinaatteja... ⏳';
        const locations = [startLoc, ...municipalities.map(m => m.name)];
        const coords = {};
        for (const loc of locations) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc + ', Finland')}&format=json&limit=1`);
                if (!response.ok) throw new Error(`Verkkovastaus ei ollut kunnossa.`);
                const data = await response.json();
                if (data && data.length > 0) coords[loc] = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
                else throw new Error(`Sijaintia ei löytynyt: ${loc}`);
            } catch (error) {
                routeResultDiv.innerHTML = `❌ Virhe haettaessa sijaintia '<strong>${loc}</strong>'.`;
                return;
            }
        }
        routeResultDiv.textContent = 'Optimoidaan reittiä...';
        let unvisited = [...municipalities.map(m => m.name)];
        let currentLoc = startLoc;
        const route = [startLoc];
        const distance = (p1, p2) => Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lon - p2.lon, 2));
        while (unvisited.length > 0) {
            let nearest = unvisited.reduce((a, b) => distance(coords[currentLoc], coords[a]) < distance(coords[currentLoc], coords[b]) ? a : b);
            route.push(nearest);
            unvisited = unvisited.filter(l => l !== nearest);
            currentLoc = nearest;
        }
        const optimizedOrder = route.slice(1);
        municipalities.sort((a, b) => optimizedOrder.indexOf(a.name) - optimizedOrder.indexOf(b.name));
        const mapsUrl = `https://www.google.com/maps/dir/${route.map(r => encodeURIComponent(r)).join('/')}`;
        routeResultDiv.innerHTML = `✅ Reitti optimoitu! <a href="${mapsUrl}" target="_blank">Avaa reitti Google Mapsissa</a>`;
        saveMunicipalities();
    });
});
