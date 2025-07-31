let places = [];

const jsonUrl = 'places.json?v=' + Date.now(); // Thêm timestamp để luôn lấy mới

fetch(jsonUrl)
  .then(response => response.json())
  .then(data => {
    places = data;
    renderPlaces();
  })
  .catch(err => {
    document.getElementById('places').innerHTML = '<p style="color:red;">Không thể tải dữ liệu địa điểm.</p>';
    console.error('Lỗi tải places.json:', err);
  });

function removeDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function searchPlaces(query) {
  query = removeDiacritics(query.trim().toLowerCase());
  if (!query) {
    renderPlaces();
    return;
  }
  const matched = places.filter(place =>
    removeDiacritics((place.name || '').toLowerCase()).includes(query) ||
    removeDiacritics((place.address || '').toLowerCase()).includes(query)
  );
  renderPlaces(matched);
}

function renderPlaces(list = places) {
  const container = document.getElementById('places');
  container.innerHTML = '';
  for (const place of list) {
    const card = document.createElement('div');
    const types = Array.isArray(place.type) ? place.type.join(' ') : (place.type || '');
    card.className = `card ${types}`;
    const stars = typeof place.rating === 'number'
      ? Array.from({ length: 5 }, (_, i) => `
        <span class="star ${i < Math.round(place.rating) ? 'filled' : ''}">★</span>
      `).join('')
      : '';
    card.innerHTML = `
      <h2>${place.name || ''}</h2>
      <p><strong>Địa chỉ:</strong> ${place.address || ''}</p>
      <p><strong>Giờ mở cửa:</strong> ${place.hours || ''}</p>
      <p><strong>Đánh giá:</strong> <span class="stars">${stars}</span> (${place.rating || ''})</p>
      <div class="note-area">${place.note ? `<p><strong>Ghi chú:</strong> ${place.note}</p>` : ''}</div>
      <div class="map-frame">${place.mapEmbed || ''}</div>
    `;
    container.appendChild(card);
  }
}

function filterPlaces(type) {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    if (type === 'all' || card.classList.contains(type)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

let currentSort = null;
function sortPlaces(order) {
  if (currentSort === order) {
    renderPlaces(places);
    currentSort = null;
  } else {
    let sorted = [...places];
    sorted.sort((a, b) => order === 'asc' ? a.rating - b.rating : b.rating - a.rating);
    renderPlaces(sorted);
    currentSort = order;
  }
}