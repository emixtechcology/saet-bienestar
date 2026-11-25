/* SAET Bienestar · Mis actividades
   Lo usa: Servidor de la Nación y Monitor */

function vTareas(){
 const mias=S.acts.filter(a=>a.asignadoA===S.user.id),t=S.tab;
 const l=mias.filter(a=>t==='Todas'||(t==='Pendientes'?['Pendiente','Rechazada'].includes(a.estatus):hecha(a))).sort((a,b)=>(a.fecha+a.hora).localeCompare(b.fecha+b.hora));
 if(t!=='Pendientes') l.reverse();
 $('#vista').innerHTML=`<div class="filtros"><div class="tabs">${['Pendientes','Entregadas','Todas'].map(x=>`<button class="${t===x?'on':''}" onclick="S.tab='${x}';vTareas()">${x}</button>`).join('')}</div><span class="sp"></span>
  ${S.user.rol==='monitor'?`<button class="btn oro" onclick="planearIA()">${ic('ia')}Planear con IA</button><button class="btn" onclick="nuevaActividad()">${ic('mas')}Nueva actividad</button>`:''}</div>
 <div class="grid tarjetas">${l.map(a=>`<div class="card tarea"><div class="fila">${badge(estado(a))}<span class="sp"></span><span class="sm mute">${esc(a.tipo)}</span></div><h4>${esc(a.titulo)}</h4>
  <div class="meta">${ic('agenda')}${fechaTxt(a.fecha)}${horarioTxt(a)?' · '+esc(horarioTxt(a)):''}</div><div class="meta">${ic('visitas')}${esc(a.lugar||a.zona||'—')}</div>${companeros(a).length?`<div class="meta">${ic('perfil')}En equipo con ${companeros(a).length-1} ${companeros(a).length===2?'persona':'personas'}${enEquipo(a)?' · una evidencia por equipo':''}</div>`:''}
  <div class="fila" style="margin-top:auto;padding-top:6px">${['Pendiente','Rechazada'].includes(a.estatus)?(esSup(a)?`<button class="btn sp" onclick="formaSup('${a.id}')">${ic('evidencias')}Registrar visita</button>`:`<button class="btn sp" onclick="formaEvidencia('${a.id}')">${ic('evidencias')}Subir evidencia</button>`):''}<button class="btn sec ${hecha(a)?'sp':''}" onclick="detalle('${a.id}')">Ver</button></div></div>`).join('')}</div>
 ${l.length?'':'<div class="card vacio">No hay actividades en esta lista.</div>'}`;
}
