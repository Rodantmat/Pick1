(function(){
  'use strict';

  const splash = document.getElementById('splashScreen');
  const updates = document.getElementById('updatesScreen');
  const pickup = document.getElementById('pickupScreen');
  const menuShell = document.getElementById('menuShell');
  const menuDim = document.getElementById('menuDim');
  const menuClose = document.getElementById('menuClose');
  const menuGoPickup = document.getElementById('menuGoPickup');
  const updatesTapCapture = document.getElementById('updatesTapCapture');
  const pickupTapCapture = document.getElementById('pickupTapCapture');
  const cameraShell = document.getElementById('cameraShell');
  const cameraVideo = document.getElementById('cameraVideo');
  const cameraClose = document.getElementById('cameraClose');
  const loaderFill = document.getElementById('loaderFill');

  let cameraStream = null;
  let splashFinished = false;

  function setActive(screen) {
    splash.classList.remove('active');
    updates.classList.remove('active');
    pickup.classList.remove('active');
    screen.classList.add('active');
  }

  function openMenu() {
    menuShell.classList.add('open');
  }

  function closeMenu() {
    menuShell.classList.remove('open');
  }

  function showPickup() {
    closeMenu();
    setActive(pickup);
  }

  function showUpdates() {
    closeMenu();
    setActive(updates);
  }

  async function openCamera() {
    closeMenu();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera is not available in this browser.');
        return;
      }
      if (!cameraStream) {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      }
      cameraVideo.srcObject = cameraStream;
      cameraShell.classList.add('open');
    } catch (err) {
      alert('Camera permission is required for this demo.');
    }
  }

  function closeCamera() {
    cameraShell.classList.remove('open');
  }

  function bindPress(el, fn) {
    if (!el) return;
    const handler = function(e) {
      e.preventDefault();
      e.stopPropagation();
      fn(e);
    };
    el.addEventListener('click', handler, { passive: false });
    el.addEventListener('touchend', handler, { passive: false });
    el.addEventListener('pointerup', handler, { passive: false });
  }

  function startLoader() {
    const duration = 1600;
    const start = performance.now();
    loaderFill.style.width = '0%';

    function frame(now) {
      const progress = Math.max(0, Math.min(1, (now - start) / duration));
      loaderFill.style.width = (progress * 100).toFixed(1) + '%';
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        splashFinished = true;
        setTimeout(showUpdates, 140);
      }
    }

    requestAnimationFrame(frame);
  }

  bindPress(updatesTapCapture, openMenu);
  bindPress(menuDim, closeMenu);
  bindPress(menuClose, closeMenu);
  bindPress(menuGoPickup, showPickup);
  bindPress(pickupTapCapture, openCamera);
  bindPress(cameraClose, closeCamera);

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (cameraShell.classList.contains('open')) {
      closeCamera();
      return;
    }
    closeMenu();
  });

  // Fallback direct delegates for iOS/PWA oddities.
  updates.addEventListener('click', function() { if (splashFinished) openMenu(); });
  updates.addEventListener('touchend', function(e) { if (splashFinished) { e.preventDefault(); openMenu(); } }, { passive: false });
  pickup.addEventListener('click', function() { openCamera(); });
  pickup.addEventListener('touchend', function(e) { e.preventDefault(); openCamera(); }, { passive: false });

  setActive(splash);
  startLoader();
})();
