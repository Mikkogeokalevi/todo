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
    // UUDET ELEMENTIT
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
    
    const sortMunicipalities = () => {
        if (!municipalities) return;
        municipalities.sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const render = () => {
        sortMunicipalities();
        municipalityList.innerHTML = '';
        if (!municipalities) municipalities = [];
        
        municipalities.forEach((municipality) => {
            const munItem = document.createElement('li');
            munItem.className = 'municipality-item';
            // POISTETTU: draggable = true

            let cacheHtml = (municipality.caches || []).map((cache, cacheIndex) => `
                <li class="cache-item">
                    <input type="checkbox" ${cache.done ? 'checked' : ''} data-mun-id="${municipality.id}" data-cache-index="${cacheIndex}">
                    <div class="cache-info">
                        <div><span class="cache-type">${cache.type}</span><span class="${cache.done ? 'done' : ''}">${cache.name}</span></div>
                    </div>
                    <div class="cache-actions">
                        <button class="edit-cache-btn" data-mun-id="${municipality.id}" data-cache-index="${cacheIndex}">✏️</button>
                        <button class="delete-cache-btn" data-mun-id="${municipality.id}" data-cache-index="${cacheIndex}">🗑️</button>
                    </div>
                </li>
            `).join('');

            munItem.innerHTML = `
                <div class="municipality-header">
                    <div class="order-and-name">
                        <input type="number" class="order-number" value="${municipality.order}" data-id="${municipality.id}">
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
                    <button class="add-cache-btn" data-id="${municipality.id}">+</button>
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
        bulkAddSection.classList.add('hidden'); // Piilota lisäyksen jälkeen
        saveData();
    };

    // === TAPAHTUMANKÄSITTELIJÄT ===

    // Nappi kuntien lisäysosion näyttämiselle/piilottamiselle
    toggleBulkAddBtn.addEventListener('click', () => {
        bulkAddSection.classList.toggle('hidden');
    });

    bulkAddBtn.addEventListener('click', handleBulkAdd);

    // UUSI, LUOTETTAVA LOGIIKKA NUMEROJÄRJESTYSTÄ VARTEN
    municipalityList.addEventListener('change', (e) => {
        if (e.target.classList.contains('order-number')) {
            const munId = e.target.dataset.id;
            const newOrder = parseInt(e.target.value, 10);

            if (isNaN(newOrder) || newOrder < 1) {
                // Palauta vanha arvo, jos syöte on virheellinen
                render(); 
                return;
            }

            const itemToMoveIndex = municipalities.findIndex(m => m.id == munId);
            if (itemToMoveIndex === -1) return;

            // 1. Ota siirrettävä kunta talteen ja poista se listalta
            const [itemToMove] = municipalities.splice(itemToMoveIndex, 1);
            
            // 2. Lisää kunta uuteen paikkaan (varmista, ettei mennä yli rajojen)
            const newIndex = Math.max(0, Math.min(newOrder - 1, municipalities.length));
            municipalities.splice(newIndex, 0, itemToMove);
            
            // 3. Päivitä KAIKKIEN kuntien järjestysnumerot vastaamaan uutta järjestystä
            municipalities.forEach((mun, index) => {
                mun.order = index + 1;
            });
            
            // 4. Tallenna ja renderöi
            saveData();
        }
    });


    municipalityList.addEventListener('click', (e) => {
        const button = e.target.closest('button, input[type="checkbox"]');
        if (!button) return;

        const munId = button.dataset.id || button.dataset.munId;
        if (!munId) return;

        const munIndex = municipalities.findIndex(m => m.id == munId);
        if (munIndex === -1) return;
        
        const cacheIndex = button.dataset.cacheIndex;
        
        if (button.classList.contains('edit-municipality-btn')) {
            const newName = prompt("Muokkaa kunnan nimeä:", municipalities[munIndex].name);
            if (newName && newName.trim()) {
                municipalities[munIndex].name = newName.trim();
                saveData();
            }
        } else if (button.classList.contains('delete-municipality-btn')) {
            if (confirm(`Haluatko poistaa kunnan "${municipalities[munIndex].name}"?`)) {
                municipalities.splice(munIndex, 1);
                // Päivitä järjestysnumerot poiston jälkeen
                municipalities.forEach((mun, index) => mun.order = index + 1);
                saveData();
            }
        } else if (button.classList.contains('add-cache-btn')) {
            const container = button.closest('.add-cache');
            const nameInput = container.querySelector('.new-cache-name');
            const typeSelector = container.querySelector('.cache-type-selector');
            if (nameInput.value.trim()) {
                if (!municipalities[munIndex].caches) municipalities[munIndex].caches = [];
                municipalities[munIndex].caches.push({ id: Date.now(), name: nameInput.value.trim(), type: typeSelector.value, done: false });
                nameInput.value = '';
                saveData();
            }
        } else if (button.classList.contains('delete-cache-btn')) {
            if (confirm(`Poistetaanko kätkö "${municipalities[munIndex].caches[cacheIndex].name}"?`)) {
                municipalities[munIndex].caches.splice(cacheIndex, 1);
                saveData();
            }
        } else if (button.classList.contains('edit-cache-btn')) {
            const newName = prompt("Muokkaa kätkön nimeä:", municipalities[munIndex].caches[cacheIndex].name);
            if (newName && newName.trim()) {
                municipalities[munIndex].caches[cacheIndex].name = newName.trim();
                saveData();
            }
        } else if (button.type === 'checkbox') {
            const cacheMunIndex = municipalities.findIndex(m => m.id == button.dataset.munId);
            if (cacheMunIndex !== -1) {
                 municipalities[cacheMunIndex].caches[cacheIndex].done = button.checked;
                 saveData();
            }
        }
    });

    startLocationInput.addEventListener('change', () => {
        set(ref(database, 'startLocation'), startLocationInput.value);
    });

    // POISTETTU: Koko RAAHAA & PUDOTA -toiminnallisuus poistettu tarpeettomana

    // === REITIN OPTIMOINTI ===
    optimizeRouteBtn.addEventListener('click', async () => {
        // ... (Tämä funktio pysyy ennallaan)
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
