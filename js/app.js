const menu = document.querySelector('#menu');

// Siempre volver arriba al recargar
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

// También forzar scroll al top al cargar
window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

// Si por alguna razón hay scroll, forzarlo a 0
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      menu.classList.add('menu-visible');
      io.disconnect();
    }
  }
}, { threshold: 0.1 });

io.observe(menu);

// Remover pantalla de carga después de la animación
setTimeout(() => {
  const loader = document.querySelector('.loader-screen');
  if (loader) {
    loader.remove();
  }
}, 4300);