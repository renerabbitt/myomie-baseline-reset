const gallery=document.querySelector('#gallery'),more=document.querySelector('#more'),lightbox=document.querySelector('#lightbox');let filter='all',limit=8,current=0,items=[];const labels={'golden-child.webp':'Golden Child · from Sharon’s collection','miss-universe.webp':'Miss Universe · from Sharon’s collection','drblock.webp':'Dr. Block · from Sharon’s collection','drblockred.webp':'Dr. Block · new growth'};function caption(photo){return labels[photo.file]||(photo.origin==='local'?'From Sharon’s plant collection':'From the Night Vein grow room');}function render(){items=window.photos.filter(p=>filter==='all'||p.origin===filter);gallery.replaceChildren();items.slice(0,limit).forEach((p,i)=>{const b=document.createElement('button'),im=document.createElement('img');im.src='assets/'+p.file;im.alt=caption(p);im.loading='lazy';b.setAttribute('aria-label','Enlarge '+caption(p));b.append(im);b.onclick=()=>openPhoto(i);gallery.append(b)});more.hidden=limit>=items.length;more.firstChild.textContent=`View more photographs (${items.length-Math.min(limit,items.length)} more) `;}function show(){const p=items[current];lightbox.querySelector('img').src='assets/'+p.file;lightbox.querySelector('img').alt=caption(p);lightbox.querySelector('p').textContent=caption(p);document.querySelector('#position').textContent=(current+1)+' / '+items.length;}function openPhoto(i){current=i;show();lightbox.showModal()}document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;limit=8;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});render()});more.onclick=()=>{limit+=12;render()};document.querySelectorAll('[data-image]').forEach(b=>b.onclick=()=>{if(filter!=='all'){filter='all';document.querySelector('[data-filter="all"]').click()}openPhoto(items.findIndex(p=>p.file===b.dataset.image))});document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelector('#next').onclick=()=>{current=(current+1)%items.length;show()};document.querySelector('#prev').onclick=()=>{current=(current-1+items.length)%items.length;show()};lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight')document.querySelector('#next').click();if(e.key==='ArrowLeft')document.querySelector('#prev').click()});document.querySelector('#read-story').onclick=()=>document.querySelector('#story').showModal();document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));render();

// Progressive enhancement: content stays visible when motion is unavailable.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver;
let motionFrame = 0;
function observeReveals(root = document) {
  if (!revealObserver || motionPreference.matches) return;
  root.querySelectorAll('.intro > div, .section-heading, .photo-card, .gallery > button, .journal-photo, .journal-copy, .about-copy, .about figure, .closing > *').forEach((element) => {
    if (element.dataset.motionReady) return;
    element.dataset.motionReady = 'true';
    const siblings = [...element.parentElement.children];
    const stagger = element.matches('.photo-card, .gallery > button') ? siblings.indexOf(element) % 4 : 0;
    element.style.setProperty('--reveal-delay', `${stagger * 65}ms`);
    // Never hide content that the visitor can already see.
    if (element.getBoundingClientRect().top < innerHeight * .96) return;
    element.classList.add('scroll-reveal');
    revealObserver.observe(element);
  });
}
function updateScrollMotion() {
  motionFrame = 0;
  const hero = document.querySelector('.hero');
  const bounds = hero.getBoundingClientRect();
  const travel = Math.max(0, Math.min(-bounds.top, bounds.height));
  document.querySelector('.hero-photo').style.setProperty('--hero-drift', `${Math.min(travel * .12, 70)}px`);
  const range = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.reading-progress').style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0})`;
}
function scheduleScrollMotion() {
  if (!motionPreference.matches && !motionFrame) motionFrame = requestAnimationFrame(updateScrollMotion);
}
const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
function configureMotion() {
  revealObserver?.disconnect();
  cancelAnimationFrame(motionFrame);
  motionFrame = 0;
  document.querySelectorAll('.scroll-reveal').forEach(el => el.classList.remove('scroll-reveal'));
  document.querySelectorAll('[data-motion-ready]').forEach(el => delete el.dataset.motionReady);
  document.body.classList.toggle('motion-enabled', !motionPreference.matches);
  if (motionPreference.matches || !('IntersectionObserver' in window)) {
    revealObserver = null;
    document.querySelector('.hero-photo').style.removeProperty('--hero-drift');
    return;
  }
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: .08, rootMargin: '0px 0px -20px 0px'});
  observeReveals();
  scheduleScrollMotion();
}
new MutationObserver(() => { observeReveals(gallery); scheduleScrollMotion(); }).observe(gallery, {childList:true});
window.addEventListener('scroll', scheduleScrollMotion, {passive:true});
window.addEventListener('resize', scheduleScrollMotion, {passive:true});
motionPreference.addEventListener('change', configureMotion);
configureMotion();

const botanicalBackdrop = document.createElement('div');
botanicalBackdrop.className = 'botanical-backdrop';
botanicalBackdrop.setAttribute('aria-hidden', 'true');
document.body.prepend(botanicalBackdrop);
