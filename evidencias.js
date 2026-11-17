/* SAET Bienestar · Subir evidencia y lista de evidencias por validar
   Lo usa: Servidor de la Nación (subir) · Regional y Encargado (revisar) */

function formaEvidencia(id){
 const a=S.acts.find(x=>x.id===id),n=visitasDe(id).length;S.fotos=[];S.geo=null;
 modal(`<h2>Evidencia</h2><p class="mute" style="margin:-8px 0 14px">${esc(a.titulo)}</p>
 <div class="campo"><label>Fotos (hasta 4) *</label><div class="minis" id="eF"></div>
  <label class="btn sec" style="display:inline-flex;margin-top:8px">${ic('evidencias')}Agregar foto<input type="file" accept="image/*" multiple class="hide" onchange="agregarFotos(this)"></label></div>
 <div class="campo"><label>¿Qué se hizo?</label><textarea id="eC" rows="3" placeholder="Describe brevemente el resultado"></textarea></div>
 <p class="sm mute" id="eG" style="margin-bottom:12px">Obteniendo ubicación…</p>
 ${esVisita(a)?`<div class="ia sm" style="margin-bottom:14px">${n?`Llevas <b>${n}</b> ${n===1?'visita registrada':'visitas registradas'} en esta actividad.`:'Aún no registras visitas en esta actividad.'} Las personas visitadas se capturan aparte, en el botón <b>Visitas</b>; puedes añadirlas o corregirlas antes o después de enviar la evidencia.</div>`:''}
 <button class="btn grande" onclick="enviarEvidencia('${id}',this)">Enviar evidencia</button>`,600);
 if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p=>{S.geo=p.coords;const g=$('#eG');if(g)g.textContent='Ubicación registrada ✓'},()=>{const g=$('#eG');if(g)g.textContent='Sin ubicación (permiso no concedido).'},{enableHighAccuracy:true,timeout:9000});
 else $('#eG').textContent='';
}
async function agregarFotos(inp){for(const f of [...inp.files].slice(0,4-S.fotos.length)){try{S.fotos.push(await comprimir(f))}catch(e){toast(e.message)}}inp.value='';
 $('#eF').innerHTML=S.fotos.map((f,i)=>`<img src="${f}" alt="Foto ${i+1}" title="Tocar para quitar" onclick="S.fotos.splice(${i},1);this.remove()">`).join('')}
function enviarEvidencia(id,b){ocupado(b,async()=>{
 if(!S.fotos.length) throw new Error('Agrega al menos una foto');
 await encolar('subirEvidencia',{id:idNuevo('E'),actividadId:id,fotos:S.fotos.slice(),comentario:val('eC'),lat:S.geo?String(S.geo.latitude):'',lng:S.geo?String(S.geo.longitude):'',cuando:hoy()+' '+new Date().toTimeString().slice(0,5)});
 cerrar();pintar();toast(DEMO||navigator.onLine?'Evidencia registrada. ¡Gracias!':'Sin señal: la evidencia quedó guardada y se enviará sola al volver la conexión.')})}


function vEvidencias(){
 const f=S.f,q=(f.q||'').toLowerCase();
 const l=S.evs.filter(e=>(!f.val||e.validacion===f.val)&&(!f.zona||e.zona===f.zona)&&(!q||(e.usuarioNombre+e.comentario).toLowerCase().includes(q))).sort((a,b)=>b.fecha.localeCompare(a.fecha));
 $('#vista').innerHTML=`<div class="filtros"><input placeholder="Buscar persona…" value="${esc(f.q||'')}" onchange="S.f.q=this.value;vEvidencias()">
  <select onchange="S.f.val=this.value;vEvidencias()"><option value="">Todas</option>${['Por validar','Validada','Rechazada'].map(e=>`<option ${f.val===e?'selected':''}>${e}</option>`).join('')}</select>
  ${S.user.rol!=='encargado'?`<select onchange="S.f.zona=this.value;vEvidencias()"><option value="">Todas las zonas</option>${zonasVisibles().map(z=>`<option ${f.zona===z?'selected':''}>${esc(z)}</option>`).join('')}</select>`:''}
  <span class="sp"></span><span class="mute sm">${l.length} evidencias</span></div>
 <div class="grid tarjetas">${l.slice(0,90).map(e=>{const a=S.acts.find(x=>x.id===e.actividadId)||{};return`<div class="card tarea" style="padding:12px"><img class="foto" loading="lazy" src="${esc(foto(e.fotos.split(' | ')[0]))}" alt="Evidencia" onclick="ampliar(this.src)">
  <div class="fila">${badge(e.validacion)}<span class="sp"></span><span class="sm mute">${esc(e.fecha.slice(0,10))}</span></div><h4>${esc(a.titulo||'Actividad')}</h4>
  <div class="meta">${ic('perfil')}${esc(e.usuarioNombre)} · ${esc(e.zona)}</div><button class="btn sec" onclick="detalle('${e.actividadId}')">Revisar</button></div>`}).join('')}</div>
 ${l.length?'':'<div class="card vacio">Aún no hay evidencias.</div>'}`;
}
