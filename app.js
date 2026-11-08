// ==========================================
//  WARDROBE MANAGER - Sistem Pengelola Lemari Pakaian
// ==========================================

// ====== DATA STORE ======
const Store = {
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    },
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
};

// State
let clothes = Store.get('wardrobe_clothes');
let favorites = Store.get('wardrobe_favorites');
let schedules = Store.get('wardrobe_schedules');
let currentGroupTab = 'color';

// Outfit registry — stores generated outfits by index so we can reference them
// from onclick handlers without inlining JSON into attributes.
let outfitRegistry = [];

// ====== COLOR MAPPING ======
const COLOR_MAP = {
    'Hitam': '#1a1a1a',
    'Putih': '#f5f5f5',
    'Merah': '#e74c3c',
    'Biru': '#3498db',
    'Hijau': '#27ae60',
    'Kuning': '#f1c40f',
    'Abu-abu': '#95a5a6',
    'Coklat': '#8B4513',
    'Pink': '#e91e90',
    'Ungu': '#9b59b6',
    'Orange': '#e67e22',
    'Krem': '#d4c5a9',
    'Navy': '#1a3a5c',
    'Maroon': '#800000'
};

const COLOR_EMOJI = {
    'Hitam': '⬛', 'Putih': '⬜', 'Merah': '🟥', 'Biru': '🟦',
    'Hijau': '🟩', 'Kuning': '🟨', 'Abu-abu': '🔲', 'Coklat': '🟫',
    'Pink': '💗', 'Ungu': '🟪', 'Orange': '🟧', 'Krem': '🔳',
    'Navy': '🔵', 'Maroon': '🔴'
};

const CATEGORY_ICON = {
    'Baju': '👕', 'Celana': '👖', 'Rok': '👗', 'Jaket': '🧥',
    'Dress': '👗', 'Aksesoris': '💍', 'Sepatu': '👟', 'Lainnya': '🧢'
};

// ====== COLOR HARMONY RULES ======
const COLOR_HARMONIES = {
    'Hitam':    { complementary: ['Putih', 'Merah', 'Kuning'], analogous: ['Abu-abu', 'Navy'] },
    'Putih':    { complementary: ['Hitam', 'Navy', 'Merah'], analogous: ['Krem', 'Abu-abu'] },
    'Merah':    { complementary: ['Hitam', 'Putih', 'Abu-abu'], analogous: ['Maroon', 'Orange', 'Pink'] },
    'Biru':     { complementary: ['Putih', 'Krem', 'Orange'], analogous: ['Navy', 'Ungu'] },
    'Hijau':    { complementary: ['Putih', 'Krem', 'Coklat'], analogous: ['Kuning', 'Biru'] },
    'Kuning':   { complementary: ['Hitam', 'Navy', 'Abu-abu'], analogous: ['Orange', 'Krem'] },
    'Abu-abu':  { complementary: ['Hitam', 'Putih', 'Merah'], analogous: ['Hitam', 'Putih'] },
    'Coklat':   { complementary: ['Putih', 'Krem', 'Biru'], analogous: ['Orange', 'Krem'] },
    'Pink':     { complementary: ['Hitam', 'Putih', 'Abu-abu'], analogous: ['Merah', 'Ungu'] },
    'Ungu':     { complementary: ['Putih', 'Kuning', 'Krem'], analogous: ['Pink', 'Biru', 'Navy'] },
    'Orange':   { complementary: ['Hitam', 'Navy', 'Putih'], analogous: ['Kuning', 'Merah', 'Coklat'] },
    'Krem':     { complementary: ['Coklat', 'Navy', 'Hitam'], analogous: ['Putih', 'Coklat'] },
    'Navy':     { complementary: ['Putih', 'Krem', 'Kuning'], analogous: ['Biru', 'Hitam'] },
    'Maroon':   { complementary: ['Putih', 'Krem', 'Abu-abu'], analogous: ['Merah', 'Coklat'] }
};

// ====== OUTFIT STYLING TIPS ======
const STYLE_TIPS = {
    casual: [
        "Padukan dengan sneakers putih untuk kesan santai",
        "Tambahkan tote bag untuk melengkapi penampilan casual",
        "Gulung lengan baju untuk tampilan rileks",
        "Layer dengan jaket denim untuk sentuhan extra",
        "Cocok dipakai untuk hangout atau jalan-jalan santai"
    ],
    formal: [
        "Padukan dengan sepatu pantofel untuk kesan profesional",
        "Tambahkan jam tangan elegan sebagai aksesoris",
        "Pastikan pakaian tersetrika rapi",
        "Cocok untuk meeting atau acara resmi",
        "Tambahkan belt matching untuk kesan lebih polished"
    ],
    sporty: [
        "Padukan dengan sepatu running yang nyaman",
        "Gunakan backpack sporty untuk melengkapi look",
        "Cocok untuk kegiatan outdoor atau olahraga ringan",
        "Tambahkan cap atau sunglasses untuk sentuhan sporty",
        "Pilih bahan yang breathable dan stretchy"
    ],
    elegant: [
        "Tambahkan perhiasan minimalis untuk sentuhan elegan",
        "Padukan dengan heels atau loafers berkualitas",
        "Cocok untuk dinner atau acara spesial",
        "Gunakan clutch bag untuk melengkapi penampilan",
        "Perhatikan detail seperti lipatan dan draping"
    ]
};

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderWardrobe();
    updateFilterOptions();
    updateTotalCount();
});

// ====== NAVIGATION ======
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            switchPage(page);
        });
    });
}

function switchPage(pageName) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${pageName}"]`).classList.add('active');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageName}`).classList.add('active');

    if (pageName === 'grouping') renderGrouping();
    if (pageName === 'outfits') generateOutfits();
    if (pageName === 'favorites') renderFavorites();
    if (pageName === 'schedule') renderSchedule();
}

// ====== WARDROBE CRUD ======
function openAddModal(editId = null) {
    const modal = document.getElementById('modal-add');
    const title = document.getElementById('modal-add-title');
    const form = document.getElementById('form-add-clothes');

    form.reset();
    document.getElementById('edit-id').value = '';

    if (editId) {
        const item = clothes.find(c => c.id === editId);
        if (item) {
            title.textContent = 'Edit Pakaian';
            document.getElementById('edit-id').value = item.id;
            document.getElementById('clothes-name').value = item.name;
            document.getElementById('clothes-category').value = item.category;
            document.getElementById('clothes-color').value = item.color;
            document.getElementById('clothes-motif').value = item.motif;
            document.getElementById('clothes-fabric').value = item.fabric;
            document.getElementById('clothes-style').value = item.style || 'casual';
            document.getElementById('clothes-notes').value = item.notes || '';
        }
    } else {
        title.textContent = 'Tambah Pakaian Baru';
    }

    modal.classList.add('show');
}

function saveClothes(event) {
    event.preventDefault();

    const editId = document.getElementById('edit-id').value;
    const item = {
        id: editId || 'cl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: document.getElementById('clothes-name').value.trim(),
        category: document.getElementById('clothes-category').value,
        color: document.getElementById('clothes-color').value,
        motif: document.getElementById('clothes-motif').value,
        fabric: document.getElementById('clothes-fabric').value,
        style: document.getElementById('clothes-style').value,
        notes: document.getElementById('clothes-notes').value.trim(),
        createdAt: editId ? (clothes.find(c => c.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    if (editId) {
        const index = clothes.findIndex(c => c.id === editId);
        if (index !== -1) clothes[index] = item;
        showToast('Pakaian berhasil diperbarui!', 'success');
    } else {
        clothes.push(item);
        showToast('Pakaian berhasil ditambahkan!', 'success');
    }

    Store.set('wardrobe_clothes', clothes);
    closeModal('modal-add');
    renderWardrobe();
    updateFilterOptions();
    updateTotalCount();
}

function deleteClothes(id) {
    if (!confirm('Hapus pakaian ini dari lemari?')) return;

    clothes = clothes.filter(c => c.id !== id);
    Store.set('wardrobe_clothes', clothes);

    // Remove from favorites that include this item
    favorites = favorites.filter(fav => !fav.items.some(item => item.id === id));
    Store.set('wardrobe_favorites', favorites);

    // Remove from schedules that include this item
    schedules = schedules.filter(s => !s.outfit.items.some(item => item.id === id));
    Store.set('wardrobe_schedules', schedules);

    renderWardrobe();
    updateFilterOptions();
    updateTotalCount();
    showToast('Pakaian dihapus', 'info');
}

// ====== RENDER WARDROBE ======
function renderWardrobe() {
    const grid = document.getElementById('wardrobe-grid');
    const empty = document.getElementById('empty-wardrobe');
    const filtered = getFilteredClothes();

    if (clothes.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.style.display = 'grid';

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <span class="empty-icon">🔍</span>
                <h3>Tidak ditemukan</h3>
                <p>Coba ubah filter pencarian</p>
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map(item => `
        <div class="clothes-card">
            <div class="clothes-card-header">
                <h4>${CATEGORY_ICON[item.category] || '🧢'} ${escapeHtml(item.name)}</h4>
                <div class="clothes-card-actions">
                    <button onclick="openAddModal('${item.id}')" title="Edit">✏️</button>
                    <button onclick="deleteClothes('${item.id}')" title="Hapus">🗑️</button>
                </div>
            </div>
            <span class="clothes-category-badge badge-${item.category}">${item.category}</span>
            <div class="clothes-details">
                <div class="clothes-detail">
                    <span class="clothes-detail-label">Warna</span>
                    <span class="color-dot" style="background:${COLOR_MAP[item.color] || '#888'}"></span>
                    <span>${item.color}</span>
                </div>
                <div class="clothes-detail">
                    <span class="clothes-detail-label">Motif</span>
                    <span>${item.motif}</span>
                </div>
                <div class="clothes-detail">
                    <span class="clothes-detail-label">Bahan</span>
                    <span>${item.fabric}</span>
                </div>
                <div class="clothes-detail">
                    <span class="clothes-detail-label">Gaya</span>
                    <span>${capitalizeFirst(item.style || 'casual')}</span>
                </div>
            </div>
            ${item.notes ? `<div class="clothes-notes">📝 ${escapeHtml(item.notes)}</div>` : ''}
        </div>
    `).join('');
}

function getFilteredClothes() {
    const category = document.getElementById('filter-category').value;
    const color = document.getElementById('filter-color').value;
    const search = document.getElementById('filter-search').value.toLowerCase();

    return clothes.filter(item => {
        if (category !== 'all' && item.category !== category) return false;
        if (color !== 'all' && item.color !== color) return false;
        if (search && !item.name.toLowerCase().includes(search) &&
            !item.category.toLowerCase().includes(search) &&
            !item.motif.toLowerCase().includes(search) &&
            !item.fabric.toLowerCase().includes(search)) return false;
        return true;
    });
}

function filterWardrobe() {
    renderWardrobe();
}

function updateFilterOptions() {
    const colorFilter = document.getElementById('filter-color');
    const currentVal = colorFilter.value;
    const colors = [...new Set(clothes.map(c => c.color))].sort();

    colorFilter.innerHTML = '<option value="all">Semua</option>' +
        colors.map(c => `<option value="${c}" ${c === currentVal ? 'selected' : ''}>${COLOR_EMOJI[c] || ''} ${c}</option>`).join('');
}

function updateTotalCount() {
    document.getElementById('total-clothes').textContent = clothes.length;
}

// ====== GROUPING ======
function switchGroupTab(btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGroupTab = btn.dataset.group;
    renderGrouping();
}

function renderGrouping() {
    const container = document.getElementById('grouping-content');
    let groups = {};
    let labelKey = '';
    let emojiFn;

    switch (currentGroupTab) {
        case 'color':
            labelKey = 'color';
            emojiFn = (val) => COLOR_EMOJI[val] || '🎨';
            break;
        case 'motif':
            labelKey = 'motif';
            emojiFn = () => '🔲';
            break;
        case 'fabric':
            labelKey = 'fabric';
            emojiFn = () => '🧵';
            break;
    }

    clothes.forEach(item => {
        const key = item[labelKey];
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    });

    if (Object.keys(groups).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📊</span>
                <h3>Belum ada data</h3>
                <p>Tambahkan pakaian terlebih dahulu untuk melihat pengelompokan</p>
            </div>`;
        return;
    }

    const sortedGroups = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);

    container.innerHTML = sortedGroups.map(([key, items]) => `
        <div class="group-section">
            <div class="group-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'flex' : 'none'">
                <h4>${emojiFn(key)} ${key}</h4>
                <span class="group-count">${items.length} item</span>
            </div>
            <div class="group-items">
                ${items.map(item => `
                    <span class="group-item-chip">
                        ${CATEGORY_ICON[item.category] || '🧢'} ${escapeHtml(item.name)}
                        <span class="chip-category">${item.category}</span>
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ====== OUTFIT RECOMMENDATION ENGINE ======
function generateOutfits() {
    const container = document.getElementById('outfits-grid');
    const emptyState = document.getElementById('empty-outfits');
    const styleFilter = document.getElementById('outfit-style').value;
    const colorScheme = document.getElementById('outfit-color-scheme').value;

    const tops = clothes.filter(c => ['Baju', 'Dress'].includes(c.category));
    const bottoms = clothes.filter(c => ['Celana', 'Rok'].includes(c.category));
    const outers = clothes.filter(c => c.category === 'Jaket');
    const accessories = clothes.filter(c => ['Aksesoris', 'Sepatu'].includes(c.category));

    if (tops.length === 0 || bottoms.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    let outfits = [];
    const maxOutfits = 12;

    for (const top of tops) {
        for (const bottom of bottoms) {
            if (outfits.length >= maxOutfits * 3) break;
            const outfit = buildOutfit(top, bottom, outers, accessories, styleFilter, colorScheme);
            if (outfit) outfits.push(outfit);
        }
    }

    outfits.sort((a, b) => b.score - a.score);
    outfits = outfits.slice(0, maxOutfits);

    // Store in registry for safe onclick referencing
    outfitRegistry = outfits;

    if (outfits.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <span class="empty-icon">🤔</span>
                <h3>Tidak ada kombinasi yang cocok</h3>
                <p>Coba ubah filter gaya atau skema warna</p>
            </div>`;
        return;
    }

    container.innerHTML = outfits.map((outfit, idx) => renderOutfitCard(outfit, idx, 'registry')).join('');
}

function buildOutfit(top, bottom, outers, accessories, styleFilter, colorScheme) {
    let score = 0;
    let items = [top, bottom];
    let outfitStyle = determineStyle(top, bottom);

    if (styleFilter !== 'all' && outfitStyle !== styleFilter) return null;

    const harmony = getColorHarmony(top.color, bottom.color);
    if (colorScheme === 'monochrome' && harmony !== 'monochrome') return null;
    if (colorScheme === 'complementary' && harmony !== 'complementary') return null;
    if (colorScheme === 'analogous' && harmony !== 'analogous') return null;

    if (harmony === 'monochrome') score += 8;
    else if (harmony === 'complementary') score += 10;
    else if (harmony === 'analogous') score += 7;
    else score += 3;

    if (areFabricsCompatible(top.fabric, bottom.fabric)) score += 5;

    if (top.motif === 'Polos' || bottom.motif === 'Polos') score += 4;
    if (top.motif !== 'Polos' && bottom.motif !== 'Polos') score -= 3;

    const matchingOuter = outers.find(o => {
        const h = getColorHarmony(o.color, top.color);
        return h === 'complementary' || h === 'monochrome' || h === 'analogous';
    });
    if (matchingOuter) {
        items.push(matchingOuter);
        score += 3;
    }

    const matchingAcc = accessories.find(a => {
        const h = getColorHarmony(a.color, top.color);
        return h === 'complementary' || h === 'monochrome' || a.color === bottom.color;
    });
    if (matchingAcc) {
        items.push(matchingAcc);
        score += 2;
    }

    score += Math.random() * 3;

    const tip = STYLE_TIPS[outfitStyle][Math.floor(Math.random() * STYLE_TIPS[outfitStyle].length)];

    return {
        id: 'outfit_' + items.map(i => i.id).sort().join('_'),
        name: generateOutfitName(items, outfitStyle),
        style: outfitStyle,
        items: items,
        score: score,
        harmony: harmony,
        tip: tip
    };
}

function determineStyle(top, bottom) {
    const styles = [top.style, bottom.style];
    if (styles.includes('formal') && !styles.includes('sporty')) return 'formal';
    if (styles.includes('elegant')) return 'elegant';
    if (styles.includes('sporty')) return 'sporty';
    return 'casual';
}

function getColorHarmony(color1, color2) {
    if (color1 === color2) return 'monochrome';
    const rules = COLOR_HARMONIES[color1];
    if (!rules) return 'neutral';
    if (rules.complementary.includes(color2)) return 'complementary';
    if (rules.analogous.includes(color2)) return 'analogous';
    return 'neutral';
}

function areFabricsCompatible(f1, f2) {
    const casual = ['Katun', 'Denim', 'Linen', 'Fleece', 'Spandex'];
    const formal = ['Sutra', 'Satin', 'Wool', 'Chiffon'];
    return (casual.includes(f1) && casual.includes(f2)) || (formal.includes(f1) && formal.includes(f2));
}

function generateOutfitName(items, style) {
    const prefixes = {
        casual: ['Santai', 'Rileks', 'Easy-going', 'Chill'],
        formal: ['Profesional', 'Elegan', 'Rapi', 'Berkelas'],
        sporty: ['Aktif', 'Energik', 'Sporty', 'Fresh'],
        elegant: ['Glamor', 'Mewah', 'Stunning', 'Chic']
    };
    const prefix = prefixes[style][Math.floor(Math.random() * prefixes[style].length)];
    const topName = items[0].name.split(' ').slice(0, 2).join(' ');
    return `${prefix} Look: ${topName}`;
}

/**
 * Render an outfit card.
 * @param {Object} outfit
 * @param {number} index - position in the source array
 * @param {string} source - 'registry' (recommendation page) or 'favorite'
 */
function renderOutfitCard(outfit, index, source) {
    const isFav = favorites.some(f => f.id === outfit.id);

    const favAction = source === 'favorite'
        ? `<button class="btn-fav is-fav" onclick="removeFavorite(${index})">🗑️ Hapus Favorit</button>`
        : `<button class="btn-fav ${isFav ? 'is-fav' : ''}" onclick="toggleFavoriteByIndex(${index}, '${source}', this)">${isFav ? '❤️ Favorit' : '🤍 Favorit'}</button>`;

    const scheduleAction = `<button class="btn-schedule" onclick="openScheduleFromIndex(${index}, '${source}')">📅 Jadwalkan</button>`;

    return `
        <div class="outfit-card">
            <div class="outfit-card-banner"></div>
            <div class="outfit-card-body">
                <div class="outfit-title">${escapeHtml(outfit.name)}</div>
                <span class="outfit-style-badge style-${outfit.style}">${capitalizeFirst(outfit.style)}</span>

                <div class="outfit-items">
                    ${outfit.items.map(item => `
                        <div class="outfit-item">
                            <span class="outfit-item-icon">${CATEGORY_ICON[item.category] || '🧢'}</span>
                            <div class="outfit-item-info">
                                <div class="outfit-item-name">${escapeHtml(item.name)}</div>
                                <div class="outfit-item-detail">${item.color} • ${item.motif} • ${item.fabric}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="outfit-tip">
                    <strong>💡 Tip:</strong> ${outfit.tip}
                </div>

                <div class="outfit-actions">
                    ${favAction}
                    ${scheduleAction}
                </div>
            </div>
        </div>
    `;
}

// ====== FAVORITES ======

/** Look up an outfit from registry or favorites by index. */
function getOutfitByRef(index, source) {
    if (source === 'favorite') return favorites[index];
    return outfitRegistry[index]; // 'registry'
}

function toggleFavoriteByIndex(index, source, btnElement) {
    const outfit = getOutfitByRef(index, source);
    if (!outfit) return;

    const existingIndex = favorites.findIndex(f => f.id === outfit.id);

    if (existingIndex !== -1) {
        favorites.splice(existingIndex, 1);
        if (btnElement) {
            btnElement.classList.remove('is-fav');
            btnElement.innerHTML = '🤍 Favorit';
        }
        showToast('Dihapus dari favorit', 'info');
    } else {
        favorites.push(outfit);
        if (btnElement) {
            btnElement.classList.add('is-fav');
            btnElement.innerHTML = '❤️ Favorit';
        }
        showToast('Ditambahkan ke favorit! ❤️', 'success');
    }

    Store.set('wardrobe_favorites', favorites);
}

function renderFavorites() {
    const grid = document.getElementById('favorites-grid');
    const empty = document.getElementById('empty-favorites');

    if (favorites.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = favorites.map((outfit, idx) => renderOutfitCard(outfit, idx, 'favorite')).join('');
}

function removeFavorite(index) {
    const outfit = favorites[index];
    if (!outfit) return;

    // Also remove related schedules
    schedules = schedules.filter(s => s.outfit.id !== outfit.id);
    Store.set('wardrobe_schedules', schedules);

    favorites.splice(index, 1);
    Store.set('wardrobe_favorites', favorites);
    renderFavorites();
    showToast('Dihapus dari favorit', 'info');
}

// ====== SCHEDULE ======
function openScheduleModal(day) {
    const modal = document.getElementById('modal-schedule');
    const title = document.getElementById('schedule-modal-title');
    const outfitList = document.getElementById('schedule-outfit-list');

    title.textContent = `Jadwalkan Outfit - ${day || 'Pilih Hari'}`;
    document.getElementById('schedule-day').value = day || '';
    document.getElementById('schedule-occasion').value = '';

    document.querySelectorAll('#schedule-days-select input[type="checkbox"]').forEach(cb => {
        cb.checked = day ? cb.value === day : false;
    });

    if (favorites.length === 0) {
        outfitList.innerHTML = `
            <div style="text-align:center; padding: 20px; color: var(--text-muted);">
                <p>Belum ada outfit favorit.</p>
                <p style="font-size: 0.8rem;">Tambahkan outfit ke favorit terlebih dahulu dari halaman Rekomendasi.</p>
            </div>`;
    } else {
        outfitList.innerHTML = favorites.map((outfit, idx) => `
            <label class="schedule-outfit-option" onclick="selectScheduleOutfit(this, ${idx})">
                <input type="radio" name="schedule-outfit" value="${idx}" style="accent-color: var(--primary);">
                <div class="schedule-outfit-info">
                    <strong>${escapeHtml(outfit.name)}</strong>
                    <small>${outfit.items.map(i => i.name).join(' + ')}</small>
                </div>
            </label>
        `).join('');
    }

    modal.classList.add('show');
}

function selectScheduleOutfit(label, idx) {
    document.querySelectorAll('.schedule-outfit-option').forEach(o => o.classList.remove('selected'));
    label.classList.add('selected');
    label.querySelector('input').checked = true;
}

function openScheduleFromIndex(index, source) {
    const outfit = getOutfitByRef(index, source);
    if (!outfit) return;

    // Ensure it's in favorites first
    if (!favorites.some(f => f.id === outfit.id)) {
        favorites.push(outfit);
        Store.set('wardrobe_favorites', favorites);
        showToast('Outfit ditambahkan ke favorit', 'success');
    }

    openScheduleModal('');

    // Auto-select this outfit
    setTimeout(() => {
        const favIdx = favorites.findIndex(f => f.id === outfit.id);
        if (favIdx !== -1) {
            const options = document.querySelectorAll('.schedule-outfit-option');
            if (options[favIdx]) {
                options[favIdx].click();
            }
        }
    }, 100);
}

function saveSchedule() {
    const selectedRadio = document.querySelector('input[name="schedule-outfit"]:checked');
    const occasion = document.getElementById('schedule-occasion').value.trim() || 'Outfit';
    const checkedDays = [...document.querySelectorAll('#schedule-days-select input:checked')].map(cb => cb.value);

    if (!selectedRadio) {
        showToast('Pilih outfit terlebih dahulu!', 'error');
        return;
    }

    if (checkedDays.length === 0) {
        showToast('Pilih minimal satu hari!', 'error');
        return;
    }

    const outfitIdx = parseInt(selectedRadio.value);
    const outfit = favorites[outfitIdx];

    checkedDays.forEach(day => {
        schedules.push({
            id: 'sch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            day: day,
            occasion: occasion,
            outfit: outfit,
            createdAt: new Date().toISOString()
        });
    });

    Store.set('wardrobe_schedules', schedules);
    closeModal('modal-schedule');
    renderSchedule();
    showToast(`Outfit dijadwalkan untuk ${checkedDays.join(', ')}! 📅`, 'success');
}

function renderSchedule() {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    days.forEach(day => {
        const slot = document.getElementById(`schedule-${day}`);
        const daySchedules = schedules.filter(s => s.day === day);

        if (daySchedules.length === 0) {
            slot.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted); font-size: 0.8rem;">
                Belum ada jadwal
            </div>`;
        } else {
            slot.innerHTML = daySchedules.map(s => `
                <div class="schedule-slot">
                    <button class="schedule-slot-remove" onclick="removeSchedule('${s.id}')" title="Hapus">✕</button>
                    <div class="schedule-slot-occasion">${escapeHtml(s.occasion)}</div>
                    <div class="schedule-slot-items">
                        ${s.outfit.items.map(item => `${CATEGORY_ICON[item.category] || '🧢'} ${escapeHtml(item.name)}`).join('<br>')}
                    </div>
                </div>
            `).join('');
        }
    });
}

function removeSchedule(scheduleId) {
    schedules = schedules.filter(s => s.id !== scheduleId);
    Store.set('wardrobe_schedules', schedules);
    renderSchedule();
    showToast('Jadwal dihapus', 'info');
}

// ====== MODAL UTILS ======
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function closeModalOnOverlay(event, modalId) {
    if (event.target === event.currentTarget) {
        closeModal(modalId);
    }
}

// ====== TOAST NOTIFICATION ======
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ====== UTILITY FUNCTIONS ======
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ====== SAMPLE DATA (for demo) ======
function loadSampleData() {
    if (clothes.length > 0) {
        if (!confirm('Data yang ada akan ditimpa. Lanjutkan?')) return;
    }

    clothes = [
        { id: 'cl_s1', name: 'Kemeja Putih Polos', category: 'Baju', color: 'Putih', motif: 'Polos', fabric: 'Katun', style: 'formal', notes: 'Untuk kerja', createdAt: new Date().toISOString() },
        { id: 'cl_s2', name: 'T-shirt Hitam', category: 'Baju', color: 'Hitam', motif: 'Polos', fabric: 'Katun', style: 'casual', notes: '', createdAt: new Date().toISOString() },
        { id: 'cl_s3', name: 'Blouse Bunga Pink', category: 'Baju', color: 'Pink', motif: 'Bunga', fabric: 'Chiffon', style: 'elegant', notes: '', createdAt: new Date().toISOString() },
        { id: 'cl_s4', name: 'Kaos Garis Navy', category: 'Baju', color: 'Navy', motif: 'Garis', fabric: 'Katun', style: 'casual', notes: 'Breton style', createdAt: new Date().toISOString() },
        { id: 'cl_s5', name: 'Polo Shirt Hijau', category: 'Baju', color: 'Hijau', motif: 'Polos', fabric: 'Katun', style: 'casual', notes: '', createdAt: new Date().toISOString() },
        { id: 'cl_s6', name: 'Batik Coklat', category: 'Baju', color: 'Coklat', motif: 'Batik', fabric: 'Katun', style: 'formal', notes: 'Batik Pekalongan', createdAt: new Date().toISOString() },
        { id: 'cl_s7', name: 'Kaos Sporty Merah', category: 'Baju', color: 'Merah', motif: 'Polos', fabric: 'Polyester', style: 'sporty', notes: 'Dri-fit', createdAt: new Date().toISOString() },
        { id: 'cl_s8', name: 'Celana Jeans Biru', category: 'Celana', color: 'Biru', motif: 'Denim', fabric: 'Denim', style: 'casual', notes: 'Slim fit', createdAt: new Date().toISOString() },
        { id: 'cl_s9', name: 'Celana Chino Krem', category: 'Celana', color: 'Krem', motif: 'Polos', fabric: 'Katun', style: 'casual', notes: '', createdAt: new Date().toISOString() },
        { id: 'cl_s10', name: 'Celana Hitam Formal', category: 'Celana', color: 'Hitam', motif: 'Polos', fabric: 'Polyester', style: 'formal', notes: 'Untuk kantor', createdAt: new Date().toISOString() },
        { id: 'cl_s11', name: 'Celana Training Abu', category: 'Celana', color: 'Abu-abu', motif: 'Polos', fabric: 'Spandex', style: 'sporty', notes: '', createdAt: new Date().toISOString() },
        { id: 'cl_s12', name: 'Rok A-line Navy', category: 'Rok', color: 'Navy', motif: 'Polos', fabric: 'Polyester', style: 'formal', notes: '', createdAt: new Date().toISOString() },
        { id: 'cl_s13', name: 'Rok Floral Putih', category: 'Rok', color: 'Putih', motif: 'Bunga', fabric: 'Katun', style: 'casual', notes: 'Motif bunga kecil', createdAt: new Date().toISOString() },
        { id: 'cl_s14', name: 'Jaket Denim Biru', category: 'Jaket', color: 'Biru', motif: 'Denim', fabric: 'Denim', style: 'casual', notes: '', createdAt: new Date().toISOString() },
        { id: 'cl_s15', name: 'Blazer Hitam', category: 'Jaket', color: 'Hitam', motif: 'Polos', fabric: 'Wool', style: 'formal', notes: 'Slim fit', createdAt: new Date().toISOString() },
        { id: 'cl_s16', name: 'Hoodie Abu-abu', category: 'Jaket', color: 'Abu-abu', motif: 'Polos', fabric: 'Fleece', style: 'sporty', notes: '', createdAt: new Date().toISOString() },
        { id: 'cl_s17', name: 'Sneakers Putih', category: 'Sepatu', color: 'Putih', motif: 'Polos', fabric: 'Kulit', style: 'casual', notes: 'Nike Air Force 1', createdAt: new Date().toISOString() },
        { id: 'cl_s18', name: 'Sepatu Pantofel Hitam', category: 'Sepatu', color: 'Hitam', motif: 'Polos', fabric: 'Kulit', style: 'formal', notes: '', createdAt: new Date().toISOString() },
        { id: 'cl_s19', name: 'Topi Baseball Merah', category: 'Aksesoris', color: 'Merah', motif: 'Polos', fabric: 'Katun', style: 'sporty', notes: '', createdAt: new Date().toISOString() },
        { id: 'cl_s20', name: 'Syal Rajut Krem', category: 'Aksesoris', color: 'Krem', motif: 'Polos', fabric: 'Rajut', style: 'elegant', notes: '', createdAt: new Date().toISOString() },
    ];

    favorites = [];
    schedules = [];
    Store.set('wardrobe_clothes', clothes);
    Store.set('wardrobe_favorites', favorites);
    Store.set('wardrobe_schedules', schedules);

    renderWardrobe();
    updateFilterOptions();
    updateTotalCount();
    showToast('Data sampel berhasil dimuat! 🎉', 'success');
}
