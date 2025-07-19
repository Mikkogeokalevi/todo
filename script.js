import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
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
    const bulkAddInput = document.getElementById('bulkAddMunicipalities');
    const bulkAddBtn = document.getElementById('bulkAddBtn');
    const municipalityList = document.getElementById('municipalityList');
    const optimizeRouteBtn = document.getElementById('optimizeRouteBtn');
    const routeResultDiv = document.getElementById('routeResult');
    const cacheTypeSelectorTemplate = document.getElementById('cacheTypeSelector');
    const toggleBulkAddBtn = document.getElementById('toggleBulkAddBtn');
    const bulkAddContainer = document.getElementById('bulkAddContainer');

    let municipalities = [];
    let startLocation = '';

    const saveData = () => {
        set(ref(database, 'paalista'), {
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
    
    onValue(ref(database, 'paalista'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            municipalities = data.municipalities || [];
            startLocation = data.startLocation || '';
            startLocationInput.value = startLocation;
            render();
        } else {
            municipalities = [];
            startLocation = '';
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
            const cacheName = municipalities[munIndex].caches[cacheIndex].name;
            if (confirm(`Poistetaanko kätkö "${cacheName}"?`)) municipalities[munIndex].caches.splice(cacheIndex, 1);
        } else if (button.classList.contains('edit-cache-btn')) {
            const oldCache = municipalities[munIndex].caches[cacheIndex];
            const newName = prompt("Muokkaa kätkön nimeä:", oldCache.name);
            if (newName && newName.trim()) oldCache.name = newName.trim();
        } else if (button.type === 'checkbox') {
            municipalities[munIndex].caches[cacheIndex].done = button.checked;
        }
        saveData();
    });

    startLocationInput.addEventListener('change', () => {
        set(ref(database, 'paalista/startLocation'), startLocationInput.value);
    });

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
        saveData();
    });
});
