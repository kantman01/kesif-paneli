const distData = { 
    "Istanbul": ["Kadıköy", "Fatih", "Üsküdar", "Beşiktaş"], 
    "Izmir": ["Selçuk", "Bergama"] 
};

function updateDistricts() {
    const city = document.getElementById('cityFilter').value;
    const dSel = document.getElementById('districtFilter');
    dSel.innerHTML = '<option value="all">Tüm İlçeler</option>';
    if(distData[city]) {
        distData[city].forEach(d => {
            let o = document.createElement('option'); o.value = d; o.text = d; dSel.add(o);
        });
    }
    applyFilters();
}

function applyFilters() {
    const q = document.getElementById('quickSearch').value.toLowerCase();
    const city = document.getElementById('cityFilter').value;
    const dist = document.getElementById('districtFilter').value;
    const civ = document.getElementById('civilizationFilter').value;

    const filtered = allData.filter(s => {
        const name = s.Name.toLowerCase();
        // Kadıköy araması Haydarpaşa'yı da kapsasın
        const isKadikoyRelated = q === "kadıköy" && (name.includes("haydarpaşa") || name.includes("kadıköy"));
        const matchesSsearch = isKadikoyRelated || name.includes(q);
        
        const matchesCity = (city === 'all' || s.Name.includes(city));
        const matchesDistrict = (dist === 'all' || s.Name.includes(dist) || (dist === "Kadıköy" && s.Name.includes("Haydarpaşa")));
        const matchesCiv = (civ === 'all' || s.Type === civ);

        return matchesSearch && matchesCity && matchesDistrict && matchesCiv;
    });

    renderMarkers(filtered);

    // KAMERA PAN & ZOOM (AKICI GEÇİŞ)
    if(filtered.length > 0) {
        // Eğer birden fazla nokta varsa merkeze odaklan, tek nokta varsa oraya uç
        const group = new L.featureGroup(markers.filter(m => filtered.some(f => f.Latitude === m.getLatLng().lat)));
        const zoomLevel = (dist !== 'all' || q !== '') ? 14 : 7;
        
        map.flyTo(group.getBounds().getCenter(), zoomLevel, {
            animate: true,
            duration: 1.5
        });
    }

    function toggleSidebar() {
    const sidebar = document.getElementById('sidebar-left');
    const openBtn = document.getElementById('open-sidebar');
    
    sidebar.classList.toggle('closed');
    
    // Sidebar kapandığında açma butonunu göster, açıldığında gizle
    if (sidebar.classList.contains('closed')) {
        setTimeout(() => { openBtn.style.display = 'block'; }, 300);
    } else {
        openBtn.style.display = 'none';
    }

    // Harita varsa, sidebar kapandıktan sonra haritayı tam ekrana yaymak için invalidateSize tetiklenebilir
    setTimeout(() => {
        if (typeof map !== 'undefined') {
            map.invalidateSize();
        }
    }, 400);
}
}