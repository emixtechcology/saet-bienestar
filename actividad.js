/* SAET Bienestar · Detalle de una actividad: ver, reprogramar, eliminar y validar
   Lo usa: todos (validar: Regional y Encargado) */

function detalle(id){
 const a=S.acts.find(x=>x.id===id);if(!a)return;
 const e=evidenciaDe(a),eq=companeros(a),vis=visitasDe(id),mio=a.asignadoA===S.user.id,mando=jefe()||a.creadoPor===S.user.id;
 modal(`<h2>${esc(a.titulo)}</h2><div class="fila wrap" style="margin-bottom:12px">${badge(estado(a))}<span class="badge">${esc(a.tipo)}</span></div>
 <div class="meta">${ic('agenda')}${fechaTxt(a.fecha)}${horarioTxt(a)?' · '+esc(horarioTxt(a)):''}</div>
 <div class="meta">${ic('visitas')}${esc(a.lugar||'Sin lugar')} · ${esc(a.zona||a.region||'')}</div>
 <div class="meta">${ic('perfil')}Asignada a <b>${esc(a.asignadoNombre)}</b> · por ${esc(a.creadoNombre)}</div>
 ${eq.length?`<div class="equipo-act"><div class="fila wrap"><b>${ic('perfil')} Equipo de esta actividad · ${eq.length} personas</b><span class="sp"></span><span class="badge ${a.modo==='equipo'?'b-oro':''}">${a.modo==='equipo'?'Una evidencia por equipo':'Cada quien sube su evidencia'}</span></div>
  ${eq.map(x=>`<div class="miembro">${avatar({nombre:x.asignadoNombre,selfie:(S.personal.find(p=>p.id===x.asignadoA)||{}).selfie})}<span class="sp">${esc(x.asignadoNombre)}${x.asignadoA===S.user.id?' <small class="mute">(tú)</small>':''}<br><small class="mute">${esc(x.zona||x.region||'')}</small></span>${badge(estado(x))}</div>`).join('')}
  ${e&&a.modo==='equipo'&&e.actividadId!==a.id?`<p class="sm mute" style="margin:8px 0 0">La evidencia la subió ${esc(e.usuarioNombre)} por todo el equipo.</p>`:''}</div>`:''}
 ${a.descripcion?`<p style="margin:12px 0;padding:12px;background:var(--g50);border-radius:12px">${esc(a.descripcion)}</p>`:''}
 ${e?`<h3 class="serif" style="margin:16px 0 8px;font-size:16px">Evidencia</h3><div class="minis">${e.fotos.split(' | ').map(f=>`<img src="${esc(foto(f))}" alt="Evidencia" onclick="ampliar(this.src)">`).join('')}</div>
  <p style="margin:10px 0">${esc(e.comentario)}</p><p class="sm mute">Enviada ${esc(e.fecha)}${e.lat?` · <a target="_blank" rel="noopener" href="https://www.google.com/maps?q=${encodeURIComponent(e.lat+','+e.lng)}">Ver ubicación</a>`:''}${e.validadoPor?` · ${esc(e.validacion)} por ${esc(e.validadoPor)}`:''}</p>
  ${e.nota?`<p class="sm" style="color:var(--bad);margin-top:6px">Nota: ${esc(e.nota)}</p>`:''}${jefe()?`<div id="panelV">${panelVerificacion(e)}</div>`:''}
`:''}
 ${vis.length?`<h3 class="serif" style="margin:16px 0 8px;font-size:16px">Personas visitadas (${vis.length})</h3><div class="tabla"><table><tr><th>Persona visitada</th><th>Programa</th><th>Resultado</th></tr>${vis.map(v=>`<tr><td><b>${esc(v.nombre)}</b><br><span class="sm mute">${esc(v.localidad)}</span></td><td>${esc(v.programa)}</td><td>${esc(v.resultado)}</td></tr>`).join('')}</table></div>`:''}
 <div class="fila wrap" style="margin-top:18px">
  ${mio&&['Pendiente','Rechazada'].includes(a.estatus)?`<button class="btn" onclick="formaEvidencia('${a.id}')">${ic('evidencias')}Subir evidencia</button>`:''}
  ${mio&&(esVisita(a)||vis.length)&&a.estatus!=='Validada'?`<button class="btn sec" onclick="listaVisitas('${a.id}')">${ic('visitas')}Visitas (${vis.length})</button>`:''}
  ${jefe()&&e&&e.validacion==='Por validar'?`<button class="btn ok" onclick="validar('${e.id}','Validada',this)">Validar</button><button class="btn bad" onclick="validar('${e.id}','Rechazada',this)">Rechazar</button>`:''}
  ${jefe()&&e?`<button class="btn oro" onclick="verificarIA('${e.id}',this)">${ic('ia')}${e.ia?'Volver a revisar':'Revisar ahora'} con IA</button>`:''}
  ${mando&&!e?`<button class="btn sec" onclick="$('#repro').classList.toggle('hide')">Reprogramar</button><button class="btn bad" onclick="eliminarAct('${a.id}',this)">${eq.length?'Eliminar…':'Eliminar'}</button>`:''}</div>
 <div id="repro" class="hide" style="margin-top:12px"><div class="campo"><label>Nueva fecha</label><input type="date" id="rF" value="${a.fecha}"></div><div class="campo"><label>Horario</label>${editorHorarios('rHor',bloquesDe(a))}</div>${eq.length?`<label class="fila sm" style="margin:0 0 12px;gap:8px"><input type="checkbox" id="rTodos" checked style="width:auto"> Aplicar a todo el equipo (${eq.length} personas)</label>`:''}<button class="btn" onclick="reprogramar('${a.id}')">Guardar cambios</button></div>`,600);
}
function reprogramar(id){const a=S.acts.find(x=>x.id===id),f=val('rF');if(!a||!f)return;let hs;try{hs=leerHorarios('rHor')}catch(e){return toast(e.message)}
 const todos=!!($('#rTodos')&&$('#rTodos').checked),c={fecha:f,horarios:hs.map(b=>b.inicio+'-'+b.fin).join('|'),hora:hs[0]?hs[0].inicio:'',horaFin:hs.length?hs[hs.length-1].fin:''};
 if(!todos){Object.assign(a,c);const q=S.equipo.find(x=>x.id===id);if(q)q.fecha=f;cerrar();pintar();toast('Actividad reprogramada');return fondo(api('guardarActividad',{id,fecha:f,horarios:hs}))}
 cerrar();api('guardarActividad',{id,fecha:f,horarios:hs,todos:true}).then(r=>{toast(`Se reprogramó para ${r.cambiadas.length} ${r.cambiadas.length===1?'persona':'personas'} del equipo`);refrescar()}).catch(e=>toast(e.message))}
function eliminarAct(id){const a=S.acts.find(x=>x.id===id),eq=companeros(a);
 if(!eq.length){if(confirm('¿Eliminar esta actividad?'))borrarAct(id,false);return}
 modal(`<h2>Eliminar actividad</h2><p class="mute" style="margin:-6px 0 16px">${esc(a.titulo)} · ${fechaTxt(a.fecha)}<br>Es una actividad de equipo (${eq.length} personas).</p>
 <button class="btn bad grande" onclick="borrarAct('${id}',false)">Quitarla solo a ${esc(a.asignadoNombre)}</button>
 <button class="btn sec grande" style="margin-top:8px" onclick="borrarAct('${id}',true)">Eliminarla a todo el equipo</button>
 <p class="sm mute" style="margin-top:12px">A quien ya subió evidencia o registró visitas no se le elimina.</p>`,460)}
function borrarAct(id,todos){cerrar();
 if(!todos){S.acts=S.acts.filter(x=>x.id!==id);S.equipo=S.equipo.filter(x=>x.id!==id);pintar();toast('Actividad eliminada');return fondo(api('eliminarActividad',{id}))}
 api('eliminarActividad',{id,todos:true}).then(r=>{toast(`Se eliminó a ${r.borradas} ${r.borradas===1?'persona':'personas'}`+(r.conservadas?` · ${r.conservadas} se conservaron porque ya tienen evidencia o visitas`:''));refrescar()}).catch(e=>toast(e.message))}
function validar(id,v){const e=S.evs.find(x=>x.id===id);if(!e)return;let nota='';
 if(v==='Rechazada'){nota=prompt('Motivo del rechazo (lo verá quien subió la evidencia):');if(nota===null)return}
 Object.assign(e,{validacion:v,validadoPor:S.user.nombre,nota});const a=S.acts.find(x=>x.id===e.actividadId);if(a){a.estatus=v;marcarEquipo(a,v,['Con evidencia'])}
 cerrar();pintar();toast('Evidencia '+v.toLowerCase());fondo(api('validarEvidencia',{id,validacion:v,nota}))}
function verificarIA(id,b){ocupado(b,async()=>{const r=await api('ia',{tipo:'verificar',id},120000);const e=S.evs.find(x=>x.id===id);if(e){Object.assign(e,r,{puntaje:String(r.puntaje)});const p=$('#panelV');if(p)p.innerHTML=panelVerificacion(e)}toast('Revisión con IA lista')})}
