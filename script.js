(() => {
  'use strict';
  const header=document.querySelector('.site-header'), menu=document.querySelector('.menu-toggle'), nav=document.querySelector('#navigation');
  const mobile=matchMedia('(max-width:760px)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
  header.classList.add('js-nav');
  const closeMenu=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
  nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  document.addEventListener('click',e=>{if(!header.contains(e.target))closeMenu();});
  mobile.addEventListener('change',closeMenu);

  const track=document.querySelector('#services-track'), cards=[...track.querySelectorAll('.service-card')];
  const controls=document.querySelector('.carousel-controls'), status=document.querySelector('.carousel-status');
  controls.hidden=false;
  function updateCarousel(){
    const max=track.scrollWidth-track.clientWidth;
    controls.querySelector('[data-direction="-1"]').setAttribute('aria-disabled',String(track.scrollLeft<=4));
    controls.querySelector('[data-direction="1"]').setAttribute('aria-disabled',String(track.scrollLeft>=max-4));
    const bounds=track.getBoundingClientRect();
    const center=(Math.max(0,bounds.left)+Math.min(innerWidth,bounds.right))/2;
    const nearest=cards.reduce((best,c,i)=>{
      const box=c.getBoundingClientRect(), distance=Math.abs(box.left+box.width/2-center);
      return distance<best.distance?{index:i,distance}:best;
    },{index:0,distance:Infinity});
    cards.forEach((card,index)=>card.classList.toggle('is-active',index===nearest.index));
    status.textContent='Serviço '+(nearest.index+1)+' de '+cards.length;
  }
  function go(direction){
    const step=cards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);
    track.scrollBy({left:direction*step,behavior:reduced.matches?'instant':'smooth'});
  }
  controls.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.getAttribute('aria-disabled')!=='true')go(Number(b.dataset.direction));});
  track.addEventListener('keydown',e=>{
    if(e.target!==track)return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(e.key==='ArrowRight'?1:-1);}
    if(e.key==='Home'||e.key==='End'){e.preventDefault();track.scrollTo({left:e.key==='Home'?0:track.scrollWidth,behavior:reduced.matches?'instant':'smooth'});}
  });
  let carouselFrame=false;
  track.addEventListener('scroll',()=>{if(!carouselFrame){carouselFrame=true;requestAnimationFrame(()=>{carouselFrame=false;updateCarousel();});}},{passive:true});
  window.addEventListener('resize',updateCarousel,{passive:true});
  updateCarousel();

  const photo=document.querySelector('.hero-photo img'); let frame=false;
  function paint(){frame=false;if(mobile.matches||reduced.matches){photo.style.removeProperty('transform');return;}
    const box=photo.parentElement.getBoundingClientRect();if(box.bottom<0)return;
    photo.style.transform='translate3d(0,'+Math.min(22,Math.max(-22,-box.top*.04)).toFixed(2)+'px,0)';
  }
  function requestPaint(){if(!frame){frame=true;requestAnimationFrame(paint);}}
  window.addEventListener('scroll',requestPaint,{passive:true});window.addEventListener('resize',requestPaint,{passive:true});reduced.addEventListener('change',requestPaint);paint();

  const config=window.MICHELLE_CONFIG||{};
  const phone=String(config.whatsapp||'').replace(/\D/g,'');
  if(/^55\d{10,11}$/.test(phone)){
    document.querySelectorAll('[data-whatsapp]').forEach(a=>{
      const message=a.dataset.service?'Olá, Dra. Michelle. Gostaria de informações sobre '+a.dataset.service+'.':config.whatsappMessage;
      a.href='https://wa.me/'+phone+'?text='+encodeURIComponent(message||'Olá, Dra. Michelle. Gostaria de conversar sobre uma demanda médico-pericial.');
      a.target='_blank';a.rel='noopener noreferrer';
    });
    document.querySelector('.contact-number').href='tel:+'+phone;
  }
  const email=String(config.email||'').trim();
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))document.querySelectorAll('[data-email]').forEach(a=>{a.href='mailto:'+email;a.textContent=email;});
  if(config.crm)document.querySelectorAll('[data-crm]').forEach(el=>el.textContent=config.crm);
  if(config.region)document.querySelectorAll('[data-region]').forEach(el=>{el.textContent=config.region;el.hidden=false;});
  document.querySelector('#year').textContent=new Date().getFullYear();

  // Animate once on entry. The default rendering stays visible if JS or motion is unavailable.
  if (!reduced.matches && 'IntersectionObserver' in window && typeof Element.prototype.animate === 'function') {
    const animations=new Map();
    const reveal=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const element=entry.target;
        reveal.unobserve(element);
        if(reduced.matches || element.contains(document.activeElement))return;
        const stagger=element.matches('.method-steps li, .area-grid article')
          ? [...element.parentElement.children].indexOf(element)%2*65 : 0;
        const animation=element.animate([
          {opacity:0,transform:'translateY(18px)'},
          {opacity:1,transform:'translateY(0)'}
        ],{duration:650,delay:stagger,easing:'cubic-bezier(.22,.68,.25,1)',fill:'backwards'});
        animations.set(element,animation);
        animation.onfinish=()=>animations.delete(element);
        animation.oncancel=()=>animations.delete(element);
      });
    },{threshold:0,rootMargin:'0px 0px 35px 0px'});
    document.querySelectorAll('.section-heading, .services-track, .profile-portrait, .profile-copy, .method .eyebrow, .method h2, .method-steps li, .areas > div:first-child, .area-grid article, .faq > div, .contact-inner > div').forEach(element=>{
      if(element.getBoundingClientRect().top>innerHeight+35)reveal.observe(element);
    });
    document.addEventListener('focusin',event=>{
      animations.forEach((animation,element)=>{if(element.contains(event.target))animation.cancel();});
    });
    reduced.addEventListener('change',()=>{
      if(reduced.matches){reveal.disconnect();animations.forEach(animation=>animation.cancel());}
    });
    window.addEventListener('beforeprint',()=>{
      reveal.disconnect();animations.forEach(animation=>animation.cancel());
    });
  }
})();
