/* SAET Bienestar · Pantalla de Inicio (tablero)
   Lo usa: todos */

function vInicio(){
 const u=S.user,sem=deSemana(),ok=sem.filter(hecha).length,exig=sem.filter(a=>!(a.estatus==='Pendiente'&&a.fecha>=hoy())).length,pct=exig?Math.round(ok/exig*100):0;
 const ids=new Set(sem.map(a=>a.id)),vis=S.vis.filter(v=>ids.has(v.actividadId)).length;
 const h=new Date().getHours(),sal=h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches';
 const pendientes=sem.filter(a=>!hecha(a)).length;
 const clave=u.rol==='admin'?(S.avIni||'region'):u.rol==='regional'?'zona':'asignadoNombre',grupos={};
 sem.forEach(a=>{const g=grupos[a[clave]||'Monitores']=grupos[a[clave]||'Monitores']||{t:0,ok:0,ex:0};g.t++;if(hecha(a))g.ok++;if(!(a.estatus==='Pendiente'&&a.fecha>=hoy()))g.ex++});
 const deHoy=sem.filter(a=>a.fecha===hoy()).sort((a,b)=>a.hora.localeCompare(b.hora));
 const porValidar=S.evs.filter(e=>e.validacion==='Por validar').slice(0,4),porAprobar=S.personal.filter(p=>p.estatus==='Pendiente').slice(0,4);
 $('#vista').innerHTML=`<div class="grid dash"><div class="grid">
  <div class="hero"><svg class="deco" viewBox="0 0 64 64">${CEIBA}</svg><h2>${sal}, ${esc(u.nombre.split(' ')[0])}</h2>
   <p>${sem.length?`Esta semana hay <b>${sem.length}</b> actividades en tu agenda y <b>${pendientes}</b> siguen pendientes de evidencia.`:'Aún no hay actividades cargadas para esta semana.'}</p>
   ${u.rol==='servidor'?`<button class="btn blanco" onclick="ir('tareas')">Ver mis actividades</button>`:`<button class="btn blanco" onclick="${jefe()?"ir('agenda');":"ir('tareas');"}nuevaActividad()">${ic('mas')}Nueva actividad</button>`}</div>
  <div class="grid tiles">
   <div class="tile"><i>${ic('agenda')}</i><div><b>${sem.length}</b><span>Actividades de la semana</span></div></div>
   <div class="tile"><i>${ic('tareas')}</i><div><b>${ok}</b><span>Con evidencia</span></div></div>
   <div class="tile"><i>${ic('reloj')}</i><div><b>${pendientes}</b><span>Pendientes</span></div></div>
   <div class="tile"><i>${ic('visitas')}</i><div><b>${vis}</b><span>Personas visitadas</span></div></div></div>
  ${jefe()?`<div class="card"><h3>Avance de la semana por ${clave==='region'?'región':clave==='zona'?'municipio o distrito':'persona'}<span class="der">${pct}% general</span></h3>
   <div class="fila wrap" style="margin:-4px 0 10px">${u.rol==='admin'?`<div class="tabs">${[['region','Por región'],['zona','Por municipio']].map(([k,t])=>`<button class="${clave===k?'on':''}" onclick="S.avIni='${k}';vInicio()">${t}</button>`).join('')}</div>`:''}<span class="sp"></span><button class="btn sec ch" onclick="abrirReporte('')">${ic('reportes')} Reporte completo</button></div><div class="tabla"><table>
   <tr><th>${clave==='region'?'Región':clave==='zona'?'Zona':'Nombre'}</th><th>Programadas</th><th>Con evidencia</th><th style="width:34%">Cumplimiento <small class="mute">(de lo ya vencido)</small></th></tr>
   ${Object.entries(grupos).sort((a,b)=>(b[1].ex?b[1].ok/b[1].ex:-1)-(a[1].ex?a[1].ok/a[1].ex:-1)).map(([k,g])=>{const p=g.ex?Math.round(g.ok/g.ex*100):0;const sem=SEMAFORO(p),ir=clave==='region'?`r:${k}`:clave==='zona'?`z:${k}`:'';return`<tr><td><b>${ir&&k!=='Monitores'?`<a href="#" onclick="abrirReporte('${esc(ir)}');return false">${esc(k)}</a>`:esc(k)}</b></td><td>${g.t}</td><td>${g.ok}</td><td><div class="fila"><div class="barra sp"><i style="width:${p}%;background:${sem.c}"></i></div><b class="sm">${p}%</b></div></td></tr>`}).join('')||'<tr><td colspan="4" class="vacio">Sin actividades esta semana</td></tr>'}
   </table></div></div>`:''}
  <div class="card"><h3>Para hoy<span class="der">${fechaTxt(hoy())}</span></h3>${deHoy.slice(0,7).map(itemAct).join('')||'<div class="vacio">Nada programado para hoy.</div>'}</div>
 </div><div class="grid" style="align-content:start">
  <div class="card"><h3>Semana<span class="der">${fechaTxt(iso(S.semana))} – ${fechaTxt(iso(mas(S.semana,6)))}</span></h3><div class="dias">${dias7().map(d=>{const n=sem.filter(a=>a.fecha===iso(d)).length;return`<div class="dia ${iso(d)===hoy()?'hoy':''}">${d.toLocaleDateString('es-MX',{weekday:'short'}).slice(0,3)}<b>${d.getDate()}</b><em>${n||'·'}</em></div>`}).join('')}</div></div>
  ${jefe()?`<div class="card"><h3>Evidencias por validar<span class="der"><a href="#" onclick="ir('evidencias');return false">Ver todas</a></span></h3>${porValidar.map(e=>{const a=S.acts.find(x=>x.id===e.actividadId)||{};return`<div class="item">${avatar(persona(e.usuarioId)||{nombre:e.usuarioNombre})}<div class="sp"><div class="t">${esc(e.usuarioNombre)}</div><div class="s">${esc(a.titulo)}</div></div><button class="btn sec ch" onclick="detalle('${e.actividadId}')">Revisar</button></div>`}).join('')||'<div class="vacio">Todo al día.</div>'}</div>
  <div class="card"><h3>Registros por aprobar</h3>${porAprobar.map(p=>`<div class="item">${avatar(p)}<div class="sp"><div class="t">${esc(p.nombre)}</div><div class="s">${esc(p.zona)}</div></div><button class="btn ok ch" onclick="estatusPersona('${p.id}','Activo',this)">Aprobar</button></div>`).join('')||'<div class="vacio">Sin registros nuevos.</div>'}</div>`
  :`<div class="card"><h3>Tu avance</h3><div class="fila"><div class="barra sp"><i style="width:${pct}%"></i></div><b>${pct}%</b></div><p class="sm mute" style="margin-top:10px">${ok} de ${exig} actividades que ya debían hacerse tienen evidencia (${sem.length} programadas esta semana).</p></div>`}
 </div></div>`;
}
const itemAct=a=>`<div class="item"><div class="sp"><div class="t">${esc(a.titulo)}</div><div class="s">${a.hora?esc(a.hora)+' · ':''}${esc(a.lugar||a.zona)} · ${esc(a.asignadoNombre)}</div></div>${badge(estado(a))}<button class="btn sec ch" onclick="detalle('${a.id}')">Abrir</button></div>`;
