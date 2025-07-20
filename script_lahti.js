import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // Kuntadata pysyy ennallaan...
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

    let municipalities = [];
    let map;
    let userMarker;
    let trackingWatcher = null;
    let lastCheckedMunicipality = null;
    let municipalityMarkers = [];
    let cacheMarkers = [];
    let clickMarker = null;

    const parseDDMCoordinates = (str) => {
        if (!str) return null;
        let cleaned = str.toUpperCase().replace(/,/g, '.').replace(/°|´|`|'/g, ' ').replace(/([NSEW])/g, ' $1 ').replace(/\s+/g, ' ').trim();
        const latRegex = /([NS])\s*(\d{1,2})\s+([\d\.]+)/;
        const lonRegex = /([EW])\s*(\d{1,3})\s+([\d\.]+)/;
        let latMatch = cleaned.match(latRegex);
        const lonMatch = cleaned.match(lonRegex);
        if (!latMatch && lonMatch) {
            const potentialLatStr = cleaned.split(lonMatch[0])[0].trim();
            const latParts = potentialLatStr.split(/\s+/);
            if (latParts.length === 2) {
                const latDeg = parseFloat(latParts[0]);
                const latMin = parseFloat(latParts[1]);
                if (!isNaN(latDeg) && !isNaN(latMin)) {
                    latMatch = ["", 'N', latDeg.toString(), latMin.toString()];
                }
            }
        }
        if (!latMatch || !lonMatch) return null;
        try {
          let lat = parseFloat(latMatch[2]) + parseFloat(latMatch[3]) / 60.0;
          if (latMatch[1] === 'S') lat = -lat;
          let lon = parseFloat(lonMatch[2]) + parseFloat(lonMatch[3]) / 60.0;
          if (lonMatch[1] === 'W') lon = -lon;
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

    const handleMapClick = async (e) => {
        if (trackingWatcher) return;
        const { lat, lng } = e.latlng;
        if (clickMarker) clickMarker.removeFrom(map);
        clickMarker = L.marker([lat, lng]).addTo(map);
        clickMarker.bindPopup('Haetaan kuntaa...').openPopup();
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10`);
            if (!response.ok) throw new Error('Haku epäonnistui');
            const data = await response.json();
            const municipalityName = getMunicipalityFromResponse(data) || 'Tuntematon sijainti';
            clickMarker.getPopup().setContent(`<b>${municipalityName}</b>`);
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

    const showNotification = (message) => {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => { notification.remove(); }, 5000);
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
        municipalityMarkers.forEach(marker => marker.removeFrom(map));
        municipalityMarkers = [];
        cacheMarkers.forEach(marker => marker.removeFrom(map));
        cacheMarkers = [];
        
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

        if (bounds.length > 0 && !trackingWatcher) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    };

    const checkCurrentMunicipality = async (lat, lon) => {
        updateStatusDisplay({ municipality: null, lat, lon });
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
                    showNotification(`Saavuit kuntaan: ${currentMunicipality}!`);
                    const munElement = document.getElementById(`mun-item-${foundMunIndex}`);
                    if (munElement) munElement.classList.add('highlight');
                }
            }
        } catch (error) { console.error("Kuntatarkistusvirhe:", error); }
    };

    const toggleTracking = () => {
        if (clickMarker) { clickMarker.removeFrom(map); clickMarker = null; }
        if (trackingWatcher) {
            navigator.geolocation.clearWatch(trackingWatcher);
            trackingWatcher = null;
            toggleTrackingBtn.textContent = '🛰️ Aloita seuranta';
            toggleTrackingBtn.classList.remove('tracking-active');
            lastCheckedMunicipality = null;
            updateStatusDisplay(null);
            updateAllMarkers();
        } else {
            if (!("geolocation" in navigator)) return alert("Selaimesi ei tue paikannusta.");
            trackingWatcher = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (map && userMarker) {
                        userMarker.setLatLng([latitude, longitude]);
                        if (!map.getBounds().contains(userMarker.getLatLng())) map.setView([latitude, longitude], 13);
                        checkCurrentMunicipality(latitude, longitude);
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
                } else {
                    cacheNameDisplay = cacheName;
                }
                const coordsSetClass = (cache.lat && cache.lon) ? 'coords-set' : '';
                return `<li class="cache-item"><input type="checkbox" ${cache.done ? 'checked' : ''} data-mun-index="${munIndex}" data-cache-index="${cacheIndex}"><div class="cache-info"><div><span class="cache-type">${cache.type}</span><span class="${cache.done ? 'done' : ''}">${cacheNameDisplay}</span></div></div><div class="cache-actions"><button class="set-coords-btn ${coordsSetClass}" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">📍</button><button class="edit-cache-btn" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">✏️</button><button class="delete-cache-btn" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">🗑️</button></div></li>`;
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
            munItem.innerHTML = `<div class="municipality-header"><a class="municipality-name-link" href="https://www.geocache.fi/stat/other/jakauma.php?kuntalista=${encodeURIComponent(kunnanNimi)}" target="_blank" rel="noopener noreferrer">${kunnanNimi}</a><div class="actions">${pgcLinkHtml}<button class="edit-municipality-btn" title="Muokkaa kunnan nimeä" data-mun-index="${munIndex}">✏️</button><button class="delete-municipality-btn" title="Poista kunta" data-mun-index="${munIndex}">🗑️</button></div></div><ul class="cache-list">${cacheHtml}</ul><div class="add-cache"><input type="text" class="new-cache-name" placeholder="Kätkön nimi tai GC-koodi">${cacheTypeSelectorTemplate.innerHTML}<button class="add-cache-btn" data-mun-index="${munIndex}">+</button></div>`;
            municipalityList.appendChild(munItem);
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
                        mun.lat = parseFloat(data[0].lat);
                        mun.lon = parseFloat(data[0].lon);
                        didChange = true;
                    }
                } catch (error) { console.error("Koordinaattien haku epäonnistui kunnalle:", mun.name, error); }
            }
        }
        if (didChange) { console.log("Paikannettiin puuttuvia koordinaatteja, tallennetaan..."); saveMunicipalities(); }
    };
    
    initMap();

    // TÄRKEÄÄ: Tämä käyttää `lahti_lista`-polkua
    onValue(ref(database, 'lahti_lista'), (snapshot) => {
        const data = snapshot.val();
        municipalities = (data && data.pgcProfileName !== undefined) ? (data.municipalities || []) : [];
        pgcProfileNameInput.value = data ? data.pgcProfileName || '' : '';
        render();
        ensureAllCoordsAreFetched(municipalities);
        updateAllMarkers();
    });

    // TÄRKEÄÄ: Tämä käyttää `lahti_lista`-polkua
    const saveMunicipalities = () => set(ref(database, 'lahti_lista/municipalities'), municipalities);
    const savePgcProfileName = () => set(ref(database, 'lahti_lista/pgcProfileName'), pgcProfileNameInput.value);

    const handleBulkAdd = async () => {
        const text = bulkAddInput.value.trim();
        if (!text) return;
        bulkAddBtn.disabled = true;
        bulkAddBtn.textContent = 'Haetaan...';
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
        bulkAddInput.value = '';
        bulkAddBtn.disabled = false;
        bulkAddBtn.textContent = 'Lisää listasta';
        saveMunicipalities();
    };

    toggleBulkAddBtn.addEventListener('click', () => {
        const isHidden = bulkAddContainer.classList.toggle('hidden');
        toggleBulkAddBtn.textContent = isHidden ? 'Lisää kunnat listana' : 'Piilota lisäysalue';
    });

    bulkAddBtn.addEventListener('click', handleBulkAdd);

    municipalityList.addEventListener('click', (e) => {
        const button = e.target.closest('button, input[type="checkbox"]');
        if (!button) return;
        const munIndex = button.dataset.munIndex;
        if (munIndex === undefined) return;
        let needsSave = false;
        let needsRender = false;

        if (button.classList.contains('set-coords-btn')) {
            const cache = municipalities[munIndex].caches[button.dataset.cacheIndex];
            const currentCoords = cache.lat ? `${cache.lat} ${cache.lon}` : '';
            const input = prompt(`Syötä kätkön "${cache.name}" koordinaatit:`, currentCoords);
            if(input === null) return;
            const coords = parseDDMCoordinates(input); // KÄYTETÄÄN UUTTA FUNKTIOTA
            if(coords) {
                cache.lat = coords.lat;
                cache.lon = coords.lon;
                needsSave = true;
                needsRender = true;
            } else if (input.trim() === '') {
                delete cache.lat;
                delete cache.lon;
                needsSave = true;
                needsRender = true;
            } else {
                alert("Virheellinen koordinaattimuoto.\nEsimerkki: N 60 58.794 E 26 11.341");
            }
        }
        else if (button.classList.contains('edit-municipality-btn')) {
            const oldName = municipalities[munIndex].name;
            const newName = prompt("Muokkaa kunnan nimeä:", oldName);
            if (newName && newName.trim() && newName.trim().toLowerCase() !== oldName.toLowerCase()) {
                municipalities[munIndex].name = newName.trim();
                delete municipalities[munIndex].lat;
                delete municipalities[munIndex].lon;
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
                municipalities[munIndex].caches.push({ id: Date.now(), name: nameInput.value.trim(), type: container.querySelector('.cache-type-selector').value, done: false });
                nameInput.value = '';
                needsSave = true; needsRender = true;
            }
        } else if (button.classList.contains('delete-cache-btn')) {
            if (confirm(`Poistetaanko kätkö "${municipalities[munIndex].caches[button.dataset.cacheIndex].name}"?`)) {
                municipalities[munIndex].caches.splice(button.dataset.cacheIndex, 1);
                needsSave = true; needsRender = true;
            }
        } else if (button.classList.contains('edit-cache-btn')) {
            const cache = municipalities[munIndex].caches[button.dataset.cacheIndex];
            const newName = prompt("Muokkaa kätkön nimeä:", cache.name);
            if (newName && newName.trim()) {
                cache.name = newName.trim();
                needsSave = true; needsRender = true;
            }
        } else if (button.type === 'checkbox') {
            const cache = municipalities[munIndex].caches[button.dataset.cacheIndex];
            cache.done = button.checked;
            needsSave = true; needsRender = true;
        }
        if (needsSave) saveMunicipalities();
        if (needsRender) { render(); updateAllMarkers(); }
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
