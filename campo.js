/* SAET Bienestar · Visitas de supervisión de los mandos
   Lo usan: Regionales, Enlaces municipales y Monitores (el Administrador las ve y valida).
   Un mando elige una actividad de sus servidores o a quiénes va a supervisar ("Voy a supervisar hoy esta"),
   va a campo y registra la visita con fotos, lista de revisión y una calificación por servidor.
   Su superior la valida. Los servidores de la nación no ven estas visitas. */

const TIPO_SUP='Visita de supervisión';
const TIPOS_VISITA_SUP=['Supervisión de ruta','Acompañamiento','Capacitación','Reunión de seguimiento'];
const REVISION_SUP=[['ruta','¿Estaba en su ruta o actividad?'],['identificacion','¿Portaba identificación o chaleco?'],['material','¿Traía su material de trabajo?'],['registro','¿Está registrando en su sistema?'],['trato','¿Buen trato con la población?']];
const CALIF=['Bien','Regular','Requiere apoyo'];
const esSup=a=>!!a&&a.tipo===TIPO_SUP;
const esMando=()=>['admin','regional','encargado','monitor'].includes(S.user.rol);
const objetivoDe=a=>{try{return JSON.parse(a&&a.objetivo||'{}')}catch(e){return{}}};
const detalleDe=e=>{try{return JSON.parse(e&&e.detalle||'{}')}catch(x){return{}}};
const normCal=c=>c==='Bien'?'ok':c==='Regular'?'warn':'bad';
/* Quién valida: nadie su propia evidencia; las visitas de supervisión, el regional (a enlaces y monitores) o el administrador */
function puedeValidarEv(e,a){if(!e||!jefe()||e.usuarioId===S.user.id)return false;if(!esSup(a))return true;
 if(S.user.rol==='admin')return true;const sup=S.personal.find(p=>p.id===a.asignadoA);return S.user.rol==='regional'&&!!sup&&sup.rol!=='regional'}

function vCampo(){
 const u=S.user,sups=S.acts.filter(esSup),mias=sups.filter(a=>a.asignadoA===u.id);
 const porValidar=sups.filter(a=>{const e=evidenciaDe(a);return e&&e.validacion==='Por validar'&&puedeValidarEv(e,a)});
 const equipo=sups.filter(a=>a.asignadoA!==u.id);
 const tabs=[['mias',`Mis visitas (${mias.length})`],...(jefe()?[['validar',`Por validar (${porValidar.length})`],['equipo',`De mi equipo (${equipo.length})`]]:[])];
 let t=S.tabC||(u.rol==='admin'?'validar':'mias');if(!tabs.some(x=>x[0]===t))t=tabs[0][0];
 const l=(t==='mias'?mias:t==='validar'?porValidar:equipo).slice().sort((a,b)=>(a.fecha+(a.hora||'')).localeCompare(b.fecha+(b.hora||'')));
 const base=t==='mias'?mias:sups,hechas=base.filter(hecha),sv=new Set();hechas.forEach(a=>(objetivoDe(a).servidores||[]).forEach(s=>sv.add(s.id)));
 $('#vista').innerHTML=`<div class="filtros">${navSemana()}<span class="sp"></span>
  ${u.rol!=='admin'?`<button class="btn sec" onclick="planearSup(false)">${ic('agenda')}Planear visita</button><button class="btn" onclick="planearSup(true)">${ic('evidencias')}Registrar visita ahora</button>`:''}</div>
 <div class="tiles2">
  <div class="tile2"><b>${base.length}</b><span>Visitas planeadas</span></div>
  <div class="tile2" style="--c:var(--ok)"><b>${hechas.length}</b><span>Realizadas</span></div>
  <div class="tile2" style="--c:var(--g700)"><b>${base.filter(a=>a.estatus==='Validada').length}</b><span>Validadas</span></div>
  <div class="tile2" style="--c:var(--bad)"><b>${base.filter(a=>estado(a)==='Vencida').length}</b><span>Vencidas sin registrar</span></div>
  <div class="tile2"><b>${sv.size}</b><span>Servidores supervisados</span></div></div>
 <div class="filtros"><div class="tabs">${tabs.map(([k,x])=>`<button class="${t===k?'on':''}" onclick="S.tabC='${k}';vCampo()">${x}</button>`).join('')}</div></div>
 ${l.length?`<div class="grid tarjetas">${l.map(tarjetaSup).join('')}</div>`:`<div class="card vacio">${t==='mias'?`Aún no tienes visitas de supervisión esta semana.${u.rol!=='admin'?'<br><br><button class="btn" onclick="planearSup(false)">Planear mi primera visita</button>':''}`:t==='validar'?'No hay visitas por validar.':'Tu equipo no tiene visitas de supervisión esta semana.'}</div>`}`;
}
function tarjetaSup(a){
 const o=objetivoDe(a),e=evidenciaDe(a),det=detalleDe(e),mio=a.asignadoA===S.user.id,sv=o.servidores||[];
 return`<div class="card tarea sup-card"><div class="fila">${badge(estado(a))}<span class="sp"></span><span class="sm mute">${esc(det.tipo||'Visita de supervisión')}</span></div>
 <h4>${esc(a.titulo.replace(/^Supervisar: /,''))}</h4>
 <div class="meta">${ic('agenda')}${fechaTxt(a.fecha)}${horarioTxt(a)?' · '+esc(horarioTxt(a)):''}</div>
 ${!mio?`<div class="meta">${ic('perfil')}<b>${esc(a.asignadoNombre)}</b>&nbsp;· ${esc(ROL[(S.personal.find(p=>p.id===a.asignadoA)||{}).rol]||'')}</div>`:''}
 <div class="sup-sv">${sv.slice(0,6).map(s=>{const c=(det.calificaciones||{})[s.id];return`<span class="chip-sv ${c?'cal-'+normCal(c):''}" title="${esc(s.zona||'')}">${esc(s.nombre.split(' ').slice(0,2).join(' '))}${c?` · ${esc(c)}`:''}</span>`}).join('')}${sv.length>6?`<span class="chip-sv">+${sv.length-6}</span>`:''}</div>
 <div class="fila" style="margin-top:auto;padding-top:6px">
  ${mio&&['Pendiente','Rechazada'].includes(a.estatus)?`<button class="btn sp" onclick="formaSup('${a.id}')">${ic('evidencias')}Registrar visita</button>`:''}
  ${e&&e.validacion==='Por validar'&&puedeValidarEv(e,a)?`<button class="btn ok ch sp" onclick="validar('${e.id}','Validada',this)">Validar</button><button class="btn bad ch sp" onclick="validar('${e.id}','Rechazada',this)">Rechazar</button>`:''}
  <button class="btn sec" onclick="detalle('${a.id}')">Ver</button></div></div>`;
}

/* ── Planear: "Voy a supervisar esta actividad" o "a estos servidores" ── */
async function planearSup(ahora){
 modal('<div class="vacio"><span class="carga oscura"></span><p style="margin-top:10px">Cargando tus servidores y sus actividades…</p></div>',640);
 try{S.obj=await api('objetivosSupervision',{desde:iso(mas(new Date(),-1)),hasta:iso(mas(new Date(),14))})}catch(e){cerrar();return toast(e.message)}
 S.planSup={ahora,modo:'act',fecha:hoy(),act:'',sv:new Set(),q:''};pintarPlanSup();
}
function pintarPlanSup(){
 const P=S.planSup,O=S.obj,acts=O.actividades.filter(x=>x.fecha===P.fecha),q=P.q.toLowerCase();
 const svs=O.servidores.filter(s=>!q||(s.nombre+' '+s.zona).toLowerCase().includes(q));
 modal(`<h2>${P.ahora?'Registrar visita de supervisión':'Planear visita de supervisión'}</h2>
 <p class="mute sm" style="margin:-8px 0 14px">${P.ahora?'Elige qué estás supervisando ahora. Después tomas las fotos y llenas la revisión.':'Elige qué vas a supervisar. Te queda en tu agenda y el día de la visita la registras con fotos.'}</p>
 ${P.ahora?'':`<div class="dos"><div class="campo"><label>Fecha de la visita *</label><input type="date" id="sF" value="${P.fecha}" min="${hoy()}" onchange="S.planSup.fecha=this.value;S.planSup.act='';pintarPlanSup()"></div><div class="campo"><label>Horario <span class="mute">(opcional)</span></label>${editorHorarios('sH')}</div></div>`}
 <div class="campo"><label>¿Qué vas a supervisar? *</label><div class="seg"><button class="${P.modo==='act'?'on':''}" onclick="S.planSup.modo='act';pintarPlanSup()">Una actividad</button><button class="${P.modo==='sv'?'on':''}" onclick="S.planSup.modo='sv';pintarPlanSup()">A uno o varios servidores</button></div></div>
 ${P.modo==='act'?`<div class="lista sup-lista">${acts.map(x=>`<label class="${P.act===x.actividadId?'on':''}"><input type="radio" name="sAct" ${P.act===x.actividadId?'checked':''} onchange="S.planSup.act='${x.actividadId}';pintarPlanSup()"><span class="sp"><b>${esc(x.titulo)}</b><br><small class="mute">${esc(String(x.horarios||'').replace(/\|/g,' y ').replace(/-/g,'–')||'Sin hora')} · ${esc(x.lugar||x.zona||'')} · ${x.personas.length===1?esc(x.personas[0].nombre):x.personas.length+' servidores'}</small></span></label>`).join('')||`<div class="vacio sm">Tus servidores no tienen actividades el ${fechaTxt(P.fecha)}. Elige “A uno o varios servidores”.</div>`}</div>`
 :`<input placeholder="Buscar servidor o municipio…" value="${esc(P.q)}" oninput="S.planSup.q=this.value;clearTimeout(S.tq);S.tq=setTimeout(pintarPlanSup,250)" style="margin-bottom:8px"><div class="lista sup-lista">${svs.map(s=>`<label><input type="checkbox" ${P.sv.has(s.id)?'checked':''} onchange="this.checked?S.planSup.sv.add('${s.id}'):S.planSup.sv.delete('${s.id}');$('#sCnt').textContent=S.planSup.sv.size"><span class="sp">${esc(s.nombre)}<br><small class="mute">${esc(s.puesto==='UBA'?'UBA':'Servidor de la Nación')} · ${esc(s.zona)}</small></span></label>`).join('')||'<div class="vacio sm">Sin servidores con ese nombre.</div>'}</div><p class="sm mute" style="margin:6px 2px 0"><b id="sCnt">${P.sv.size}</b> seleccionados</p>`}
 <div class="dos" style="margin-top:12px"><div class="campo"><label>Lugar</label><input id="sL" placeholder="Si es distinto al de la actividad"></div><div class="campo"><label>Notas</label><input id="sN" placeholder="Ej. revisar avance del censo"></div></div>
 <button class="btn grande" onclick="guardarPlanSup(this)">${P.ahora?'Continuar: tomar fotos y revisar':'Guardar en mi agenda'}</button>`,640);
}
function guardarPlanSup(b){ocupado(b,async()=>{const P=S.planSup;
 if(P.modo==='act'&&!P.act) throw new Error('Elige la actividad que vas a supervisar');
 if(P.modo==='sv'&&!P.sv.size) throw new Error('Elige al menos a un servidor');
 const r=await api('planearSupervision',{fecha:P.ahora?hoy():P.fecha,horarios:P.ahora?[]:leerHorarios('sH'),actividadId:P.modo==='act'?P.act:'',servidores:P.modo==='sv'?[...P.sv]:[],lugar:val('sL'),descripcion:val('sN')});
 S.acts.push(r.actividad);
 if(P.ahora) return formaSup(r.actividad.id);
 cerrar();S.tabC='mias';pintar();toast('Visita guardada en tu agenda')})}

/* ── Registrar la visita: fotos en campo + revisión + calificación por servidor ── */
function formaSup(id){
 const a=S.acts.find(x=>x.id===id);if(!a)return;const sv=objetivoDe(a).servidores||[];S.fotos=[];S.geo=null;
 modal(`<h2>Registrar visita de supervisión</h2><p class="mute" style="margin:-8px 0 14px">${esc(a.titulo.replace(/^Supervisar: /,''))} · ${fechaTxt(a.fecha)}</p>
 <div class="campo"><label for="sT">Tipo de visita</label><select id="sT">${TIPOS_VISITA_SUP.map(t=>`<option>${t}</option>`).join('')}</select></div>
 <div class="paso"><i>1</i>Servidores supervisados</div>
 <div class="sup-cal">${sv.map(s=>`<div class="fila-cal"><label class="fila" style="gap:8px;margin:0"><input type="checkbox" class="sPres" value="${s.id}" checked style="width:auto"><span><b>${esc(s.nombre)}</b><br><small class="mute">${esc(s.zona||'')}</small></span></label>
  <div class="seg seg-cal" data-id="${s.id}">${CALIF.map((c,i)=>`<button type="button" class="${i===0?'on':''} c-${normCal(c)}" onclick="this.parentNode.querySelectorAll('button').forEach(x=>x.classList.remove('on'));this.classList.add('on')">${c}</button>`).join('')}</div></div>`).join('')}</div>
 <p class="sm mute" style="margin:6px 2px 14px">Desmarca a quien no encontraste en campo.</p>
 <div class="paso"><i>2</i>Lista de revisión</div>
 <div class="sup-rev">${REVISION_SUP.map(([k,t])=>`<div class="fila-rev"><span class="sp">${t}</span><div class="seg" data-k="${k}"><button type="button" class="on" onclick="this.parentNode.querySelectorAll('button').forEach(x=>x.classList.remove('on'));this.classList.add('on')">Sí</button><button type="button" onclick="this.parentNode.querySelectorAll('button').forEach(x=>x.classList.remove('on'));this.classList.add('on')">No</button></div></div>`).join('')}</div>
 <div class="paso"><i>3</i>Foto en campo con los servidores</div>
 <div class="campo"><div class="fotos-ev" id="eF"></div>
  <div class="fila wrap" style="margin-top:10px"><label class="btn" style="margin:0">${ic('evidencias')} Tomar foto<input type="file" accept="image/*" capture="environment" class="hide" onchange="agregarFotos(this,'camara')"></label>
  <label class="btn sec" style="margin:0">Elegir de galería<input type="file" accept="image/*" multiple class="hide" onchange="agregarFotos(this,'galeria')"></label></div></div>
 <p class="sm mute" id="eG" style="margin-bottom:12px">Obteniendo ubicación…</p>
 <div class="paso"><i>4</i>Observaciones y acuerdos</div>
 <div class="campo"><label>¿Qué observaste?</label><textarea id="eC" rows="2" placeholder="Cómo encontraste el trabajo en campo"></textarea></div>
 <div class="campo"><label>Acuerdos o compromisos</label><textarea id="sA" rows="2" placeholder="Ej. reforzar el registro en la colonia Gaviotas"></textarea></div>
 <button class="btn grande" onclick="enviarSup('${id}',this)">Enviar visita</button>`,640);
 pintarFotosEv();
 if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p=>{S.geo=p.coords;const g=$('#eG');if(g)g.textContent='✓ Ubicación registrada'},()=>{const g=$('#eG');if(g)g.innerHTML='<b style="color:var(--warn)">Sin ubicación:</b> activa la ubicación para que la visita cuente como confiable.'},{enableHighAccuracy:true,timeout:9000});
 else $('#eG').textContent='';
}
function enviarSup(id,b){ocupado(b,async()=>{
 if(!S.fotos.length) throw new Error('Toma al menos una foto en campo');
 const presentes=[...document.querySelectorAll('.sPres:checked')].map(i=>i.value),cal={},rev={};
 document.querySelectorAll('.seg-cal').forEach(s=>{if(presentes.includes(s.dataset.id))cal[s.dataset.id]=s.querySelector('.on').textContent});
 document.querySelectorAll('.sup-rev .seg').forEach(s=>rev[s.dataset.k]=s.querySelector('.on').textContent==='Sí');
 if(!presentes.length&&!confirm('No marcaste a ningún servidor como presente. ¿Enviar de todos modos?'))return;
 await encolar('subirEvidencia',{id:idNuevo('E'),actividadId:id,fotos:S.fotos.map(f=>f.dataUrl),meta:S.fotos.map(f=>f.meta),comentario:val('eC'),lat:S.geo?String(S.geo.latitude):'',lng:S.geo?String(S.geo.longitude):'',cuando:hoy()+' '+new Date().toTimeString().slice(0,5),
  detalle:{tipo:val('sT'),revision:rev,calificaciones:cal,presentes,acuerdos:val('sA')}});
 cerrar();S.tabC='mias';pintar();toast(DEMO||navigator.onLine?'Visita registrada. Tu superior la validará.':'Sin señal: la visita quedó guardada y se enviará sola al volver la conexión.')})}

/* Bloque del detalle de una visita de supervisión (dentro de "Ver") */
function bloqueSup(a,e){const o=objetivoDe(a),det=detalleDe(e),sv=o.servidores||[],pres=det.presentes||[];
 return`<div class="equipo-act"><div class="fila wrap"><b>${ic('perfil')} ${o.actividadTitulo?'Supervisión de la actividad: '+esc(o.actividadTitulo):'Servidores a supervisar'}</b><span class="sp"></span>${det.tipo?`<span class="badge b-oro">${esc(det.tipo)}</span>`:''}</div>
 ${sv.map(s=>{const c=(det.calificaciones||{})[s.id];return`<div class="miembro"><span class="av">${esc(iniciales(s.nombre))}</span><span class="sp">${esc(s.nombre)}<br><small class="mute">${esc(s.zona||'')}${e&&!pres.includes(s.id)?' · no estuvo presente':''}</small></span>${c?`<span class="cal cal-${normCal(c)}">${esc(c)}</span>`:e?'':'<span class="sm mute">Por visitar</span>'}</div>`}).join('')}
 ${e&&det.revision?`<div class="rev-res">${REVISION_SUP.filter(([k])=>det.revision[k]).map(([k,t])=>`<span class="${det.revision[k]==='si'?'si':'no'}">${det.revision[k]==='si'?'✓':'✕'} ${t.replace(/[¿?]/g,'')}</span>`).join('')}</div>`:''}
 ${det.acuerdos?`<p class="sm" style="margin:4px 0 0"><b>Acuerdos:</b> ${esc(det.acuerdos)}</p>`:''}</div>`}
