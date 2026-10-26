const initialMenuItems = [
  { id: 'cb-1', title: 'Caramel Cappuccino', category: 'Coffee', price: 180, inStock: true, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80', desc: 'Espresso with steamed milk and rich caramel drizzle.' },
  { id: 'cb-2', title: 'Belgian Chocolate Truffle Cake', category: 'Bakery', price: 240, inStock: true, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', desc: 'Decadent multi-layered chocolate fudge pastry.' },
  { id: 'cb-3', title: 'Peri Peri Crispy Paneer Burger', category: 'Snacks', price: 210, inStock: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', desc: 'Spicy paneer patty with lettuce and creamy mayo.' },
  { id: 'cb-4', title: 'Oreo Thick Brownie Shake', category: 'Shakes', price: 220, inStock: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80', desc: 'Blended chocolate shake topped with crushed brownie.' },
  { id: 'cb-5', title: 'Butter Croissant', category: 'Bakery', price: 140, inStock: true, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80', desc: 'Flaky, buttery French style artisanal pastry.' }
];

let appSettings = JSON.parse(localStorage.getItem('bake_settings')) || {
  restaurantName: 'Bake & Brew Cafe',
  ownerPhone: '918376891847',
  gstRate: 5.0
};

let menuItems = JSON.parse(localStorage.getItem('bake_menu')) || initialMenuItems;
let reservationsList = JSON.parse(localStorage.getItem('bake_bookings')) || [];
let cart = JSON.parse(localStorage.getItem('bake_cart')) || [];
let isDarkMode = true;
let currentCategory = 'All';
let isLoggedIn = false;

document.addEventListener('DOMContentLoaded', () => {
  renderCustomerMenu();
  renderAdminTable();
  updateCartUI();
});

function saveMenuState() { localStorage.setItem('bake_menu', JSON.stringify(menuItems)); }
function saveCartState() { localStorage.setItem('bake_cart', JSON.stringify(cart)); }

function toggleTheme() {
  isDarkMode = !isDarkMode;
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');

  if (isDarkMode) {
    html.classList.remove('light');
    html.classList.add('dark');
    icon.className = 'fa-solid fa-moon text-amber-400';
    label.textContent = 'Dark';
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
    icon.className = 'fa-solid fa-sun text-amber-500';
    label.textContent = 'Light';
  }
}

function filterCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('#categoryFilterGroup button').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderCustomerMenu();
}

function searchMenu() { renderCustomerMenu(); }

function renderCustomerMenu() {
  const container = document.getElementById('customerMenuGrid');
  const query = document.getElementById('menuSearchInput')?.value.toLowerCase() || '';
  container.innerHTML = '';

  const filtered = menuItems.filter(item => {
    const matchCat = currentCategory === 'All' || item.category === currentCategory;
    const matchSearch = item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = `menu-card card-bg rounded-2xl overflow-hidden border card-border flex flex-col justify-between`;
    card.innerHTML = `
      <div>
        <div class="relative h-48 overflow-hidden">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
          <div class="absolute top-3 left-3">
            <span class="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">${item.category}</span>
          </div>
        </div>
        <div class="p-5 space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="font-extrabold text-brand text-base">${item.title}</h3>
            <span class="text-amber-500 font-black text-base">₹${item.price}</span>
          </div>
          <p class="text-xs text-sub leading-relaxed">${item.desc}</p>
        </div>
      </div>
      <div class="p-5 pt-0">
        <button onclick="addToCart('${item.id}')" class="w-full font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2" style="background-color: #f59e0b !important; color: #1c1917 !important;">
          <i class="fa-solid fa-plus"></i> Add to Order Cart
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleCartDrawer() { document.getElementById('cartDrawer').classList.toggle('hidden'); }

function addToCart(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCartState();
  updateCartUI();
  showToast(`Added ${item.title} to cart!`, 'success');
}

function updateCartUI() {
  const container = document.getElementById('cartItemsContainer');
  const countBadge = document.getElementById('cartCountBadge');
  container.innerHTML = '';
  let totalQty = 0, subtotal = 0;

  cart.forEach(item => {
    totalQty += item.qty;
    subtotal += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'flex justify-between items-center bg-card p-3 rounded-xl border card-border text-xs';
    row.innerHTML = `
      <div>
        <h4 class="font-bold text-brand">${item.title} x ${item.qty}</h4>
        <p class="text-amber-500 font-bold">₹${item.price * item.qty}</p>
      </div>
    `;
    container.appendChild(row);
  });

  const gst = subtotal * 0.05, total = subtotal + gst;
  countBadge.textContent = totalQty;
  document.getElementById('cartSubtotal').textContent = `₹${subtotal.toFixed(0)}`;
  document.getElementById('cartTax').textContent = `₹${gst.toFixed(0)}`;
  document.getElementById('cartTotal').textContent = `₹${total.toFixed(0)}`;
}

function handleCheckout() {
  if (cart.length === 0) { showToast('Cart is empty!', 'error'); return; }
  const name = document.getElementById('cartCustomerName').value.trim();
  const phone = document.getElementById('cartCustomerPhone').value.trim();
  if (!name || !phone) { showToast('Enter name and phone!', 'error'); return; }

  let text = '';
  let subtotal = 0;
  cart.forEach(i => { subtotal += i.price * i.qty; text += `${i.title} x ${i.qty} = ₹${i.price * i.qty}\n`; });
  const total = subtotal * 1.05;

  const msg = `*NEW CAFE ORDER* ☕\n*Name:* ${name}\n*Phone:* ${phone}\n\n*ITEMS:*\n${text}\n*TOTAL:* ₹${total.toFixed(0)}`;
  window.open(`https://wa.me/${appSettings.ownerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  cart = []; saveCartState(); updateCartUI(); toggleCartDrawer();
}

function handleTableBooking(e) {
  e.preventDefault();
  const name = document.getElementById('bookName').value;
  const phone = document.getElementById('bookPhone').value;
  const date = document.getElementById('bookDate').value;
  const time = document.getElementById('bookTime').value;
  const guests = document.getElementById('bookGuests').value;

  const msg = `*CAFE TABLE RESERVATION* 🪑\n*Name:* ${name}\n*Phone:* ${phone}\n*Date:* ${date} @ ${time}\n*Guests:* ${guests}`;
  window.open(`https://wa.me/${appSettings.ownerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  e.target.reset();
  showToast('Booking sent via WhatsApp!', 'success');
}

function switchMode(mode) {
  document.getElementById('customerView').classList.toggle('hidden', mode !== 'customer');
  document.getElementById('adminView').classList.toggle('hidden', mode !== 'admin');
}

function renderAdminTable() {
  const tbody = document.getElementById('adminMenuTableBody');
  tbody.innerHTML = '';
  menuItems.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="p-4 flex items-center gap-3">
        <img src="${item.image}" class="w-10 h-10 object-cover rounded-xl">
        <span class="font-bold text-brand text-xs">${item.title}</span>
      </td>
      <td class="p-4 text-sub">${item.category}</td>
      <td class="p-4 font-bold text-amber-500">₹${item.price}</td>
      <td class="p-4"><span class="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full text-[10px]">In Stock</span></td>
      <td class="p-4 text-right"><button onclick="deleteItem('${item.id}')" class="text-rose-500 text-xs">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteItem(id) {
  menuItems = menuItems.filter(m => m.id !== id);
  saveMenuState(); renderAdminTable(); renderCustomerMenu();
  showToast('Item deleted', 'info');
}

function handleAuthClick() {
  if (isLoggedIn) { isLoggedIn = false; switchMode('customer'); document.getElementById('loginBtn').innerText = 'Staff Login'; }
  else openModal('authModal');
}

function handleAuthLogin(e) {
  e.preventDefault(); isLoggedIn = true;
  document.getElementById('loginBtn').innerText = 'Logout';
  closeModal('authModal'); switchMode('admin');
  showToast('Logged in as Cafe Admin', 'success');
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function scrollToSection(id) { document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); }

function showToast(msg, type='success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `px-4 py-3 rounded-xl text-xs font-bold text-white shadow-xl ${type==='success'?'bg-emerald-600':'bg-rose-600'}`;
  t.innerHTML = msg; c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
