/* ================================================================
   JOHN & MARIAM WEDDING CELEBRATION — SCRIPT
   ================================================================ */

/* ===== Navbar shrink + back to top ===== */
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}

const nav = document.getElementById('nav');
const topBtn = document.getElementById('top');
const wishesTicker = document.getElementById('wishesTicker');

/* ===== Parallax for Hero Script ===== */
const heroScript = document.querySelector('.hero-script');
const isMobile = () => window.innerWidth <= 900;

// Throttle scroll work via rAF loop
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;

      // Navbar + back-to-top
      nav.classList.toggle('shrink', y > 60);
      topBtn.classList.toggle('show', y > 600);

      // Parallax only on desktop
      if (!isMobile() && heroScript) {
        heroScript.style.transform = `translateX(-50%) translateY(${y * 0.25}px)`;
      }

      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

topBtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

/* ===== Mobile Navigation Menu ===== */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('navOverlay');

function openMenu() {
  mobileMenu.classList.add('open');
  overlay.classList.add('show');
  burger.classList.add('active');
  burger.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  overlay.classList.remove('show');
  burger.classList.remove('active');
  burger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

burger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});
overlay.addEventListener('click', closeMenu);
mobileMenu
  .querySelectorAll('a')
  .forEach((a) => a.addEventListener('click', closeMenu));

/* Brand Link - Scroll to Top */
const brandLink = document.getElementById('brandLink');
brandLink.addEventListener('click', () => {
  closeMenu();
  scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== Scroll Reveal Animations ===== */
const groups = [
  document.querySelectorAll('.gallery > div'),
  document.querySelectorAll('.timeline .tl-item'),
];
groups.forEach((list) => {
  list.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
  });
});

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
);

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* ===== Countdown Target Date (8 October 2026 - 4:00 PM) ===== */
const target = new Date('2026-10-18T16:00:00').getTime();
const pad = (n) => String(n).padStart(2, '0');
const dEl = document.getElementById('d');
const hEl = document.getElementById('h');
const mEl = document.getElementById('m');
const sEl = document.getElementById('s');

function updateCountdown() {
  const diff = target - Date.now();
  if (diff < 0) {
    dEl.textContent = '00';
    hEl.textContent = '00';
    mEl.textContent = '00';
    sEl.textContent = '00';
    return;
  }
  dEl.textContent = pad(Math.floor(diff / 864e5));
  hEl.textContent = pad(Math.floor(diff / 36e5) % 24);
  mEl.textContent = pad(Math.floor(diff / 6e4) % 60);
  sEl.textContent = pad(Math.floor(diff / 1e3) % 60);
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* ===== Year in Footer ===== */
document.getElementById('year').textContent = new Date().getFullYear();

/* Resize Handler */
window.addEventListener(
  'resize',
  () => {
    if (innerWidth > 900 && mobileMenu.classList.contains('open')) closeMenu();
    if (isMobile() && heroScript) {
      heroScript.style.transform = 'translateX(-50%)';
    }
  },
  { passive: true },
);

/* ================================================================
   FIREBASE & GUEST WISHES MANAGEMENT (FREE PLAN COMPATIBLE)
   ================================================================ */

// Default starter wishes if none are in database yet (Set to empty per request)
const DEFAULT_WISHES = [];

// Firebase Configuration (Replace with your Firebase Project keys if desired)
const firebaseConfig = {
  apiKey: 'AIzaSyBCfDZp6s74y42BKxzB9dSL58W6ctgTQVE',
  authDomain: 'j-m-wedding-fa104.firebaseapp.com',
  projectId: 'j-m-wedding-fa104',
  storageBucket: 'j-m-wedding-fa104.firebasestorage.app',
  messagingSenderId: '457334149848',
  appId: '1:457334149848:web:c944ba6447d9089dc5fdad',
  measurementId: 'G-17ZC3YSDJK',
};

let db = null;
let firebaseInitialized = false;

// Try initializing Firebase
try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    // Only init if not already initialized
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    firebaseInitialized = true;
    console.log('Firebase initialized successfully.');
  }
} catch (err) {
  console.warn('Firebase initialization in offline/hybrid fallback mode:', err);
}

// In-Memory & LocalStorage Store
const STORAGE_KEY = 'jm_wedding_wishes_v1';
let currentWishes = [];

function loadStoredWishes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any legacy starter items
        const cleanWishes = parsed.filter(
          (w) => w && w.id && !w.id.startsWith('starter-'),
        );
        return cleanWishes;
      }
    }
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }
  return [...DEFAULT_WISHES];
}

function saveStoredWishes(wishes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

// Render Ticker Track
const tickerTrack = document.getElementById('tickerTrack');

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ===== Interactive Touch/Drag Infinite Ticker Engine ===== */
const tickerViewport = document.getElementById('tickerViewport');
let isTickerDragging = false;
let tickerStartX = 0;
let tickerStartScroll = 0;
let tickerAnimId = null;
let isTickerPaused = false;
let tickerResumeTimer = null;
let currentScrollPos = 0;
const TICKER_SCROLL_SPEED = 0.85; // pixels per animation frame (smooth float)

function runTickerLoop() {
  if (tickerAnimId) cancelAnimationFrame(tickerAnimId);

  function step() {
    const viewport = document.getElementById('tickerViewport');
    const track = document.getElementById('tickerTrack');

    if (viewport && track && !isTickerDragging && !isTickerPaused) {
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 20) {
        currentScrollPos += TICKER_SCROLL_SPEED;
        if (currentScrollPos >= halfWidth) {
          currentScrollPos -= halfWidth;
        }
        viewport.scrollLeft = Math.round(currentScrollPos);
      }
    }
    tickerAnimId = requestAnimationFrame(step);
  }
  tickerAnimId = requestAnimationFrame(step);
}

// Touch & Mouse Drag Interaction
if (tickerViewport) {
  function onDragStart(clientX) {
    isTickerDragging = true;
    isTickerPaused = true;
    tickerStartX = clientX;
    tickerStartScroll = currentScrollPos;
    if (tickerResumeTimer) clearTimeout(tickerResumeTimer);
  }

  function onDragMove(clientX) {
    if (!isTickerDragging || !tickerTrack) return;
    const dx = clientX - tickerStartX;
    currentScrollPos = tickerStartScroll - dx;

    // Wrap around smoothly during manual scrolling
    const halfWidth = tickerTrack.scrollWidth / 2;
    if (halfWidth > 20) {
      while (currentScrollPos >= halfWidth) {
        currentScrollPos -= halfWidth;
        tickerStartScroll -= halfWidth;
      }
      while (currentScrollPos < 0) {
        currentScrollPos += halfWidth;
        tickerStartScroll += halfWidth;
      }
    }
    tickerViewport.scrollLeft = Math.round(currentScrollPos);
  }

  function onDragEnd() {
    if (!isTickerDragging) return;
    isTickerDragging = false;
    if (tickerResumeTimer) clearTimeout(tickerResumeTimer);
    // Resume auto scroll smoothly after user lifts finger/mouse
    tickerResumeTimer = setTimeout(() => {
      isTickerPaused = false;
    }, 1200);
  }

  // Mouse Drag Listeners (Desktop)
  tickerViewport.addEventListener('mousedown', (e) => {
    tickerViewport.style.cursor = 'grabbing';
    onDragStart(e.pageX);
  });
  window.addEventListener('mousemove', (e) => {
    if (isTickerDragging) {
      onDragMove(e.pageX);
    }
  });
  window.addEventListener('mouseup', () => {
    if (tickerViewport) tickerViewport.style.cursor = 'grab';
    onDragEnd();
  });

  // Touch Swipe Listeners (Mobile & Tablets)
  tickerViewport.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches && e.touches.length > 0) {
        onDragStart(e.touches[0].pageX);
      }
    },
    { passive: true },
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (isTickerDragging && e.touches && e.touches.length > 0) {
        onDragMove(e.touches[0].pageX);
      }
    },
    { passive: true },
  );

  window.addEventListener('touchend', () => {
    onDragEnd();
  });

  window.addEventListener('touchcancel', () => {
    onDragEnd();
  });

  // Hover Pause ONLY on devices with actual mouse (never freeze on mobile taps)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    tickerViewport.addEventListener('mouseenter', () => {
      isTickerPaused = true;
    });
    tickerViewport.addEventListener('mouseleave', () => {
      if (!isTickerDragging) {
        if (tickerResumeTimer) clearTimeout(tickerResumeTimer);
        tickerResumeTimer = setTimeout(() => {
          isTickerPaused = false;
        }, 500);
      }
    });
  }
}

function renderTickerWishes(wishes) {
  if (!tickerTrack) return;

  const validWishes = wishes.filter(
    (w) => w && w.note && w.note.trim().length > 0,
  );
  if (validWishes.length === 0) {
    const emptyCard = `
      <div class="ticker-item floating-wish floating-welcome">
        <span class="v-crest">✨</span>
        <span class="sender-name">Jojo &amp; Marioom</span>
        <span class="v-divider">·</span>
        <span class="msg-text">“Welcome to our wedding! Leave your blessings and warm congratulations below.”</span>
        <span class="sep">✦</span>
      </div>
    `;
    tickerTrack.innerHTML = emptyCard + emptyCard + emptyCard + emptyCard;
    currentScrollPos = 0;
    if (tickerViewport) tickerViewport.scrollLeft = 0;
    runTickerLoop();
    return;
  }

  // Create bespoke pure floating message items (free floating without box/card background)
  const itemsHtml = validWishes
    .map(
      (w) => `
      <div class="ticker-item floating-wish" data-id="${escapeHtml(w.id || '')}">
        <span class="v-crest">⚜</span>
        <span class="sender-name">${escapeHtml(w.name)}</span>
        <span class="v-divider">·</span>
        <span class="msg-text">“${escapeHtml(w.note)}”</span>
        <span class="sep">✦</span>
      </div>
    `,
    )
    .join('');

  // Repeat sufficiently for an infinite loop with zero jump
  const repeatCount = Math.max(4, Math.ceil(12 / validWishes.length));
  let finalTrackHtml = '';
  for (let i = 0; i < repeatCount * 2; i++) {
    finalTrackHtml += itemsHtml;
  }

  tickerTrack.innerHTML = finalTrackHtml;
  runTickerLoop();
}

// Setup Live Listeners (Firebase or Local)
function initWishesSync() {
  currentWishes = loadStoredWishes();
  renderTickerWishes(currentWishes);

  if (firebaseInitialized && db) {
    try {
      db.collection('wedding_wishes')
        .orderBy('timestamp', 'desc')
        .limit(100)
        .onSnapshot(
          (snapshot) => {
            const fbWishes = [];
            snapshot.forEach((doc) => {
              fbWishes.push({ id: doc.id, ...doc.data() });
            });
            if (fbWishes.length > 0) {
              const existingIds = new Set(fbWishes.map((w) => w.id));
              const localUnsynced = currentWishes.filter(
                (w) => !existingIds.has(w.id),
              );
              currentWishes = [...fbWishes, ...localUnsynced];
              saveStoredWishes(currentWishes);
              renderTickerWishes(currentWishes);
              if (adminModal && adminModal.classList.contains('show')) {
                renderAdminMessagesList();
              }
            }
          },
          (err) => {
            console.warn(
              'Firestore sync note (using reliable local cache):',
              err,
            );
          },
        );
    } catch (e) {
      console.warn('Firestore onSnapshot error:', e);
    }
  }
}
initWishesSync();

/* ===== RSVP & Wishes Form Submission (Reliable Multi-Use) ===== */
const rsvpForm = document.getElementById('rsvpForm');
const rsvpSubmitBtn = document.getElementById('rsvpSubmitBtn');
const msgEl = document.getElementById('msg');

rsvpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('rsvpName').value.trim();
  const attend = document.getElementById('rsvpAttend').value;
  const guests = document.getElementById('rsvpGuests').value;
  const note = document.getElementById('rsvpNote').value.trim();

  if (!name || !attend || !note) {
    msgEl.textContent = 'Please fill in all required fields.';
    msgEl.style.color = '#ff7675';
    return;
  }

  rsvpSubmitBtn.disabled = true;
  rsvpSubmitBtn.textContent = 'Sending...';

  const newWish = {
    id: 'wish_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name,
    attend: attend,
    guests: guests,
    note: note,
    timestamp: Date.now(),
  };

  try {
    // 1. Immediately update locally & refresh ticker live
    currentWishes.unshift(newWish);
    saveStoredWishes(currentWishes);
    renderTickerWishes(currentWishes);

    // 2. Safe async sync with remote Firebase (with timeout protection)
    if (firebaseInitialized && db) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase sync timeout')), 3000),
        );
        const savePromise = db
          .collection('wedding_wishes')
          .doc(newWish.id)
          .set({
            name: newWish.name,
            attend: newWish.attend,
            guests: newWish.guests,
            note: newWish.note,
            timestamp: newWish.timestamp,
          });
        await Promise.race([savePromise, timeoutPromise]);
      } catch (err) {
        console.warn('Firestore remote sync note (saved locally):', err);
      }
    }

    // 3. Display success message & reset form fields
    msgEl.textContent = `Thank you, ${name}! Your RSVP and warm wishes have been joyfully received ♥`;
    msgEl.style.color = 'var(--gold-soft)';
    rsvpForm.reset();

    // Scroll towards feedback message
    setTimeout(() => {
      msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  } catch (overallErr) {
    console.error('Error handling RSVP submission:', overallErr);
    msgEl.textContent = 'Thank you! Your wish was recorded successfully.';
    msgEl.style.color = 'var(--gold-soft)';
  } finally {
    // Always re-enable submit button so user can use it repeatedly
    rsvpSubmitBtn.disabled = false;
    rsvpSubmitBtn.textContent = 'Send RSVP & Wishes ⟶';
  }
});

/* ================================================================
   ADMIN MODERATION MODAL & DELETE CAPABILITIES
   ================================================================ */
const openAdminBtn = document.getElementById('openAdminBtn');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const adminModal = document.getElementById('adminModal');
const adminAuthSection = document.getElementById('adminAuthSection');
const adminPanelSection = document.getElementById('adminPanelSection');
const adminPinInput = document.getElementById('adminPinInput');
const adminUnlockBtn = document.getElementById('adminUnlockBtn');
const adminPinError = document.getElementById('adminPinError');
const adminStats = document.getElementById('adminStats');
const adminMessagesList = document.getElementById('adminMessagesList');
const adminRefreshBtn = document.getElementById('adminRefreshBtn');

// Admin PIN is strictly 123123
const ADMIN_PIN = '123123';
let isAdminAuthenticated = false;

function openAdminModal() {
  adminModal.classList.add('show');
  adminModal.setAttribute('aria-hidden', 'false');
  if (!isAdminAuthenticated) {
    adminAuthSection.style.display = 'block';
    adminPanelSection.style.display = 'none';
    adminPinInput.value = '';
    adminPinError.textContent = '';
    adminPinInput.focus();
  } else {
    adminAuthSection.style.display = 'none';
    adminPanelSection.style.display = 'flex';
    renderAdminMessagesList();
  }
}

function closeAdminModal() {
  adminModal.classList.remove('show');
  adminModal.setAttribute('aria-hidden', 'true');
}

openAdminBtn.addEventListener('click', openAdminModal);
closeAdminBtn.addEventListener('click', closeAdminModal);
adminModal.addEventListener('click', (e) => {
  if (e.target === adminModal) closeAdminModal();
});

// Unlock with passcode
function attemptUnlock() {
  const pin = adminPinInput.value.trim();
  if (pin === ADMIN_PIN) {
    isAdminAuthenticated = true;
    adminPinError.textContent = '';
    adminAuthSection.style.display = 'none';
    adminPanelSection.style.display = 'flex';
    renderAdminMessagesList();
  } else {
    adminPinError.textContent = 'Invalid passcode. Access denied.';
  }
}

adminUnlockBtn.addEventListener('click', attemptUnlock);
adminPinInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') attemptUnlock();
});

// Render list of messages in Admin Panel
function renderAdminMessagesList() {
  if (!adminMessagesList) return;

  adminStats.textContent = `Total Wishes: ${currentWishes.length}`;

  if (currentWishes.length === 0) {
    adminMessagesList.innerHTML = `
      <div class="admin-empty-state">
        No guest messages found in database.
      </div>
    `;
    return;
  }

  adminMessagesList.innerHTML = currentWishes
    .map((w) => {
      const isDecline = w.attend && w.attend.toLowerCase().includes('decline');
      const timeStr = w.timestamp
        ? new Date(w.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Recent';

      return `
        <div class="admin-msg-card" id="admin-card-${escapeHtml(w.id)}">
          <div class="admin-msg-info">
            <div class="admin-msg-top">
              <span class="admin-msg-name">${escapeHtml(w.name || 'Anonymous')}</span>
              <span class="admin-msg-tag ${isDecline ? 'decline' : ''}">
                ${escapeHtml(w.attend || 'Attending')} (${escapeHtml(w.guests || '1')} Guest${w.guests > 1 ? 's' : ''})
              </span>
            </div>
            <p class="admin-msg-text">"${escapeHtml(w.note || '')}"</p>
            <span class="admin-msg-time">🕒 ${timeStr}</span>
          </div>
          <button
            class="admin-del-btn"
            onclick="deleteWish('${escapeHtml(w.id)}')"
            title="Delete this message"
          >
            🗑️ Delete
          </button>
        </div>
      `;
    })
    .join('');
}

// Delete a message function
window.deleteWish = async function (id) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  // 1. Remove from local state
  currentWishes = currentWishes.filter((w) => w.id !== id);
  saveStoredWishes(currentWishes);
  renderTickerWishes(currentWishes);
  renderAdminMessagesList();

  // 2. Remove from Firebase if initialized
  if (firebaseInitialized && db) {
    try {
      await db.collection('wedding_wishes').doc(id).delete();
      console.log('Document successfully deleted from Firebase:', id);
    } catch (err) {
      console.warn('Error deleting document from Firebase:', err);
    }
  }
};

adminRefreshBtn.addEventListener('click', () => {
  currentWishes = loadStoredWishes();
  renderAdminMessagesList();
  renderTickerWishes(currentWishes);
});

/* ================================================================
   BACKGROUND MUSIC & INVITATION SEAL OVERLAY
   ================================================================ */
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('music-toggle');
const musicVolume = 0.3;

bgMusic.volume = musicVolume;
bgMusic.loop = true;
let musicStarted = false;
let pausedAt = 0;
let manualPause = false;

function startMusic() {
  if (musicStarted || !bgMusic) return;

  bgMusic.currentTime = pausedAt || 0;
  const playPromise = bgMusic.play();

  if (playPromise) {
    playPromise
      .then(() => {
        musicStarted = true;
        manualPause = false;
        musicToggle.textContent = '🔊';
      })
      .catch(() => {
        musicStarted = false;
        console.log('Autoplay blocked – waiting for user interaction');
      });
  }
}

const handleFirstTouchToStartMusic = () => {
  if (manualPause || musicStarted) return;
  startMusic();
};

document.addEventListener('pointerdown', handleFirstTouchToStartMusic, {
  passive: true,
});
document.addEventListener('touchstart', handleFirstTouchToStartMusic, {
  passive: true,
});
document.addEventListener('click', handleFirstTouchToStartMusic, {
  passive: true,
});

window.addEventListener('load', () => {
  if (window.location.hash) {
    history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search,
    );
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  setTimeout(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, 300);
});

bgMusic.addEventListener('ended', () => {
  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {});
});

musicToggle.addEventListener('click', (e) => {
  e.stopPropagation();

  if (bgMusic.paused) {
    pausedAt = bgMusic.currentTime || pausedAt || 0;
    bgMusic.currentTime = pausedAt;
    bgMusic
      .play()
      .then(() => {
        musicStarted = true;
        manualPause = false;
        musicToggle.textContent = '🔊';
      })
      .catch(() => {
        musicStarted = false;
        manualPause = true;
        musicToggle.textContent = '🔇';
      });
  } else {
    pausedAt = bgMusic.currentTime || 0;
    bgMusic.pause();
    musicStarted = false;
    manualPause = true;
    musicToggle.textContent = '🔇';
  }
});

/* Wax Seal Envelope Opening */
const inviteOverlay = document.getElementById('inviteOverlay');
const waxSeal = document.getElementById('waxSeal');
const inviteHint = document.getElementById('inviteHint');

document.body.classList.add('invite-locked');

let inviteOpened = false;
waxSeal.addEventListener('click', () => {
  if (inviteOpened) return;
  inviteOpened = true;

  inviteOverlay.classList.add('opened');
  waxSeal.classList.add('gone');
  inviteHint.classList.add('gone');

  startMusicFromInvite();

  setTimeout(() => {
    inviteOverlay.classList.add('hide');
    document.body.classList.remove('invite-locked');
    setTimeout(() => inviteOverlay.remove(), 1200);
  }, 3000);
});

function startMusicFromInvite() {
  if (!bgMusic) return;
  bgMusic.volume = musicVolume;
  bgMusic.currentTime = 0;
  const p = bgMusic.play();
  if (p && p.then) {
    p.then(() => {
      musicStarted = true;
      manualPause = false;
      if (musicToggle) musicToggle.textContent = '🔊';
    }).catch(() => {});
  }
}
