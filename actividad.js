/* SAET Bienestar · Detalle de una actividad: ver, reprogramar, eliminar y validar
   Lo usa: todos (validar: Regional y Encargado) */

function detalle(id){
 const a=S.acts.find(x=>x.id===id);if(!a)return;
 const e=S.evs.filter(x=>x.actividadId===id).pop(),vis=visitasDe(id),mio=a.asignadoA===S.user.id,mando=jefe()||a.creadoPor===S.user.id;
 modal(`<h2>${esc(a.titulo)}</h2><div class="fila wrap" style="margin-bottom:12px">${badge(estado(a))}<span class="badge">${esc(a.tipo)}</span></div>
 <div class="meta">${ic('agenda')}${fechaTxt(a.fecha)}${a.hora?' · '+esc(a.hora):''}</div>
 <div class="meta">${ic('visitas')}${esc(a.lugar||'Sin lugar')} · ${esc(a.zona||a.region||'')}</div>
 <div class="meta">${ic('perfil')}Asignada a <b>${esc(a.asignadoNombre)}</b> · por ${esc(a.creadoNombre)}</div>
 ${a.descripcion?`<p style="margin:12px 0;padding:12px;background:var(--g50);border-radius:12px">${esc(a.descripcion)}</p>`:''}
 ${e?`<h3 class="serif" style="margin:16px 0 8px;font-size:16px">Evidencia</h3><div class="minis">${e.fotos.split(' | ').map(f=>`<img src="${esc(foto(f))}" alt="Evidencia" onclick="ampliar(this.src)">`).join('')}</div>
  <p style="margin:10px 0">${esc(e.comentario)}</p><p class="sm mute">Enviada ${esc(e.fecha)}${e.lat?` · <a target="_blank" rel="noopener" href="https://www.google.com/maps?q=${encodeURIComponent(e.lat+','+e.lng)}">Ver ubicación</a>`:''}${e.validadoPor?` · ${esc(e.validacion)} por ${esc(e.validadoPor)}`:''}</p>
  ${e.nota?`<p class="sm" style="color:var(--bad);margin-top:6px">Nota: ${esc(e.nota)}</p>`:''}<p class="sm" id="iaV" style="margin-top:6px;color:var(--info)">${esc(e.ia||'')}</p>
`:''}
 ${vis.length?`<h3 class="serif" style="margin:16px 0 8px;font-size:16px">Personas visitadas (${vis.length})</h3><div class="tabla"><table><tr><th>Persona visitada</th><th>Programa</th><th>Resultado</th></tr>${vis.map(v=>`<tr><td><b>${esc(v.nombre)}</b><br><span class="sm mute">${esc(v.localidad)}</span></td><td>${esc(v.programa)}</td><td>${esc(v.resultado)}</td></tr>`).join('')}</table></div>`:''}
 <div class="fila wrap" style="margin-top:18px">
  ${mio&&['Pendiente','Rechazada'].includes(a.estatus)?`<button class="btn" onclick="formaEvidencia('${a.id}')">${ic('evidencias')}Subir evidencia</button>`:''}
  ${mio&&(esVisita(a)||vis.length)&&a.estatus!=='Validada'?`<button class="btn sec" onclick="listaVisitas('${a.id}')">${ic('visitas')}Visitas (${vis.length})</button>`:''}
  ${jefe()&&e&&e.validacion==='Por validar'?`<button class="btn ok" onclick="validar('${e.id}','Validada',this)">Validar</button><button class="btn bad" onclick="validar('${e.id}','Rechazada',this)">Rechazar</button>`:''}
  ${jefe()&&e?`<button class="btn oro" onclick="verificarIA('${e.id}',this)">${ic('ia')}Revisar con IA</button>`:''}
  ${mando&&!e?`<button class="btn sec" onclick="$('#repro').classList.toggle('hide')">Reprogramar</button><button class="btn bad" onclick="eliminarAct('${a.id}',this)">Eliminar</button>`:''}</div>
 <div id="repro" class="hide dos" style="margin-top:12px"><input type="date" id="rF" value="${a.fecha}"><div class="fila"><input type="time" id="rH" value="${esc(a.hora)}"><button class="btn" onclick="reprogramar('${a.id}',this)">Guardar</button></div></div>`,600);
}
function reprogramar(id){const a=S.acts.find(x=>x.id===id),f=val('rF'),h=val('rH');if(!a||!f)return;Object.assign(a,{fecha:f,hora:h});cerrar();pintar();toast('Actividad reprogramada');fondo(api('guardarActividad',{id,fecha:f,hora:h}))}
function eliminarAct(id){S.acts=S.acts.filter(a=>a.id!==id);cerrar();pintar();toast('Actividad eliminada');fondo(api('eliminarActividad',{id}))}
function validar(id,v){const e=S.evs.find(x=>x.id===id);if(!e)return;let nota='';
 if(v==='Rechazada'){nota=prompt('Motivo del rechazo (lo verá quien subió la evidencia):');if(nota===null)return}
 Object.assign(e,{validacion:v,validadoPor:S.user.nombre,nota});const a=S.acts.find(x=>x.id===e.actividadId);if(a)a.estatus=v;
 cerrar();pintar();toast('Evidencia '+v.toLowerCase());fondo(api('validarEvidencia',{id,validacion:v,nota}))}
function verificarIA(id,b){ocupado(b,async()=>{const r=await api('ia',{tipo:'verificar',id});const e=S.evs.find(x=>x.id===id);if(e)e.ia=r.ia;const p=$('#iaV');if(p)p.textContent=r.ia;else toast(r.ia)})}
