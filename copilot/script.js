/* script.js
   Hero canvas, three.js sculpture, text scramble, tabs, filters, modal, micro-cursor,
   magnetic buttons, scroll reveal, contact form handling.
*/

const qs = (s, ctx=document) => ctx.querySelector(s);
const qsa = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', () => {
  qs('#year')?.textContent = new Date().getFullYear();
  qs('#year2')?.textContent = new Date().getFullYear();
  initCanvasHero();
  initThree();
  initScramble();
  bindServiceTabs();
  bindFilters();
  bindProjectModal();
  initCursor();
  initScrollReveal();
  bindContactForm();
});

/* Canvas hero: subtle moving geometric lines */
function initCanvasHero(){
  const canvas = qs('#heroCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w,h;
  const lines = Array.from({length:26}, (_,i)=>({
    x: Math.random(), y: Math.random(),
    a: (Math.random()*2-1)*0.6, speed: 0.0009 + Math.random()*0.0015
  }));
  function resize(){ w=canvas.width=innerWidth; h=canvas.height=innerHeight; }
  function draw(t){
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'lighter';
    lines.forEach((l,i)=>{
      l.x += Math.cos(t*l.speed + i)*0.0006;
      l.y += Math.sin(t*l.speed*1.1 + i)*0.0007;
      const x = (l.x*1.7%1)*w;
      const y = (l.y*1.7%1)*h;
      const len = 220 + Math.abs(Math.sin(t*0.0003 + i))*240;
      const angle = l.a + Math.sin(t*0.00018+i)*0.18;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(16,24,40,${0.04 + Math.abs(Math.sin(t*0.0004+i))*0.06})`;
      ctx.lineWidth = 1 + Math.abs(Math.cos(i))*1.6;
      ctx.moveTo(x,y);
      ctx.lineTo(x+Math.cos(angle)*len, y+Math.sin(angle)*len);
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }
  resize(); window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

/* three.js mini sculpture */
function initThree(){
  const mount = qs('#threeMount');
  if(!mount || !window.THREE) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, mount.clientWidth/mount.clientHeight, 0.1, 1000);
  camera.position.set(0,0,4.6);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  mount.appendChild(renderer.domElement);

  const geo = new THREE.TorusKnotGeometry(0.8, 0.26, 160, 12);
  const mat = new THREE.MeshStandardMaterial({color:0xff5a3c, metalness:0.5, roughness:0.3, emissive:0x220b05, emissiveIntensity:0.05});
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  scene.add(new THREE.DirectionalLight(0xffffff, 0.9));
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  window.addEventListener('resize', ()=> {
    camera.aspect = mount.clientWidth/mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  });

  let t=0;
  (function anim(){
    t += 0.01;
    mesh.rotation.x = Math.sin(t*0.6)*0.22;
    mesh.rotation.y = t*0.18;
    mesh.material.color.setHSL((Math.sin(t*0.32)+1)/4, 0.8, 0.5);
    renderer.render(scene, camera);
    requestAnimationFrame(anim);
  })();
}

/* Text scramble for hero headline */
function initScramble(){
  const el = qs('.scramble');
  if(!el) return;
  const target = el.dataset.text || el.textContent;
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  let progress = 0;
  el.textContent = '';
  function step(){
    progress += 0.02;
    const out = [];
    for(let i=0;i<target.length;i++){
      if(i/progress < 1) out.push(target[i]);
      else out.push(chars[Math.floor(Math.random()*chars.length)]);
    }
    el.textContent = out.join('');
    if(progress < 1) requestAnimationFrame(step); else el.textContent = target;
  }
  step();
}

/* Service tabs */
function bindServiceTabs(){
  const tabs = qsa('.service-tab');
  const show = qs('#serviceShow');
  if(!tabs.length || !show) return;
  tabs.forEach(t => t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('ring-2')); t.classList.add('ring-2');
    renderService(t.dataset.tab);
  }));
  renderService('web');
}
function renderService(id){
  const show = qs('#serviceShow');
  const map = {
    web:{title:'Web Applications', body:'Secure, scalable web apps and platforms.', tech:'React; Next.js; Node.js; TypeScript; GraphQL'},
    mobile:{title:'Mobile Applications', body:'Cross-platform and native apps built for performance.', tech:'Flutter; React Native; Swift; Kotlin'},
    ui:{title:'UI/UX Design', body:'Design systems, accessibility-first interfaces, and motion.', tech:'Figma; Storybook; A11y; Motion'}
  };
  const t = map[id] || map.web;
  show.innerHTML = `
    <div class="glass p-6 rounded-lg mt-4">
      <h3 class="font-semibold">${t.title}</h3>
      <p class="text-[var(--muted)] mt-2">${t.body}</p>
      <p class="mt-3 text-sm"><strong>Typical tech</strong>: ${t.tech}</p>
      <div class="mt-4 flex gap-3">
        <button class="px-4 py-2 rounded" style="background:var(--accent); color:white;">Start Project</button>
        <a href="portfolio.html" class="px-4 py-2 rounded glass">See Examples</a>
      </div>
    </div>
  `;
}

/* Portfolio filters */
function bindFilters(){
  const buttons = qsa('.filter-btn');
  buttons.forEach(b=> b.addEventListener('click', ()=>{
    buttons.forEach(x=>x.classList.remove('bg-[var(--accent)]','text-white'));
    b.classList.add('bg-[var(--accent)]','text-white');
    const f = b.dataset.filter;
    filterProjects(f);
  }));
  const all = buttons.find(b=>b.dataset.filter==='all');
  if(all) all.classList.add('bg-[var(--accent)]','text-white');
}
function filterProjects(filter){
  const projects = qsa('.project');
  projects.forEach(p=>{
    const tags = p.dataset.tags.split(' ');
    if(filter==='all' || tags.includes(filter)){ p.style.display=''; p.classList.remove('opacity-40'); }
    else { p.style.display='none'; }
  });
}

/* Modal case study */
function bindProjectModal(){
  const openers = qsa('.open-case');
  const modal = qs('#caseModal');
  const content = qs('#caseContent');
  const close = qs('#closeModal');
  const data = {
    'proj-1': {title:'Aurora Finance', subtitle:'Real-time finance dashboard', client:'Aurora Finance', industry:'Fintech', services:'Web App, API', tech:['React','TypeScript','Node.js'], features:['Real-time streaming','Role-based dashboards','Design system']},
    'proj-2': {title:'Nomad Trails', subtitle:'Offline-first travel guide', client:'Nomad Trails', industry:'Travel', services:'Mobile App', tech:['Flutter','Firebase'], features:['Offline caching','Map sync','Local-first UX']},
    'proj-3': {title:'Foundry Studio', subtitle:'Design system & component library', client:'Foundry Studio', industry:'Design', services:'UI/UX, Design System', tech:['Figma','Storybook'], features:['Tokenized design','Accessible components']},
    'proj-4': {title:'MarketCraft', subtitle:'B2B marketplace', client:'MarketCraft', industry:'Marketplace', services:'Web App', tech:['Next.js','GraphQL'], features:['Vendor flows','Payments','Search']},
    'proj-5': {title:'Pulse Health', subtitle:'Patient engagement app', client:'Pulse Health', industry:'Health', services:'Mobile App', tech:['React Native'], features:['Secure sync','Notifications','HIPAA-aware']},
    'proj-6': {title:'Civic Connect', subtitle:'Open data portal', client:'Civic Connect', industry:'Civic Tech', services:'Web App, Data Viz', tech:['D3','React'], features:['Accessibility','API exports','Visualizations']}
  };

  openers.forEach(o=> o.addEventListener('click', e=>{
    e.preventDefault();
    const id = o.dataset.id;
    const d = data[id];
    if(!d) return;
    content.innerHTML = renderCase(d);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // focus trap start
    qs('#caseModal button, #caseModal a')?.focus();
  }));

  function closeModal(){
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  close?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') { if(!modal.classList.contains('hidden')) closeModal(); } });
}
function renderCase(d){
  return `
    <header id="caseTitle" class="mb-4">
      <h2 class="text-2xl font-semibold">${d.title}</h2>
      <p class="text-[var(--muted)]">${d.subtitle}</p>
    </header>
    <div class="h-48 mb-4 rounded-md bg-gradient-to-br from-[#111827] to-[#374151]"></div>
    <section class="mb-4">
      <h4 class="font-semibold">Project Info</h4>
      <p class="text-[var(--muted)] mt-2"><strong>Client:</strong> ${d.client} · <strong>Industry:</strong> ${d.industry} · <strong>Services:</strong> ${d.services}</p>
      <p class="text-[var(--muted)] mt-2"><strong>Tech stack:</strong> ${d.tech.join(', ')}</p>
    </section>
    <section class="mb-4">
      <h4 class="font-semibold">The Challenge</h4>
      <p class="text-[var(--muted)] mt-2">A concise description of the core problem the client faced and constraints we respected.</p>
    </section>
    <section class="mb-4">
      <h4 class="font-semibold">The Solution</h4>
      <p class="text-[var(--muted)] mt-2">How we solved it: technical approach, design decisions, and outcomes.</p>
      <div class="grid md:grid-cols-3 gap-4 mt-4">
        <div class="h-28 rounded-md bg-gradient-to-br from-[#0b1220] to-[#374151]"></div>
        <div class="h-28 rounded-md bg-gradient-to-br from-[#06b6d4] to-[#0ea5a4]"></div>
        <div class="h-28 rounded-md bg-gradient-to-br from-[#f97316] to-[#fb923c]"></div>
      </div>
    </section>
    <section class="mb-4">
      <h4 class="font-semibold">Key Features</h4>
      <ul class="list-disc ml-6 text-[var(--muted)] mt-2">${d.features.map(f=>`<li>${f}</li>`).join('')}</ul>
    </section>
    <section class="mb-4">
      <h4 class="font-semibold">Client Quote</h4>
      <blockquote class="italic text-[var(--muted)] mt-2">"An impactful quote from the client about outcomes and partnership."</blockquote>
    </section>
    <div class="flex gap-3 mt-4">
      <a href="project-detail.html" class="px-4 py-2 rounded" style="background:var(--accent);color:white">View Case Study</a>
      <a href="#" class="px-4 py-2 rounded glass">Visit Live Site</a>
    </div>
  `;
}

/* Cursor + magnetic micro-interactions */
function initCursor(){
  const dot = qs('#cursorDot'), outer = qs('#cursorOuter');
  if(!dot || !outer) return;
  let mx = innerWidth/2, my = innerHeight/2, ox = mx, oy = my;
  document.addEventListener('mousemove', e=> { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
  (function follow(){ ox += (mx - ox) * 0.12; oy += (my - oy) * 0.12; outer.style.left = ox + 'px'; outer.style.top = oy + 'px'; requestAnimationFrame(follow); })();

  qsa('.magnet, .project-card, .open-case, a, button').forEach(el=>{
    el.addEventListener('mouseenter', ()=> { dot.style.transform = 'scale(0.5)'; outer.style.transform = 'scale(1.12)'; });
    el.addEventListener('mouseleave', ()=> { dot.style.transform = 'scale(1)'; outer.style.transform = 'scale(1)'; });
  });

  qsa('.magnet').forEach(btn=>{
    btn.addEventListener('mousemove', e=>{
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width/2);
      const dy = e.clientY - (rect.top + rect.height/2);
      btn.style.transform = `translate(${dx*0.12}px, ${dy*0.12}px) scale(1.02)`;
    });
    btn.addEventListener('mouseleave', ()=> btn.style.transform = '');
  });
}

/* Scroll reveal */
function initScrollReveal(){
  const els = qsa('section, .glass, .project-card, .project');
  function reveal(){
    els.forEach(el=>{
      const r = el.getBoundingClientRect();
      if(r.top < window.innerHeight - 80){ el.style.opacity = 1; el.style.transform = 'translateY(0)'; el.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2,.9,.3,1)'; }
      else { el.style.opacity = 0; el.style.transform = 'translateY(18px)'; }
    });
  }
  reveal();
  window.addEventListener('scroll', reveal);
  window.addEventListener('resize', reveal);
}

/* Contact form handling */
function bindContactForm(){
  const f = qs('#contactForm');
  if(!f) return;
  f.addEventListener('submit', e=>{
    e.preventDefault();
    const btn = f.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Thanks — we will be in touch';
    setTimeout(()=>{ f.reset(); btn.disabled=false; btn.textContent = 'Book Your Free Consultation'; }, 1800);
  });
}