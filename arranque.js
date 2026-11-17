/* SAET Bienestar · Arranque de la app (va al final)
   Lo usa: todas las pantallas */

(async()=>{
 if(DEMO){sembrarDemo();return pantallaAcceso()}
 let t=null,c=null;try{t=localStorage.getItem('ceiba_t');c=JSON.parse(localStorage.getItem('ceiba_c'))}catch(e){}
 if(!t) return pantallaAcceso();
 S.token=t;S.semana=lunes(new Date());S.rango=rangoDe(S.semana);
 if(c&&c.d&&c.d.usuario){aplicar(c.d);pintar();await sync();procesarCola();return}   // abre al instante con la copia local y actualiza detrás
 const intentar=async()=>{
  $('#raiz').innerHTML='<div class="vacio" style="padding-top:30vh"><span class="carga" style="border-color:var(--g200);border-top-color:var(--g700);width:28px;height:28px"></span><p style="margin-top:14px">Cargando…</p></div>';
  try{await cargar();pintar();procesarCola()}
  catch(e){if(!e.red) return salir();
   $('#raiz').innerHTML='<div class="vacio" style="padding-top:30vh"><p style="margin-bottom:14px">Sin conexión con el servidor.</p><button class="btn" id="reint">Reintentar</button></div>';$('#reint').onclick=intentar}};
 intentar();
})();
window.addEventListener('online',()=>{procesarCola();sync()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.user&&!DEMO){procesarCola();sync()}});
setInterval(()=>{if(S.user&&!DEMO&&!document.hidden){if(miCola().length)procesarCola();else sync()}},120000);
window.addEventListener('error',e=>console.error(e.message));
