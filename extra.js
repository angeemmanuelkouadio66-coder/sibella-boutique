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
