/* SAET Bienestar · Mi perfil
   Lo usa: todos */

function vPerfil(){const u=S.user;S.selfie=null;
 $('#vista').innerHTML=`<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));max-width:900px">
 <div class="card"><div class="fila" style="margin-bottom:16px"><span id="pfS">${avatar(u,'xg')}</span><div><h3 style="margin:0">${esc(u.nombre)}</h3><div class="mute sm">${ROL[u.rol]} · ${esc(u.zona||u.region||'Estatal')}</div><div class="mute sm">${esc(u.curp)}</div>
  <label class="btn sec ch" style="display:inline-flex;margin-top:8px">Cambiar foto<input type="file" accept="image/*" capture="user" class="hide" onchange="selfiePerfil(this)"></label></div></div>
  <div class="campo"><label>Correo</label><input id="fE" value="${esc(u.correo)}"></div><div class="campo"><label>Teléfono</label><input id="fT" value="${esc(u.telefono)}"></div>
  <div class="campo"><label>Facebook</label><input id="fF" value="${esc(u.facebook)}"></div><div class="campo"><label>Instagram</label><input id="fI" value="${esc(u.instagram)}"></div>
  <button class="btn" onclick="guardarPerfil(this,{correo:val('fE'),telefono:val('fT'),facebook:val('fF'),instagram:val('fI'),selfie:S.selfie||undefined})">Guardar datos</button></div>
 <div class="card" style="align-self:start"><h3>Cambiar PIN</h3><div class="campo"><label>PIN actual</label><input id="fA" type="password" inputmode="numeric"></div><div class="campo"><label>PIN nuevo (6 a 8 números)</label><input id="fN" type="password" inputmode="numeric" maxlength="8"></div>
  <button class="btn sec" onclick="guardarPerfil(this,{pinActual:val('fA'),pinNuevo:val('fN')})">Actualizar PIN</button></div></div>`;
}
async function selfiePerfil(inp){if(!inp.files[0])return;S.selfie=await comprimir(inp.files[0],600,.75);$('#pfS').innerHTML=`<img class="av xg" src="${S.selfie}" alt="">`}
function guardarPerfil(b,d){ocupado(b,async()=>{const r=await api('actualizarPerfil',d);if(r.token)guardarToken(r.token);S.user=r.usuario;const i=S.personal.findIndex(p=>p.id===S.user.id);if(i>-1)S.personal[i]=S.user;toast('Datos guardados');pintar()})}
