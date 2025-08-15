// Tämä on esimerkkiversio, johon on lisätty textarea-korkeuden automaattinen säätö
function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
}

// Esimerkki käytöstä kirjausten luonnissa
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('tehtava-input')) {
        autoResizeTextarea(e.target);
    }
});
