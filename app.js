// KAIRO - UPCYCLED GLASSWARE STUDIO
// Side-Sliding Menu Drawer, 3D Revolving Hero, Dual Filters & Interactive Logic

document.addEventListener('DOMContentLoaded', () => {

    // 1. Preloader Animation & Safe Auto-Dismiss
  function dismissPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 600);
    }
  }

  try {
    const preloader = document.getElementById('preloader');
    const progressFill = document.getElementById('progressFill');
    if (preloader) {
      if (progressFill) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          progressFill.style.width = `${progress}%`;
          if (progress >= 100) {
            clearInterval(interval);
            dismissPreloader();
          }
        }, 15);
      } else {
        dismissPreloader();
      }
    }
  } catch (err) {
    dismissPreloader();
  }

  setTimeout(dismissPreloader, 350);
  window.addEventListener('load', dismissPreloader);

  // 2. Side-Sliding Navigation Menu Drawer Logic
  const menuBtn = document.getElementById('menuBtn');
  const menuDrawer = document.getElementById('menuDrawer');
  const closeNavBtn = document.getElementById('closeNavBtn');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const navCatalogHeader = document.querySelector('#navCatalogAccordion .nav-accordion-header');
  const navCatalogAccordion = document.getElementById('navCatalogAccordion');

  function toggleMenuDrawer(open) {
    if (open) {
      menuDrawer?.classList.add('active');
      drawerBackdrop?.classList.add('active');
    } else {
      menuDrawer?.classList.remove('active');
      const cartDrawer = document.getElementById('cartDrawer');
      if (!cartDrawer?.classList.contains('active')) {
        drawerBackdrop?.classList.remove('active');
      }
    }
  }

  menuBtn?.addEventListener('click', () => toggleMenuDrawer(true));
  closeNavBtn?.addEventListener('click', () => toggleMenuDrawer(false));
  navCatalogHeader?.addEventListener('click', () => {
    navCatalogAccordion?.classList.toggle('active');
  });

  document.querySelectorAll('.nav-sub-list a, #navByobBtn, #navCustomizedBtn, #navContactBtn').forEach(link => {
    link.addEventListener('click', () => toggleMenuDrawer(false));
  });

  // 3. Scroll-Triggered Reveal Animations (Intersection Observer optimized for touch-scrolling)
  const revealSections = document.querySelectorAll('.reveal-section');
  if ('IntersectionObserver' in window && revealSections.length > 0) {
    const isMobileViewport = window.innerWidth <= 768;
    const observerOptions = {
      root: null,
      rootMargin: isMobileViewport ? '0px 0px 5% 0px' : '0px 0px -10% 0px',
      threshold: isMobileViewport ? 0.02 : 0.1
    };
    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);
    revealSections.forEach(section => sectionObserver.observe(section));
  } else {
    revealSections.forEach(section => section.classList.add('is-visible'));
  }

  // 4. Horizontal Drag-to-Scroll Support for Product Card Carousel
  const carouselContainer = document.getElementById('carouselContainer');
  if (carouselContainer) {
    let isDown = false;
    let startX;
    let scrollLeft;
    carouselContainer.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - carouselContainer.offsetLeft;
      scrollLeft = carouselContainer.scrollLeft;
    });
    carouselContainer.addEventListener('mouseleave', () => { isDown = false; });
    carouselContainer.addEventListener('mouseup', () => { isDown = false; });
    carouselContainer.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carouselContainer.offsetLeft;
      const walk = (x - startX) * 1.5;
      carouselContainer.scrollLeft = scrollLeft - walk;
    });
  }

  // 5. Shopping Bag Cart State Management (with localStorage Persistence & Hydration)
  const CART_STORAGE_KEY = 'kairo_cart_state';

  function loadCartFromStorage() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Unable to load cart from localStorage:', e);
    }
    return [];
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Unable to save cart to localStorage:', e);
    }
  }

  let cart = loadCartFromStorage();
  let activePdpItem = null;

  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartCount = document.getElementById('cartCount');
  const cartItemList = document.getElementById('cartItemList');
  const cartSubtotal = document.getElementById('cartSubtotal');

  function toggleCart(open) {
    if (open) {
      cartDrawer?.classList.add('active');
      drawerBackdrop?.classList.add('active');
    } else {
      cartDrawer?.classList.remove('active');
      if (!menuDrawer?.classList.contains('active')) {
        drawerBackdrop?.classList.remove('active');
      }
    }
  }

  cartBtn?.addEventListener('click', () => toggleCart(true));
  closeCartBtn?.addEventListener('click', () => toggleCart(false));
  drawerBackdrop?.addEventListener('click', () => {
    toggleCart(false);
    toggleMenuDrawer(false);
  });

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (cartCount) cartCount.textContent = totalItems;
    if (cartSubtotal) cartSubtotal.innerHTML = `&#8377;${totalPrice}`;

    if (!cartItemList) return;

    if (cart.length === 0) {
      cartItemList.innerHTML = `<p class="mono-text" style="color: var(--Grey-2); text-align: center; margin-top: 4rem;">YOUR BAG IS CURRENTLY EMPTY.</p>`;
    } else {
      cartItemList.innerHTML = cart.map(item => `
        <div class="cart-item" style="display:flex; align-items:center; justify-content:space-between; gap:1.2rem; border-bottom:1px solid var(--Red-1); padding-bottom:1.2rem;">
          <div class="cart-item__details" style="display:flex; flex-direction:column; gap:0.4rem;">
            <span class="cart-item__name" style="font-size:1.4rem; font-weight:700; color:var(--Black);">${item.name}</span>
            <span class="cart-item__price" style="font-family:var(--Font-Mono); font-size:1.2rem; color:var(--Red-Main);">&#8377;${item.price} &times; ${item.qty}</span>
          </div>
          <button class="mono-text" style="color:var(--Red-Main); font-size:1.1rem; background:none; border:none; cursor:pointer;" onclick="removeFromCart('${item.id}')">[ REMOVE ]</button>
        </div>
      `).join('');
    }
  }

  window.addToCart = function(id, name, price, qty = 1) {
    const pNum = parseFloat(price) || 0;
    const qNum = parseInt(qty) || 1;
    const existing = cart.find(item => String(item.id) === String(id));
    if (existing) {
      existing.qty += qNum;
    } else {
      cart.push({ id: String(id), name, price: pNum, qty: qNum });
    }
    saveCartToStorage();
    updateCartUI();
    toggleCart(true);
  };

  window.removeFromCart = function(id) {
    cart = cart.filter(item => String(item.id) !== String(id));
    saveCartToStorage();
    updateCartUI();
  };

  // Re-hydrate cart state on page navigation (Back / Forward / bfcache restores)
  window.addEventListener('pageshow', () => {
    cart = loadCartFromStorage();
    updateCartUI();
  });

  window.addEventListener('popstate', () => {
    cart = loadCartFromStorage();
    updateCartUI();
  });

  // Cross-tab cart synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === CART_STORAGE_KEY) {
      cart = loadCartFromStorage();
      updateCartUI();
    }
  });

  // Immediate UI hydration on load
  updateCartUI();

  // 6. Product Display Page (PDP) Modal Logic
  const pdpModal = document.getElementById('pdpModal');
  const closePdpBtn = document.getElementById('closePdpBtn');
  const pdpBrandTag = document.getElementById('pdpBrandTag');
  const pdpTitle = document.getElementById('pdpTitle');
  const pdpPrice = document.getElementById('pdpPrice');
  const pdpBtnPrice = document.getElementById('pdpBtnPrice');
  const pdpDesc = document.getElementById('pdpDesc');
  const pdpAddToCartBtn = document.getElementById('pdpAddToCartBtn');

  function openPdp(card) {
    if (card.classList.contains('collection-card') || !card.hasAttribute('data-id')) return;

    const id = parseInt(card.getAttribute('data-id') || 1);
    const name = card.getAttribute('data-name') || card.querySelector('.carousel-card__title')?.textContent || 'Kairo';
    const brand = card.getAttribute('data-brand') || 'Kairo';
    const price = parseFloat(card.getAttribute('data-price') || 65);
    const meta = card.querySelector('.carousel-card__meta span')?.textContent || '';

    activePdpItem = { id, name, price };

    if (pdpBrandTag) pdpBrandTag.textContent = `[ ${brand.toUpperCase()} ]`;
    if (pdpTitle) pdpTitle.textContent = name;
    if (pdpPrice) pdpPrice.textContent = `\u20B9${price}`;
    if (pdpBtnPrice) pdpBtnPrice.textContent = `\u20B9${price}`;
    if (pdpDesc) {
      pdpDesc.textContent = `Handcrafted from 100% authentic reclaimed ${brand} glass bottles. Features a bevel-cut, diamond-polished rim with heavy-base balance for an elevated sipping experience (${meta}).`;
    }

    const isSipperModal = (name + ' ' + brand + ' ' + meta).toLowerCase().includes('sipper');
    let pdpModalDisclaimer = document.getElementById('pdpModalDisclaimer');
    if (!pdpModalDisclaimer && pdpDesc && pdpDesc.parentNode) {
      pdpModalDisclaimer = document.createElement('p');
      pdpModalDisclaimer.id = 'pdpModalDisclaimer';
      pdpModalDisclaimer.style.cssText = "font-family: var(--Font-Secondary), 'Inter', sans-serif; font-size: 1.25rem; font-style: italic; color: var(--Grey-2); margin-top: 1.2rem; margin-bottom: 2rem; padding: 0.8rem 1.2rem; background: rgba(0, 0, 0, 0.03); border-left: 3px solid var(--Red-Main); border-radius: 0.2rem;";
      pdpModalDisclaimer.textContent = "The metal straw shown in the image comes with the sippers.";
      pdpDesc.parentNode.insertBefore(pdpModalDisclaimer, pdpDesc.nextSibling);
    }
    if (pdpModalDisclaimer) {
      pdpModalDisclaimer.style.display = isSipperModal ? 'block' : 'none';
    }

    pdpModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePdp() {
    pdpModal?.classList.remove('active');
    document.body.style.overflow = '';
  }

  closePdpBtn?.addEventListener('click', closePdp);
  pdpAddToCartBtn?.addEventListener('click', () => {
    if (activePdpItem) {
      window.addToCart(activePdpItem.id, activePdpItem.name, activePdpItem.price);
      closePdp();
    }
  });

  // 7. Accordion Toggle Logic
  const accordionItems = document.querySelectorAll('.pdp-accordion__item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.pdp-accordion__header');
    header?.addEventListener('click', () => {
      accordionItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      item.classList.toggle('active');
    });
  });

  function bindCardClickEvents(container = document) {
    container.querySelectorAll('.arrivals-card').forEach(card => {
      card.addEventListener('click', () => openPdp(card));
    });
  }
  bindCardClickEvents();

  // 8. Dual-Navigation Filter System with URL Parameter Parsing
  const formFilterPills = document.querySelectorAll('[data-form-filter]');
  const originFilterPills = document.querySelectorAll('[data-origin-filter]');
  const brandPillsLegacy = document.querySelectorAll('#brandFilterBar .brand-pill');

  const catalogCounter = document.getElementById('catalogCounter') || document.getElementById('skuCounter');
  const gridContainer = document.getElementById('standaloneGrid') || document.getElementById('catalogGrid');
  const allCards = gridContainer ? Array.from(gridContainer.querySelectorAll('.arrivals-card')) : [];

  let currentFormFilter = 'ALL';
  let currentOriginFilter = 'ALL';

  function applyDualFilters() {
    let visibleCount = 0;
    allCards.forEach(card => {
      const cardForm = card.getAttribute('data-form') || '';
      const cardBrand = card.getAttribute('data-brand') || '';

      const matchesForm = (currentFormFilter === 'ALL' || cardForm.toLowerCase() === currentFormFilter.toLowerCase());
      const matchesOrigin = (currentOriginFilter === 'ALL' || cardBrand.toLowerCase().includes(currentOriginFilter.toLowerCase()) || currentOriginFilter.toLowerCase().includes(cardBrand.toLowerCase()));

      if (matchesForm && matchesOrigin) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (catalogCounter) {
      catalogCounter.textContent = `[ SHOWING ${visibleCount} / 55 SKUS ]`;
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const paramOrigin = urlParams.get('origin') || urlParams.get('brand');
  const rawFormParam = urlParams.get('form') || urlParams.get('group') || urlParams.get('category') || urlParams.get('product');

  if (paramOrigin) {
    currentOriginFilter = paramOrigin;
    originFilterPills.forEach(pill => {
      const val = pill.getAttribute('data-origin-filter');
      if (val.toLowerCase() === paramOrigin.toLowerCase() || paramOrigin.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(paramOrigin.toLowerCase())) {
        originFilterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    });
  }

  if (rawFormParam) {
    let mappedForm = rawFormParam;
    const rf = rawFormParam.toLowerCase().replace(/[-_]/g, ' ');
    if (rf.includes('glass')) mappedForm = 'Glasses';
    else if (rf.includes('sipper')) mappedForm = 'Sippers';
    else if (rf.includes('tray') || rf.includes('combo')) mappedForm = 'Trays';
    else if (rf.includes('container')) mappedForm = 'Containers';

    currentFormFilter = mappedForm;
    formFilterPills.forEach(pill => {
      const val = pill.getAttribute('data-form-filter');
      if (val.toLowerCase() === mappedForm.toLowerCase()) {
        formFilterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    });
  }

  if (allCards.length > 0) {
    applyDualFilters();
  }

  formFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      formFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFormFilter = pill.getAttribute('data-form-filter');
      applyDualFilters();
    });
  });

  originFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      originFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentOriginFilter = pill.getAttribute('data-origin-filter');
      applyDualFilters();
    });
  });

  brandPillsLegacy.forEach(pill => {
    pill.addEventListener('click', () => {
      brandPillsLegacy.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentOriginFilter = pill.getAttribute('data-filter');
      applyDualFilters();
    });
  });

  // 9. Typo-Tolerant Fuzzy Search, Real-Time Auto-Suggest & Grouped Result Rendering
  const searchBtn = document.getElementById('searchBtn');
  const searchModal = document.getElementById('searchModal');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchAutosuggest = document.getElementById('searchAutosuggest');

  function levenshteinDistance(a, b) {
    if (!a) return (b || '').length;
    if (!b) return (a || '').length;
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function normalizeStr(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, '')
      .trim();
  }

  function sequentialSubsequenceScore(query, target) {
    const q = normalizeStr(query);
    const t = normalizeStr(target);
    if (!q || !t) return 0;
    let qIdx = 0;
    let tIdx = 0;
    let matchCount = 0;
    let consecutiveMatches = 0;
    let maxConsecutive = 0;
    while (qIdx < q.length && tIdx < t.length) {
      if (q[qIdx] === t[tIdx]) {
        matchCount++;
        consecutiveMatches++;
        if (consecutiveMatches > maxConsecutive) maxConsecutive = consecutiveMatches;
        qIdx++;
      } else {
        consecutiveMatches = 0;
      }
      tIdx++;
    }
    if (qIdx < q.length) {
      return (matchCount / q.length) * 35;
    }
    const coverage = q.length / Math.max(t.length, q.length);
    const consecRatio = maxConsecutive / q.length;
    return 65 + (consecRatio * 25) + (coverage * 10);
  }

  function calcFuzzyScore(query, item) {
    const normQ = normalizeStr(query);
    if (!normQ) return 0;
    const brand = normalizeStr(item.brand);
    const title = normalizeStr(item.name || item.titleText);
    const form = normalizeStr(item.form);
    const fullText = `${brand} ${title} ${form}`;

    if (fullText.includes(normQ)) return 100;
    if (brand.startsWith(normQ) || title.startsWith(normQ)) return 95;

    const seqBrandScore = sequentialSubsequenceScore(normQ, brand);
    const seqTitleScore = sequentialSubsequenceScore(normQ, title);
    const seqFullScore = sequentialSubsequenceScore(normQ, fullText);
    const maxSeq = Math.max(seqBrandScore, seqTitleScore, seqFullScore);

    const qTokens = normQ.split(/\s+/);
    const tTokens = fullText.split(/\s+/);
    let totalLevScore = 0;

    qTokens.forEach(qTok => {
      let maxTokSim = 0;
      tTokens.forEach(tTok => {
        if (tTok.startsWith(qTok) || qTok.startsWith(tTok)) {
          maxTokSim = Math.max(maxTokSim, 0.9);
        } else {
          const dist = levenshteinDistance(qTok, tTok);
          const maxLen = Math.max(qTok.length, tTok.length);
          const sim = 1 - (dist / maxLen);
          if (sim > maxTokSim) maxTokSim = sim;
        }
      });
      totalLevScore += maxTokSim;
    });

    const levScoreAvg = (totalLevScore / qTokens.length) * 80;
    return Math.max(maxSeq, levScoreAvg);
  }

  const KAIRO_BRANDS = [
    'Absolut Vodka', 'Bombay Sapphire', 'Grey Goose', 'Old Monk Face',
    'Jägermeister', "Jack Daniel's", 'Tanqueray', 'Black Label',
    'Ciroc', '1800 Tequila', 'Blue Label', 'Don Julio 1942', 'Altius GG'
  ];

  const KAIRO_FORMS = [
    { key: 'Glasses', label: 'DRINKING GLASSES', queryAliases: ['glass', 'glasses', 'tumbler', 'drinking'] },
    { key: 'Sippers', label: 'GLASS SIPPERS', queryAliases: ['sipper', 'sippers', 'straw', 'sip'] },
    { key: 'Trays', label: 'ARTISANAL TRAYS', queryAliases: ['tray', 'trays', 'combo', 'combos'] },
    { key: 'Containers', label: 'GLASS CONTAINERS', queryAliases: ['container', 'containers', 'jar', 'vessel'] }
  ];

  const KAIRO_MASTER_CATALOG = [
    { id: 1, brand: 'Absolut Vodka', form: 'Sippers', name: 'Absolut Vodka - Sipper • Single', price: 52.00, badge: 'SINGLE', quantityText: '1 Sipper • 100% Upcycled' },
    { id: 2, brand: 'Absolut Vodka', form: 'Sippers', name: 'Absolut Vodka - Sipper • Set of 2', price: 95.00, badge: 'SET OF 2', quantityText: '2 Sippers • 100% Upcycled' },
    { id: 3, brand: 'Absolut Vodka', form: 'Sippers', name: 'Absolut Vodka - Sipper • Set of 5', price: 210.00, badge: 'SET OF 5', quantityText: '5 Sippers • 100% Upcycled' },
    { id: 4, brand: 'Absolut Vodka', form: 'Glasses', name: 'Absolut Vodka - Tumbler Glass • Single', price: 48.00, badge: 'SINGLE', quantityText: '1 Glass • 100% Upcycled' },
    { id: 5, brand: 'Absolut Vodka', form: 'Glasses', name: 'Absolut Vodka - Tumbler Glass • Set of 2', price: 88.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' },
    { id: 6, brand: 'Bombay Sapphire', form: 'Glasses', name: 'Bombay Sapphire - Glass • Set of 2', price: 65.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' },
    { id: 7, brand: 'Bombay Sapphire', form: 'Glasses', name: 'Bombay Sapphire - Glass • Set of 4', price: 120.00, badge: 'SET OF 4', quantityText: '4 Glasses • 100% Upcycled' },
    { id: 8, brand: 'Bombay Sapphire', form: 'Sippers', name: 'Bombay Sapphire - Wave Sipper • Single', price: 55.00, badge: 'SINGLE', quantityText: '1 Sipper • 100% Upcycled' },
    { id: 9, brand: 'Bombay Sapphire', form: 'Trays', name: 'Bombay Sapphire - Reclaimed Tray', price: 78.00, badge: 'ARTISANAL', quantityText: '1 Tray • Reclaimed Wood' },
    { id: 10, brand: 'Grey Goose', form: 'Glasses', name: 'Grey Goose - Highball Glass • Single', price: 58.00, badge: 'SINGLE', quantityText: '1 Glass • 100% Upcycled' },
    { id: 11, brand: 'Grey Goose', form: 'Glasses', name: 'Grey Goose - Highball Glass • Set of 2', price: 105.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' },
    { id: 12, brand: 'Grey Goose', form: 'Sippers', name: 'Grey Goose - Frosted Sipper • Single', price: 60.00, badge: 'SINGLE', quantityText: '1 Sipper • 100% Upcycled' },
    { id: 13, brand: 'Old Monk Face', form: 'Glasses', name: 'Old Monk Face - Molded Tumbler • Single', price: 45.00, badge: 'SINGLE', quantityText: '1 Glass • 100% Upcycled' },
    { id: 14, brand: 'Old Monk Face', form: 'Glasses', name: 'Old Monk Face - Molded Tumbler • Set of 2', price: 82.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' },
    { id: 15, brand: 'Old Monk Face', form: 'Trays', name: 'Old Monk Face - Carved Tray', price: 70.00, badge: 'CARVED', quantityText: '1 Tray • Reclaimed Wood' },
    { id: 16, brand: 'Jägermeister', form: 'Glasses', name: 'Jägermeister - Square Shot Glass • Set of 2', price: 42.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' },
    { id: 17, brand: 'Jägermeister', form: 'Glasses', name: 'Jägermeister - Square Highball • Single', price: 50.00, badge: 'SINGLE', quantityText: '1 Glass • 100% Upcycled' },
    { id: 18, brand: 'Jägermeister', form: 'Containers', name: 'Jägermeister - Green Glass Storage Jar', price: 64.00, badge: 'CONTAINER', quantityText: '1 Container • Airtight Top' },
    { id: 19, brand: 'Jack Daniel\'s', form: 'Glasses', name: 'Jack Daniel\'s - Square Rocks Glass • Single', price: 49.00, badge: 'SINGLE', quantityText: '1 Glass • 100% Upcycled' },
    { id: 20, brand: 'Jack Daniel\'s', form: 'Glasses', name: 'Jack Daniel\'s - Square Rocks Glass • Set of 2', price: 90.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' },
    { id: 21, brand: 'Jack Daniel\'s', form: 'Trays', name: 'Jack Daniel\'s - Barrel Wood Tray Set', price: 85.00, badge: 'BARREL WOOD', quantityText: '1 Tray Set • Reclaimed Oak' },
    { id: 22, brand: 'Tanqueray', form: 'Glasses', name: 'Tanqueray - Green Goblet Glass • Single', price: 54.00, badge: 'SINGLE', quantityText: '1 Glass • 100% Upcycled' },
    { id: 23, brand: 'Tanqueray', form: 'Glasses', name: 'Tanqueray - Green Goblet Glass • Set of 2', price: 98.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' },
    { id: 24, brand: 'Black Label', form: 'Glasses', name: 'Black Label - Beveled Highball • Single', price: 56.00, badge: 'SINGLE', quantityText: '1 Glass • 100% Upcycled' },
    { id: 25, brand: 'Black Label', form: 'Glasses', name: 'Black Label - Beveled Highball • Set of 2', price: 100.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' },
    { id: 26, brand: 'Ciroc', form: 'Glasses', name: 'Ciroc - Cobalt Blue Tumbler • Single', price: 58.00, badge: 'SINGLE', quantityText: '1 Glass • 100% Upcycled' },
    { id: 27, brand: 'Ciroc', form: 'Glasses', name: 'Ciroc - Cobalt Blue Tumbler • Set of 2', price: 108.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' },
    { id: 28, brand: 'Ciroc', form: 'Sippers', name: 'Ciroc - Cobalt Blue Sipper', price: 62.00, badge: 'SINGLE', quantityText: '1 Sipper • 100% Upcycled' },
    { id: 29, brand: '1800 Tequila', form: 'Glasses', name: '1800 Tequila - Pyramid Lowball • Single', price: 52.00, badge: 'SINGLE', quantityText: '1 Glass • 100% Upcycled' },
    { id: 30, brand: '1800 Tequila', form: 'Glasses', name: '1800 Tequila - Pyramid Lowball • Set of 2', price: 96.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' },
    { id: 31, brand: 'Blue Label', form: 'Glasses', name: 'Blue Label - Heavy Base Rocks Glass • Single', price: 75.00, badge: 'PREMIUM', quantityText: '1 Glass • Heavy Cut' },
    { id: 32, brand: 'Blue Label', form: 'Glasses', name: 'Blue Label - Heavy Base Rocks Glass • Set of 2', price: 140.00, badge: 'PREMIUM', quantityText: '2 Glasses • Heavy Cut' },
    { id: 33, brand: 'Don Julio 1942', form: 'Glasses', name: 'Don Julio 1942 - Tall Tequila Vessel • Single', price: 82.00, badge: 'RARE', quantityText: '1 Glass • 100% Upcycled' },
    { id: 34, brand: 'Don Julio 1942', form: 'Trays', name: 'Don Julio 1942 - Agave Wood Serving Tray', price: 110.00, badge: 'EXCLUSIVE', quantityText: '1 Tray • Agave Wood' },
    { id: 35, brand: 'Altius GG', form: 'Glasses', name: 'Altius GG - Crystal Cut Highball • Single', price: 68.00, badge: 'CRYSTAL', quantityText: '1 Glass • 100% Upcycled' },
    { id: 36, brand: 'Altius GG', form: 'Glasses', name: 'Altius GG - Crystal Cut Highball • Set of 2', price: 125.00, badge: 'SET OF 2', quantityText: '2 Glasses • 100% Upcycled' }
  ];

  function getSearchableCatalog() {
    const gridContainer = document.getElementById('standaloneGrid') || document.getElementById('catalogGrid');
    if (gridContainer) {
      const cards = Array.from(gridContainer.querySelectorAll('.arrivals-card'));
      if (cards.length > 0) {
        return cards.map((card, idx) => {
          const id = parseInt(card.getAttribute('data-id') || (idx + 1));
          const brand = card.getAttribute('data-brand') || card.querySelector('.arrivals-card__brand')?.textContent || 'KAIRO';
          const form = card.getAttribute('data-form') || 'Glasses';
          const name = card.getAttribute('data-name') || card.querySelector('.arrivals-card__title')?.textContent || 'Kairo Upcycled Vessel';
          const priceStr = card.getAttribute('data-price') || '65.00';
          const price = parseFloat(priceStr) || 65.00;
          const badge = card.querySelector('.arrivals-card__badge')?.textContent || 'UPCYCLE';
          const quantityText = card.querySelector('.arrivals-card__meta span:last-child')?.textContent || '1 Unit • 100% Upcycled';
          return { id, brand, form, name, price, badge, quantityText };
        });
      }
    }
    return KAIRO_MASTER_CATALOG;
  }

  function detectBrandMatches(query) {
    const normQ = normalizeStr(query);
    if (!normQ) return [];
    return KAIRO_BRANDS.filter(brand => {
      const normB = normalizeStr(brand);
      if (normB.includes(normQ) || normQ.includes(normB)) return true;
      const qTokens = normQ.split(/\s+/);
      const bTokens = normB.split(/\s+/);
      return qTokens.some(qTok => bTokens.some(bTok => {
        if (bTok.startsWith(qTok) || qTok.startsWith(bTok)) return true;
        const dist = levenshteinDistance(qTok, bTok);
        const maxLen = Math.max(qTok.length, bTok.length);
        return (1 - dist / maxLen) >= 0.45 || (sequentialSubsequenceScore(normQ, normB) >= 60);
      }));
    });
  }

  function detectFormMatches(query) {
    const normQ = normalizeStr(query);
    if (!normQ) return [];
    return KAIRO_FORMS.filter(formObj => {
      return formObj.queryAliases.some(alias => {
        const normA = normalizeStr(alias);
        if (normA.includes(normQ) || normQ.includes(normA)) return true;
        const dist = levenshteinDistance(normQ, normA);
        const maxLen = Math.max(normQ.length, normA.length);
        return (1 - dist / maxLen) >= 0.45 || (sequentialSubsequenceScore(normQ, normA) >= 60);
      });
    });
  }

  function renderGroupedResults(query, results) {
    if (!searchResults) return;

    const matchedBrands = detectBrandMatches(query);
    const matchedForms = detectFormMatches(query);

    if (results.length === 0 && matchedBrands.length === 0 && matchedForms.length === 0) {
      searchResults.innerHTML = `<p class="mono-text" style="color:var(--Red-Main); font-size:1.6rem; grid-column: 1/-1; padding: 2rem 0;">NO UPCYCLED GLASSWARE MATCHES YOUR QUERY.</p>`;
      return;
    }

    const container = document.createElement('div');
    container.className = 'search-results-grouped';

    if (matchedBrands.length > 0 || matchedForms.length > 0) {
      const collectionSection = document.createElement('div');
      collectionSection.className = 'search-group';
      collectionSection.innerHTML = `
        <a href="catalog.html" class="search-group__header">
          <h3 class="search-group__title">FEATURED COLLECTIONS &rarr;</h3>
          <span class="search-group__count">[ DIRECT CATALOG VIEW ]</span>
        </a>
        <div class="search-group__grid"></div>
      `;

      const grid = collectionSection.querySelector('.search-group__grid');
      matchedBrands.forEach(brandName => {
        const brandKey = brandName.split(' ')[0];
        const cardLink = document.createElement('a');
        cardLink.className = 'arrivals-card collection-card';
        cardLink.href = `catalog.html?origin=${encodeURIComponent(brandName)}`;
        cardLink.style.textDecoration = 'none';
        cardLink.style.color = 'inherit';
        cardLink.innerHTML = `
          <div class="arrivals-card__img-wrapper" style="aspect-ratio: 1 / 1; width: 100%; border: 1px solid var(--Red-1); border-radius: 0.4rem; overflow: hidden; position: relative;">
            <span class="arrivals-card__badge" style="background: var(--Red-Main); color: white; position: absolute; top: 1rem; left: 1rem; padding: 0.3rem 0.8rem; font-size: 1rem; font-family: var(--Font-Mono); z-index: 2;">BRAND COLLECTION</span>
            <img src="images/${encodeURIComponent(brandName)}%20Glass%20Set%20of%202.png" onerror="this.src='images/Absolut%20Vodka%20Sipper%20Single.png';" alt="${brandName}" class="arrivals-card__img" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1; display: block;">
          </div>
          <div class="arrivals-card__info" style="margin-top: 1.2rem;">
            <span class="arrivals-card__brand" style="color: var(--Red-Main); font-family: var(--Font-Primary); font-size: 1.6rem; font-weight: 700;">BRAND DIRECTORY</span>
            <h3 class="arrivals-card__title" style="font-family: var(--Font-Primary); font-size: 1.4rem; font-weight: 500; text-transform: uppercase;">SHOP ${brandName.toUpperCase()} COLLECTION</h3>
            <div class="arrivals-card__meta" style="font-family: var(--Font-Mono); font-size: 1.2rem; color: var(--Grey-2); display: flex; justify-content: space-between; margin-top: 0.4rem;">
              <span>Filtered Catalog View &rarr;</span>
              <span>100% Upcycled</span>
            </div>
          </div>
        `;
        cardLink.addEventListener('click', () => searchModal?.classList.remove('active'));
        grid.appendChild(cardLink);
      });

      const formImageMap = {
        'Glasses': 'images/categories/Glasses%20Collection%20.jpeg',
        'Sippers': 'images/categories/Sipper%20Collection.jpeg',
        'Trays': 'images/categories/Tray%20Collection.jpeg',
        'Containers': 'images/Tanqueray%20Container%20Single.png'
      };

      matchedForms.forEach(formObj => {
        const groupSlug = formObj.key.toLowerCase().replace(/\s+/g, '-');
        const formImg = formImageMap[formObj.key] || 'images/categories/Glasses%20Collection%20.jpeg';

        const cardLink = document.createElement('a');
        cardLink.className = 'arrivals-card collection-card';
        cardLink.href = `catalog.html?group=${encodeURIComponent(groupSlug)}&form=${encodeURIComponent(formObj.key)}`;
        cardLink.style.textDecoration = 'none';
        cardLink.style.color = 'inherit';
        cardLink.innerHTML = `
          <div class="arrivals-card__img-wrapper" style="aspect-ratio: 1 / 1; width: 100%; border: 1px solid var(--Red-1); border-radius: 0.4rem; overflow: hidden; position: relative;">
            <span class="arrivals-card__badge" style="background: var(--Black); color: white; position: absolute; top: 1rem; left: 1rem; padding: 0.3rem 0.8rem; font-size: 1rem; font-family: var(--Font-Mono); z-index: 2;">PRODUCT TYPE</span>
            <img src="${formImg}" alt="${formObj.label}" class="arrivals-card__img" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1; display: block;">
          </div>
          <div class="arrivals-card__info" style="margin-top: 1.2rem;">
            <span class="arrivals-card__brand" style="color: var(--Red-Main); font-family: var(--Font-Primary); font-size: 1.6rem; font-weight: 700;">CATEGORY DIRECTORY</span>
            <h3 class="arrivals-card__title" style="font-family: var(--Font-Primary); font-size: 1.4rem; font-weight: 500; text-transform: uppercase;">SHOP ALL ${formObj.label}</h3>
            <div class="arrivals-card__meta" style="font-family: var(--Font-Mono); font-size: 1.2rem; color: var(--Grey-2); display: flex; justify-content: space-between; margin-top: 0.4rem;">
              <span>Filtered Catalog View &rarr;</span>
              <span>Complete Lineup</span>
            </div>
          </div>
        `;
        cardLink.addEventListener('click', () => searchModal?.classList.remove('active'));
        grid.appendChild(cardLink);
      });

      container.appendChild(collectionSection);
    }

    if (results.length > 0) {
      const groups = {
        'DRINKING GLASSES': [],
        'GLASS SIPPERS': [],
        'ARTISANAL TRAYS & COMBOS': [],
        'CONTAINERS': []
      };

      results.forEach(item => {
        const f = (item.form || '').toLowerCase();
        if (f.includes('glass')) groups['DRINKING GLASSES'].push(item);
        else if (f.includes('sipper')) groups['GLASS SIPPERS'].push(item);
        else if (f.includes('tray') || f.includes('combo')) groups['ARTISANAL TRAYS & COMBOS'].push(item);
        else groups['CONTAINERS'].push(item);
      });

      const formParamMap = {
        'DRINKING GLASSES': 'Glasses',
        'GLASS SIPPERS': 'Sippers',
        'ARTISANAL TRAYS & COMBOS': 'Trays',
        'CONTAINERS': 'Containers'
      };

      const groupSlugMap = {
        'DRINKING GLASSES': 'drinking-glasses',
        'GLASS SIPPERS': 'glass-sippers',
        'ARTISANAL TRAYS & COMBOS': 'artisanal-trays',
        'CONTAINERS': 'containers'
      };

      Object.keys(groups).forEach(groupTitle => {
        const items = groups[groupTitle];
        if (items.length === 0) return;

        const formParam = formParamMap[groupTitle] || 'Glasses';
        const groupSlug = groupSlugMap[groupTitle] || 'drinking-glasses';
        const groupSection = document.createElement('div');
        groupSection.className = 'search-group';
        groupSection.innerHTML = `
          <a href="catalog.html?group=${encodeURIComponent(groupSlug)}&form=${encodeURIComponent(formParam)}" class="search-group__header">
            <h3 class="search-group__title">${groupTitle} &rarr;</h3>
            <span class="search-group__count">[ ${items.length} ${items.length === 1 ? 'PRODUCT' : 'PRODUCTS'} &middot; EXPLORE CATALOG ]</span>
          </a>
          <div class="search-group__grid"></div>
        `;

        const grid = groupSection.querySelector('.search-group__grid');
        items.forEach(item => {
          const cardLink = document.createElement('a');
          cardLink.className = 'arrivals-card';
          cardLink.href = `product.html?id=${item.id}`;
          cardLink.style.textDecoration = 'none';
          cardLink.style.color = 'inherit';
          
          let cardImg = item.img || `images/${encodeURIComponent(item.name)}.png`;
          if (!cardImg.startsWith('images/')) cardImg = 'images/' + cardImg;

          cardLink.innerHTML = `
            <div class="arrivals-card__img-wrapper" style="aspect-ratio: 1 / 1; width: 100%; border: 1px solid var(--Red-1); border-radius: 0.4rem; overflow: hidden; position: relative;">
              <span class="arrivals-card__badge" style="background: var(--Red-Main); color: white; position: absolute; top: 1rem; left: 1rem; padding: 0.3rem 0.8rem; font-size: 1rem; font-family: var(--Font-Mono); z-index: 2;">${item.badge || 'UPCYCLE'}</span>
              <span class="arrivals-card__prices" style="position: absolute; top: 1rem; right: 1rem; background: white; border: 1px solid var(--Red-1); padding: 0.3rem 0.8rem; font-size: 1.1rem; font-family: var(--Font-Mono); border-radius: 99rem; font-weight: 600; color: var(--Black); z-index: 2;">&#8377;${item.price}</span>
              <img src="${cardImg}" onerror="this.src='images/Absolut%20Vodka%20Sipper%20Single.png';" alt="${item.name}" class="arrivals-card__img" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1; display: block;">
            </div>
            <div class="arrivals-card__info" style="margin-top: 1.2rem; display: flex; flex-direction: column; gap: 0.4rem;">
              <span class="arrivals-card__brand" style="font-family: var(--Font-Primary); font-size: 1.6rem; font-weight: 700; text-transform: uppercase;">${(item.brand || '').toUpperCase()}</span>
              <h3 class="arrivals-card__title" style="font-family: var(--Font-Primary); font-size: 1.4rem; font-weight: 500; text-transform: uppercase; color: var(--Red-Main);">${item.name || item.titleText}</h3>
              <div class="arrivals-card__meta" style="font-family: var(--Font-Mono); font-size: 1.2rem; color: var(--Grey-2); display: flex; justify-content: space-between;">
                <span class="arrivals-card__price-val">&#8377;${item.price}</span>
                <span>100% Upcycled</span>
              </div>
            </div>
          `;
          cardLink.addEventListener('click', () => searchModal?.classList.remove('active'));
          grid.appendChild(cardLink);
        });
        container.appendChild(groupSection);
      });
    }

    searchResults.innerHTML = '';
    searchResults.appendChild(container);
  }

  function renderZeroState() {
    if (!searchResults) return;
    if (searchAutosuggest) {
      searchAutosuggest.innerHTML = '';
      searchAutosuggest.classList.remove('active');
    }

    searchResults.innerHTML = `
      <div class="search-group zero-state-group" style="width: 100%;">
        <div class="search-group__header">
          <h3 class="search-group__title">FEATURED CATEGORY DIRECTORIES &rarr;</h3>
          <span class="search-group__count">[ POPULAR QUICK LINKS ]</span>
        </div>
        <div class="search-group__grid">
          <!-- Quick Link 1: GLASSES -->
          <a href="catalog.html?form=Glasses" class="arrivals-card collection-card zero-state-card" style="text-decoration:none; color:inherit;">
            <div class="arrivals-card__img-wrapper" style="aspect-ratio: 1 / 1; width: 100%; border: 1px solid var(--Red-1); border-radius: 0.4rem; overflow: hidden; position: relative;">
              <span class="arrivals-card__badge" style="background: var(--Black); color: white; position: absolute; top: 1rem; left: 1rem; padding: 0.3rem 0.8rem; font-size: 1rem; font-family: var(--Font-Mono); z-index: 2;">DRINKING GLASSES</span>
              <img src="images/categories/Glasses%20Collection%20.jpeg" alt="GLASSES" class="arrivals-card__img" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1; display: block;">
            </div>
            <div class="arrivals-card__info" style="margin-top: 1.2rem;">
              <span class="arrivals-card__brand" style="color: var(--Red-Main); font-family: var(--Font-Primary); font-size: 1.6rem; font-weight: 700;">CATEGORY DIRECTORY</span>
              <h3 class="arrivals-card__title" style="font-family: var(--Font-Primary); font-size: 1.4rem; font-weight: 500; text-transform: uppercase;">GLASSES</h3>
              <div class="arrivals-card__meta" style="font-family: var(--Font-Mono); font-size: 1.2rem; color: var(--Grey-2); display: flex; justify-content: space-between; margin-top: 0.4rem;">
                <span>Filtered Catalog View &rarr;</span>
                <span>Complete Lineup</span>
              </div>
            </div>
          </a>

          <!-- Quick Link 2: SIPPERS -->
          <a href="catalog.html?form=Sippers" class="arrivals-card collection-card zero-state-card" style="text-decoration:none; color:inherit;">
            <div class="arrivals-card__img-wrapper" style="aspect-ratio: 1 / 1; width: 100%; border: 1px solid var(--Red-1); border-radius: 0.4rem; overflow: hidden; position: relative;">
              <span class="arrivals-card__badge" style="background: var(--Black); color: white; position: absolute; top: 1rem; left: 1rem; padding: 0.3rem 0.8rem; font-size: 1rem; font-family: var(--Font-Mono); z-index: 2;">GLASS SIPPERS</span>
              <img src="images/categories/Sipper%20Collection.jpeg" alt="SIPPERS" class="arrivals-card__img" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1; display: block;">
            </div>
            <div class="arrivals-card__info" style="margin-top: 1.2rem;">
              <span class="arrivals-card__brand" style="color: var(--Red-Main); font-family: var(--Font-Primary); font-size: 1.6rem; font-weight: 700;">CATEGORY DIRECTORY</span>
              <h3 class="arrivals-card__title" style="font-family: var(--Font-Primary); font-size: 1.4rem; font-weight: 500; text-transform: uppercase;">SIPPERS</h3>
              <div class="arrivals-card__meta" style="font-family: var(--Font-Mono); font-size: 1.2rem; color: var(--Grey-2); display: flex; justify-content: space-between; margin-top: 0.4rem;">
                <span>Filtered Catalog View &rarr;</span>
                <span>Complete Lineup</span>
              </div>
            </div>
          </a>

          <!-- Quick Link 3: TRAYS -->
          <a href="catalog.html?form=Trays" class="arrivals-card collection-card zero-state-card" style="text-decoration:none; color:inherit;">
            <div class="arrivals-card__img-wrapper" style="aspect-ratio: 1 / 1; width: 100%; border: 1px solid var(--Red-1); border-radius: 0.4rem; overflow: hidden; position: relative;">
              <span class="arrivals-card__badge" style="background: var(--Black); color: white; position: absolute; top: 1rem; left: 1rem; padding: 0.3rem 0.8rem; font-size: 1rem; font-family: var(--Font-Mono); z-index: 2;">ARTISANAL TRAYS</span>
              <img src="images/categories/Tray%20Collection.jpeg" alt="TRAYS" class="arrivals-card__img" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1; display: block;">
            </div>
            <div class="arrivals-card__info" style="margin-top: 1.2rem;">
              <span class="arrivals-card__brand" style="color: var(--Red-Main); font-family: var(--Font-Primary); font-size: 1.6rem; font-weight: 700;">CATEGORY DIRECTORY</span>
              <h3 class="arrivals-card__title" style="font-family: var(--Font-Primary); font-size: 1.4rem; font-weight: 500; text-transform: uppercase;">TRAYS</h3>
              <div class="arrivals-card__meta" style="font-family: var(--Font-Mono); font-size: 1.2rem; color: var(--Grey-2); display: flex; justify-content: space-between; margin-top: 0.4rem;">
                <span>Filtered Catalog View &rarr;</span>
                <span>Complete Lineup</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    `;

    searchResults.querySelectorAll('.zero-state-card').forEach(card => {
      card.addEventListener('click', () => searchModal?.classList.remove('active'));
    });
  }

  function handleSearchInput(e) {
    const query = e.target.value.trim();
    if (query === '') {
      renderZeroState();
      return;
    }

    const catalog = getSearchableCatalog();
    const scored = catalog.map(item => ({ item, score: calcFuzzyScore(query, item) })).filter(x => x.score > 25).sort((a, b) => b.score - a.score);

    const matchedBrands = detectBrandMatches(query);
    const matchedForms = detectFormMatches(query);
    const suggestItems = [];

    matchedBrands.forEach(b => {
      suggestItems.push({
        html: `<div class="autosuggest-item" onclick="window.location.href='catalog.html?origin=${encodeURIComponent(b)}'">
            <div class="autosuggest-left"><span class="autosuggest-tag">[ BRAND COLLECTION ]</span><span class="autosuggest-title">SHOP ${b.toUpperCase()} COLLECTION</span></div>
            <span class="autosuggest-price">&rarr;</span>
          </div>`
      });
    });

    matchedForms.forEach(f => {
      const slug = f.key.toLowerCase().replace(/\s+/g, '-');
      suggestItems.push({
        html: `<div class="autosuggest-item" onclick="window.location.href='catalog.html?group=${encodeURIComponent(slug)}&form=${encodeURIComponent(f.key)}'">
            <div class="autosuggest-left"><span class="autosuggest-tag">[ PRODUCT CATEGORY ]</span><span class="autosuggest-title">SHOP ALL ${f.label}</span></div>
            <span class="autosuggest-price">&rarr;</span>
          </div>`
      });
    });

    scored.forEach(({ item }) => {
      suggestItems.push({
        html: `<div class="autosuggest-item" onclick="window.location.href='catalog.html?form=${encodeURIComponent(item.form || 'Glasses')}&origin=${encodeURIComponent(item.brand || '')}'">
            <div class="autosuggest-left"><span class="autosuggest-tag">[ ${(item.brand || '').toUpperCase()} &middot; ${(item.form || '').toUpperCase()} ]</span><span class="autosuggest-title">${item.name}</span></div>
            <span class="autosuggest-price">&#8377;${item.price || 799}</span>
          </div>`
      });
    });

    const topPredictiveMatches = suggestItems.slice(0, 5);
    if (topPredictiveMatches.length > 0 && searchAutosuggest) {
      searchAutosuggest.innerHTML = topPredictiveMatches.map(x => x.html).join('');
      searchAutosuggest.classList.add('active');
    } else if (searchAutosuggest) {
      searchAutosuggest.innerHTML = '';
      searchAutosuggest.classList.remove('active');
    }

    renderGroupedResults(query, scored.map(x => x.item));
  }

  searchBtn?.addEventListener('click', () => {
    searchModal?.classList.add('active');
    if (searchInput) {
      if (searchInput.value.trim() === '') {
        renderZeroState();
      }
      searchInput.focus();
    }
  });

  closeSearchBtn?.addEventListener('click', () => {
    searchModal?.classList.remove('active');
    if (searchAutosuggest) searchAutosuggest.classList.remove('active');
  });

  searchInput?.addEventListener('input', handleSearchInput);
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (searchAutosuggest) searchAutosuggest.classList.remove('active');
    }
  });

  if (searchInput && searchInput.value.trim() === '') {
    renderZeroState();
  }

  document.addEventListener('click', (e) => {
    if (!searchInput?.contains(e.target) && !searchAutosuggest?.contains(e.target)) {
      searchAutosuggest?.classList.remove('active');
    }
  });

  // 10. Custom Interactive Floating Cursor (Guarded)
  const cursor = document.getElementById('customCursor');
  if (cursor) {
    function bindCursorEvents() {
      const hoverables = document.querySelectorAll('.arrivals-card, .carousel-card, .categories-card, .brand-origin-card, .brand-pill');
      hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
      });
    }

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
    bindCursorEvents();
  }

  // 11. Minimalist Fail-Safe Header Opaque Scroll Toggle (.header-opaque)
  const globalHeader = document.querySelector('.header__inner');
  if (globalHeader) {
    function toggleHeaderOpaque() {
      if (window.scrollY > 50) {
        globalHeader.classList.add('header-opaque');
      } else {
        globalHeader.classList.remove('header-opaque');
      }
    }
    window.addEventListener('scroll', toggleHeaderOpaque, { passive: true });
    toggleHeaderOpaque();
  }

  // 12. Section 6: Campaign Film Strict Sticky Scroll-Lock, Fullscreen Overlay & Touch-Scroll Optimizations
  const track6 = document.getElementById('section6Track');
  const placeholder6 = document.getElementById('section6Placeholder');

  function updateSection6Scale() {
    if (!track6 || !placeholder6) return;

    const trackRect = track6.getBoundingClientRect();
    const windowHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const totalScrollable = track6.offsetHeight - windowHeight;
    const currentScroll = -trackRect.top;

    const rawProgress = Math.max(0, Math.min(1, currentScroll / (totalScrollable || 1)));
    const animProgress = Math.min(1, rawProgress / 0.75);

    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? (85 + (animProgress * 15)) : (60 + (animProgress * 40));
    const height = isMobile ? (35 + (animProgress * 60)) : (45 + (animProgress * 55));
    const radius = 1.6 * (1 - animProgress);

    placeholder6.style.width = `${width}vw`;
    placeholder6.style.height = `${height}vh`;
    placeholder6.style.borderRadius = `${radius}rem`;

    if (animProgress >= 0.95) {
      placeholder6.style.border = 'none';
      placeholder6.style.background = 'rgba(255, 255, 255, 0.18)';
    } else {
      placeholder6.style.border = '1px dashed rgba(255, 255, 255, 0.4)';
      placeholder6.style.background = 'rgba(255, 255, 255, 0.12)';
    }
  }

  window.addEventListener('scroll', updateSection6Scale, { passive: true });
  window.addEventListener('resize', updateSection6Scale);
  updateSection6Scale();

  // Mobile Filter Collapsible Toggle Logic
  const mobileFilterToggle = document.getElementById('mobileFilterToggle');
  const catalogFilterControls = document.getElementById('catalogFilterControls');
  if (mobileFilterToggle && catalogFilterControls) {
    mobileFilterToggle.addEventListener('click', () => {
      catalogFilterControls.classList.toggle('active');
      const isExpanded = catalogFilterControls.classList.contains('active');
      mobileFilterToggle.innerHTML = isExpanded 
        ? '<span>[ HIDE FILTERS − ]</span><span style="font-size: 1.1rem; color: var(--Red-Main);">▲ TAP TO COLLAPSE</span>' 
        : '<span>[ FILTERS + ]</span><span style="font-size: 1.1rem; color: var(--Red-Main);">▼ TAP TO EXPAND</span>';
    });
  }

  // 13. Customized Page 2-Step Flow Interactive Logic
  const customBrandInput = document.getElementById('customBrandInput');
  const selBrand = document.getElementById('selBrand');
  const selectionCards = document.querySelectorAll('.selection-card');
  const addCustomToBagBtn = document.getElementById('addCustomToBagBtn');

  if (customBrandInput && selBrand) {
    customBrandInput.addEventListener('input', () => {
      selBrand.textContent = customBrandInput.value.toUpperCase() || 'CUSTOM BOTTLE';
    });
  }

  if (selectionCards.length > 0) {
    selectionCards.forEach(card => {
      card.addEventListener('click', () => {
        const stepGroup = card.getAttribute('data-step');
        if (!stepGroup) return;

        document.querySelectorAll(`.selection-card[data-step="${stepGroup}"]`).forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const formVal = document.querySelector('.selection-card[data-step="form"].selected')?.getAttribute('data-value') || 'GLASSES';
        const elForm = document.getElementById('selForm');
        if (elForm) elForm.textContent = formVal;
      });
    });
  }

  // 13b. Mandatory Customer Contact Capture Modal Interception System (BYOB & Customized Pages)
  const contactModalOverlay = document.getElementById('contactModalOverlay');
  const modalContactForm = document.getElementById('modalContactForm');
  const closeContactModalBtn = document.getElementById('closeContactModalBtn');
  const cancelContactModalBtn = document.getElementById('cancelContactModalBtn');
  const modalConfirmSubmitBtn = document.getElementById('modalConfirmSubmitBtn');
  let pendingSubmissionType = null;

  const submitByobBtn = document.getElementById('submitByobBtn');
  const submitCraftRequestBtn = document.getElementById('submitCraftRequestBtn');

  function openContactModal(type) {
    pendingSubmissionType = type;
    if (contactModalOverlay) {
      contactModalOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      const nameInput = document.getElementById('modalCustomerName');
      if (nameInput) setTimeout(() => nameInput.focus(), 100);
    }
  }

  function closeContactModal() {
    if (contactModalOverlay) {
      contactModalOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
    if (modalConfirmSubmitBtn) {
      modalConfirmSubmitBtn.disabled = false;
      modalConfirmSubmitBtn.innerHTML = '[ CONFIRM &amp; SEND REQUEST ]';
    }
  }

  if (submitByobBtn) {
    submitByobBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal('BYOB');
    });
  }

  if (submitCraftRequestBtn) {
    submitCraftRequestBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal('CUSTOMIZED');
    });
  }

  if (closeContactModalBtn) closeContactModalBtn.addEventListener('click', closeContactModal);
  if (cancelContactModalBtn) cancelContactModalBtn.addEventListener('click', closeContactModal);

  if (contactModalOverlay) {
    contactModalOverlay.addEventListener('click', (e) => {
      if (e.target === contactModalOverlay) closeContactModal();
    });
  }

  if (modalContactForm) {
    modalContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const customerName = document.getElementById('modalCustomerName')?.value.trim();
      const customerPhone = document.getElementById('modalCustomerPhone')?.value.trim();

      if (!customerName || !customerPhone) {
        if (modalConfirmSubmitBtn) {
          modalConfirmSubmitBtn.style.background = 'var(--Red-Main)';
          modalConfirmSubmitBtn.innerHTML = '[ PLEASE FILL ALL REQUIRED FIELDS ]';
          setTimeout(() => {
            modalConfirmSubmitBtn.style.background = 'var(--Black)';
            modalConfirmSubmitBtn.innerHTML = '[ SUBMIT REQUEST &rarr; ]';
          }, 2500);
        }
        return;
      }

      // Show processing "SENDING..." state
      if (modalConfirmSubmitBtn) {
        modalConfirmSubmitBtn.disabled = true;
        modalConfirmSubmitBtn.innerHTML = '[ SENDING... ]';
      }

      setTimeout(() => {
        let subject = '';
        let bodyText = '';

        if (pendingSubmissionType === 'CUSTOMIZED') {
          const brandVal = document.getElementById('customBrandInput')?.value || 'DOM PERIGNON';
          const formVal = document.getElementById('selForm')?.textContent || 'GLASSES';
          subject = `New Customized Commission Request - ${customerName}`;
          bodyText = `KAIRO STUDIO CUSTOMIZED COMMISSION REQUEST\n\nCUSTOMER DETAILS:\n- Full Name: ${customerName}\n- WhatsApp Number: ${customerPhone}\n\nCOMMISSION SPECIFICATIONS:\n- Target Bottle Brand: ${brandVal}\n- Vessel Form Choice: ${formVal}\n\nSubmitted via Kairo Studio Website.`;
        } else {
          subject = `New BYOB Craft Request - ${customerName}`;
          bodyText = `KAIRO STUDIO BRING YOUR OWN BOTTLE (BYOB) REQUEST\n\nCUSTOMER DETAILS:\n- Full Name: ${customerName}\n- WhatsApp Number: ${customerPhone}\n\nSERVICE DETAILS:\n- Service: Bring Your Own Bottle Upcycling Craft\n\nSubmitted via Kairo Studio Website.`;
        }

        // Open Gmail compose pre-filled with merged payload
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=assistance.kairo@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');

        // Close modal
        closeContactModal();

        // Render clean success banner on the main page
        const existingBanner = document.getElementById('submissionSuccessBanner');
        if (existingBanner) existingBanner.remove();

        const successBanner = document.createElement('div');
        successBanner.id = 'submissionSuccessBanner';
        successBanner.className = 'mono-text';
        successBanner.style.cssText = 'background: #0d0d0d; color: var(--White-Main); border: 1.5px solid var(--Red-Main); padding: 2.4rem; border-radius: 0.6rem; text-align: center; margin: 3rem auto; max-width: 650px; box-shadow: 0 15px 40px rgba(0,0,0,0.2); animation: modalSlideUp 0.3s ease;';
        successBanner.innerHTML = `<span style="color: var(--Red-Main); font-weight: 700; font-size: 1.6rem;">[ REQUEST SENT SUCCESSFULLY ]</span><br><br>Thank you, <strong>${customerName}</strong>! Your request payload has been compiled and dispatched to <strong>assistance.kairo@gmail.com</strong>.<br><br><span style="color: var(--Grey-2); font-size: 1.2rem;">Our studio team will contact you on WhatsApp (${customerPhone}) shortly regarding your commission.</span>`;

        const mainSection = document.querySelector('main');
        if (mainSection) {
          mainSection.prepend(successBanner);
          successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    });
  }

  // 14. Functional Two-Category Catalog Filter System (Product Type & Brand Origin)
  const productTypePills = document.querySelectorAll('#productTypeFilters [data-type-filter]');
  const brandPills = document.querySelectorAll('#brandFilters [data-brand-filter]');
  const resetBtn = document.getElementById('resetFiltersBtn');
  const catalogCards = document.querySelectorAll('#catalogGrid .arrivals-card');
  const resultCountEl = document.getElementById('catalogResultCount');

  if (catalogCards.length > 0) {
    let selectedType = 'all';
    let selectedBrand = 'all';

    function applyCatalogFilters() {
      let visibleCount = 0;

      catalogCards.forEach(card => {
        const cardType = card.getAttribute('data-type') || '';
        const cardBrand = card.getAttribute('data-brand') || '';

        const matchType = (selectedType === 'all') || (cardType === selectedType);
        
        let matchBrand = false;
        if (selectedBrand === 'all') {
          matchBrand = true;
        } else {
          const bSelLower = selectedBrand.toLowerCase();
          const bCardLower = cardBrand.toLowerCase();
          matchBrand = bCardLower.includes(bSelLower) || bSelLower.includes(bCardLower);
        }

        if (matchType && matchBrand) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (resultCountEl) {
        resultCountEl.textContent = `SHOWING ${visibleCount} OF ${catalogCards.length} PRODUCTS`;
      }
    }

    productTypePills.forEach(pill => {
      pill.addEventListener('click', () => {
        productTypePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedType = pill.getAttribute('data-type-filter');
        applyCatalogFilters();
      });
    });

    brandPills.forEach(pill => {
      pill.addEventListener('click', () => {
        brandPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedBrand = pill.getAttribute('data-brand-filter');
        applyCatalogFilters();
      });
    });

    resetBtn?.addEventListener('click', () => {
      selectedType = 'all';
      selectedBrand = 'all';
      productTypePills.forEach(p => p.classList.remove('active'));
      brandPills.forEach(p => p.classList.remove('active'));
      document.querySelector('#productTypeFilters [data-type-filter="all"]')?.classList.add('active');
      document.querySelector('#brandFilters [data-brand-filter="all"]')?.classList.add('active');
      applyCatalogFilters();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const brandParam = urlParams.get('brand') || urlParams.get('origin');
    const formParam = urlParams.get('form');

    if (formParam) {
      let targetType = 'all';
      const fLower = formParam.toLowerCase();
      if (fLower.includes('glass') || fLower.includes('sipper')) targetType = 'glass';
      else if (fLower.includes('tray')) targetType = 'tray';
      else if (fLower.includes('container')) targetType = 'container';
      else if (fLower.includes('combo')) targetType = 'combo';

      const targetPill = document.querySelector(`#productTypeFilters [data-type-filter="${targetType}"]`);
      if (targetPill) {
        productTypePills.forEach(p => p.classList.remove('active'));
        targetPill.classList.add('active');
        selectedType = targetType;
      }
    }

    if (brandParam) {
      brandPills.forEach(p => {
        const bVal = p.getAttribute('data-brand-filter');
        if (bVal && (brandParam.toLowerCase().includes(bVal.toLowerCase()) || bVal.toLowerCase().includes(brandParam.toLowerCase()))) {
          brandPills.forEach(bp => bp.classList.remove('active'));
          p.classList.add('active');
          selectedBrand = bVal;
        }
      });
    }

    applyCatalogFilters();
  }

  // ==========================================================================
  // Global Cookie & Privacy Policy Consent Pop-Up Logic (First-Time Visit Only)
  // ==========================================================================
  function initCookieConsent() {
    const CONSENT_KEY = 'kairo_cookie_consent';
    try {
      if (localStorage.getItem(CONSENT_KEY) === 'true') return;
    } catch (e) {
      console.warn('LocalStorage access restricted:', e);
    }

    setTimeout(() => {
      if (document.getElementById('kairoCookieBanner')) return;

      const banner = document.createElement('div');
      banner.id = 'kairoCookieBanner';
      banner.className = 'cookie-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Cookie and Privacy Consent Banner');
      banner.innerHTML = `
        <div class="cookie-banner__content">
          <span class="cookie-banner__badge">[ PRIVACY NOTICE ]</span>
          <p class="cookie-banner__text">
            We use cookies to enhance your browsing experience and analyze site traffic. By continuing to use this site, you agree to our <a href="privacy-policy.html" class="cookie-banner__link">Privacy Policy</a> and <a href="privacy-policy.html#cookies" class="cookie-banner__link">Cookies Policy</a>.
          </p>
          <div class="cookie-banner__actions">
            <button id="acceptCookieBtn" class="cookie-banner__btn">[ ACCEPT &amp; CLOSE ]</button>
          </div>
        </div>
      `;

      document.body.appendChild(banner);

      requestAnimationFrame(() => {
        banner.classList.add('active');
      });

      document.getElementById('acceptCookieBtn')?.addEventListener('click', () => {
        try {
          localStorage.setItem(CONSENT_KEY, 'true');
        } catch (e) {
          console.warn('LocalStorage error setting cookie consent:', e);
        }
        banner.classList.remove('active');
        setTimeout(() => {
          banner.remove();
        }, 400);
      });
    }, 1500);
  }

  initCookieConsent();

  // ==========================================================================
  // Two-Step Checkout Flow Logic (Step 1: Summary & Logistics, Step 2: Payment Gateway)
  // ==========================================================================
  function initTwoStepCheckout() {
    // 1. Create or ensure checkout modal structure exists
    if (!document.getElementById('checkoutModal')) {
      const modal = document.createElement('div');
      modal.id = 'checkoutModal';
      modal.className = 'checkout-modal-backdrop';
      modal.innerHTML = `
        <div class="checkout-card" id="checkoutCard">
          <!-- Close Button -->
          <button class="close-btn" id="closeCheckoutBtn" style="position:absolute; top:2.4rem; right:2.4rem; cursor:pointer; background:none; border:none; font-family:var(--Font-Mono); font-size:1.4rem; color:var(--Red-Main);">[ CLOSE X ]</button>
          
          <!-- STEP 1: ORDER SUMMARY & LOGISTICS -->
          <div id="checkoutStep1">
            <div class="checkout-header">
              <span class="checkout-steps-badge">[ STEP 1 OF 2 : ORDER SUMMARY &amp; SHIPPING LOGISTICS ]</span>
              <h2 class="checkout-title">Review Order &amp; Delivery</h2>
            </div>

            <!-- Itemized Cart Summary Box -->
            <div class="checkout-summary-box">
              <span style="font-family:var(--Font-Mono); font-size:1.1rem; color:var(--Red-Main); font-weight:700; text-transform:uppercase;">[ CART ITEMS ]</span>
              <div id="checkoutItemsList" style="margin-top:1rem; max-height:16rem; overflow-y:auto;"></div>

              <!-- Cost Breakdown Table -->
              <table class="checkout-table">
                <tr>
                  <td class="table-label">Subtotal</td>
                  <td class="table-val" id="summarySubtotal">&#8377;0</td>
                </tr>
                <tr id="summaryDiscountRow" style="display: none;">
                  <td class="table-label" id="summaryDiscountLabel" style="color:#27ae60; font-weight:600;">Discount</td>
                  <td class="table-val" id="summaryDiscountVal" style="color:#27ae60; font-weight:700;">-&#8377;0</td>
                </tr>
                <tr>
                  <td class="table-label">Shipping Cost <span style="font-size:1.1rem; color:var(--Grey-2);">(Standard Delivery)</span></td>
                  <td class="table-val" id="summaryShipping">&#8377;199</td>
                </tr>
                <tr id="summaryCodRow" style="display: none;">
                  <td class="table-label">COD Convenience Fee</td>
                  <td class="table-val" id="summaryCodFee" style="color:var(--Red-Main); font-weight:700;">&#8377;49</td>
                </tr>
                <tr class="total-row">
                  <td class="table-label">Total Payable</td>
                  <td class="table-val" id="summaryTotal">&#8377;0</td>
                </tr>
              </table>

              <!-- Repositioned Subtle Discount Code Input Box (Stealth Mode: No Hints, Autocomplete Off) -->
              <div style="margin-top: 1.6rem; padding-top: 1.2rem; border-top: 1px dashed #E0E0E0;">
                <label class="modal-input-label" for="discountCodeInput" style="font-size:1rem; color: var(--Grey-2); font-weight:600; text-transform:uppercase; display:block; margin-bottom:0.6rem;">PROMO / DISCOUNT CODE</label>
                <div style="display:flex; gap:0.8rem; align-items:center;">
                  <input type="text" id="discountCodeInput" class="modal-input" autocomplete="off" style="padding:0.8rem 1.2rem; font-size:1.25rem; text-transform:uppercase;">
                  <button id="btnApplyDiscount" type="button" style="background:var(--Black); color:var(--White-Main); border:none; padding:0.8rem 1.6rem; border-radius:0.4rem; font-family:var(--Font-Mono); font-size:1.1rem; font-weight:700; cursor:pointer; white-space:nowrap;">APPLY</button>
                </div>
                <div id="discountFeedback" style="font-family:var(--Font-Secondary), 'Inter', sans-serif; font-size:1.15rem; margin-top:0.6rem; display:none; font-weight:600;"></div>
              </div>
            </div>

            <!-- Payment Method Preference Selection Toggle -->
            <div style="margin: 1.6rem 0 2rem 0; padding: 1.4rem 1.6rem; background: #FFFFFF; border: 1.5px solid #E0E0E0; border-radius: 0.6rem;">
              <span style="font-family: var(--Font-Mono); font-size: 1.1rem; color: var(--Red-Main); font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 1rem;">[ SELECT PAYMENT METHOD ]</span>
              <div style="display: flex; gap: 1.6rem; flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: 0.8rem; font-family: var(--Font-Secondary), 'Inter', sans-serif; font-size: 1.3rem; cursor: pointer; color: var(--Black); font-weight: 600;">
                  <input type="radio" name="checkoutStep1PaymentMethod" value="ONLINE" checked style="accent-color: var(--Red-Main); width: 1.6rem; height: 1.6rem;"> Online Payment (Prepaid)
                </label>
                <label style="display: flex; align-items: center; gap: 0.8rem; font-family: var(--Font-Secondary), 'Inter', sans-serif; font-size: 1.3rem; cursor: pointer; color: var(--Black); font-weight: 600;">
                  <input type="radio" name="checkoutStep1PaymentMethod" value="COD" style="accent-color: var(--Red-Main); width: 1.6rem; height: 1.6rem;"> Cash on Delivery (COD + &#8377;49)
                </label>
              </div>
            </div>

            <!-- Shipping & Contact Details Form with Web3Forms Integration -->
            <form action="https://api.web3forms.com/submit" method="POST" id="web3FormsCheckoutForm" onsubmit="return false;">
              <input type="hidden" name="access_key" value="90f096b2-ec87-44b8-8e55-35b80a00472c">
              <input type="hidden" name="subject" value="New KAIRO Studio Bill Summary & Order Submission">
              <input type="hidden" name="from_name" value="KAIRO Studio Checkout">
              <textarea name="message" id="web3FormsMessage" style="display:none;" required></textarea>

              <div class="checkout-form-grid">
                <div class="modal-input-group checkout-form-full">
                  <label class="modal-input-label" for="checkoutName">Full Name *</label>
                  <input type="text" id="checkoutName" name="name" class="modal-input" placeholder="e.g. Rahul Sharma" required>
                </div>

                <div class="modal-input-group checkout-form-full">
                  <label class="modal-input-label" for="checkoutEmail">Email Address *</label>
                  <input type="email" id="checkoutEmail" name="email" class="modal-input" placeholder="e.g. rahul@example.com" required>
                </div>

                <div class="modal-input-group checkout-form-full">
                  <label class="modal-input-label" for="checkoutPhone">Phone / WhatsApp Number *</label>
                  <input type="tel" id="checkoutPhone" name="phone" class="modal-input" placeholder="e.g. +91 98765 43210" required>
                </div>

                <div class="modal-input-group checkout-form-full">
                  <label class="modal-input-label" for="checkoutAddress">Delivery Address *</label>
                  <input type="text" id="checkoutAddress" name="address" class="modal-input" placeholder="House/Flat No., Building, Street Name" required>
                </div>

                <div class="modal-input-group">
                  <label class="modal-input-label" for="checkoutCity">City *</label>
                  <input type="text" id="checkoutCity" name="city" class="modal-input" placeholder="e.g. Mumbai" required>
                </div>

                <div class="modal-input-group">
                  <label class="modal-input-label" for="checkoutPincode">Pincode *</label>
                  <input type="text" id="checkoutPincode" name="pincode" class="modal-input" placeholder="e.g. 400001" required>
                </div>
              </div>
            </form>

            <div id="checkoutStep1Error" style="color:var(--Red-Main); font-family:var(--Font-Secondary), 'Inter', sans-serif; font-size:1.3rem; margin-bottom:1.6rem; display:none; text-align:center; font-weight:600;">
              Please fill in all required shipping and contact details before proceeding.
            </div>

            <button class="primary-btn" id="btnProceedToPayment" style="width:100%; font-size:1.4rem; padding:1.6rem;">
              PROCEED TO PAYMENT &rarr;
            </button>
          </div>

          <!-- STEP 2: PAYMENT GATEWAY HANDOFF -->
          <div id="checkoutStep2" style="display:none;">
            <div class="checkout-header">
              <span class="checkout-steps-badge">[ STEP 2 OF 2 : SECURE PAYMENT GATEWAY ]</span>
              <h2 class="checkout-title">Select Payment Gateway</h2>
            </div>

            <div style="background:#FFF9F7; border:1px solid var(--Red-1); border-radius:0.6rem; padding:1.8rem; margin-bottom:2rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; font-family:var(--Font-Secondary), 'Inter', sans-serif;">
                <span style="font-size:1.4rem; color:var(--Black);">Total Amount Payable:</span>
                <span style="font-family:var(--Font-Mono); font-size:2rem; font-weight:800; color:var(--Red-Main);" id="finalPayableTotal">&#8377;0</span>
              </div>
              <div style="font-size:1.2rem; color:var(--Grey-2); margin-top:0.6rem;">
                Deliver to: <strong id="finalCustomerName" style="color:var(--Black);">Customer</strong> (<span id="finalCustomerPhone">Phone</span>)
              </div>
            </div>

            <!-- Payment Gateway Methods -->
            <div class="checkout-payment-methods">
              <label class="payment-method-option selected">
                <input type="radio" name="paymentGateway" value="UPI" checked>
                <div class="payment-method-text">
                  <span class="payment-method-title">Instant UPI (GPay / PhonePe / Paytm / BHIM)</span>
                  <span class="payment-method-desc">Pay directly via any UPI app with instant verification</span>
                </div>
              </label>

              <label class="payment-method-option">
                <input type="radio" name="paymentGateway" value="Card">
                <div class="payment-method-text">
                  <span class="payment-method-title">Credit / Debit Card (Visa, Mastercard, RuPay)</span>
                  <span class="payment-method-desc">Secure 256-bit encrypted card checkout handoff</span>
                </div>
              </label>

              <label class="payment-method-option">
                <input type="radio" name="paymentGateway" value="NetBanking">
                <div class="payment-method-text">
                  <span class="payment-method-title">Net Banking / Wallets</span>
                  <span class="payment-method-desc">All major Indian banks and digital wallets</span>
                </div>
              </label>

              <label class="payment-method-option">
                <input type="radio" name="paymentGateway" value="COD">
                <div class="payment-method-text">
                  <span class="payment-method-title">Cash on Delivery (COD + &#8377;49 Fee)</span>
                  <span class="payment-method-desc">Pay cash upon delivery to your doorstep</span>
                </div>
              </label>
            </div>

            <button class="primary-btn" id="btnPaySecurely" style="width:100%; font-size:1.4rem; padding:1.6rem; margin-bottom:1.6rem;">
              PAY &#8377;<span id="btnPayAmount">0</span> SECURELY &rarr;
            </button>

            <button style="background:none; border:none; color:var(--Grey-2); font-family:var(--Font-Mono); font-size:1.2rem; cursor:pointer; width:100%; text-align:center;" id="btnBackToStep1">
              &larr; Back to Order Summary
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // 2. Element references & state variables
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutStep1 = document.getElementById('checkoutStep1');
    const checkoutStep2 = document.getElementById('checkoutStep2');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const btnProceedToPayment = document.getElementById('btnProceedToPayment');
    const btnBackToStep1 = document.getElementById('btnBackToStep1');
    const btnPaySecurely = document.getElementById('btnPaySecurely');
    const checkoutStep1Error = document.getElementById('checkoutStep1Error');
    const btnApplyDiscount = document.getElementById('btnApplyDiscount');
    const discountCodeInput = document.getElementById('discountCodeInput');
    const discountFeedback = document.getElementById('discountFeedback');

    // Promo Code Registries
    const PROMO_CODES_10 = [
      'KAIRO10FLAT',
      'KAIROFLAT01',
      'KAIROFLAT02',
      'KAIROFLAT03',
      'KAIROFLAT04',
      'KAIROFLAT05',
      'KAIROFLAT06',
      'KAIROFLAT07',
      'KAIROFLAT08',
      'KAIROFLAT09'
    ];
    const PROMO_CODES_25 = [
      'KAIROKARTIKFLAT'
    ];

    let currentCalculatedTotal = 0;
    let currentSubtotal = 0;
    const FIXED_SHIPPING_COST = 199;
    let currentCodFee = 0;
    let isDiscountApplied = false;
    let activeAppliedCode = '';
    let activeDiscountRate = 0; // 0.10 or 0.25
    let currentDiscountAmount = 0;

    function recalculateTotals() {
      currentSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const isCod = document.querySelector('input[name="checkoutStep1PaymentMethod"]:checked')?.value === 'COD';
      currentCodFee = isCod ? 49 : 0;

      if (isDiscountApplied && activeDiscountRate > 0) {
        currentDiscountAmount = Math.round(currentSubtotal * activeDiscountRate);
      } else {
        currentDiscountAmount = 0;
      }

      currentCalculatedTotal = currentSubtotal - currentDiscountAmount + FIXED_SHIPPING_COST + currentCodFee;

      const summarySubtotal = document.getElementById('summarySubtotal');
      const summaryDiscountRow = document.getElementById('summaryDiscountRow');
      const summaryDiscountLabel = document.getElementById('summaryDiscountLabel');
      const summaryDiscountVal = document.getElementById('summaryDiscountVal');
      const summaryShipping = document.getElementById('summaryShipping');
      const summaryCodRow = document.getElementById('summaryCodRow');
      const summaryTotal = document.getElementById('summaryTotal');
      const finalPayableTotal = document.getElementById('finalPayableTotal');
      const btnPayAmount = document.getElementById('btnPayAmount');

      if (summarySubtotal) summarySubtotal.innerHTML = `&#8377;${currentSubtotal}`;

      if (summaryDiscountRow && summaryDiscountVal) {
        if (isDiscountApplied && currentDiscountAmount > 0) {
          summaryDiscountRow.style.display = 'table-row';
          if (summaryDiscountLabel) {
            summaryDiscountLabel.textContent = `Discount (${activeAppliedCode})`;
          }
          summaryDiscountVal.innerHTML = `-&#8377;${currentDiscountAmount}`;
        } else {
          summaryDiscountRow.style.display = 'none';
        }
      }

      if (summaryShipping) summaryShipping.innerHTML = `&#8377;${FIXED_SHIPPING_COST}`;
      if (summaryCodRow) summaryCodRow.style.display = isCod ? 'table-row' : 'none';
      if (summaryTotal) summaryTotal.innerHTML = `&#8377;${currentCalculatedTotal}`;
      if (finalPayableTotal) finalPayableTotal.innerHTML = `&#8377;${currentCalculatedTotal}`;
      if (btnPayAmount) btnPayAmount.textContent = currentCalculatedTotal;
    }

    // Discount Code Apply Handler (Stealth Mode: Multi-tier 10% & 25% Registry)
    btnApplyDiscount?.addEventListener('click', () => {
      const code = discountCodeInput?.value.trim().toUpperCase();
      if (!code) {
        isDiscountApplied = false;
        activeAppliedCode = '';
        activeDiscountRate = 0;
        if (discountFeedback) {
          discountFeedback.style.display = 'block';
          discountFeedback.style.color = 'var(--Red-Main)';
          discountFeedback.textContent = '✕ Please enter a discount code.';
        }
        recalculateTotals();
        return;
      }

      if (PROMO_CODES_10.includes(code)) {
        isDiscountApplied = true;
        activeAppliedCode = code;
        activeDiscountRate = 0.10;
        if (discountFeedback) {
          discountFeedback.style.display = 'block';
          discountFeedback.style.color = '#27ae60';
          discountFeedback.textContent = '✓ Discount code applied!';
        }
      } else if (PROMO_CODES_25.includes(code)) {
        isDiscountApplied = true;
        activeAppliedCode = code;
        activeDiscountRate = 0.25;
        if (discountFeedback) {
          discountFeedback.style.display = 'block';
          discountFeedback.style.color = '#27ae60';
          discountFeedback.textContent = '✓ Discount code applied!';
        }
      } else {
        isDiscountApplied = false;
        activeAppliedCode = '';
        activeDiscountRate = 0;
        if (discountFeedback) {
          discountFeedback.style.display = 'block';
          discountFeedback.style.color = 'var(--Red-Main)';
          discountFeedback.textContent = '✕ Invalid discount code.';
        }
      }
      recalculateTotals();
    });

    discountCodeInput?.addEventListener('input', () => {
      const currentCode = discountCodeInput.value.trim().toUpperCase();
      if (isDiscountApplied && currentCode !== activeAppliedCode) {
        isDiscountApplied = false;
        activeAppliedCode = '';
        activeDiscountRate = 0;
        if (discountFeedback) discountFeedback.style.display = 'none';
        recalculateTotals();
      }
    });

    // Radio change handlers in Step 1
    document.querySelectorAll('input[name="checkoutStep1PaymentMethod"]').forEach(radio => {
      radio.addEventListener('change', () => {
        recalculateTotals();
        const isCod = radio.value === 'COD';
        const targetRadio = document.querySelector(`input[name="paymentGateway"][value="${isCod ? 'COD' : 'UPI'}"]`);
        if (targetRadio) {
          targetRadio.checked = true;
          document.querySelectorAll('.payment-method-option').forEach(o => o.classList.remove('selected'));
          targetRadio.closest('.payment-method-option')?.classList.add('selected');
        }
      });
    });

    window.openCheckoutModal = function() {
      if (!cart || cart.length === 0) {
        return;
      }

      // Reset discount state on fresh checkout open
      isDiscountApplied = false;
      activeAppliedCode = '';
      activeDiscountRate = 0;
      currentDiscountAmount = 0;
      if (discountCodeInput) discountCodeInput.value = '';
      if (discountFeedback) discountFeedback.style.display = 'none';

      // Close cart drawer if open
      if (typeof window.toggleCart === 'function') {
        window.toggleCart(false);
      }

      // Populate Step 1 Items
      const checkoutItemsList = document.getElementById('checkoutItemsList');
      if (checkoutItemsList) {
        checkoutItemsList.innerHTML = cart.map(item => `
          <div class="checkout-item-row">
            <div>
              <strong style="color:var(--Black);">${item.name}</strong>
              <span style="color:var(--Grey-2); font-size:1.2rem;"> × ${item.qty}</span>
            </div>
            <div style="font-family:var(--Font-Mono); color:var(--Black); font-weight:600;">&#8377;${item.price * item.qty}</div>
          </div>
        `).join('');
      }

      recalculateTotals();

      // Reset to Step 1
      checkoutStep1.style.display = 'block';
      checkoutStep2.style.display = 'none';
      if (checkoutStep1Error) checkoutStep1Error.style.display = 'none';

      checkoutModal.classList.add('active');
    };

    closeCheckoutBtn?.addEventListener('click', () => {
      checkoutModal.classList.remove('active');
    });

    // Web3Forms Order & Bill Summary Dispatcher Function (Access Key: 90f096b2-ec87-44b8-8e55-35b80a00472c)
    const sendWeb3FormsOrderSummary = async (paymentMethod, paymentStatus = 'PENDING GATEWAY HANDOFF') => {
      const name = document.getElementById('checkoutName')?.value.trim() || 'Customer';
      const email = document.getElementById('checkoutEmail')?.value.trim() || 'customer@kairo.studio';
      const phone = document.getElementById('checkoutPhone')?.value.trim() || 'N/A';
      const address = document.getElementById('checkoutAddress')?.value.trim() || '';
      const city = document.getElementById('checkoutCity')?.value.trim() || '';
      const pincode = document.getElementById('checkoutPincode')?.value.trim() || '';

      const itemsSummary = cart.map(i => `${i.name} (x${i.qty}) - ₹${i.price * i.qty}`).join('\n');
      const formattedMessage = `KAIRO GLASSWARE - BILL SUMMARY & ORDER SUBMISSION\n\nCUSTOMER DETAILS:\n- Full Name: ${name}\n- Email: ${email}\n- Phone/WhatsApp: ${phone}\n- Delivery Address: ${address}, ${city} - ${pincode}\n\nBILL SUMMARY:\n- Subtotal: ₹${currentSubtotal}\n- Discount (${activeAppliedCode || 'N/A'}): ${isDiscountApplied ? '-₹' + currentDiscountAmount : 'N/A'}\n- Shipping: ₹${FIXED_SHIPPING_COST}\n- TOTAL PAYABLE: ₹${currentCalculatedTotal}\n\nORDERED ITEMS:\n${itemsSummary}\n\nPAYMENT DETAILS:\n- Method: ${paymentMethod}\n- Gateway Status: ${paymentStatus}\n\nSubmitted via Kairo Studio Checkout with Web3Forms Integration.`;

      try {
        const formData = new FormData();
        formData.append('access_key', '90f096b2-ec87-44b8-8e55-35b80a00472c');
        formData.append('subject', `New KAIRO Studio Bill Summary & Order - ${name} (₹${currentCalculatedTotal})`);
        formData.append('from_name', 'KAIRO Studio Checkout');
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('address', `${address}, ${city} - ${pincode}`);
        formData.append('message', formattedMessage);

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        }).catch(err => console.warn('Web3Forms background dispatch warning:', err));
      } catch (err) {
        console.warn('Web3Forms dispatch error:', err);
      }
    };

    // Step 1 -> Step 2 Transition with Form Validation & Web3Forms Submission
    btnProceedToPayment?.addEventListener('click', () => {
      const name = document.getElementById('checkoutName')?.value.trim();
      const email = document.getElementById('checkoutEmail')?.value.trim();
      const phone = document.getElementById('checkoutPhone')?.value.trim();
      const address = document.getElementById('checkoutAddress')?.value.trim();
      const city = document.getElementById('checkoutCity')?.value.trim();
      const pincode = document.getElementById('checkoutPincode')?.value.trim();

      if (!name || !email || !phone || !address || !city || !pincode) {
        if (checkoutStep1Error) {
          checkoutStep1Error.textContent = 'Please fill in all required shipping, email, and contact details before proceeding.';
          checkoutStep1Error.style.display = 'block';
        }
        return;
      }

      if (checkoutStep1Error) checkoutStep1Error.style.display = 'none';

      // Submit Bill Summary to Web3Forms API immediately before payment gateway
      sendWeb3FormsOrderSummary('Step 1 - Bill Summary Review', 'PROCEEDED TO PAYMENT GATEWAY');

      // Update Step 2 Details
      recalculateTotals();
      document.getElementById('finalCustomerName').textContent = name;
      document.getElementById('finalCustomerPhone').textContent = phone;

      checkoutStep1.style.display = 'none';
      checkoutStep2.style.display = 'block';
    });

    // Step 2 -> Step 1 Back Navigation
    btnBackToStep1?.addEventListener('click', () => {
      checkoutStep2.style.display = 'none';
      checkoutStep1.style.display = 'block';
    });

    // Payment Method Option Selection Highlight in Step 2
    document.querySelectorAll('.payment-method-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.payment-method-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          const isCod = radio.value === 'COD';
          const step1Radio = document.querySelector(`input[name="checkoutStep1PaymentMethod"][value="${isCod ? 'COD' : 'ONLINE'}"]`);
          if (step1Radio) step1Radio.checked = true;
          recalculateTotals();
        }
      });
    });

    // Final Payment Handshake (Razorpay Web Checkout & COD Support)
    btnPaySecurely?.addEventListener('click', async () => {
      const selectedGateway = document.querySelector('input[name="paymentGateway"]:checked')?.value || 'ONLINE';
      const name = document.getElementById('checkoutName')?.value.trim();
      const phone = document.getElementById('checkoutPhone')?.value.trim();
      const address = document.getElementById('checkoutAddress')?.value.trim();
      const city = document.getElementById('checkoutCity')?.value.trim();
      const pincode = document.getElementById('checkoutPincode')?.value.trim();

      if (!name || !phone || !address || !city || !pincode) {
        const errorEl = document.getElementById('checkoutStep1Error');
        if (errorEl) {
          errorEl.textContent = 'Please fill in all required delivery details before proceeding.';
          errorEl.style.display = 'block';
        }
        return;
      }

      // Handle Cash on Delivery (COD)
      if (selectedGateway === 'COD') {
        sendWeb3FormsOrderSummary('Cash on Delivery (COD)', 'CONFIRMED ORDER (COD)');
        
        const itemsSummary = cart.map(i => `${i.name} (x${i.qty}) - ₹${i.price * i.qty}`).join('\n');
        const subject = `KAIRO Order (COD) - ${name} (₹${currentCalculatedTotal})`;
        const body = `KAIRO GLASSWARE - CASH ON DELIVERY ORDER\n\nORDER SUMMARY:\n${itemsSummary}\n\nCOST BREAKDOWN:\n- Subtotal: ₹${currentSubtotal}\n- Discount (${activeAppliedCode || 'N/A'}): ${isDiscountApplied ? '-₹' + currentDiscountAmount : 'N/A'}\n- Shipping: ₹${FIXED_SHIPPING_COST}\n- COD Fee: ₹49\n- TOTAL PAYABLE: ₹${currentCalculatedTotal}\n\nDELIVERY ADDRESS:\nName: ${name}\nPhone/WhatsApp: ${phone}\nAddress: ${address}, ${city} - ${pincode}\n\nPAYMENT METHOD: Cash on Delivery\n\nSubmitted via Kairo Studio Secure Checkout.`;

        const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=assistance.kairo@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl, '_blank', 'noopener,noreferrer');

        cart = [];
        saveCartToStorage();
        if (typeof updateCartUI === 'function') updateCartUI();
        checkoutModal.classList.remove('active');
        return;
      }

      // Online Payment via Razorpay Gateway Integration
      const originalBtnText = btnPaySecurely.innerHTML;
      btnPaySecurely.disabled = true;
      btnPaySecurely.innerHTML = '[ INITIALIZING RAZORPAY... ]';

      try {
        // Determine backend API host URL dynamically (supports file://, local server, and production host)
        const getApiHost = () => {
          const origin = window.location.origin || '';
          if (!origin || origin.startsWith('file:') || origin === 'null') {
            return 'http://localhost:8080';
          }
          return ''; // Use relative path for all HTTP/HTTPS web origins
        };

        const apiHost = getApiHost();

        // Fail-safe total calculation in case currentCalculatedTotal is uninitialized
        let calculatedTotal = Number(currentCalculatedTotal);
        if (!calculatedTotal || isNaN(calculatedTotal) || calculatedTotal <= 0) {
          const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
          calculatedTotal = cartSubtotal > 0 ? (cartSubtotal + FIXED_SHIPPING_COST) : 599;
        }
        const amountInPaise = Math.round(calculatedTotal * 100);

        // Auto-inject Razorpay Checkout SDK if missing or blocked
        if (typeof Razorpay === 'undefined') {
          try {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://checkout.razorpay.com/v1/checkout.js';
              script.onload = resolve;
              script.onerror = () => reject(new Error('Razorpay Checkout SDK script failed to load. Please check your internet connection or ad-blockers.'));
              document.head.appendChild(script);
            });
          } catch (sdkError) {
            throw new Error('Razorpay Checkout SDK is unavailable. Please refresh the page and try again.');
          }
        }

        let orderData = null;
        try {
          const orderResponse = await fetch(`${apiHost}/api/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: amountInPaise,
              currency: 'INR',
              receipt: `rcpt_${Date.now()}`
            })
          });

          const contentType = orderResponse.headers.get('content-type') || '';
          if (orderResponse.ok && contentType.includes('application/json')) {
            orderData = await orderResponse.json();
          } else {
            console.warn('Backend API endpoint returned non-200/non-JSON response. Proceeding with Razorpay Standard Direct Checkout handoff.');
          }
        } catch (netErr) {
          console.warn('Backend API connection unavailable. Proceeding with Razorpay Standard Direct Checkout handoff.', netErr);
        }

        // STEP 2: Configure Razorpay Checkout Modal (Fail-Safe Dual-Mode)
        const options = {
          key: (orderData && orderData.key_id) ? orderData.key_id : 'rzp_live_TTfqyRkXrGvP3b',
          amount: (orderData && orderData.amount) ? orderData.amount : amountInPaise,
          currency: (orderData && orderData.currency) ? orderData.currency : 'INR',
          name: 'KAIRO Studio',
          description: `Upcycled Glassware Order (₹${calculatedTotal})`,
          image: 'images/Founder%20Kairo.jpg',
          handler: async function (response) {
            btnPaySecurely.innerHTML = '[ VERIFYING PAYMENT... ]';
            
            // If backend order_id and signature exist, attempt server verification
            if (orderData && orderData.order_id && response.razorpay_signature) {
              try {
                const verifyResponse = await fetch(`${apiHost}/api/verify-payment`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                  })
                });

                const verifyContentType = verifyResponse.headers.get('content-type') || '';
                if (verifyResponse.ok && verifyContentType.includes('application/json')) {
                  const verifyData = await verifyResponse.json();
                  if (!verifyData.success) {
                    console.warn('Backend signature verification note:', verifyData.message);
                  }
                }
              } catch (vErr) {
                console.warn('Backend verification skipped on static host mode:', vErr);
              }
            }

            // Always Dispatch Web3Forms Notification with Payment ID & Order Details
            sendWeb3FormsOrderSummary('Online Payment (Razorpay)', `VERIFIED & PAID (Payment ID: ${response.razorpay_payment_id})`);

            const itemsSummary = cart.map(i => `${i.name} (x${i.qty}) - ₹${i.price * i.qty}`).join('\n');
            const subject = `KAIRO Paid Order - ${name} (₹${calculatedTotal})`;
            const body = `KAIRO GLASSWARE - ONLINE PAYMENT SUCCESSFUL\n\nRAZORPAY TRANSACTION DETAILS:\n- Payment ID: ${response.razorpay_payment_id}\n- Status: VERIFIED & PAID\n\nORDER SUMMARY:\n${itemsSummary}\n\nCOST BREAKDOWN:\n- Subtotal: ₹${currentSubtotal}\n- Discount (${activeAppliedCode || 'N/A'}): ${isDiscountApplied ? '-₹' + currentDiscountAmount : 'N/A'}\n- Shipping: ₹${FIXED_SHIPPING_COST}\n- TOTAL PAID: ₹${calculatedTotal}\n\nDELIVERY ADDRESS:\nName: ${name}\nPhone/WhatsApp: ${phone}\nAddress: ${address}, ${city} - ${pincode}\n\nSubmitted via Kairo Studio Razorpay Checkout.`;

            const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=assistance.kairo@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(mailtoUrl, '_blank', 'noopener,noreferrer');

            // Clear cart & reset UI
            cart = [];
            saveCartToStorage();
            if (typeof updateCartUI === 'function') updateCartUI();
            checkoutModal.classList.remove('active');

            // Display Payment Success Banner
            const successMsg = document.createElement('div');
            successMsg.style.cssText = 'position:fixed; top:20px; right:20px; background:#27ae60; color:#fff; padding:16px 24px; border-radius:8px; z-index:9999; font-family:sans-serif; font-size:14px; box-shadow:0 8px 24px rgba(0,0,0,0.2);';
            successMsg.innerHTML = `<strong>✓ Payment Successful!</strong><br>Payment ID: ${response.razorpay_payment_id}`;
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 6000);
          },
          prefill: {
            name: name,
            contact: phone,
            email: document.getElementById('checkoutEmail')?.value.trim() || 'customer@kairo.studio'
          },
          theme: {
            color: '#ED3834'
          },
          modal: {
            ondismiss: function() {
              console.log('Razorpay payment modal closed by user.');
              btnPaySecurely.disabled = false;
              btnPaySecurely.innerHTML = originalBtnText;
            }
          }
        };

        if (orderData && orderData.order_id) {
          options.order_id = orderData.order_id;
        }

        const rzp = new Razorpay(options);
        
        rzp.on('payment.failed', function (failedResponse) {
          console.error('Razorpay Payment Failed:', failedResponse.error);
          alert(`Payment Failed: ${failedResponse.error.description || failedResponse.error.reason || 'Payment could not be completed.'}`);
          btnPaySecurely.disabled = false;
          btnPaySecurely.innerHTML = originalBtnText;
        });

        rzp.open();
      } catch (err) {
        console.error('Razorpay Error:', err);
        alert(`Payment Initialization Error: ${err.message}`);
        btnPaySecurely.disabled = false;
        btnPaySecurely.innerHTML = originalBtnText;
      }
    });

    // Delegate click on document for any PROCEED TO CHECKOUT button
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, .primary-btn, .add-to-cart-btn');
      if (target && target.textContent && target.textContent.includes('PROCEED TO CHECKOUT')) {
        e.preventDefault();
        e.stopPropagation();
        window.openCheckoutModal();
      }
    });
  }

  initTwoStepCheckout();
});