/* ===== Navbar shrink + back to top ===== */
const nav = document.getElementById('nav'),
  topBtn = document.getElementById('top');
window.addEventListener('scroll', () => {
  nav.classList.toggle('shrink', scrollY > 60);
  topBtn.classList.toggle('show', scrollY > 600);
});
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

/* لو رجع الشاشة لحجم ديسكتوب وهو مفتوح: يقفل تلقائي */
window.addEventListener('resize', () => {
  if (innerWidth > 900 && mobileMenu.classList.contains('open'))
    closeMenu();
});

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

/* ===== Parallax للاسم الكبير خلف الفريم ===== */
const script = document.querySelector('.hero-script');
window.addEventListener('scroll', () => {
  script.style.transform = `translateX(-50%) translateY(${scrollY * 0.25}px)`;
});
