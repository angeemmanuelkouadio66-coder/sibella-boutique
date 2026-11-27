
const SUPABASE_URL="https://swxtcfrhonijjcsbrldg.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eHRjZnJob25pampjc2JybGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NjUyNTUsImV4cCI6MjExMDM0MTI1NX0.MfA87LwUJWZpfg6dlkf5pSgPnJWCeKVuA4hTDbkoTMg";
const GH={owner:"angeemmanuelkouadio66-coder",repo:"sibella-boutique",site:"https://angeemmanuelkouadio66-coder.github.io/sibella-boutique/"};
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const msg=(el,t,ok)=>{el.textContent=t;el.className="msg "+(ok?"ok":"err")};
const fmt=n=>Number(n).toLocaleString("fr-FR")+" FCFA";
const MAX=5;
let LISTE=[],editId=null,items=[],originales=[],TOKEN="";

/* ---- Connexion ---- */
async function demarrer(){
  const {data}=await sb.auth.getSession();
  if(!data.session){TOKEN="";$("#login").hidden=false;$("#app").hidden=true;$("#out").hidden=true;return}
  const {data:ok}=await sb.rpc("is_admin");
  if(!ok){await sb.auth.signOut();msg($("#ml"),"Ce compte n’est pas administrateur.");$("#login").hidden=false;return}
  $("#login").hidden=true;$("#app").hidden=false;$("#out").hidden=false;
  infoCompte();chargerListe();chargerZones();chargerToken();
}
$("#fl").addEventListener("submit",async e=>{
  e.preventDefault();msg($("#ml"),"Connexion…",true);
  const {error}=await sb.auth.signInWithPassword({email:$("#em").value.trim(),password:$("#pw").value});
  if(error){msg($("#ml"),"Email ou mot de passe incorrect.");return}
  $("#pw").value="";msg($("#ml"),"",true);demarrer();
});
$("#out").addEventListener("click",async()=>{await sb.auth.signOut();demarrer()});

/* ---- Mon compte ---- */
async function infoCompte(){
  const {data}=await sb.auth.getUser();
  $("#monEmail").textContent="Connecté avec : "+(data&&data.user?data.user.email:"");
}
$("#npSave").addEventListener("click",async()=>{
  const a=$("#np1").value,b=$("#np2").value;
  if(a.length<8){msg($("#mc"),"8 caractères minimum.");return}
  if(a!==b){msg($("#mc"),"Les deux mots de passe ne sont pas identiques.");return}
  const {error}=await sb.auth.updateUser({password:a});
  if(error){msg($("#mc"),"Erreur : "+error.message);return}
  $("#np1").value="";$("#np2").value="";
  msg($("#mc"),"Mot de passe changé ✓",true);
});

/* ---- Partage : pages d'aperçu sur GitHub ---- */
const b64=s=>btoa(unescape(encodeURIComponent(s)));
function gh(method,path,body){
  return fetch("https://api.github.com/repos/"+GH.owner+"/"+GH.repo+"/contents/"+path,{
    method:method,
    headers:{Authorization:"Bearer "+TOKEN,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},
    body:body?JSON.stringify(body):undefined
  });
}
function pagePartage(p){
  const titre=p.nom+" — "+fmt(p.prix);
  const desc=(p.description&&String(p.description).trim())||"Disponible chez Si’Bella Boutique, Cocody Angré 22e. Commande facile sur WhatsApp.";
  const url=GH.site+"a/"+p.id+".html",cible=GH.site+"?a="+p.id;
  return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">'
   +'<meta name="viewport" content="width=device-width, initial-scale=1">'
   +'<title>'+esc(titre)+'</title>'
   +'<meta name="description" content="'+esc(desc)+'">'
   +'<meta property="og:type" content="website">'
   +'<meta property="og:site_name" content="Si’Bella Boutique">'
   +'<meta property="og:title" content="'+esc(titre)+'">'
   +'<meta property="og:description" content="'+esc(desc)+'">'
   +'<meta property="og:url" content="'+esc(url)+'">'
   +'<meta property="og:image" content="'+esc(p.photo)+'">'
   +'<meta property="og:locale" content="fr_FR">'
   +'<meta name="twitter:card" content="summary_large_image">'
   +'<link rel="canonical" href="'+esc(url)+'">'
   +'<noscript><meta http-equiv="refresh" content="0;url='+esc(cible)+'"></noscript>'
   +'<script>location.replace('+JSON.stringify(cible)+')<\/script>'
   +'</head><body style="font-family:sans-serif;text-align:center;padding:24px"><p>Ouverture de <a href="'+esc(cible)+'">Si’Bella Boutique</a>…</p></body></html>';
}
async function publierPage(p){
  if(!TOKEN)throw new Error("clé GitHub manquante");
  const path="a/"+p.id+".html";
  let sha;
  const g=await gh("GET",path);
  if(g.ok){sha=(await g.json()).sha}
  const r=await gh("PUT",path,{message:"Page de partage : "+p.nom,content:b64(pagePartage(p)),sha:sha});
  if(!r.ok)throw new Error("GitHub a répondu "+r.status);
}
async function supprimerPage(id){
  if(!TOKEN)return;
  const path="a/"+id+".html";
  const g=await gh("GET",path);
  if(!g.ok)return;
  const sha=(await g.json()).sha;
  await gh("DELETE",path,{message:"Suppression de la page de partage",sha:sha});
}
async function chargerToken(){
  const {data}=await sb.from("reglages").select("valeur").eq("cle","github_token").maybeSingle();
  TOKEN=data&&data.valeur?data.valeur:"";
  majReg();
}
function majReg(){
  $("#regEtat").textContent=TOKEN?"Clé GitHub enregistrée ✓":"Aucune clé enregistrée : le partage avec aperçu ne marchera pas.";
  $("#regForm").hidden=!!TOKEN;
  $("#tokChg").hidden=!TOKEN;
}
$("#tokChg").addEventListener("click",()=>{$("#regForm").hidden=false});
$("#tokSave").addEventListener("click",async()=>{
  const t=$("#tok").value.trim();if(!t)return;
  msg($("#mr"),"Vérification…",true);
  TOKEN=t;
  const r=await gh("GET","index.html");
  if(!r.ok){TOKEN="";msg($("#mr"),"Clé refusée par GitHub (code "+r.status+"). Vérifie qu’elle est copiée en entier.");return}
  const {error}=await sb.from("reglages").upsert({cle:"github_token",valeur:t});
  if(error){TOKEN="";msg($("#mr"),"Erreur : "+error.message);return}
  $("#tok").value="";majReg();msg($("#mr"),"Clé enregistrée et valide ✓",true);
});
$("#genAll").addEventListener("click",async()=>{
  if(!TOKEN){msg($("#mr"),"Enregistre d’abord la clé.");return}
  if(!LISTE.length){msg($("#mr"),"Aucun article à traiter.");return}
  const b=$("#genAll");b.disabled=true;let ok=0,ko=0;
  for(let i=0;i<LISTE.length;i++){
    msg($("#mr"),"Création des pages "+(i+1)+" sur "+LISTE.length+"…",true);
    try{await publierPage(LISTE[i]);ok++}catch(e){ko++}
  }
  msg($("#mr"),ok+" page(s) créée(s)"+(ko?", "+ko+" erreur(s)":" ✓"),!ko);
  b.disabled=false;
});

/* ---- Photos ---- */
function compress(file){return new Promise((ok,ko)=>{
  const img=new Image(),u=URL.createObjectURL(file);
  img.onload=()=>{const r=Math.min(1,1000/Math.max(img.width,img.height)),c=document.createElement("canvas");
    c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);
    c.toBlob(b=>b?ok(b):ko(new Error("Compression impossible")),"image/jpeg",.8)};
  img.onerror=()=>ko(new Error("Image illisible"));img.src=u})}
const chemin=u=>{const i=String(u).indexOf("/photos/");return i<0?null:decodeURIComponent(u.slice(i+8))};
const retirer=urls=>{const c=urls.map(chemin).filter(Boolean);return c.length?sb.storage.from("photos").remove(c):null};
const photosDe=p=>p.photos&&p.photos.length?p.photos:(p.photo?[p.photo]:[]);
function renderPrev(){
  $("#prev").innerHTML=items.map((it,i)=>`<div class="ph"><img src="${esc(it.prev)}" alt=""><button type="button" class="x" data-rm="${i}" aria-label="Retirer">✕</button>${i===0?'<span class="p">Principale</span>':`<button type="button" class="mk" data-mk="${i}">Principale</button>`}</div>`).join("");
  $("#prev").hidden=!items.length;
}
$("#photo").addEventListener("change",()=>{
  const files=[...$("#photo").files];
  for(const f of files){
    if(items.length>=MAX){msg($("#mp"),MAX+" photos maximum par article.");break}
    items.push({file:f,prev:URL.createObjectURL(f)});
  }
  $("#photo").value="";renderPrev();
});
$("#prev").addEventListener("click",e=>{
  const r=e.target.closest("[data-rm]"),m=e.target.closest("[data-mk]");
  if(r){items.splice(+r.dataset.rm,1);renderPrev()}
  else if(m){const it=items.splice(+m.dataset.mk,1)[0];items.unshift(it);renderPrev()}
});

/* ---- Articles ---- */
async function chargerListe(){
  const {data,error}=await sb.from("produits").select("*").order("created_at",{ascending:false});
  if(error){$("#liste").textContent="Erreur : "+error.message;return}
  LISTE=data;$("#nb").textContent=data.length;
  $("#liste").innerHTML=data.length?data.map(p=>{const n=photosDe(p).length;
    return `<div class="item"><img src="${esc(p.photo)}" alt=""><div><b>${esc(p.nom)}</b><br>${fmt(p.prix)} · ${esc(p.categorie)} · ${n} photo${n>1?"s":""}${p.epuise?" · <b>Épuisé</b>":""}${p.populaire?" · ★":""}<div class="acts"><button class="sec" data-e="${p.id}">Modifier</button><button class="sec" data-s="${p.id}">${p.epuise?"Remettre en stock":"Marquer épuisé"}</button><button class="sec" data-c="${p.id}">Copier le lien</button><button class="del" data-d="${p.id}">Supprimer</button></div></div></div>`}).join(""):"<p>Aucun article pour l’instant.</p>";
}
function remplir(p){
  editId=p?p.id:null;
  originales=p?photosDe(p):[];
  items=originales.map(u=>({url:u,prev:u}));
  $("#nom").value=p?p.nom:"";$("#prix").value=p?p.prix:"";$("#ancien").value=p&&p.ancien_prix?p.ancien_prix:"";
  $("#cat").value=p?p.categorie:"chaussures";$("#couleurs").value=p?p.couleurs||"":"";
  $("#pointures").value=p?p.pointures||"":"";$("#cm").value=p?p.cm||"":"";
  $("#etiq").value=p?p.etiquette||"":"";$("#desc").value=p?p.description||"":"";
  $("#pop").checked=!!(p&&p.populaire);$("#epuise").checked=!!(p&&p.epuise);
  $("#photo").value="";renderPrev();
  $("#titreForm").textContent=p?"Modifier l’article":"Ajouter un article";
  $("#bsave").textContent=p?"Enregistrer les modifications":"Publier";$("#cancel").hidden=!p;
}
$("#cancel").addEventListener("click",()=>{remplir(null);msg($("#mp"),"",true)});
$("#fp").addEventListener("submit",async e=>{
  e.preventDefault();const b=$("#bsave");b.disabled=true;msg($("#mp"),"Envoi en cours…",true);
  const nouvelles=[];
  try{
    if(!items.length)throw new Error("Choisis au moins une photo.");
    const urls=[];
    for(let i=0;i<items.length;i++){
      const it=items[i];
      if(it.url){urls.push(it.url);continue}
      msg($("#mp"),"Envoi de la photo "+(i+1)+" sur "+items.length+"…",true);
      const blob=await compress(it.file),nom=Date.now()+"-"+i+"-"+Math.random().toString(36).slice(2,8)+".jpg";
      const {error}=await sb.storage.from("photos").upload(nom,blob,{contentType:"image/jpeg"});
      if(error)throw error;
      const u=sb.storage.from("photos").getPublicUrl(nom).data.publicUrl;
      nouvelles.push(u);urls.push(u);
    }
    const row={nom:$("#nom").value.trim(),prix:parseInt($("#prix").value)||0,ancien_prix:parseInt($("#ancien").value)||0,
      categorie:$("#cat").value,photo:urls[0],photos:urls,couleurs:$("#couleurs").value.trim(),pointures:$("#pointures").value.trim(),
      cm:$("#cm").value.trim(),populaire:$("#pop").checked,etiquette:$("#etiq").value||null,
      epuise:$("#epuise").checked,description:$("#desc").value.trim()};
    let id=editId;
    if(editId){
      const {error}=await sb.from("produits").update(row).eq("id",editId);if(error)throw error;
    }else{
      const {data,error}=await sb.from("produits").insert(row).select("id").single();if(error)throw error;
      id=data.id;
    }
    const retirees=originales.filter(u=>!urls.includes(u));
    if(retirees.length)await retirer(retirees);
    let note="";
    try{await publierPage({id:id,nom:row.nom,prix:row.prix,photo:row.photo,description:row.description})}
    catch(er){note=" (le lien de partage n’a pas pu être créé : "+(er.message||er)+")"}
    remplir(null);msg($("#mp"),"Article enregistré ✓"+note,!note);chargerListe();
  }catch(err){
    if(nouvelles.length)await retirer(nouvelles);
    msg($("#mp"),"Erreur : "+(err.message||err));
  }
  b.disabled=false;
});
$("#liste").addEventListener("click",async e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.e){remplir(LISTE.find(p=>p.id===b.dataset.e));scrollTo({top:0,behavior:"smooth"})}
  else if(b.dataset.s){const p=LISTE.find(x=>x.id===b.dataset.s);
    const {error}=await sb.from("produits").update({epuise:!p.epuise}).eq("id",p.id);
    if(error)alert("Erreur : "+error.message);chargerListe()}
  else if(b.dataset.c){const u=GH.site+"a/"+b.dataset.c+".html";
    try{await navigator.clipboard.writeText(u);alert("Lien copié. Envoie-le sur WhatsApp pour tester l’aperçu.")}catch(er){prompt("Copie ce lien :",u)}}
  else if(b.dataset.d){const p=LISTE.find(x=>x.id===b.dataset.d);
    if(!confirm("Supprimer « "+p.nom+" » ? Cette action est définitive."))return;
    const {error}=await sb.from("produits").delete().eq("id",p.id);
    if(error){alert("Erreur : "+error.message);return}
    await retirer(photosDe(p));
    try{await supprimerPage(p.id)}catch(er){}
    chargerListe()}
});

/* ---- Frais de livraison ---- */
async function chargerZones(){
  const {data,error}=await sb.from("livraison").select("*").order("id");
  if(error){$("#zones").textContent="Erreur : "+error.message;return}
  $("#zones").innerHTML=data.map(z=>`<div class="zone"><span>${esc(z.zone)}</span><input type="number" min="0" value="${z.prix==null?"":z.prix}" data-p="${z.id}" placeholder="à confirmer"><button class="sec" data-zs="${z.id}">OK</button><button class="del" data-zd="${z.id}">✕</button></div>`).join("");
}
$("#zones").addEventListener("click",async e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.zs){const v=document.querySelector('[data-p="'+b.dataset.zs+'"]').value;
    const {error}=await sb.from("livraison").update({prix:v===""?null:parseInt(v)}).eq("id",b.dataset.zs);
    msg($("#mz"),error?"Erreur : "+error.message:"Tarif enregistré ✓",!error)}
  else if(b.dataset.zd){if(!confirm("Supprimer cette zone ?"))return;
    const {error}=await sb.from("livraison").delete().eq("id",b.dataset.zd);
    if(error)msg($("#mz"),"Erreur : "+error.message);chargerZones()}
});
$("#zadd").addEventListener("click",async()=>{
  const z=$("#zn").value.trim();if(!z)return;
  const v=$("#zp").value;
  const {error}=await sb.from("livraison").insert({zone:z,prix:v===""?null:parseInt(v)});
  if(error){msg($("#mz"),"Erreur : "+error.message);return}
  $("#zn").value="";$("#zp").value="";msg($("#mz"),"Zone ajoutée ✓",true);chargerZones();
});

demarrer();
