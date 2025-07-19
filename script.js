// Importoi tarvittavat funktiot Firebase SDK:sta
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // === FIREBASE-ASETUKSET ===
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

    // === DOM-ELEMENTIT ===
    const startLocationInput = document.getElementById('startLocation');
    const bulkAddInput = document.getElementById('bulkAddMunicipalities');
    const bulkAddBtn = document.getElementById('bulkAddBtn');
    const municipalityList = document.getElementById('municipalityList');
    const optimizeRouteBtn = document.getElementById('optimizeRouteBtn');
    const routeResultDiv = document.getElementById('routeResult');
    const cacheTypeSelectorTemplate = document.getElementById('cacheTypeSelector');

    // === SOVELLUKSEN TILA ===
    let municipalities = [];
    let startLocation = 'Lahti';
    
    // === FUNKTIOT ===
    const saveData = () => {
        set(ref(database), {
            municipalities: municipalities,
            startLocation: startLocationInput.value
        });
    };
    
    const normalizeOrderNumbers = () => {
        municipalities.forEach((mun, index) => {
            mun.order = index + 1;
        });
    };

    const render = () => {
        municipalityList.innerHTML = '';
        if (!municipalities) municipalities = [];
        
        municipalities.sort((a,b) => (a.order || 0) - (b.order || 0));

        municipalities.forEach((municipality, munIndex) => {
            const munItem = document.createElement('li');
            munItem.className = 'municipality-item';
            munItem.draggable = true;
            munItem.dataset.munIndex = munIndex;

            let cacheHtml = (municipality.caches || []).map((cache, cacheIndex) => `
                <li class="cache-item">
                    <input type="checkbox" ${cache.done ? 'checked' : ''} data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">
                    <div class="cache-info">
                        <div><span class="cache-type">${cache.type}</span><span class="${cache.done ? 'done' : ''}">${cache.name}</span></div>
                    </div>
                    <div class="cache-actions">
                        <button class="edit-cache-btn" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">✏️</button>
                        <button class="delete-cache-btn" data-mun-index="${munIndex}" data-cache-index="${cacheIndex}">🗑️</button>
                    </div>
                </li>
            `).join('');

            // KORJATTU OSA ALKAA: Numerokenttä ja nimi on nyt kääritty omaan div-elementtiin
            munItem.innerHTML = `
                <div class="municipality-header">
                    <div class="municipality-info">
                        <input type="number" class="municipality-order" value="${municipality.order}" data-mun-index="${munIndex}" min="1">
                        <span class="municipality-name">${municipality.name}</span>
                    </div>
                    <div class="actions">
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
            // KORJATTU OSA LOPPUU
            municipalityList.appendChild(munItem);
        });
    };

    // === DATAN KUUNTELIJA FIREBASESTA ===
    onValue(ref(database), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            municipalities = data.municipalities || [];
            startLocation = data.startLocation || 'Lahti';
            startLocationInput.value = startLocation;
            render();
        } else {
            municipalities = [];
            startLocation = 'Lahti';
            render();
        }
    });
    
    const handleBulkAdd = () => {
        if (!municipalities) municipalities = [];
        const text = bulkAddInput.value.trim();
        if (!text) return;
        const lastOrder = municipalities.length > 0 ? Math.max(...municipalities.map(m => m.order || 0)) : 0;

        const newNames = text.split(/[\n,]/).map(name => name.trim()).filter(Boolean);
        newNames.forEach((name, index) => {
            if (!municipalities.some(m => m.name.toLowerCase() === name.toLowerCase())) {
                municipalities.push({ name: name, caches: [], order: lastOrder + index + 1 });
            }
        });

        bulkAddInput.value = '';
        saveData();
    };

    // === TAPAHTUMANKÄSITTELIJÄT ===
    bulkAddBtn.addEventListener('click', handleBulkAdd);

    municipalityList.addEventListener('change', (e) => {
        if (e.target.classList.contains('municipality-order')) {
            const munIndex = parseInt(e.target.dataset.munIndex, 10);
            const newOrder = parseInt(e.target.value, 10);
            
            municipalities[munIndex].order = newOrder;
            municipalities.sort((a,b) => (a.order || 0) - (b.order || 0));
            
            normalizeOrderNumbers();
            saveData();
        }
    });

    municipalityList.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton && e.target.type !== 'checkbox') return;

        const button = targetButton || e.target;
        const munIndex = button.dataset.munIndex;
        const cacheIndex = button.dataset.cacheIndex;
        
        e.stopPropagation();

        if (button.classList.contains('edit-municipality-btn')) {
             const newName = prompt("Muokkaa kunnan nimeä:", municipalities[munIndex].name);
            if (newName && newName.trim()) municipalities[munIndex].name = newName.trim();
        } else if (button.classList.contains('delete-municipality-btn')) {
            if (confirm(`Haluatko poistaa kunnan "${municipalities[munIndex].name}"?`)) {
                municipalities.splice(munIndex, 1);
                normalizeOrderNumbers(); 
            }
        } else if (button.classList.contains('add-cache-btn')) {
            const container = button.closest('.add-cache');
            const nameInput = container.querySelector('.new-cache-name');
            const typeSelector = container.querySelector('.cache-type-selector');
            if (nameInput.value.trim()) {
                if (!municipalities[munIndex].caches) municipalities[munIndex].caches = [];
                municipalities[munIndex].caches.push({ id: Date.now(), name: nameInput.value.trim(), type: typeSelector.value, done: false });
                nameInput.value = '';
            }
        } else if (button.classList.contains('delete-cache-btn')) {
            if (confirm(`Poistetaanko kätkö "${municipalities[munIndex].caches[cacheIndex].name}"?`)) municipalities[munIndex].caches.splice(cacheIndex, 1);
        } else if (button.classList.contains('edit-cache-btn')) {
            const newName = prompt("Muokkaa kätkön nimeä:", municipalities[munIndex].caches[cacheIndex].name);
            if (newName && newName.trim()) municipalities[munIndex].caches[cacheIndex].name = newName.trim();
        } else if (button.type === 'checkbox') {
            municipalities[munIndex].caches[cacheIndex].done = button.checked;
        }
        saveData();
    });

    startLocationInput.addEventListener('change', () => {
        set(ref(database, 'startLocation'), startLocationInput.value);
    });

    // === RAAHAA & PUDOTA -TOIMINNALLISUUS ===
    let draggedIndex = null;

    municipalityList.addEventListener('dragstart', (e) => {
        if(e.target.classList.contains('municipality-item')) {
            draggedIndex = parseInt(e.target.dataset.munIndex, 10);
            setTimeout(() => e.target.classList.add('dragging'), 0);
        } else {
            e.preventDefault();
        }
    });

    municipalityList.addEventListener('dragover', (e) => e.preventDefault());
    
    municipalityList.addEventListener('dragend', (e) => {
        if(e.target.classList.contains('municipality-item')) e.target.classList.remove('dragging');
    });

    municipalityList.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement) {
            const newIndex = Array.from(municipalityList.children).indexOf(draggingElement);
            if (newIndex > -1) {
                const [removed] = municipalities.splice(draggedIndex, 1);
                municipalities.splice(newIndex, 0, removed);
                normalizeOrderNumbers(); 
                saveData();
            }
        }
    });
    
    // === REITIN OPTIMOINTI ===
    optimizeRouteBtn.addEventListener('click', async () => {
        const startLoc = startLocationInput.value.trim();
        if (!startLoc) return alert('Syötä lähtöpaikka!');
        if (!municipalities || municipalities.length === 0) return alert('Lisää vähintään yksi kunta.');

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
        
        normalizeOrderNumbers(); 
        
        const mapsUrl = `https://www.google.com/maps/dir/${route.map(r => encodeURIComponent(r)).join('/')}`;
        routeResultDiv.innerHTML = `✅ Reitti optimoitu! <a href="${mapsUrl}" target="_blank">Avaa reitti Google Mapsissa</a>`;
        
        saveData();
    });
});
