// =========================================
// YummyFood Ultimate Interactive Scripts
// =========================================

// --- 0. Preloader ---
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
    document.body.classList.remove('loading');
  }, 1200); // Artificial delay to show the nice animation
});

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loading'); // Start keeping scrollbar hidden

  // --- Utility: Toast Notification ---
  const toastContainer = document.getElementById('toast-container');
  function showToast(message, iconClass = 'ph-check-circle') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="ph ${iconClass}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --- 1. Dark Mode Toggle ---
  const themeTogglePr = document.getElementById('theme-toggle');
  const themeIcon = themeTogglePr?.querySelector('i');
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeIcon) themeIcon.className = 'ph ph-sun';
  }
  if (themeTogglePr) {
    themeTogglePr.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      themeIcon.className = isDark ? 'ph ph-sun' : 'ph ph-moon';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      showToast(isDark ? 'Dark Mode Enabled' : 'Light Mode Enabled', isDark ? 'ph-moon' : 'ph-sun');
    });
  }

  // --- 2. Live Search & Category Filters ---
  const searchInput = document.getElementById('search-input');
  const menuItems = document.querySelectorAll('.menu-item');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const noResultMsg = document.getElementById('no-results-msg');

  function filterMenu() {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    let visibleCount = 0;

    menuItems.forEach(item => {
      const name = item.dataset.name.toLowerCase();
      const category = item.dataset.category;
      
      const matchesSearch = name.includes(query);
      const matchesCategory = activeFilter === 'all' || category === activeFilter;

      if (matchesSearch && matchesCategory) {
        item.style.display = 'flex';
        visibleCount++;
        setTimeout(() => item.style.opacity = '1', 50);
      } else {
        item.style.opacity = '0';
        setTimeout(() => item.style.display = 'none', 300);
      }
    });

    if (noResultMsg) noResultMsg.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  if (searchInput) searchInput.addEventListener('input', filterMenu);
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterMenu();
    });
  });

  // --- 3. Quick View Modal ---
  const modalOverlay = document.getElementById('quick-view-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalPrice = document.getElementById('modal-price');
  const addModalBtn = document.getElementById('modal-add-btn');

  let currentModalItem = null;

  document.querySelectorAll('.quick-view-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const card = e.target.closest('.menu-item');
      if (!card) return;
      currentModalItem = card; // Save ref to current item

      modalImg.src = card.dataset.img;
      modalTitle.textContent = card.dataset.name;
      modalDesc.textContent = card.dataset.desc;
      modalPrice.textContent = card.querySelector('.price-tag').textContent;

      modalOverlay.classList.add('active');
    });
  });

  function closeQuickView() {
    modalOverlay.classList.remove('active');
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeQuickView);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if(e.target === modalOverlay) closeQuickView();
    });
  }

  // --- 4. Cart Sidebar System ---
  let cartItems = JSON.parse(localStorage.getItem('yummy_cart')) || [];
  const cartSidebar = document.getElementById('cart-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  function toggleSidebar() {
    cartSidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
  }

  document.getElementById('cart-toggle')?.addEventListener('click', toggleSidebar);
  document.getElementById('close-sidebar')?.addEventListener('click', toggleSidebar);
  sidebarOverlay?.addEventListener('click', toggleSidebar);

  function updateCart() {
    localStorage.setItem('yummy_cart', JSON.stringify(cartItems));

    const cnt = document.getElementById('cart-count');
    if (cnt) cnt.textContent = cartItems.length;
    
    let total = cartItems.reduce((acc, curr) => acc + curr.price, 0);
    const totEl = document.getElementById('cart-total');
    if (totEl) totEl.textContent = `$${total.toFixed(2)}`;

    const container = document.getElementById('cart-items-container');
    if(!container) return;
    container.innerHTML = '';
    if (cartItems.length === 0) {
      container.innerHTML = `<div class="empty-cart-msg"><i class="ph ph-shopping-cart-simple"></i><p>Your cart is empty.</p></div>`;
      return;
    }
    
    cartItems.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-info"><h4>${item.name}</h4><p>$${item.price.toFixed(2)}</p></div>
        <button class="icon-btn remove-item" data-index="${index}"><i class="ph ph-trash"></i></button>`;
      container.appendChild(div);
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        cartItems.splice(e.currentTarget.dataset.index, 1);
        updateCart();
      });
    });
  }

  function addToCart(name, priceStr) {
    const price = parseFloat(priceStr.replace('$', ''));
    cartItems.push({ name, price });
    updateCart();
    showToast(`Added ${name} to cart!`);
    const cCount = document.getElementById('cart-count');
    if (cCount) {
      cCount.style.transform = 'scale(1.5)';
      setTimeout(() => cCount.style.transform = 'scale(1)', 200);
    }
  }

  updateCart(); // Initialize cart from localStorage

  document.querySelectorAll('.checkout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'checkout.html';
    });
  });

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.menu-item');
      addToCart(card.dataset.name, card.querySelector('.price-tag').textContent);
    });
  });

  if (addModalBtn) {
    addModalBtn.addEventListener('click', () => {
      if (currentModalItem) {
        addToCart(currentModalItem.dataset.name, currentModalItem.querySelector('.price-tag').textContent);
        closeQuickView();
      }
    });
  }


  // --- 5. Testimonials Carousel ---
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  if(slides.length > 0) {
    nextBtn?.addEventListener('click', () => { nextSlide(); resetSlideInterval(); });
    prevBtn?.addEventListener('click', () => { prevSlide(); resetSlideInterval(); });
    function resetSlideInterval() { clearInterval(slideInterval); slideInterval = setInterval(nextSlide, 4000); }
    slideInterval = setInterval(nextSlide, 4000);
  }

  // --- 6. Back To Top & Parallax ---
  const backToTopBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const x = (window.innerWidth / 2 - e.pageX) / 35;
      const y = (window.innerHeight / 2 - e.pageY) / 35;
      heroContent.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    });
  }

  // --- 7. Reveal Observer ---
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('active'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // --- 8. Checkout Page Logic ---
  const checkoutItemsContainer = document.getElementById('checkout-cart-items');
  if (checkoutItemsContainer) {
    checkoutItemsContainer.innerHTML = '';
    if (cartItems.length === 0) {
      checkoutItemsContainer.innerHTML = '<p style="color:var(--text-light); font-style:italic;">Your cart is empty.</p>';
    } else {
      cartItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'summary-line';
        div.innerHTML = `<span>${item.name}</span><span>$${item.price.toFixed(2)}</span>`;
        checkoutItemsContainer.appendChild(div);
      });
      const subtotal = cartItems.reduce((acc, curr) => acc + curr.price, 0);
      document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
      document.getElementById('checkout-total').textContent = `$${(subtotal + 4.99).toFixed(2)}`;
    }

    const checkoutForm = document.querySelector('.checkout-form form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Payment successful! Your order is processing.', 'ph-check-circle');
        localStorage.removeItem('yummy_cart');
        cartItems = [];
        updateCart();
        setTimeout(() => { window.location.href = 'index.html'; }, 3000);
      });
    }
  }
});
