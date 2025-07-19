// Importoi tarvittavat funktiot Firebase SDK:sta
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // === FIREBASE-ASETUKSET ===
    // TÄRKEÄÄ: LIITÄ UUSI, RAJOITETTU API-AVAIMESI TÄHÄN!
    const firebaseConfig = {
        apiKey: "AIzaSyA1OgSGhgYgmxDLv7-xkPPsUGCpcxFaI8M",
        authDomain: "geokatkosuunnittelija.firebaseapp.com",
        databaseURL: "https://geokatkosuunnittelija-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "geokatkosuunnittelija",
        storageBucket: "geokatkosuunnittelija.appspot.com",
        messagingSenderId: "745498680990",
        appId: "1:745498680990:web:869074eb0f0b72565ca58f"
    };

    // Alustetaan Firebase modernilla syntaksilla
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
        // Käyttää modernia set-funktiota
        set(ref(database), {
            municipalities: municipalities,
            startLocation: startLocationInput.value
        });
    };

    const render = () => {
        municipalityList.innerHTML = '';
        if (!municipalities) municipalities = [];
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

            munItem.innerHTML = `
                <div class="municipality-header">
                    <span>${municipality.name}</span>
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
            // Jos tietokanta on täysin tyhjä, alustetaan tyhjillä arvoilla
            municipalities = [];
            startLocation = 'Lahti';
            render();
        }
    });
    
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
        saveData();
    };

    // === TAPAHTUMANKÄSITTELIJÄT ===
    bulkAddBtn.addEventListener('click', handleBulkAdd);

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
            if (confirm(`Haluatko poistaa kunnan "${municipalities[munIndex].name}"?`)) municipalities.splice(munIndex, 1);
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
        // Tallennetaan vain lähtöpaikka, ei koko dataa turhaan
        set(ref(database, 'startLocation'), startLocationInput.value);
    });

    // === RAAHAA & PUDOTA -TOIMINNALLISUUS ===
    let draggedIndex = null;

    municipalityList.addEventListener('dragstart', (e) => {
        // Varmistetaan, että raahaus alkaa vain listan itemistä, ei napeista
        if(e.target.classList.contains('municipality-item')) {
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
        if(e.target.classList.contains('municipality-item')) {
            e.target.classList.remove('dragging');
        }
    });

    municipalityList.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement) {
            const newIndex = Array.from(municipalityList.children).indexOf(draggingElement);
            if (newIndex > -1) {
                const [removed] = municipalities.splice(draggedIndex, 1);
                municipalities.splice(newIndex, 0, removed);
                saveData();
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
        
        const mapsUrl = `https://www.google.com/maps/dir/${route.map(r => encodeURIComponent(r)).join('/')}`;
        routeResultDiv.innerHTML = `✅ Reitti optimoitu! <a href="${mapsUrl}" target="_blank">Avaa reitti Google Mapsissa</a>`;
        
        saveData();
    });
});
