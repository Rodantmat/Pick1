
(() => {
  const $ = (id) => document.getElementById(id);
  const screens = {
    splash: $('screenSplash'),
    updates: $('screenUpdates'),
    pickup: $('screenPickup')
  };

  const state = {
    current: 'splash',
    splashFinished: false,
    cameraStream: null,
    lock: false
  };

  const loaderFill = $('loaderFill');
  const menuShell = $('menuShell');
  const cameraShell = $('cameraShell');
  const cameraVideo = $('cameraVideo');

  function setScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle('is-active', key === name);
    });
    state.current = name;
  }

  function openMenu() {
    if (cameraShell.classList.contains('is-open')) return;
    menuShell.classList.add('is-open');
    menuShell.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    menuShell.classList.remove('is-open');
    menuShell.setAttribute('aria-hidden', 'true');
  }

  function animateLoader(duration = 1650) {
    const start = performance.now();
    loaderFill.style.width = '0%';

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      loaderFill.style.width = (progress * 100).toFixed(2) + '%';
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        state.splashFinished = true;
        setScreen('updates');
      }
    }

    requestAnimationFrame(step);
  }

  async function openCamera() {
    closeMenu();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera is not available in this browser.');
        return;
      }
      if (!state.cameraStream) {
        state.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      }
      cameraVideo.srcObject = state.cameraStream;
      cameraShell.classList.add('is-open');
      cameraShell.setAttribute('aria-hidden', 'false');
    } catch (err) {
      alert('Camera permission is required for this demo.');
    }
  }

  function closeCamera() {
    cameraShell.classList.remove('is-open');
    cameraShell.setAttribute('aria-hidden', 'true');
  }

  $('updatesTap').addEventListener('click', openMenu);
  $('pickupMenuTap').addEventListener('click', (e) => {
    e.stopPropagation();
    openMenu();
  });
  $('menuClose').addEventListener('click', closeMenu);
  $('menuBackdrop').addEventListener('click', closeMenu);
  $('menuMainHit').addEventListener('click', () => {
    closeMenu();
    setScreen('pickup');
  });

  $('pickupCameraTap').addEventListener('click', (e) => {
    e.stopPropagation();
    openCamera();
  });
  $('pickupAnywhereTap').addEventListener('click', openCamera);
  $('cameraClose').addEventListener('click', closeCamera);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (cameraShell.classList.contains('is-open')) closeCamera();
      else closeMenu();
    }
  });

  setScreen('splash');
  animateLoader();
})();
