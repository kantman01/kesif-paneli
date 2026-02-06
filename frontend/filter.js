const distData = { 
    "Istanbul": ["Kadıköy", "Fatih", "Üsküdar", "Beşiktaş"], 
    "Izmir": ["Selçuk", "Bergama"] 
};

function normalizeText(value) {
    const raw = (value || '').toString().replace(/İ/g, 'I');
    return raw
        .toLowerCase()
        .replace(/i̇/g, 'i')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
}

function closeSidebarOnMobile() {
    if (window.innerWidth > 768) return;
    const sidebar = document.getElementById('sidebar-left');
    const openBtn = document.getElementById('open-sidebar');
    if (sidebar) sidebar.classList.add('closed');
    if (openBtn) openBtn.style.display = 'block';
}

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

function applyFilters() {
    const qRaw = document.getElementById('quickSearch').value;
    const q = normalizeText(qRaw);
    const city = document.getElementById('cityFilter').value;
    const dist = document.getElementById('districtFilter').value;
    const civ = document.getElementById('civilizationFilter').value;

    const filtered = allData.filter(s => {
        const name = normalizeText(s.Name);
        // Kadıköy araması Haydarpaşa'yı da kapsasın
        const isKadikoyRelated = q === "kadikoy" && (name.includes("haydarpasa") || name.includes("kadikoy"));
        const matchesSearch = !q || isKadikoyRelated || name.includes(q);
        
        const matchesCity = (city === 'all' || name.includes(normalizeText(city)));
        const matchesDistrict = (dist === 'all' || name.includes(normalizeText(dist)) || (normalizeText(dist) === "kadikoy" && name.includes("haydarpasa")));
        const matchesCiv = (civ === 'all' || s.Type === civ);

        return matchesSearch && matchesCity && matchesDistrict && matchesCiv;
    });

    renderMarkers(filtered);
    
    // Ancient sites filtreleme (hizli arama + sehir/ilce + medeniyet)
    if (typeof renderAncientSiteMarkers === 'function') {
        const qLower = q;
        const cityLower = normalizeText(city);
        const distLower = normalizeText(dist);
        const filteredAncient = allAncientSites.filter(site => {
            const name = normalizeText(site.name || '');
            const matchesSearch = !qLower || name.includes(qLower);
            const matchesCity = (city === 'all' || name.includes(cityLower));
            const matchesDistrict = (dist === 'all' || name.includes(distLower));
            const matchesCiv = (civ === 'all' || (site.type || '').includes(civ));
            return matchesSearch && matchesCity && matchesDistrict && matchesCiv;
        });
        renderAncientSiteMarkers(filteredAncient);
        
        // Medeniyet değiştiğinde ancient language slogan göster
        if (civ !== 'all') {
            showAncientSlogan(civ);
        }
    }

    // On mobile, close panel after select changes (not while typing)
    const active = document.activeElement;
    if (active && (active.id === 'cityFilter' || active.id === 'districtFilter' || active.id === 'civilizationFilter')) {
        closeSidebarOnMobile();
    }

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
}

function showAncientSlogan(civilization) {
    const slogans = {
        'Greek': {
            text: 'Γνῶθι σεαυτόν',
            translation: 'Kendini Bil (Know Thyself)'
        },
        'Roman': {
            text: 'SPQR',
            translation: 'Senatus Populusque Romanus (Roma Senatosu ve Halkı)'
        },
        'Ottoman': {
            text: 'دولت ابد مدت',
            translation: 'Devlet-i Ebed-Müddet (Ebedi Devlet)'
        }
    };
    
    const slogan = slogans[civilization];
    if (!slogan) return;
    
    const sloganDiv = document.getElementById('ancientSlogan');
    const sloganText = document.getElementById('sloganText');
    const sloganTranslation = document.getElementById('sloganTranslation');
    
    if (!sloganDiv || !sloganText || !sloganTranslation) return;
    
    sloganText.textContent = slogan.text;
    sloganTranslation.textContent = slogan.translation;
    
    // Göster
    sloganDiv.style.display = 'block';
    sloganDiv.style.opacity = '0';
    
    // Fade in
    setTimeout(() => {
        sloganDiv.style.transition = 'opacity 0.5s ease';
        sloganDiv.style.opacity = '1';
    }, 10);
    
    // 5 saniye sonra gizle
    setTimeout(() => {
        sloganDiv.style.transition = 'opacity 0.5s ease';
        sloganDiv.style.opacity = '0';
        setTimeout(() => {
            sloganDiv.style.display = 'none';
        }, 500);
    }, 5000);
}