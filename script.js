import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // === FIREBASE-ASETUKSET ===
    const firebaseConfig = {
        apiKey: "AIzaSyA1OgSGhgYgmxDLv7-xkPPsUGCpcxFaI8M", // VAIHDA TÄHÄN OMA API-AVAIMESI
        authDomain: "geokatkosuunnittelija.firebaseapp.com",
        databaseURL: "https://geokatkosuunnittelija-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "geokatkosuunnittelija",
        storageBucket: "geokatkosuunnittelija.appspot.com",
        messagingSenderId: "745498680990",
        appId: "1:745498680990:web:869074eb0f0b72565ca58f"
    };

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    // === DOM-ELEMENTIT ===
    const startLocationInput = document.getElementById('startLocation');
    const bulkAddInput = document.getElementById('bulkAddMunicipalities');
    const bulkAddBtn = document.getElementById('bulkAddBtn');
    const municipalityList = document.getElementById('municipalityList');
    const optimizeRouteBtn = document.getElementById('optimizeRouteBtn');
    const routeResultDiv = document.getElementById('routeResult');
    const cacheTypeSelectorTemplate = document.getElementById('cacheTypeSelector');
    const toggleBulkAddBtn = document.getElementById('toggleBulkAddBtn');
    const bulkAddSection = document.getElementById('bulkAddSection');

    // === SOVELLUKSEN TILA ===
    let municipalities = [];
    
    // === FUNKTIOT ===
    const saveData = () => {
        set(ref(database), {
            municipalities: municipalities,
            startLocation: startLocationInput.value
        });
    };
    
    // KORJATTU LAJITTELUFUNKTIO
    const sortMunicipalities = () => {
        if (!municipalities) return;
        municipalities.sort((a, b) => {
            const orderA = a.order || 0;
            const orderB = b.order || 0;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return a.name.localeCompare(b.name, 'fi');
        });
    };

    const render = () => {
        sortMunicipalities();
        municipalityList.innerHTML = '';
        if (!municipalities) municipalities = [];
        
        municipalities.forEach((municipality) => {
            const munItem = document.createElement('li');
            munItem.className = 'municipality-item';

            let cacheHtml = (municipality.caches || []).map((cache, cacheIndex) => `
                <li class="cache-item">
                    <input type="checkbox" ${cache.done ? 'checked' : ''} data-mun-id="${municipality.id}" data-cache-index="${cacheIndex}">
                    <div class="cache-info">
                        <div><span class="cache-type">${cache.type}</span><span class="${cache.done ? 'done' : ''}">${cache.name}</span></div>
                    </div>
                    <div class="cache-actions">
                        <button class="edit-cache-btn" title="Muokkaa kätköä" data-mun-id="${municipality.id}" data-cache-index="${cacheIndex}">✏️</button>
                        <button class="delete-cache-btn" title="Poista kätkö" data-mun-id="${municipality.id}" data-cache-index="${cacheIndex}">🗑️</button>
                    </div>
                </li>
            `).join('');

            munItem.innerHTML = `
                <div class="municipality-header">
                    <div class="order-and-name">
                        <input type="number" class="order-number" value="${municipality.order}" min="1" data-id="${municipality.id}">
                        <span>${municipality.name}</span>
                    </div>
                    <div class="actions">
                        <button class="edit-municipality-btn" title="Muokkaa kunnan nimeä" data-id="${municipality.id}">✏️</button>
                        <button class="delete-municipality-btn" title="Poista kunta" data-id="${municipality.id}">🗑️</button>
                    </div>
                </div>
                <ul class="cache-list">${cacheHtml}</ul>
                <div class="add-cache">
                    <input type="text" class="new-cache-name" placeholder="Kätkön nimi tai GC-koodi">
                    ${cacheTypeSelectorTemplate.innerHTML}
                    <button class="add-cache-btn" title="Lisää kätkö" data-id="${municipality.id}">+</button>
                </div>
            `;
            municipalityList.appendChild(munItem);
        });
    };

    // === DATAN KUUNTELIJA FIREBASESTA ===
    onValue(ref(database), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            municipalities = data.municipalities || [];
            startLocationInput.value = data.startLocation || 'Lahti';
            render();
        }
    });
    
    const handleBulkAdd = () => {
        if (!municipalities) municipalities = [];
        const text = bulkAddInput.value.trim();
        if (!text) return;

        const existingNames = new Set(municipalities.map(m => m.name.toLowerCase()));
        const newNames = text.split(/[\n,]/).map(name => name.trim()).filter(Boolean);
        
        const maxOrder = municipalities.length > 0 ? Math.max(...municipalities.map(m => m.order || 0)) : 0;
        let currentOrder = maxOrder;

        newNames.forEach(name => {
            if (!existingNames.has(name.toLowerCase())) {
                currentOrder++;
                municipalities.push({ 
                    id: Date.now() + Math.random(),
                    name: name, 
                    caches: [],
                    order: currentOrder
                });
            }
        });

        bulkAddInput.value = '';
        bulkAddSection.classList.add('hidden');
        saveData();
    };

    // === TAPAHTUMANKÄSITTELIJÄT ===
    toggleBulkAddBtn.addEventListener('click', () => {
        bulkAddSection.classList.toggle('hidden');
    });

    bulkAddBtn.addEventListener('click', handleBulkAdd);

    // KORJATTU: Kaksi erillistä, toimivaa käsittelijää klikkauksille ja numeron muutoksille
    
    // 1. Käsittelijä numerokentän muutoksille
    municipalityList.addEventListener('change', (e) => {
        if (e.target.classList.contains('order-number')) {
            const munId = e.target.dataset.id;
            const newOrder = parseInt(e.target.value, 10);
            const mun = municipalities.find(m => m.id == munId);

            if (mun) {
                mun.order = (!isNaN(newOrder) && newOrder > 0) ? newOrder : 1;
                saveData();
            }
        }
    });

    // 2. Käsittelijä kaikille nappien ja checkboxien klikkauksille
    municipalityList.addEventListener('click', (e) => {
        const target = e.target.closest('button, input[type="checkbox"]');
        if (!target) return;

        const munId = target.dataset.id || target.dataset.munId;
        if (!munId) return;

        const munIndex = municipalities.findIndex(m => m.id == munId);
        if (munIndex === -1) return;

        const municipality = municipalities[munIndex];
        const cacheIndex = target.dataset.cacheIndex;

        // Kunnan muokkaus
        if (target.classList.contains('edit-municipality-btn')) {
            const newName = prompt("Muokkaa kunnan nimeä:", municipality.name);
            if (newName && newName.trim()) {
                municipality.name = newName.trim();
                saveData();
            }
        }
        // Kunnan poisto
        else if (target.classList.contains('delete-municipality-btn')) {
            if (confirm(`Haluatko poistaa kunnan "${municipality.name}"?`)) {
                municipalities.splice(munIndex, 1);
                saveData();
            }
        }
        // Kätkön lisäys
        else if (target.classList.contains('add-cache-btn')) {
            const container = target.closest('.add-cache');
            const nameInput = container.querySelector('.new-cache-name');
            const typeSelector = container.querySelector('.cache-type-selector');
            if (nameInput.value.trim()) {
                if (!municipality.caches) municipality.caches = [];
                municipality.caches.push({ id: Date.now(), name: nameInput.value.trim(), type: typeSelector.value, done: false });
                nameInput.value = '';
                saveData();
            }
        }
        // Kätkön poisto
        else if (target.classList.contains('delete-cache-btn')) {
            if (confirm(`Poistetaanko kätkö "${municipality.caches[cacheIndex].name}"?`)) {
                municipality.caches.splice(cacheIndex, 1);
                saveData();
            }
        }
        // Kätkön muokkaus
        else if (target.classList.contains('edit-cache-btn')) {
            const newName = prompt("Muokkaa kätkön nimeä:", municipality.caches[cacheIndex].name);
            if (newName && newName.trim()) {
                municipality.caches[cacheIndex].name = newName.trim();
                saveData();
            }
        }
        // Checkboxin tila
        else if (target.type === 'checkbox') {
            municipality.caches[cacheIndex].done = target.checked;
            saveData();
        }
    });

    startLocationInput.addEventListener('change', () => {
        set(ref(database, 'startLocation'), startLocationInput.value);
    });

    // === REITIN OPTIMOINTI ===
    optimizeRouteBtn.addEventListener('click', async () => {
        const startLoc = startLocationInput.value.trim();
        if (!startLoc) return alert('Syötä lähtöpaikka!');
        if (!municipalities || municipalities.length === 0) return alert('Lisää vähintään yksi kunta.');
        sortMunicipalities();
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
        municipalities.forEach(mun => {
            mun.order = optimizedOrder.indexOf(mun.name) + 1;
        });
        const mapsUrl = `https://www.google.com/maps/dir/${route.map(r => encodeURIComponent(r)).join('/')}`;
        routeResultDiv.innerHTML = `✅ Reitti optimoitu! Järjestys päivitetty. <a href="${mapsUrl}" target="_blank">Avaa reitti Google Mapsissa</a>`;
        saveData();
    });
});
