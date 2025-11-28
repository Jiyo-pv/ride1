
/* main.js - Material Blue front-end LocalStorage app */
/* Utilities */
function showSnackbar(msg){
  const sb = document.getElementById('snackbar');
  if(!sb) return;
  sb.textContent = msg;
  sb.style.display = 'block';
  setTimeout(()=> sb.style.display = 'none', 2200);
}
function getLS(k, fallback){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; } }
function setLS(k,v){ localStorage.setItem(k, JSON.stringify(v)); }

/* Init defaults and UI */
function initApp(){
  // defaults
  if(!getLS('users', null)){
    const admin = { id: 'u_admin', name: 'Admin', email: 'admin@gmail.com', password: 'admin123', isAdmin: true };
    setLS('users', [admin]);
  }
	localStorage.removeItem('products');
  if(!getLS('products', null)){
     const sample = [
        {
            id: String(Date.now() + 1),
            name: "Full-Face Riding Helmet",
            price: 129.99,
            description: "DOT certified, scratch-resistant visor, ventilation system.",
            imagename: "assets/img/helmet.jpeg"
        },
        {
            id: String(Date.now() + 2),
            name: "Motorcycle Riding Gloves",
            price: 39.99,
            description: "Knuckle protection, breathable mesh, anti-slip palm.",
            imagename: "assets/img/gloves.jpg"
        },
        {
            id: String(Date.now() + 3),
            name: "Riding Jacket (Armored)",
            price: 169.99,
            description: "CE-approved armor, waterproof, multiple air vents.",
            imagename: "assets/img/jacket.jpeg"
        },
        {
            id: String(Date.now() + 3),
            name: "Riding Boots",
            price: 89.99,
            description: "Reinforced ankle support, anti-slip sole, weatherproof.",
            imagename: "assets/img/boots.jpg"
        },
        {
            id: String(Date.now() + 4),
            name: "Knee & Elbow Guards Set",
            price: 49.99,
            description: "Impact-resistant plastic shell with soft cushioning.",
            imagename: "assets/img/guards.jpg"
        },
        {
            id: String(Date.now() + 5),
            name: "Motorcycle Backpack",
            price: 54.99,
            description: "Aerodynamic design, waterproof, multiple compartments.",
            imagename: "assets/img/backpack.jpeg"
        }
    ];
    setLS('products', sample);
  }
  if(!getLS('cart', null)) setLS('cart', []);

  renderNav();
  updateCartBadge();
}

/* Auth */
function registerUser({name, email, password, confirm}) {

    // FIX — ensures login email matches registration email
    email = email.trim().toLowerCase();

    if (!name || !email || !password) {
        return { success: false, message: 'All fields required' };
    }
    if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
    }
    if (password !== confirm) {
        return { success: false, message: 'Passwords do not match' };
    }

    const users = getLS('users', []);
    if (users.some(u => u.email === email)) {
        return { success: false, message: 'Email already exists' };
    }

    users.push({
        id: 'u_' + Date.now(),
        name,
        email,
        password,
        isAdmin: false
    });

    setLS('users', users);

    return { success: true, message: 'Registration successful' };
}

function loginUser(email, password){
  const users = getLS('users', []);
  const u = users.find(x => x.email === email && x.password === password);
  if(u){ setLS('loggedInUser', {email:u.email,name:u.name,isAdmin:!!u.isAdmin}); renderNav(); return true; }
  return false;
}

function logoutUser(){
  localStorage.removeItem('loggedInUser');
  renderNav();
  showSnackbar('Logged out');
  setTimeout(()=> location.href = 'login.html', 600);
}

function currentUser(){ return getLS('loggedInUser', null); }

/* Navbar */
function renderNav(){
  const nav = document.getElementById('nav-links');
  if(!nav) return;
  const user = currentUser();
  let html = '';
  html += '<a href="index.html">Home</a>';
  html += '<a href="shop.html">Shop</a>';
  if(user && user.isAdmin) html += '<a href="add_product.html">Add Product</a>';
  if(user) html += `<a href="#" onclick="logoutUser(); return false;">Logout</a>`;
  else html += '<a href="login.html">Login</a><a href="register.html">Register</a>';
  nav.innerHTML = html;

  // show add product button on shop page
  const btn = document.getElementById('btn-add-product');
  if(btn) btn.style.display = (user && user.isAdmin) ? 'inline-block' : 'none';
}
function initProducts() {
    let products = JSON.parse(localStorage.getItem('products') || '[]');

    if (products.length === 0) {

        products = [
            {
                id: Date.now() + 1,
                name: "Full-Face Riding Helmet",
                price: 129.99,
                description: "DOT certified, scratch-resistant visor, ventilation system.",
                imagename: "assets/img/helmet.png"
            },
            {
                id: Date.now() + 2,
                name: "Motorcycle Riding Gloves",
                price: 39.99,
                description: "Knuckle protection, breathable mesh, anti-slip palm.",
                imagename: "assets/img/gloves.png"
            },
            {
                id: Date.now() + 3,
                name: "Riding Jacket (Armored)",
                price: 169.99,
                description: "CE-approved armor, waterproof, multiple air vents.",
                imagename: "assets/img/jacket.png"
            },
            {
                id: Date.now() + 4,
                name: "Riding Boots",
                price: 89.99,
                description: "Reinforced ankle support, anti-slip sole, weatherproof.",
                imagename: "assets/img/boots.png"
            },
            {
                id: Date.now() + 5,
                name: "Knee & Elbow Guards Set",
                price: 49.99,
                description: "Impact-resistant plastic shell with soft cushioning.",
                imagename: "assets/img/guards.png"
            },
            {
                id: Date.now() + 6,
                name: "Motorcycle Backpack",
                price: 54.99,
                description: "Aerodynamic design, waterproof, multiple compartments.",
                imagename: "assets/img/backpack.png"
            }
        ];

        localStorage.setItem("products", JSON.stringify(products));
    }
}

/* Products CRUD */
function getProducts(){ return getLS('products', []); }
function setProducts(v){ setLS('products', v); }

function renderProducts(){
  const list = document.getElementById('product-list');
  if(!list) return;
  const products = getProducts();
  list.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="media">${p.imagename ? '<img src="'+p.imagename+'" style="width:100%;height:100%;object-fit:cover"/>' : '<span class="material-icons" style="font-size:64px">image</span>'}</div>
      <div class="content">
        <h4>${escapeHtml(p.name)}</h4>
        <p>${escapeHtml(p.description)}</p>
        <div class="meta">
          <strong>$${Number(p.price).toFixed(2)}</strong>
          <div>
            <button class="btn primary" onclick="addToCart('${p.id}')">Add to cart</button>
            ${currentUser() && currentUser().isAdmin ? `<button class="btn outlined" onclick="gotoEdit('${p.id}')">Edit</button>
            <button class="btn" style="background:#ef4444;color:white" onclick="deleteProduct('${p.id}')">Delete</button>` : ''}
          </div>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

function addProduct(prod){
  const products = getProducts();
  products.push(prod);
  setProducts(products);
}

function updateProduct(updated){
  const products = getProducts().map(p => p.id === updated.id ? updated : p);
  setProducts(products);
}

function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  const products = getProducts().filter(p => p.id !== id);
  setProducts(products);
  showSnackbar('Product deleted');
  renderProducts();
}

function gotoEdit(id){
  location.href = 'edit_product.html?id=' + encodeURIComponent(id);
}

function loadProductForEdit(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id) { showSnackbar('No product id'); return; }
  const p = getProducts().find(x=>x.id===id);
  if(!p){ showSnackbar('Product not found'); return; }
  document.getElementById('edit-id').value = p.id;
  document.getElementById('edit-name').value = p.name;
  document.getElementById('edit-price').value = p.price;
  document.getElementById('edit-desc').value = p.description;
  document.getElementById('edit-image').value = p.imagename;
}

/* Cart */
function getCart(){ return getLS('cart', []); }
function setCart(v){ setLS('cart', v); updateCartBadge(); }

function addToCart(productId){
  const products = getProducts();
  const p = products.find(x=>x.id===productId);
  if(!p){ showSnackbar('Product not found'); return; }
  const cart = getCart();
  const item = cart.find(i=>i.id===productId);
  if(item) item.qty++;
  else cart.push({ id: productId, name: p.name, price: p.price, qty: 1 });
  setCart(cart);
  showSnackbar('Added to cart');
}

function updateCartBadge(){
  const badge = document.getElementById('cart-badge') || document.getElementById('cart-badge');
  if(!badge) return;
  const cart = getCart();
  const count = cart.reduce((s,i)=> s + i.qty, 0);
  badge.textContent = count;
  badge.style.display = count ? 'inline-block' : 'none';
}

function renderCartPage(){
  const area = document.getElementById('cart-area');
  if(!area) return;
  const cart = getCart();
  if(cart.length === 0){ area.innerHTML = '<div class="card"><div class="muted">Your cart is empty. <a href="shop.html">Shop now</a></div></div>'; updateCartBadge(); return; }
  let html = '<div class="card"><table style="width:100%"><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>';
  cart.forEach(item=>{
    html += `<tr>
      <td>${escapeHtml(item.name)}</td>
      <td>$${Number(item.price).toFixed(2)}</td>
      <td><input type="number" min="1" value="${item.qty}" onchange="changeQty('${item.id}', this.value)" style="width:70px"></td>
      <td>$${(item.qty * item.price).toFixed(2)}</td>
      <td><button class="btn" style="background:#ef4444;color:white" onclick="removeCartItem('${item.id}')">Remove</button></td>
    </tr>`;
  });
  const total = cart.reduce((s,i)=> s + i.qty*i.price, 0);
  html += `</tbody></table><div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px"><strong>Total: $${total.toFixed(2)}</strong><div><button class="btn outlined" onclick="clearCart()">Clear</button> <button class="btn primary" onclick="checkout()">Checkout</button></div></div></div>`;
  area.innerHTML = html;
  updateCartBadge();
}

function changeQty(id, qty){
  qty = parseInt(qty) || 1;
  let cart = getCart();
  cart = cart.map(i => i.id === id ? {...i, qty: qty} : i);
  setCart(cart);
  renderCartPage();
}

function removeCartItem(id){
  if(!confirm('Remove item?')) return;
  const cart = getCart().filter(i => i.id !== id);
  setCart(cart);
  renderCartPage();
}

function clearCart(){
  if(!confirm('Clear cart?')) return;
  setLS('cart', []);
  renderCartPage();
}

function checkout(){
  const user = currentUser();
  if(!user){ showSnackbar('Please login to checkout'); setTimeout(()=> location.href='login.html', 800); return; }
  setLS('cart', []);
  showSnackbar('Checkout successful — thank you!');
  setTimeout(()=> location.href='index.html', 1200);
}

/* Admin helper */
function ensureAdminOrRedirect(){
  const user = currentUser();
  if(!user || !user.isAdmin){ showSnackbar('Admin only'); setTimeout(()=> location.href='index.html', 700); }
}

/* Home highlights */
function renderHomeHighlights(){
  const container = document.getElementById('home-cards');
  if(!container) return;
  container.innerHTML = `
    <div class="feature-card"><div style="font-size:28px;color:var(--md-primary)">🚚</div><h4>Fast delivery</h4><p class="muted">Quick local deliveries.</p></div>
    <div class="feature-card"><div style="font-size:28px;color:var(--md-primary)">🔒</div><h4>Secure payments</h4><p class="muted">Secure checkout with client demo tokens.</p></div>
    <div class="feature-card"><div style="font-size:28px;color:var(--md-primary)">⭐</div><h4>Top quality</h4><p class="muted">Carefully curated demo products.</p></div>
  `;
}

/* Helpers */
function escapeHtml(unsafe){
  return (unsafe||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* Load product into edit if on edit page */
function loadProductForEdit(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id) return;
  const p = getProducts().find(x=>x.id===id);
  if(!p) return;
  document.getElementById('edit-id').value = p.id;
  document.getElementById('edit-name').value = p.name;
  document.getElementById('edit-price').value = p.price;
  document.getElementById('edit-desc').value = p.description;
  document.getElementById('edit-image').value = p.imagename;
}

