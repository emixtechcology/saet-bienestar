/* SAET Bienestar · Seguimiento de monitores
   Lo usa: Administrador */

function vMonitores(){
 const sem=deSemana(),mon=S.personal.filter(p=>p.rol==='monitor'&&p.estatus==='Activo');
 $('#vista').innerHTML=`<div class="filtros">${navSemana()}</div><div class="grid tarjetas">${mon.map(m=>{const l=sem.filter(a=>a.asignadoA===m.id).sort((a,b)=>(a.fecha+a.hora).localeCompare(b.fecha+b.hora)),ok=l.filter(hecha).length,p=l.length?Math.round(ok/l.length*100):0;
  return`<div class="card"><div class="fila" style="margin-bottom:12px">${avatar(m)}<div class="sp"><b>${esc(m.nombre)}</b><div class="sm mute">${l.length} actividades · ${ok} con evidencia</div></div><b class="serif" style="font-size:20px;color:var(--g700)">${p}%</b></div>
  <div class="barra" style="margin-bottom:8px"><i style="width:${p}%"></i></div>${l.slice(0,5).map(a=>`<button class="chip e-${cls(estado(a))}" onclick="detalle('${a.id}')"><b>${esc(a.titulo)}</b><span>${fechaTxt(a.fecha)} ${esc(horarioTxt(a))}</span></button>`).join('')||'<div class="sm mute">Sin actividades cargadas esta semana.</div>'}${l.length>5?`<div class="mas">+ ${l.length-5} más</div>`:''}</div>`}).join('')}</div>
 ${mon.length?'':'<div class="card vacio">Aún no hay monitores. Agrégalos en Personal.</div>'}`;
}
