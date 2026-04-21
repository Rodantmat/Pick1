(function(){
  const splash=document.getElementById('splashScreen');
  const updates=document.getElementById('updatesScreen');
  const pickup=document.getElementById('pickupScreen');
  const menuShell=document.getElementById('menuShell');
  const cameraShell=document.getElementById('cameraShell');
  const cameraVideo=document.getElementById('cameraVideo');
  const loaderFill=document.getElementById('loaderFill');
  let cameraStream=null;

  function show(screen){
    [splash,updates,pickup].forEach(el=>el.classList.remove('active'));
    screen.classList.add('active');
  }
  function openMenu(){ menuShell.classList.add('open'); }
  function closeMenu(){ menuShell.classList.remove('open'); }
  function goPickup(){ closeMenu(); show(pickup); }
  function goUpdates(){ closeMenu(); show(updates); }

  function bindTap(id, fn){
    const el=document.getElementById(id);
    if(!el) return;
    const fire=(e)=>{ e.preventDefault(); e.stopPropagation(); fn(e); };
    ['pointerup','touchend','click'].forEach(evt=>el.addEventListener(evt, fire, {passive:false}));
  }

  function startLoader(){
    let done=false;
    const begin=performance.now();
    function tick(now){
      const p=Math.min((now-begin)/1600,1);
      loaderFill.style.width=(p*100)+'%';
      if(p<1){requestAnimationFrame(tick);} else if(!done){done=true; setTimeout(()=>show(updates),120);} 
    }
    requestAnimationFrame(tick);
  }

  async function openCamera(){
    closeMenu();
    try{
      if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
        alert('Camera is not available in this browser.');
        return;
      }
      if(!cameraStream){
        cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      }
      cameraVideo.srcObject=cameraStream;
      cameraShell.classList.add('open');
    }catch(e){
      alert('Camera permission is required for this demo.');
    }
  }
  function closeCamera(){ cameraShell.classList.remove('open'); }

  bindTap('updatesOpenMenu', openMenu);
  bindTap('pickupOpenMenu', openMenu);
  bindTap('menuDim', closeMenu);
  bindTap('menuClose', closeMenu);
  bindTap('menuGoPickup', goPickup);
  bindTap('pickupOpenCamera', openCamera);
  bindTap('pickupOpenCameraAnywhere', openCamera);
  bindTap('cameraClose', closeCamera);

  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){
      if(cameraShell.classList.contains('open')) closeCamera();
      else closeMenu();
    }
  });

  show(splash);
  startLoader();
})();
