/* SAET Bienestar · Agenda semanal, nueva actividad y planear con IA
   Lo usa: Regional, Encargado (y Monitor al crear sus actividades) */

async function moverSemana(n){S.semana=n?mas(S.semana,7*n):lunes(new Date());const a=iso(S.semana),b=iso(mas(S.semana,6));
 if(a<S.rango.desde||b>S.rango.hasta){try{await cargar(S.semana)}catch(e){toast(e.message)}}pintar()}
const navSemana=()=>`<div class="fila"><button class="btn sec ch" onclick="moverSemana(-1)" aria-label="Semana anterior">${ic('izq')}</button><button class="btn sec ch" onclick="moverSemana(0)">Hoy</button><button class="btn sec ch" onclick="moverSemana(1)" aria-label="Semana siguiente">${ic('der')}</button><b class="serif" style="font-size:16px">${fechaTxt(iso(S.semana))} – ${fechaTxt(iso(mas(S.semana,6)))}</b></div>`;
const zonasVisibles=()=>[...new Set(S.personal.map(p=>p.zona).filter(Boolean))].sort();
function vAgenda(){
 const f=S.f,q=(f.q||'').toLowerCase();
 const sem=deSemana().filter(a=>(!f.zona||a.zona===f.zona)&&(!f.est||estado(a)===f.est)&&(!q||(a.titulo+a.asignadoNombre+a.lugar).toLowerCase().includes(q)));
 $('#vista').innerHTML=`<div class="filtros">${navSemana()}<span class="sp"></span>
  <input placeholder="Buscar…" value="${esc(f.q||'')}" onchange="S.f.q=this.value;vAgenda()">
  ${S.user.rol!=='encargado'?`<select onchange="S.f.zona=this.value;vAgenda()"><option value="">Todas las zonas</option>${zonasVisibles().map(z=>`<option ${f.zona===z?'selected':''}>${esc(z)}</option>`).join('')}</select>`:''}
  <select onchange="S.f.est=this.value;vAgenda()"><option value="">Todo estatus</option>${['Pendiente','Vencida','Con evidencia','Validada','Rechazada'].map(e=>`<option ${f.est===e?'selected':''}>${e}</option>`).join('')}</select>
  <button class="btn oro" onclick="planearIA()">${ic('ia')}Planear con IA</button><button class="btn" onclick="nuevaActividad()">${ic('mas')}Nueva actividad</button></div>
 <div class="semana">${dias7().map(d=>{const k=iso(d),l=sem.filter(a=>a.fecha===k).sort((a,b)=>a.hora.localeCompare(b.hora)),ab=S.f.abierto===k;
  return`<div class="col ${k===hoy()?'hoy':''}"><header><span>${d.toLocaleDateString('es-MX',{weekday:'long'})}</span><b>${d.getDate()}</b></header>
  ${(ab?l:l.slice(0,6)).map(a=>`<button class="chip e-${cls(estado(a))}" onclick="detalle('${a.id}')"><b>${a.hora?esc(a.hora)+' · ':''}${esc(a.titulo)}</b><span>${esc(a.asignadoNombre)}</span></button>`).join('')}
  ${l.length>6&&!ab?`<button class="mas" onclick="S.f.abierto='${k}';vAgenda()">+ ${l.length-6} más</button>`:''}${l.length?'':'<div class="mute sm" style="padding:4px">Sin actividades</div>'}</div>`}).join('')}</div>`;
}

function selector(){
 const u=S.user,gente=S.personal.filter(p=>p.estatus==='Activo'&&p.id!==u.id&&p.rol!=='admin');
 if(u.rol==='monitor') return '<p class="sm mute">La actividad se registra a tu nombre.</p>';
 return `<label>Asignar a *</label><div class="fila" style="margin-bottom:8px"><input id="selQ" placeholder="Buscar persona o zona…" oninput="filtrarSel()">
  <button class="btn sec ch" onclick="document.querySelectorAll('#selL label:not(.hide) input').forEach(i=>i.checked=true)">Todos</button></div>
  <div class="lista" id="selL">${gente.sort((a,b)=>(a.zona+a.nombre).localeCompare(b.zona+b.nombre)).map(p=>`<label data-t="${esc((p.nombre+' '+p.zona+' '+p.region+' '+ROL[p.rol]).toLowerCase())}"><input type="checkbox" value="${p.id}">${avatar(p)}<span class="sp">${esc(p.nombre)}<br><small class="mute">${ROL[p.rol]} · ${esc(p.zona||p.region||'')}</small></span></label>`).join('')||'<div class="vacio">Aún no hay personal activo.</div>'}</div>`;
}
function filtrarSel(){const q=val('selQ').toLowerCase();document.querySelectorAll('#selL label').forEach(l=>l.classList.toggle('hide',!l.dataset.t.includes(q)))}
const elegidos=()=>[...document.querySelectorAll('#selL input:checked')].map(i=>i.value);
function nuevaActividad(){
 modal(`<h2>Nueva actividad</h2>
 <div class="campo"><label>Título *</label><input id="aT" placeholder="Ej. Visitas de seguimiento en Villa Aldama"></div>
 <div class="dos"><div class="campo"><label>Tipo</label><select id="aTipo">${TIPOS.map(t=>`<option>${t}</option>`).join('')}</select></div><div class="campo"><label>Lugar</label><input id="aL"></div></div>
 <div class="dos"><div class="campo"><label>Fecha *</label><input id="aF" type="date" value="${hoy()}"></div><div class="campo"><label>Hora</label><input id="aH" type="time"></div></div>
 <div class="campo"><label>Indicaciones</label><textarea id="aD" rows="2"></textarea></div>
 <div class="campo">${selector()}</div>
 <button class="btn" style="width:100%" onclick="guardarActs(this,[{titulo:val('aT'),tipo:val('aTipo'),lugar:val('aL'),fecha:val('aF'),hora:val('aH'),descripcion:val('aD')}])">Guardar actividad</button>`);
}
function guardarActs(b,lista){ocupado(b,async()=>{
 if(lista.some(x=>!x.titulo||!x.fecha)) throw new Error('Falta el título o la fecha');
 const r=await api('guardarActividad',{actividades:lista,asignados:elegidos()});
 S.acts.push(...r.nuevas);cerrar();toast(r.nuevas.length===1?'Se creó 1 actividad':'Se crearon '+r.nuevas.length+' actividades');pintar()})}
function planearIA(){
 S.borr=[];
 modal(`<h2>${ic('ia')} Planear la semana con IA</h2><div class="ia"><label>Escribe o dicta tu plan tal como lo dirías</label>
 <textarea id="iaT" rows="4" placeholder="Ej. El martes a las 9 asamblea informativa en el parque de Tamulté; miércoles y jueves visitas domiciliarias en la colonia Gaviotas; viernes 10 am reunión de trabajo en la Delegación."></textarea>
 <button class="btn oro" style="margin-top:10px" onclick="pedirPlan(this)">${ic('ia')}Convertir en actividades</button></div>
 <div id="iaR" style="margin:14px 0"></div><div class="campo">${selector()}</div>
 <button class="btn" style="width:100%" onclick="guardarActs(this,S.borr)">Crear actividades</button>`,640);
}
function pedirPlan(b){ocupado(b,async()=>{S.borr=await api('ia',{tipo:'agenda',texto:val('iaT')});pintarPlan()})}
function pintarPlan(){$('#iaR').innerHTML=S.borr.map((x,i)=>`<div class="item"><div class="sp"><div class="t">${esc(x.titulo)}</div><div class="s">${esc(x.tipo)} · ${fechaTxt(x.fecha)} ${esc(x.hora||'')} · ${esc(x.lugar||'')}</div></div><button class="btn bad ch" onclick="S.borr.splice(${i},1);pintarPlan()">Quitar</button></div>`).join('')||'<p class="mute sm">Sin actividades propuestas.</p>'}
