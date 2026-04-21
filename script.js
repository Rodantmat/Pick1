(() => {
  const state = {
    current: 'splash',
    splashDone: false,
    menuOpen: false,
    stream: null,
    booted: false,
    splashTimer: null,
    splashAnimFrame: null,
  };

  if (state.booted) return;
  state.booted = true;

  const screens = {
    splash: document.getElementById('screenSplash'),
    updates: document.getElementById('screenUpdates'),
    pickup: document.getElementById('screenPickup')
  };

  const menuLayer = document.getElementById('menuLayer');
  const cameraLayer = document.getElementById('cameraLayer');
  const cameraFeed = document.getElementById('cameraFeed');
  const splashLoaderFill = document.getElementById('splashLoaderFill');

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => el.classList.toggle('active', key === name));
    state.current = name;
  }

  function openMenu() {
    if (cameraLayer.classList.contains('open')) return;
    menuLayer.classList.add('open');
    menuLayer.setAttribute('aria-hidden', 'false');
    state.menuOpen = true;
  }

  function closeMenu() {
    menuLayer.classList.remove('open');
    menuLayer.setAttribute('aria-hidden', 'true');
    state.menuOpen = false;
  }

  async function openCamera() {
    closeMenu();
    if (state.stream) {
      cameraLayer.classList.add('open');
      cameraLayer.setAttribute('aria-hidden', 'false');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      state.stream = stream;
      cameraFeed.srcObject = stream;
      cameraLayer.classList.add('open');
      cameraLayer.setAttribute('aria-hidden', 'false');
    } catch (err) {
      alert('Camera access is required for this demo.');
    }
  }

  function closeCamera() {
    cameraLayer.classList.remove('open');
    cameraLayer.setAttribute('aria-hidden', 'true');
  }

  function runSplashCheckpoint() {
    if (state.splashDone) return;
    state.splashDone = true;
    if (splashLoaderFill) {
      splashLoaderFill.style.width = '0%';
      requestAnimationFrame(() => {
        splashLoaderFill.style.width = '100%';
      });
    }
    window.clearTimeout(state.splashTimer);
    state.splashTimer = window.setTimeout(() => showScreen('updates'), 1700);
  }

  document.getElementById('openMenuUpdates').addEventListener('click', openMenu, { passive: true });
  document.getElementById('openMenuPickup').addEventListener('click', openMenu, { passive: true });
  document.getElementById('closeMenu').addEventListener('click', closeMenu, { passive: true });
  document.getElementById('menuSelectPickup').addEventListener('click', () => { showScreen('pickup'); closeMenu(); }, { passive: true });
  document.getElementById('menuBackdropHotspot').addEventListener('click', closeMenu, { passive: true });
  document.getElementById('openCamera').addEventListener('click', openCamera);
  document.getElementById('openCameraAnywhere').addEventListener('click', openCamera);
  document.getElementById('closeCamera').addEventListener('click', closeCamera, { passive: true });

  document.querySelectorAll('[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      showScreen(target === 'pickup' ? 'pickup' : 'updates');
      closeMenu();
    }, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !state.splashDone) runSplashCheckpoint();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }, { once: true });
  }

  showScreen('splash');
  runSplashCheckpoint();
})();
