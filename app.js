/* ===== RÉGLAGES ===== */
const BOUTIQUE = {
  whatsapp: "2250757561119",
  instagram: "https://www.instagram.com/sibellaboutique42",
  facebook: "https://www.facebook.com/share/1ddSU5TTLD/",
  supabaseUrl: "https://swxtcfrhonijjcsbrldg.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eHRjZnJob25pampjc2JybGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NjUyNTUsImV4cCI6MjExMDM0MTI1NX0.MfA87LwUJWZpfg6dlkf5pSgPnJWCeKVuA4hTDbkoTMg",
  livraison: [
    {zone:"Yopougon",prix:1500},{zone:"Cocody",prix:1500},{zone:"Abobo",prix:1500},
    {zone:"Koumassi",prix:1500},{zone:"Treichville",prix:1500},{zone:"Adjamé",prix:1500},
    {zone:"Attécoubé",prix:1500},{zone:"Marcory",prix:1500},{zone:"Plateau",prix:1500},
    {zone:"Port-Bouët",prix:1500},{zone:"Bingerville",prix:2000},{zone:"N'Dotré",prix:2000},
    {zone:"Grand-Bassam",prix:3000},{zone:"Anyama",prix:null},{zone:"Songon",prix:null},
    {zone:"Expédition",prix:3000}
  ]
};
const GUIDE = [["36","23"],["37","23,5"],["38","24,5"],["39","25"],["40","25,5"],["41","26"]];

/* ===== LOGIQUE ===== */
const $=s=>document.querySelector(s);
const money=n=>n.toLocaleString("fr-FR")+" FCFA";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slug=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const vide="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#ffd3e4"/><text x="100" y="118" font-size="56" text-anchor="middle" fill="#c99a2e">✦</text></svg>');
let PRODUITS=[],ZONES=BOUTIQUE.livraison,cat="tous",cart={},fav=[];
try{cart=JSON.parse(localStorage.getItem("sb_cart")||"{}")}catch(e){}
try{fav=JSON.parse(localStorage.getItem("sb_fav")||"[]")}catch(e){}
const save=()=>{try{localStorage.setItem("sb_cart",JSON.stringify(cart))}catch(e){}};
const saveFav=()=>{try{localStorage.setItem("sb_fav",JSON.stringify(fav))}catch(e){}};
const lignes=()=>Object.keys(cart).map(id=>({p:PRODUITS.find(x=>x.id===id),q:cart[id]})).filter(l=>l.p);
const total=()=>lignes().reduce((s,l)=>s+l.p.prix*l.q,0);
const wa=txt=>"https://wa.me/"+BOUTIQUE.whatsapp+"?text="+encodeURIComponent(txt);
const liste=s=>String(s||"").split(",").map(x=>x.trim()).filter(Boolean);

/* ---- Chargement depuis Supabase ---- */
const norm=p=>({id:p.id||slug(p.nom),nom:p.nom,prix:p.prix,ancien:p.ancien||0,cat:p.cat,
  photo:/^(https?:|images\/)/.test(p.photo)?p.photo:"images/"+p.photo,
  couleurs:p.couleurs||"",pointures:p.pointures||"",cm:p.cm||"",best:!!p.best,
  etiquette:p.etiquette||"",epuise:!!p.epuise,description:p.description||""});

async function charger(){
  const base=BOUTIQUE.supabaseUrl+"/rest/v1/";
  const H={apikey:BOUTIQUE.supabaseKey,Authorization:"Bearer "+BOUTIQUE.supabaseKey};
  try{
    const [a,b]=await Promise.all([
      fetch(base+"produits?select=*&order=created_at.desc",{headers:H}),
      fetch(base+"livraison?select=zone,prix&order=id.asc",{headers:H})]);
    if(!a.ok)throw new Error("produits");
    PRODUITS=(await a.json()).map(o=>norm({id:o.id,nom:o.nom,prix:o.prix,ancien:o.ancien_prix,
      cat:o.categorie,photo:o.photo||"",couleurs:o.couleurs,pointures:o.pointures,cm:o.cm,
      best:o.populaire,etiquette:o.etiquette,epuise:o.epuise,description:o.description}));
    if(b.ok){const Z=await b.json();if(Z.length)ZONES=Z}
  }catch(e){PRODUITS=[];toast("Connexion impossible, réessaie.")}
}

/* ---- Affichage ---- */
const prixHtml=p=>`<div class="price">${money(p.prix)}${p.ancien>p.prix?` <s>${money(p.ancien)}</s>`:""}</div>`;
const metas=p=>(p.couleurs?`<div class="meta">Couleurs : ${esc(p.couleurs)}</div>`:"")+(p.pointures?`<div class="meta">Pointures : ${esc(p.pointures)}</div>`:"")+(p.cm?`<div class="meta">Pied : ${esc(p.cm)} cm</div>`:"");
const btnAdd=p=>`<button class="add" data-id="${p.id}"${p.epuise?" disabled":""}>${p.epuise?"Indisponible":"Ajouter au panier"}</button>`;
const card=(p,i)=>{const f=fav.includes(p.id);
  return `<article class="card${p.epuise?" out":""}" style="animation-delay:${i*0.06}s"><div class="pic" data-open="${p.id}"><img src="${esc(p.photo)}" alt="${esc(p.nom)}" loading="lazy" onerror="this.onerror=null;this.src=vide">${p.etiquette?`<span class="tag">${esc(p.etiquette)}</span>`:""}${p.epuise?`<span class="tag out">Épuisé</span>`:""}<button class="heart${f?" on":""}" data-fav="${p.id}" aria-label="Favori">${f?"♥":"♡"}</button></div><div class="info"><h3 data-open="${p.id}">${esc(p.nom)}</h3>${prixHtml(p)}${metas(p)}${btnAdd(p)}</div></article>`};

function render(){
  const q=$("#q").value.trim().toLowerCase();
  const L=PRODUITS.filter(p=>(cat==="tous"||(cat==="favoris"?fav.includes(p.id):p.cat===cat))&&p.nom.toLowerCase().includes(q));
  $("#grid").innerHTML=L.length?L.map(card).join(""):"<p class='vide'>"+(cat==="favoris"?"Tu n’as pas encore de favoris. Appuie sur le cœur d’un article.":"Aucun article trouvé.")+"</p>";
  const best=PRODUITS.filter(p=>p.best);
  $("#bestBox").hidden=!(cat==="tous"&&!q&&best.length);
  $("#best").innerHTML=best.map(card).join("");
}
function setCat(c){
  cat=c;
  document.querySelectorAll(".cat").forEach(x=>x.classList.toggle("on",x.dataset.cat===c));
  render();
}
function detail(id){
  const p=PRODUITS.find(x=>x.id===id);if(!p)return;
  $("#dBody").innerHTML=`<img class="dimg" src="${esc(p.photo)}" alt="${esc(p.nom)}" onerror="this.onerror=null;this.src=vide"><h3>${esc(p.nom)}</h3>${prixHtml(p)}${p.etiquette?`<div class="meta"><b>${esc(p.etiquette)}</b></div>`:""}${p.description?`<p>${esc(p.description)}</p>`:""}${metas(p)}${p.cat==="chaussures"?`<button class="link" data-guide>Guide des pointures</button>`:""}${btnAdd(p)}`;
  $("#detail").showModal();
}

function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1600)}
function maj(){
  const n=lignes().reduce((s,l)=>s+l.q,0);
  $("#count").textContent=n;
  $("#barTxt").textContent=n+(n>1?" articles":" article")+" · "+money(total());
  $("#bar").hidden=n===0;
  document.body.classList.toggle("has",n>0);
  if(document.body.classList.contains("open")&&$("#f")===null)renderCart();
}
function renderCart(){
  const L=lignes();
  $("#vue").innerHTML=L.length
    ?L.map(l=>`<div class="line"><img src="${esc(l.p.photo)}" alt="" onerror="this.onerror=null;this.src=vide"><div><b>${esc(l.p.nom)}</b><br>${money(l.p.prix)}</div><div class="qty"><button data-d="-1" data-id="${l.p.id}" aria-label="Moins">−</button><span>${l.q}</span><button data-d="1" data-id="${l.p.id}" aria-label="Plus">+</button></div></div>`).join("")+`<div class="tot">Articles : ${money(total())}</div><button class="add" id="cmd">Commander</button>`
    :"<p class='vide'>Ton panier est vide.</p>";
}
function choix(nom,label,opts,attrs){
  return opts.length
    ?`<label>${label}<select name="${nom}" required><option value="">Choisir…</option>${opts.map(o=>`<option>${esc(o)}</option>`).join("")}</select></label>`
    :`<label>${label}<input name="${nom}" ${attrs||""} required></label>`;
}
function zoneSel(){const s=document.querySelector("#f [name=ville]");return s&&s.value!==""?ZONES[+s.value]:null}
function majTot(){
  const v=zoneSel(),a=total();let h="Articles : "+money(a);
  if(v){h+="<br>Livraison : "+(v.prix===null?"à confirmer sur WhatsApp":money(v.prix));
    h+=v.prix===null?"<br><b>Total articles : "+money(a)+" + livraison</b>":"<br><b>Total : "+money(a+v.prix)+"</b>"}
  $("#gt").innerHTML=h;
}
function checkout(){
  const L=lignes();
  $("#vue").innerHTML=`<form id="f"><h3>Tes informations</h3>
  <label>Nom<input name="nom" required></label>
  <label>Téléphone<input name="tel" type="tel" required></label>
  <label>Commune ou zone de livraison<select name="ville" required><option value="">Choisir…</option>${ZONES.map((v,i)=>`<option value="${i}">${esc(v.zone)} — ${v.prix===null?"frais à confirmer":money(v.prix)}</option>`).join("")}</select></label>
  <label>Quartier et repère précis<textarea name="adr" rows="2" placeholder="Ex : Niangon, près du carrefour Texaco" required></textarea></label>`
  +L.map(l=>{const k=l.p.id;return `<fieldset><legend>${esc(l.p.nom)} × ${l.q}</legend>`
    +(l.p.cat==="chaussures"
      ?choix("pt"+k,"Pointure",liste(l.p.pointures),'type="number" min="30" max="46"')
       +`<label>Longueur du pied (cm)<input name="cm${k}" type="number" step="0.5" min="18" max="32" required></label><small>Mesure du talon jusqu’au bout du plus grand orteil.</small> <button type="button" class="link" data-guide>Guide des pointures</button>`:"")
    +choix("co"+k,"Couleur souhaitée",liste(l.p.couleurs))+`</fieldset>`}).join("")
  +`<div class="tot" id="gt"></div><button class="add" type="submit">Envoyer ma commande sur WhatsApp</button><button class="back" type="button" id="ret">← Retour au panier</button></form>`;
  majTot();
}
function ouvrir(){document.body.classList.add("open");renderCart()}
function fermer(){document.body.classList.remove("open","menu")}

document.addEventListener("click",e=>{
  const t=e.target;
  if(t.tagName==="DIALOG"){t.close();return}
  if(t.closest("[data-close]")){t.closest("dialog").close();return}
  if(t.closest("[data-guide]")){$("#guide").showModal();return}
  const h=t.closest("[data-fav]");
  if(h){const id=h.dataset.fav,i=fav.indexOf(id);
    if(i<0)fav.push(id);else fav.splice(i,1);saveFav();
    if(cat==="favoris")render();
    else document.querySelectorAll('[data-fav="'+id+'"]').forEach(b=>{const on=fav.includes(id);b.classList.toggle("on",on);b.textContent=on?"♥":"♡"});
    toast(fav.includes(id)?"Ajouté aux favoris ♥":"Retiré des favoris");return}
  const o=t.closest("[data-open]");
  if(o){detail(o.dataset.open);return}
  const mn=t.closest("#menu a");
  if(mn){if(mn.dataset.cat)setCat(mn.dataset.cat);fermer();return}
  if(t.closest("#menuBtn")){document.body.classList.add("menu");return}
  if(t.id==="barCmd"){ouvrir();checkout();return}
  if(t.closest("#barInfo")){ouvrir();return}
  const a=t.closest(".add[data-id]");
  if(a){if(a.disabled)return;const id=a.dataset.id;cart[id]=(cart[id]||0)+1;save();maj();toast("Ajouté au panier ✓");
    if(a.closest("#detail"))$("#detail").close();
    const b=$("#cartBtn");b.classList.remove("bump");void b.offsetWidth;b.classList.add("bump");return}
  const d=t.closest("[data-d]");
  if(d){const id=d.dataset.id;cart[id]=(cart[id]||0)+(+d.dataset.d);if(cart[id]<=0)delete cart[id];save();maj();renderCart();return}
  const c=t.closest(".cat");
  if(c){setCat(c.dataset.cat);return}
  if(t.closest("#cartBtn"))ouvrir();
  else if(t.closest("#x")||t.id==="over")fermer();
  else if(t.id==="cmd")checkout();
  else if(t.id==="ret")renderCart();
});
document.addEventListener("change",e=>{if(e.target.name==="ville")majTot()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")fermer()});
$("#q").addEventListener("input",render);

document.addEventListener("submit",e=>{
  if(e.target.id!=="f")return;e.preventDefault();
  const d=new FormData(e.target),v=ZONES[+d.get("ville")];
  let m="Bonjour Si’Bella Boutique, je veux commander :\n\n";
  lignes().forEach((l,i)=>{const k=l.p.id;
    m+=(i+1)+") "+l.p.nom+" × "+l.q+" — "+money(l.p.prix*l.q)+"\n";
    if(l.p.cat==="chaussures")m+="   Pointure : "+d.get("pt"+k)+" | Pied : "+d.get("cm"+k)+" cm\n";
    m+="   Couleur : "+d.get("co"+k)+"\n";});
  m+="\nArticles : "+money(total());
  m+="\nLivraison ("+v.zone+") : "+(v.prix===null?"à confirmer":money(v.prix));
  m+=v.prix===null?"\nTotal articles : "+money(total())+" + livraison":"\nTotal : "+money(total()+v.prix);
  m+="\n\nNom : "+d.get("nom")+"\nTéléphone : "+d.get("tel")+"\nZone : "+v.zone+"\nQuartier / repère : "+d.get("adr");
  window.open(wa(m),"_blank");
});

/* ---- Démarrage ---- */
$("#lw").href=$("#help").href=wa("Bonjour, j’ai une question.");
$("#li").href=BOUTIQUE.instagram;$("#lf").href=BOUTIQUE.facebook;
$("#gBody").innerHTML='<table class="g"><tr><th>Pointure</th><th>Pied (cm)</th></tr>'+GUIDE.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")+"</table>";
$("#grid").innerHTML="<p class='vide'>Chargement…</p>";
charger().then(()=>{
  document.querySelectorAll(".cat img").forEach(i=>{
    const c=i.closest(".cat").dataset.cat,p=PRODUITS.find(x=>x.cat===c);
    i.onerror=()=>{i.onerror=null;i.src=vide};
    i.src=c==="tous"?"images/logo.jpg":(p?p.photo:vide);
  });
  render();maj();
});
