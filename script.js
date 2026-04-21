const splashScreen = document.getElementById('splashScreen');
const splashProgress = document.getElementById('splashProgress');
const homeScreen = document.getElementById('homeScreen');
const pickupScreen = document.getElementById('pickupScreen');
const menuDrawer = document.getElementById('menuDrawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const menuButton = document.getElementById('menuButton');
const pickupMenuButton = document.getElementById('pickupMenuButton');
const closeMenuButton = document.getElementById('closeMenuButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const scanRouteButton = document.getElementById('scanRouteButton');
const cameraOverlay = document.getElementById('cameraOverlay');
const cameraFeed = document.getElementById('cameraFeed');
const cameraMessage = document.getElementById('cameraMessage');
const closeCameraButton = document.getElementById('closeCameraButton');

const screens = {
  home: homeScreen,
  pickup: pickupScreen
};

let cameraStream = null;

function setActiveScreen(screenKey) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  (screens[screenKey] || homeScreen).classList.add('active');
}

function openMenu() {
  menuDrawer.classList.add('open');
  drawerBackdrop.classList.add('visible');
  menuDrawer.setAttribute('aria-hidden', 'false');
}

function closeMenu() {
  menuDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('visible');
  menuDrawer.setAttribute('aria-hidden', 'true');
}

function showLoadingThen(screenKey) {
  closeMenu();
  loadingOverlay.classList.add('visible');
  loadingOverlay.setAttribute('aria-hidden', 'false');

  window.setTimeout(() => {
    loadingOverlay.classList.remove('visible');
    loadingOverlay.setAttribute('aria-hidden', 'true');
    setActiveScreen(screenKey);
  }, 1150);
}

async function openCamera() {
  cameraOverlay.classList.add('visible');
  cameraOverlay.setAttribute('aria-hidden', 'false');
  cameraMessage.textContent = 'Opening camera…';

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraMessage.textContent = 'Camera access is not available in this browser.';
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' }
      },
      audio: false
    });

    cameraFeed.srcObject = cameraStream;
    cameraMessage.textContent = '';
  } catch (error) {
    cameraMessage.textContent = 'Camera permission was denied or the camera is unavailable.';
  }
}

function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  cameraFeed.srcObject = null;
  cameraOverlay.classList.remove('visible');
  cameraOverlay.setAttribute('aria-hidden', 'true');
}

function bootSplash() {
  requestAnimationFrame(() => {
    splashProgress.style.width = '100%';
  });

  window.setTimeout(() => {
    splashScreen.classList.add('hidden');
    homeScreen.classList.add('active');

    window.setTimeout(() => {
      splashScreen.style.display = 'none';
    }, 360);
  }, 2050);
}

menuButton.addEventListener('click', openMenu);
pickupMenuButton.addEventListener('click', openMenu);
closeMenuButton.addEventListener('click', closeMenu);
drawerBackdrop.addEventListener('click', closeMenu);

Array.from(document.querySelectorAll('.menu-item')).forEach((item) => {
  item.addEventListener('click', () => {
    const target = item.dataset.screen;

    if (target === 'pickup') {
      showLoadingThen('pickup');
      return;
    }

    closeMenu();

    if (target === 'home') {
      setActiveScreen('home');
    }
  });
});

scanRouteButton.addEventListener('click', openCamera);
closeCameraButton.addEventListener('click', closeCamera);
window.addEventListener('beforeunload', closeCamera);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    closeCamera();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

bootSplash();
