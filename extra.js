
/* Bannière qui change */
(function(){
  const sl=document.querySelector(".slides"),dots=document.querySelector(".dots"),h=document.querySelector(".hero");
  if(!sl||!dots||!h)return;
  const n=sl.children.length;let i=0,timer,x0=null;
  dots.innerHTML=Array.from({length:n},(_,k)=>`<button aria-label="Image ${k+1}"></button>`).join("");
  const bs=dots.querySelectorAll("button");
  function go(k){i=(k+n)%n;sl.style.transform="translateX(-"+(i*100)+"%)";bs.forEach((b,j)=>b.classList.toggle("on",j===i))}
  function start(){clearInterval(timer);timer=setInterval(()=>go(i+1),5000)}
  bs.forEach((b,j)=>b.addEventListener("click",()=>{go(j);start()}));
  h.addEventListener("touchstart",e=>{x0=e.touches[0].clientX},{passive:true});
  h.addEventListener("touchend",e=>{
    if(x0===null)return;
    const d=e.changedTouches[0].clientX-x0;
    if(Math.abs(d)>40){go(i+(d<0?1:-1));start()}
    x0=null;
  });
  go(0);start();
})();

/* Icônes du haut */
document.getElementById("searchBtn").addEventListener("click",()=>{
  const b=document.getElementById("searchBar");
  b.hidden=!b.hidden;
  if(!b.hidden)document.getElementById("q").focus();
});
document.getElementById("favBtn").addEventListener("click",()=>{
  setCat("favoris");
  document.getElementById("produits").scrollIntoView({behavior:"smooth"});
});

/* Nous trouver (Google Maps) */
(function(){
  const MAPS="https://maps.app.goo.gl/vLy6uV2c6XMTdjr86";
  const st=document.createElement("style");
  st.textContent=".loc{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px 12px}"
   +".locbtn{display:inline-block;padding:6px 14px;border-radius:999px;background:linear-gradient(135deg,#f4d27a,#c99a2e);color:#4a1030;font-weight:600;text-decoration:none;font-size:.85rem}"
   +".shr{margin-top:6px;width:100%;border:2px solid #c99a2e;background:rgba(255,255,255,.5);color:#4a1030;border-radius:12px;padding:8px;font-weight:600;font-size:.9rem;cursor:pointer}"
   +".shr:active{transform:scale(.96)}"
   +".gal{margin-bottom:6px}"
   +".gmain{position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden;margin-bottom:8px;background:#ffd3e4}"
   +".gmain img{width:100%;height:100%;object-fit:cover;display:block}"
   +".gn{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.75);font-size:1.4rem;line-height:1;cursor:pointer;color:#b0125b}"
   +".gp{left:8px}.gx{right:8px}"
   +".gth{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}"
   +".gth img{width:56px;height:56px;object-fit:cover;border-radius:10px;border:2px solid transparent;cursor:pointer;flex:0 0 auto;opacity:.7}"
   +".gth img.on{border-color:#b0125b;opacity:1}";
  document.head.appendChild(st);
  const loc=document.querySelector(".loc");
  if(loc){const a=document.createElement("a");a.className="locbtn";a.href=MAPS;a.target="_blank";a.rel="noopener";a.textContent="🧭 Nous trouver";loc.appendChild(a)}
  const links=document.querySelector("footer .links");
  if(links){const a=document.createElement("a");a.href=MAPS;a.target="_blank";a.rel="noopener";a.textContent="Nous trouver";links.appendChild(a)}
})();

/* Bouton Partager */
(function(){
  function ajouter(){
    document.querySelectorAll(".card .info").forEach(inf=>{
      if(inf.querySelector(".shr"))return;
      const b=document.createElement("button");b.type="button";b.className="shr";b.textContent="↗ Partager";
      inf.appendChild(b);
    });
    const d=document.getElementById("dBody");
    if(d&&d.children.length&&!d.querySelector(".shr")){
      const b=document.createElement("button");b.type="button";b.className="shr";b.textContent="↗ Partager";
      d.appendChild(b);
    }
  }
  ["grid","best","dBody"].forEach(id=>{
    const el=document.getElementById(id);
    if(el)new MutationObserver(ajouter).observe(el,{childList:true});
  });
  ajouter();
  document.addEventListener("click",e=>{
    const b=e.target.closest(".shr");if(!b)return;
    const box=b.closest(".card .info")||b.closest("#dBody");if(!box)return;
    const nom=(box.querySelector("h3")||{}).textContent||"Article";
    const prix=(box.querySelector(".price")||{}).textContent||"";
    const url=location.origin+location.pathname;
    const texte="Regarde ça chez Si’Bella Boutique : "+nom.trim()+(prix?" — "+prix.trim():"");
    if(navigator.share){
      navigator.share({title:"Si’Bella Boutique",text:texte,url:url}).catch(()=>{});
    }else{
      window.open("https://wa.me/?text="+encodeURIComponent(texte+" "+url),"_blank");
    }
  });
})();

/* Plusieurs photos par article (dans la fiche) */
(function(){
  const base=BOUTIQUE.supabaseUrl+"/rest/v1/";
  const H={apikey:BOUTIQUE.supabaseKey,Authorization:"Bearer "+BOUTIQUE.supabaseKey};
  const PH={},essaye={};
  function charger(){
    return fetch(base+"produits?select=id,photos",{headers:H})
      .then(r=>r.ok?r.json():[])
      .then(L=>{L.forEach(o=>{PH[o.id]=o.photos||[]})})
      .catch(()=>{});
  }
  function habiller(){
    const d=document.getElementById("dBody");if(!d)return;
    const add=d.querySelector(".add[data-id]"),main=d.querySelector(".dimg");
    if(!add||!main||d.querySelector(".gal"))return;
    const id=add.dataset.id;
    if(!(id in PH)){
      if(!essaye[id]){essaye[id]=true;charger().then(habiller)}
      return;
    }
    const ph=PH[id];if(ph.length<2)return;
    const g=document.createElement("div");g.className="gal";
    g.innerHTML='<div class="gmain"><img alt=""><button class="gn gp" type="button" aria-label="Photo précédente">‹</button><button class="gn gx" type="button" aria-label="Photo suivante">›</button></div><div class="gth"></div>';
    const big=g.querySelector(".gmain img"),th=g.querySelector(".gth");
    big.onerror=()=>{big.onerror=null;big.src=vide};
    const ths=ph.map((u,j)=>{
      const t=document.createElement("img");t.alt="";t.src=u;
      t.addEventListener("click",()=>show(j));th.appendChild(t);return t;
    });
    let k=0,x0=null;
    function show(i){k=(i+ph.length)%ph.length;big.src=ph[k];ths.forEach((t,j)=>t.classList.toggle("on",j===k))}
    g.querySelector(".gp").addEventListener("click",()=>show(k-1));
    g.querySelector(".gx").addEventListener("click",()=>show(k+1));
    const gm=g.querySelector(".gmain");
    gm.addEventListener("touchstart",e=>{x0=e.touches[0].clientX},{passive:true});
    gm.addEventListener("touchend",e=>{
      if(x0===null)return;
      const dx=e.changedTouches[0].clientX-x0;
      if(Math.abs(dx)>40)show(k+(dx<0?1:-1));
      x0=null;
    });
    main.replaceWith(g);show(0);
  }
  const d=document.getElementById("dBody");
  if(d)new MutationObserver(habiller).observe(d,{childList:true});
  charger().then(habiller);
})();
