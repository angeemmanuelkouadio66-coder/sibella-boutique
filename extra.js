
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

/* Styles ajoutés */
(function(){
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
   +".gth img.on{border-color:#b0125b;opacity:1}"
   +".shtitle{margin:0 0 4px;font-size:1.1rem;color:#b0125b;text-align:center}"
   +".shsub{margin:0 0 12px;text-align:center;font-size:.85rem;opacity:.8}"
   +".shbtns{display:grid;grid-template-columns:1fr 1fr;gap:10px}"
   +".shbtns a,.shbtns button{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 8px;border:2px solid #c99a2e;border-radius:12px;background:rgba(255,255,255,.6);color:#4a1030;font-weight:600;font-size:.92rem;text-decoration:none;cursor:pointer}"
   +".shbtns a:active,.shbtns button:active{transform:scale(.96)}"
   +".shnote{margin-top:12px;font-size:.78rem;opacity:.75;text-align:center}";
  document.head.appendChild(st);
})();

/* Nous trouver (Google Maps) */
(function(){
  const MAPS="https://maps.app.goo.gl/vLy6uV2c6XMTdjr86";
  const loc=document.querySelector(".loc");
  if(loc){const a=document.createElement("a");a.className="locbtn";a.href=MAPS;a.target="_blank";a.rel="noopener";a.textContent="🧭 Nous trouver";loc.appendChild(a)}
})();

/* Partager : menu avec plusieurs choix */
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

  const dlg=document.createElement("dialog");dlg.id="shareDlg";
  dlg.innerHTML='<button class="cl" data-close aria-label="Fermer">✕</button>'
   +'<h3 class="shtitle">Partager cet article</h3><p class="shsub" id="shName"></p>'
   +'<div class="shbtns">'
   +'<a id="shWa" target="_blank" rel="noopener">💬 WhatsApp</a>'
   +'<a id="shFb" target="_blank" rel="noopener">📘 Facebook</a>'
   +'<a id="shTg" target="_blank" rel="noopener">✈️ Telegram</a>'
   +'<button id="shCp" type="button">🔗 Copier le lien</button>'
   +'<button id="shMore" type="button">⋯ Plus…</button>'
   +'</div>'
   +'<p class="shnote">Pour Instagram : choisis « Plus… » ou copie le lien.</p>';
  document.body.appendChild(dlg);

  let cur={url:"",texte:"",nom:""};
  document.addEventListener("click",e=>{
    const b=e.target.closest(".shr");if(!b)return;
    const box=b.closest(".card .info")||b.closest("#dBody");if(!box)return;
    const idEl=box.querySelector(".add[data-id]")||(box.closest(".card")||{}).querySelector&&box.closest(".card").querySelector("[data-open]");
    const id=idEl?(idEl.dataset.id||idEl.dataset.open):"";
    const nom=((box.querySelector("h3")||{}).textContent||"Article").trim();
    const prix=((box.querySelector(".price")||{}).textContent||"").trim();
    const base=location.origin+location.pathname.replace(/[^/]*$/,"");
    const url=id?base+"a/"+id+".html":base;
    const texte="Regarde ça chez Si’Bella Boutique : "+nom+(prix?" — "+prix:"");
    cur={url:url,texte:texte,nom:nom};
    document.getElementById("shName").textContent=nom;
    document.getElementById("shWa").href="https://wa.me/?text="+encodeURIComponent(texte+" "+url);
    document.getElementById("shFb").href="https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(url);
    document.getElementById("shTg").href="https://t.me/share/url?url="+encodeURIComponent(url)+"&text="+encodeURIComponent(texte);
    document.getElementById("shMore").hidden=!navigator.share;
    dlg.showModal();
  });
  document.getElementById("shCp").addEventListener("click",()=>{
    const fin=()=>{dlg.close();if(typeof toast==="function")toast("Lien copié ✓")};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(cur.url).then(fin,()=>{prompt("Copie ce lien :",cur.url)})}
    else prompt("Copie ce lien :",cur.url);
  });
  document.getElementById("shMore").addEventListener("click",()=>{
    navigator.share({title:"Si’Bella Boutique",text:cur.texte,url:cur.url}).then(()=>dlg.close()).catch(()=>{});
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

/* Ouvrir directement un article depuis un lien partagé (?a=...) */
(function(){
  const id=new URLSearchParams(location.search).get("a");
  if(!id)return;
  let n=0;
  const t=setInterval(()=>{
    n++;
    if(typeof PRODUITS!=="undefined"&&PRODUITS.length){
      clearInterval(t);
      if(PRODUITS.find(p=>p.id===id))detail(id);
    }else if(n>60)clearInterval(t);
  },250);
})();

/* Commande WhatsApp : un lien par article, pour que la vendeuse voie la photo */
document.addEventListener("submit",function(e){
  if(!e.target||e.target.id!=="f")return;
  e.preventDefault();e.stopImmediatePropagation();
  const d=new FormData(e.target),v=ZONES[+d.get("ville")];
  const base=location.origin+location.pathname.replace(/[^/]*$/,"");
  let m="Bonjour Si’Bella Boutique, je veux commander :\n\n";
  lignes().forEach((l,i)=>{
    const k=l.p.id;
    m+=(i+1)+") "+l.p.nom+" × "+l.q+" — "+money(l.p.prix*l.q)+"\n";
    if(l.p.cat==="chaussures")m+="   Pointure : "+d.get("pt"+k)+" | Pied : "+d.get("cm"+k)+" cm\n";
    m+="   Couleur : "+d.get("co"+k)+"\n";
    m+="   Voir l’article : "+base+"a/"+k+".html\n\n";
  });
  m+="Articles : "+money(total());
  m+="\nLivraison ("+v.zone+") : "+(v.prix===null?"à confirmer":money(v.prix));
  m+=v.prix===null?"\nTotal articles : "+money(total())+" + livraison":"\nTotal : "+money(total()+v.prix);
  m+="\n\nNom : "+d.get("nom")+"\nTéléphone : "+d.get("tel")+"\nZone : "+v.zone+"\nQuartier / repère : "+d.get("adr");
  window.open(wa(m),"_blank");
},true);
