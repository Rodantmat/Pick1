const splashScreen = document.getElementById('splashScreen');
const splashProgress = document.getElementById('splashProgress');
const homeScreen = document.getElementById('homeScreen');
const itineraryScreen = document.getElementById('itineraryScreen');
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
const screens = { home: homeScreen, itinerary: itineraryScreen };
const runtime = { booted: false, loadingTimer: null, splashTimer: null, splashCleanupTimer: null, cameraStream: null, lastScreen: 'home' };
function checkpoint(label) { try { console.debug('[checkpoint]', label); } catch (_) {} }
function setActiveScreen(name) { const target = screens[name] ? name : 'home'; Object.values(screens).forEach(screen => screen.classList.remove('active')); screens[target].classList.add('active'); runtime.lastScreen = target; checkpoint(`screen:${target}`); }
function openMenu() { menuDrawer.classList.add('open'); drawerBackdrop.classList.add('visible'); menuDrawer.setAttribute('aria-hidden', 'false'); checkpoint('menu:open'); }
function closeMenu() { menuDrawer.classList.remove('open'); drawerBackdrop.classList.remove('visible'); menuDrawer.setAttribute('aria-hidden', 'true'); checkpoint('menu:close'); }
function clearLoadingTimer() { if (runtime.loadingTimer) { clearTimeout(runtime.loadingTimer); runtime.loadingTimer = null; } }
function showLoadingThen(screenName) { clearLoadingTimer(); closeMenu(); loadingOverlay.classList.add('visible'); loadingOverlay.setAttribute('aria-hidden', 'false'); checkpoint(`loading:start:${screenName}`); runtime.loadingTimer = window.setTimeout(() => { loadingOverlay.classList.remove('visible'); loadingOverlay.setAttribute('aria-hidden', 'true'); setActiveScreen(screenName); checkpoint(`loading:end:${screenName}`); runtime.loadingTimer = null; }, 1500); }
async function openCamera() { cameraOverlay.classList.add('visible'); cameraOverlay.setAttribute('aria-hidden', 'false'); cameraMessage.textContent = 'Opening camera…'; checkpoint('camera:open'); if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { cameraMessage.textContent = 'Camera access is not available in this browser.'; return; } try { if (runtime.cameraStream) { runtime.cameraStream.getTracks().forEach(track => track.stop()); runtime.cameraStream = null; } runtime.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }); cameraFeed.srcObject = runtime.cameraStream; cameraMessage.textContent = ''; checkpoint('camera:ready'); } catch (error) { cameraMessage.textContent = 'Camera permission was denied or the camera is unavailable.'; checkpoint('camera:error'); } }
function closeCamera() { if (runtime.cameraStream) { runtime.cameraStream.getTracks().forEach(track => track.stop()); runtime.cameraStream = null; } cameraFeed.srcObject = null; cameraOverlay.classList.remove('visible'); cameraOverlay.setAttribute('aria-hidden', 'true'); cameraMessage.textContent = 'Opening camera…'; checkpoint('camera:close'); }
function bootSplash() { if (runtime.booted) return; runtime.booted = true; checkpoint('boot:start'); requestAnimationFrame(() => { splashProgress.style.width = '100%'; }); runtime.splashTimer = window.setTimeout(() => { splashScreen.classList.add('hidden'); setActiveScreen('home'); runtime.splashCleanupTimer = window.setTimeout(() => { splashScreen.style.display = 'none'; checkpoint('boot:complete'); }, 340); }, 2050); }
menuButton.addEventListener('click', openMenu); pickupMenuButton.addEventListener('click', openMenu); closeMenuButton.addEventListener('click', closeMenu); drawerBackdrop.addEventListener('click', closeMenu);
document.querySelectorAll('.drawer-item[data-screen]').forEach(item => { item.addEventListener('click', () => { const target = item.dataset.screen; if (target === 'itinerary') return showLoadingThen('itinerary'); closeMenu(); setActiveScreen('home'); }); });
scanRouteButton.addEventListener('click', openCamera); closeCameraButton.addEventListener('click', closeCamera); window.addEventListener('beforeunload', closeCamera);
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); closeCamera(); } });
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./service-worker.js').catch(() => {}); }); }
bootSplash();
