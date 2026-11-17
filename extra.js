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
   +".shr:active{transform:scale(.96)}";
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
