// Importoi tarvittavat funktiot Firebase SDK:sta
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
    
    // UUSI: Funktio kuntien järjestämiseen numeron mukaan
    const sortMunicipalities = () => {
        if (!municipalities) return;
        municipalities.sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : Infinity;
            const orderB = b.order !== undefined ? b.order : Infinity;
            return orderA - orderB;
        });
    };

    const render = () => {
        // Järjestetään kunnat aina ennen renderöintiä
        sortMunicipalities();

        municipalityList.innerHTML = '';
        if (!municipalities) municipalities = [];
        
        municipalities.forEach((municipality, munIndex) => {
            const munItem = document.createElement('li');
            munItem.className = 'municipality-item';
            munItem.draggable = true;
            // Käytetään nyt kunnan uniikkia ID:tä indeksin sijaan
            munItem.dataset.id = municipality.id; 

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

            // MUOKATTU: Lisätty numerokenttä ja data-id-attribuutit
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
            startLocation = data.startLocation || 'Lahti';
            startLocationInput.value = startLocation;
            render();
        } else {
            municipalities = [];
            startLocation = 'Lahti';
            render();
        }
    });
    
    // MUOKATTU: Lisätään kunnalle uniikki ID ja järjestysnumero
    const handleBulkAdd = () => {
        if (!municipalities) municipalities = [];
        const text = bulkAddInput.value.trim();
        if (!text) return;

        const existingNames = new Set(municipalities.map(m => m.name.toLowerCase()));
        const newNames = text.split(/[\n,]/).map(name => name.trim()).filter(Boolean);
        
        newNames.forEach(name => {
            if (!existingNames.has(name.toLowerCase())) {
                const maxOrder = municipalities.length > 0 ? Math.max(...municipalities.map(m => m.order || 0)) : 0;
                municipalities.push({ 
                    id: Date.now() + Math.random(), // Uniikki ID
                    name: name, 
                    caches: [],
                    order: maxOrder + 1 // Uusi järjestysnumero
                });
            }
        });

        bulkAddInput.value = '';
        saveData();
    };

    // === TAPAHTUMANKÄSITTELIJÄT ===
    bulkAddBtn.addEventListener('click', handleBulkAdd);

    // Yhdistetään 'click' ja 'change' kuuntelijat
    municipalityList.addEventListener('input', (e) => {
        // Kuunnellaan vain 'change' tai 'blur' numerokentälle, mutta 'input' on ok nopeaan testaukseen
        if (e.target.classList.contains('order-number')) {
            const munId = e.target.dataset.id;
            const newOrder = parseInt(e.target.value, 10);
            const munIndex = municipalities.findIndex(m => m.id == munId);
            if (munIndex !== -1) {
                municipalities[munIndex].order = isNaN(newOrder) ? municipalities[munIndex].order : newOrder;
                sortMunicipalities(); // Järjestetään heti
                saveData(); // Tallentaa ja triggeröi renderöinnin
            }
        }
    });

    municipalityList.addEventListener('click', (e) => {
        const target = e.target;
        const button = target.closest('button, input[type="checkbox"]');
        if (!button) return;

        const munId = button.dataset.id || button.dataset.munId;
        if (!munId) return;

        const munIndex = municipalities.findIndex(m => m.id == munId);
        if (munIndex === -1) return;
        
        const cacheIndex = button.dataset.cacheIndex;
        
        if (button.classList.contains('edit-municipality-btn')) {
            const newName = prompt("Muokkaa kunnan nimeä:", municipalities[munIndex].name);
            if (newName && newName.trim()) municipalities[munIndex].name = newName.trim();
        } else if (button.classList.contains('delete-municipality-btn')) {
            if (confirm(`Haluatko poistaa kunnan "${municipalities[munIndex].name}"?`)) {
                municipalities.splice(munIndex, 1);
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
            if (confirm(`Poistetaanko kätkö "${municipalities[munIndex].caches[cacheIndex].name}"?`)) {
                municipalities[munIndex].caches.splice(cacheIndex, 1);
            }
        } else if (button.classList.contains('edit-cache-btn')) {
            const newName = prompt("Muokkaa kätkön nimeä:", municipalities[munIndex].caches[cacheIndex].name);
            if (newName && newName.trim()) municipalities[munIndex].caches[cacheIndex].name = newName.trim();
        } else if (button.type === 'checkbox') {
            const cacheMunIndex = municipalities.findIndex(m => m.id == button.dataset.munId);
            if (cacheMunIndex !== -1) {
                 municipalities[cacheMunIndex].caches[cacheIndex].done = button.checked;
            }
        }
        saveData();
    });

    startLocationInput.addEventListener('change', () => {
        set(ref(database, 'startLocation'), startLocationInput.value);
    });

    // === RAAHAA & PUDOTA -TOIMINNALLISUUS ===
    let draggedId = null;

    municipalityList.addEventListener('dragstart', (e) => {
        if(e.target.classList.contains('municipality-item')) {
            draggedId = e.target.dataset.id;
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
    
    // MUOKATTU: Päivitetään järjestysnumerot pudotuksen jälkeen
    municipalityList.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement) return;
        draggingElement.classList.remove('dragging');

        const draggedItemIndex = municipalities.findIndex(m => m.id == draggedId);
        const [removed] = municipalities.splice(draggedItemIndex, 1);
        
        const newIndex = Array.from(municipalityList.children).indexOf(draggingElement);
        municipalities.splice(newIndex, 0, removed);

        // Päivitä kaikkien kuntien järjestysnumerot
        municipalities.forEach((mun, index) => {
            mun.order = index + 1;
        });

        saveData(); // Tallentaa uudet järjestysnumerot ja päivittää näkymän
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

    // === REITIN OPTIMOINTI ===
    optimizeRouteBtn.addEventListener('click', async () => {
        const startLoc = startLocationInput.value.trim();
        if (!startLoc) return alert('Syötä lähtöpaikka!');
        if (!municipalities || municipalities.length === 0) return alert('Lisää vähintään yksi kunta.');
        
        // Varmistetaan että reitti optimoidaan nykyisessä järjestyksessä
        sortMunicipalities();

        routeResultDiv.textContent = 'Haetaan koordinaatteja... ⏳';
        
        const locations = [startLoc, ...municipalities.map(m => m.name)];
        const coords = {};
        
        //... (Loppuosa funktiosta pysyy ennallaan, mutta pieni korjaus Google Maps -linkkiin)
        
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
        
        // Päivitetään kuntien järjestys optimoinnin perusteella
        const optimizedOrder = route.slice(1);
        municipalities.forEach(mun => {
            mun.order = optimizedOrder.indexOf(mun.name) + 1;
        });
        
        const mapsUrl = `https://www.google.com/maps/dir/${route.map(r => encodeURIComponent(r)).join('/')}`;
        routeResultDiv.innerHTML = `✅ Reitti optimoitu! Järjestys päivitetty. <a href="${mapsUrl}" target="_blank">Avaa reitti Google Mapsissa</a>`;
        
        saveData();
    });
});
