/* ===== Navbar shrink + back to top ===== */
const nav = document.getElementById('nav'),
  topBtn = document.getElementById('top');

/* ===== Parallax للاسم الكبير خلف الفريم ===== */
const heroScript = document.querySelector('.hero-script');
const isMobile = () => window.innerWidth <= 900;

// Throttle all scroll work via a single rAF loop
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;

      // Navbar + back-to-top
      nav.classList.toggle('shrink', y > 60);
      topBtn.classList.toggle('show', y > 600);

      // Parallax: only run on desktop to avoid mobile jank
      if (!isMobile()) {
        heroScript.style.transform = `translateX(-50%) translateY(${y * 0.25}px)`;
      }

      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

topBtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

/* ===== FIX: Mobile menu (موحّد + overlay + قفل السكرول) ===== */
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

/* لو رجع الشاشة لحجم ديسكتوب وهو مفتوح: يقفل تلقائي — now handled in resize listener below */

/* ===== FIX: اسم البراند كليكابل - يرجع لفوق ===== */
const brandLink = document.getElementById('brandLink');
brandLink.addEventListener('click', () => {
  closeMenu();
  scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== FIX: Scroll reveal REVERSIBLE (بيدخل وبيخرج) ===== */
// نحسب delay التتابع مرة واحدة بس عند التحميل (مش كل مرة يدخل فيها العنصر الشاشة)
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
      // FIX: toggle بدل unobserve عشان الأنيميشن يترجع لما نطلع لفوق تاني
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
);

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* ===== Countdown ===== */
const target = new Date('2025-09-14T17:00:00').getTime();
const pad = (n) => String(n).padStart(2, '0');
setInterval(() => {
  const diff = target - Date.now();
  if (diff < 0) return;
  d.textContent = pad(Math.floor(diff / 864e5));
  h.textContent = pad(Math.floor(diff / 36e5) % 24);
  m.textContent = pad(Math.floor(diff / 6e4) % 60);
  s.textContent = pad(Math.floor(diff / 1e3) % 60);
}, 1000);

/* ===== RSVP ===== */
document.getElementById('rsvpForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  localStorage.setItem('rsvp_' + Date.now(), JSON.stringify(data));
  document.getElementById('msg').textContent =
    'Thank you, ' + data.name + '! Your RSVP has been received ♥';
  e.target.reset();
});

/* ===== Year ===== */
document.getElementById('year').textContent = new Date().getFullYear();

/* Reset parallax transform when switching back to mobile on resize */
window.addEventListener(
  'resize',
  () => {
    if (innerWidth > 900 && mobileMenu.classList.contains('open')) closeMenu();
    // Reset transform on mobile so the CSS baseline transform is in control
    if (isMobile()) {
      heroScript.style.transform = 'translateX(-50%)';
    }
  },
  { passive: true },
);
// ===== Background Music =====
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('music-toggle');

// ► Configuration — غيّر من هنا
const musicVolume = 0.3; // مستوى الصوت (0.0 – 1.0)

bgMusic.volume = musicVolume;
bgMusic.loop = true;
let musicStarted = false; // هل الاغنية اتشغلت قبل كده
let pausedAt = 0; // نقطة التوقف الحالية

// ► دالة تشغيل الموسيقى — بتبدأ من نقطة التوقف أو من البداية أول مرة
function startMusic() {
  if (musicStarted || !bgMusic) return;

  bgMusic.currentTime = pausedAt || 0;
  const playPromise = bgMusic.play();

  if (playPromise) {
    playPromise
      .then(() => {
        musicStarted = true;
        musicToggle.textContent = '🔊';
      })
      .catch(() => {
        musicStarted = false;
        console.log('Autoplay blocked – waiting for first user interaction');
      });
  }
}

// ► محاولة autoplay فورية عند تحميل الصفحة
window.addEventListener('load', () => {
  setTimeout(() => {
    startMusic();
  }, 300);
});

// ► لو المتصفح منع التشغيل تلقائيًا — نعيد المحاولة أول ما يحصل تفاعل
const retryAutoplay = () => {
  if (!musicStarted) {
    startMusic();
  }
};

document.addEventListener('click', retryAutoplay, {
  once: false,
  passive: true,
});
document.addEventListener('touchstart', retryAutoplay, {
  once: false,
  passive: true,
});
document.addEventListener('scroll', retryAutoplay, {
  once: false,
  passive: true,
});
document.addEventListener('keydown', retryAutoplay, { once: false });

// ► لما الأغنية تخلص — نرجع من البداية ونشغّلها تانى
bgMusic.addEventListener('ended', () => {
  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {});
});

// ► زرار التشغيل / الإيقاف (أيقونة سماعة)
musicToggle.addEventListener('click', (e) => {
  e.stopPropagation();

  if (bgMusic.paused) {
    pausedAt = bgMusic.currentTime || pausedAt || 0;
    bgMusic.currentTime = pausedAt;
    bgMusic
      .play()
      .then(() => {
        musicStarted = true;
        musicToggle.textContent = '🔊';
      })
      .catch(() => {
        musicStarted = false;
        musicToggle.textContent = '🔇';
      });
  } else {
    pausedAt = bgMusic.currentTime || 0;
    bgMusic.pause();
    musicStarted = false;
    musicToggle.textContent = '🔇';
  }
});
