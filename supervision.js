/* SAET Bienestar · Supervisión: quién hizo su trabajo, con qué evidencia y dónde
   Lo usa: Administrador (todo el estado), Regional (su región) y Encargado (su municipio o subregión)
   Tabla por persona (avance contra lo asignado, calidad de evidencias, visitas y localidades),
   mapa de evidencias y visitas, y ficha individual con todo su trabajo del periodo. */

const FILTROS_SUP=[['','Todos'],['sinEvidencia','Sin evidencia'],['sospechosas','Con evidencias sospechosas'],['rezago','Rezago (menos de 50%)'],['sinActividad','Sin actividades'],['sinSupervisar','Servidores sin supervisar']];
function vSupervision(){
 const R=S.sup=S.sup||{per:'semana',sel:'',q:'',filtro:'',rol:'',agrupar:'',vista:'tabla',datos:null,clave:''};rangoPeriodo(R);
 $('#vista').innerHTML=`<div class="card panel-filtros">
  <div class="pf-cab"><div><h3>Supervisión del trabajo</h3><p class="sm mute">Avance de cada persona contra lo que tiene asignado, calidad de sus evidencias y las visitas de supervisión de los mandos.</p></div>
  <button class="btn" onclick="cargarSupervision(this,true)">${ic('monitores')} Actualizar</button></div>
  <div class="pf-grid">${bloquePeriodo(R,'vSupervision')}<div class="pf-bloque"><span class="pf-et">Alcance</span>${selectorAlcance(R,"S.sup.sel=this.value;S.sup.agrupar='';cargarSupervision(null,true)")}</div></div></div>
 <div id="supCuerpo"><div class="card vacio"><span class="carga oscura"></span><p style="margin-top:10px">Cargando…</p></div></div>`;
 const clave=JSON.stringify([S.user.id,R.desde,R.hasta,R.sel]);
 if(R.datos&&R.clave===clave) pintarSupervision(); else cargarSupervision(null,false);
}
function cargarSupervision(b,forzar){ocupado(b,async()=>{const R=S.sup;
 if(!R.desde||!R.hasta||R.desde>R.hasta) throw new Error('Revisa las fechas del periodo');
 const datos=await api('supervision',{desde:R.desde,hasta:R.hasta,...paramsAlcance(R.sel)},120000);if(S.sup!==R||!S.user)return;R.datos=datos;R.clave=JSON.stringify([S.user.id,R.desde,R.hasta,R.sel]);pintarSupervision()})}
function filtraSup(p,f){return !f||(f==='sinEvidencia'?p.exigibles>0&&p.conEvidencia===0:f==='sospechosas'?p.evSospechosas>0:f==='rezago'?p.avance!=null&&p.avance<50:f==='sinActividad'?p.asignadas===0:f==='sinSupervisar'?p.rol==='servidor'&&!p.supervisado:true)}
/* Niveles de vista según el rol y el alcance elegido */
function nivelesSup(R){const u=S.user,t=tipoAlcance(R);return t==='estado'?[['region','Por región'],['zona','Por municipio'],['persona','Por persona']]:t==='region'?[['zona','Por municipio'],['persona','Por persona']]:[['persona','Por persona']]}
function agruparSup(personas,clave){
 const g={},sumar=['asignadas','exigibles','conEvidencia','vencidas','evConfiables','evRevisar','evSospechosas','duplicadas','supervisiones'];
 personas.forEach(p=>{const k=(clave==='region'?p.region:p.zona)||'Monitores',x=g[k]=g[k]||{nombre:k,region:p.region,personas:0,conActividad:0,sinEvidencia:0,servidores:0,snSup:0};
  x.personas++;if(p.asignadas)x.conActividad++;if(p.exigibles>0&&p.conEvidencia===0)x.sinEvidencia++;sumar.forEach(f=>x[f]=(x[f]||0)+(p[f]||0));if(p.rol==='servidor'){x.servidores++;if(p.supervisado)x.snSup++}});
 return Object.values(g).map(x=>{x.avance=x.exigibles?Math.round(x.conEvidencia/x.exigibles*100):null;
  const resp=S.personal.find(q=>clave==='region'?q.rol==='regional'&&q.region===x.nombre:q.rol==='encargado'&&q.zona===x.nombre);x.responsable=resp?resp.nombre:'';return x});
}
function entrarGrupo(nombre){const R=S.sup;if(nombre==='Monitores')return;
 if(R.agrupar==='region'){R.sel='r:'+nombre;R.agrupar='zona'}else{R.sel='z:'+nombre;R.agrupar='persona'}
 vSupervision()}
function pintarSupervision(){
 const R=S.sup,d=R&&R.datos,el=$('#supCuerpo');if(!el||!d)return;
 const niveles=nivelesSup(R);if(!niveles.some(n=>n[0]===R.agrupar))R.agrupar=niveles[0][0];
 const q=(R.q||'').toLowerCase(),todas=d.personas.filter(p=>!R.rol||p.rol===R.rol);
 const l=todas.filter(p=>filtraSup(p,R.filtro)&&(!q||(p.nombre+' '+p.zona+' '+p.region).toLowerCase().includes(q)))
  .sort((a,b)=>R.orden==='nombre'?a.nombre.localeCompare(b.nombre):R.orden==='sospechosas'?b.evSospechosas-a.evSospechosas:((a.avance??101)-(b.avance??101))||b.vencidas-a.vencidas);
 const s=k=>todas.reduce((t,p)=>t+(p[k]||0),0),ex=s('exigibles'),av=ex?Math.round(s('conEvidencia')/ex*100):null;
 const cont=f=>todas.filter(p=>filtraSup(p,f)).length,u=S.user;
 const roles=[['','Todos los roles'],['servidor','Servidores de la Nación'],['encargado','Enlaces municipales'],['monitor','Monitores'],...(u.rol==='admin'?[['regional','Regionales']]:[])];
 const grupos=R.agrupar==='persona'?null:agruparSup(l,R.agrupar).sort((a,b)=>R.orden==='nombre'?a.nombre.localeCompare(b.nombre):R.orden==='sospechosas'?b.evSospechosas-a.evSospechosas:(a.avance??101)-(b.avance??101)).sort((a,b)=>(a.nombre==='Monitores')-(b.nombre==='Monitores'));
 const migas=R.sel?`<div class="migas"><button onclick="S.sup.sel='';S.sup.agrupar='';vSupervision()">${u.rol==='admin'?'Todo el estado':'Toda mi región'}</button>${R.sel.startsWith('z:')&&u.rol==='admin'?`<span>›</span><button onclick="S.sup.sel='r:${esc((S.zonas.find(z=>'z:'+z.zona===R.sel)||{}).region||'')}';S.sup.agrupar='zona';vSupervision()">${esc((S.zonas.find(z=>'z:'+z.zona===R.sel)||{}).region||'')}</button>`:''}<span>›</span><b>${esc(R.sel.slice(2))}</b></div>`:'';
 el.innerHTML=`${migas}<div class="tiles2">
  <div class="tile2"><b>${todas.length}</b><span>Personas</span></div>
  <div class="tile2" style="--c:${SEMAFORO(av).c}"><b>${pctTxt(av)}</b><span>Avance promedio</span></div>
  <div class="tile2" style="--c:var(--bad)"><b>${cont('sinEvidencia')}</b><span>Sin ninguna evidencia</span></div>
  <div class="tile2" style="--c:var(--bad)"><b>${s('evSospechosas')}</b><span>Evidencias sospechosas</span></div>
  <div class="tile2" style="--c:var(--bad)"><b>${s('duplicadas')}</b><span>Fotos repetidas</span></div>
  <div class="tile2"><b>${num(s('supervisiones'))}</b><span>Visitas de supervisión</span></div>
  <div class="tile2" style="--c:var(--warn)"><b>${cont('sinSupervisar')}</b><span>Servidores sin supervisar</span></div></div>
 <div class="filtros barra-ver">${niveles.length>1?`<div class="ver-por"><span class="pf-et">Ver</span><div class="seg">${niveles.map(([k,t])=>`<button class="${R.agrupar===k?'on':''}" onclick="S.sup.agrupar='${k}';pintarSupervision()">${t}</button>`).join('')}</div></div>`:''}
  <select onchange="S.sup.rol=this.value;pintarSupervision()" aria-label="Rol">${roles.map(([k,t])=>`<option value="${k}" ${R.rol===k?'selected':''}>${t}</option>`).join('')}</select>
  <span class="sp"></span><input placeholder="Buscar persona, municipio o región…" value="${esc(R.q||'')}" oninput="S.sup.q=this.value;clearTimeout(S.tq);S.tq=setTimeout(pintarSupervision,250)">
  <select onchange="S.sup.orden=this.value;pintarSupervision()" aria-label="Orden"><option value="">Menor avance primero</option><option value="sospechosas" ${R.orden==='sospechosas'?'selected':''}>Más sospechosas primero</option><option value="nombre" ${R.orden==='nombre'?'selected':''}>Por nombre</option></select>
  <div class="seg"><button class="${R.vista!=='mapa'?'on':''}" onclick="S.sup.vista='tabla';pintarSupervision()">Tabla</button><button class="${R.vista==='mapa'?'on':''}" onclick="S.sup.vista='mapa';pintarSupervision()">${ic('visitas')} Mapa</button></div></div>
 <div class="filtros"><div class="seg">${FILTROS_SUP.map(([k,t])=>`<button class="${R.filtro===k?'on':''}" onclick="S.sup.filtro='${k}';pintarSupervision()">${t}${k?` <small>${cont(k)}</small>`:''}</button>`).join('')}</div></div>
 ${R.vista==='mapa'?`<div class="card"><div class="leyenda-mapa">${leyendaMapa()}</div><div id="mapaSup" class="mapa"></div><p class="sm mute" style="margin-top:8px">${d.puntos.length} puntos con ubicación en el periodo. Toca un punto para ver el detalle.</p></div>`
 :grupos?tablaGrupos(grupos,R.agrupar):tablaPersonasSup(l)}`;
 if(R.vista==='mapa') pintarMapa('mapaSup',d.puntos.filter(p=>!R.rol||(d.personas.find(x=>x.id===p.personaId)||{}).rol===R.rol)).catch(e=>{const m=$('#mapaSup');if(m)m.innerHTML=`<div class="vacio">${esc(e.message)}</div>`});
}
function tablaGrupos(g,clave){const reg=clave==='region';
 return`<p class="sm mute" style="margin:0 0 8px 4px">${g.length} ${reg?'regiones':'municipios y subregiones'} · toca uno para ver ${reg?'sus municipios':'a su gente'}.</p><div class="card tabla"><table class="tr sup"><tr><th>${reg?'Región':'Municipio / subregión'}</th><th>Personas<br><small>con act. / total</small></th><th style="min-width:170px">Avance</th><th>Sin evidencia</th><th>Vencidas</th><th>Evidencias<br><small>✓ ◆ ▲</small></th><th>Repetidas</th><th>Visitas de<br>supervisión</th><th>Servidores<br>supervisados</th></tr>
 ${g.map(x=>`<tr ${x.nombre==='Monitores'?'':`class="clic" title="Ver detalle" onclick="entrarGrupo('${esc(x.nombre)}')"`}><td class="persona-c"><b>${esc(x.nombre)}</b><div class="sm mute">${x.responsable?(reg?'Regional: ':'Enlace: ')+esc(x.responsable):reg?'':esc(x.region||'')}</div></td>
  <td>${num(x.conActividad)} / ${num(x.personas)}</td><td>${x.asignadas?semaforoChip(x.avance)+`<div class="sm mute">${x.conEvidencia} de ${x.exigibles} exigibles</div>`:'<span class="sm mute">Sin actividades</span>'}</td>
  <td>${x.sinEvidencia?`<b style="color:var(--bad)">${x.sinEvidencia}</b>`:0}</td><td>${x.vencidas?`<b style="color:var(--bad)">${x.vencidas}</b>`:0}</td>
  <td class="nowrap"><span class="vn ok">✓${x.evConfiables}</span> <span class="vn warn">◆${x.evRevisar}</span> <span class="vn bad">▲${x.evSospechosas}</span></td>
  <td>${x.duplicadas?`<b style="color:var(--bad)">${x.duplicadas}</b>`:0}</td><td>${num(x.supervisiones)}</td><td>${x.servidores?`${x.snSup} de ${x.servidores}`:'—'}</td></tr>`).join('')||'<tr><td colspan="9" class="vacio">Sin datos con este filtro.</td></tr>'}</table></div>`}
/* Mandos: visitas de supervisión que hicieron · Servidores: cuántas veces los supervisaron */
function celdaSup(p){if(p.rol==='servidor')return p.supervisado?`${p.supervisado} ${p.supervisado===1?'vez':'veces'}<div class="mute">última ${esc(String(p.ultimaSupervision).slice(0,10))}</div>`:'<span style="color:var(--bad)">Sin supervisar</span>';
 return`<b>${p.supervisiones}</b> ${p.supervisiones===1?'visita':'visitas'}${p.supervisionesPlaneadas>p.supervisiones?` <span class="mute">de ${p.supervisionesPlaneadas} planeadas</span>`:''}<div class="mute">${p.snSupervisados} servidores</div>`}
function tablaPersonasSup(l){
 return`<p class="sm mute" style="margin:0 0 8px 4px">${l.length} personas · toca una para ver su ficha completa: actividades, evidencias, supervisión y mapa.</p><div class="card tabla"><table class="tr sup"><tr><th>Persona</th><th>Zona</th><th>Asignadas</th><th style="min-width:170px">Avance</th><th>Evidencias<br><small>✓ ◆ ▲</small></th><th>Repetidas</th><th>Supervisión</th><th>Última evidencia</th></tr>
 ${l.map(p=>`<tr class="clic" title="Ver ficha completa" onclick="verFicha('${p.id}')"><td class="persona-c"><div class="fila">${avatar(p)}<div><b>${esc(p.nombre)}</b><div class="sm mute">${ROL[p.rol]||''}</div></div></div></td>
  <td class="sm">${esc(p.zona||'—')}</td><td>${num(p.asignadas)}${p.vencidas?`<div class="sm" style="color:var(--bad)">${p.vencidas} vencidas</div>`:''}</td>
  <td>${p.asignadas?semaforoChip(p.avance)+`<div class="sm mute">${p.conEvidencia} de ${p.exigibles} exigibles</div>`:'<span class="sm mute">Sin actividades</span>'}</td>
  <td class="nowrap"><span class="vn ok">✓${p.evConfiables}</span> <span class="vn warn">◆${p.evRevisar}</span> <span class="vn bad">▲${p.evSospechosas}</span></td>
  <td>${p.duplicadas?`<b style="color:var(--bad)">${p.duplicadas}</b>`:'0'}</td><td class="sm">${celdaSup(p)}</td>
  <td class="sm nowrap">${p.ultima?esc(p.ultima.slice(0,10)):'<span style="color:var(--bad)">Nunca</span>'}</td></tr>`).join('')||'<tr><td colspan="9" class="vacio">Nadie coincide con este filtro.</td></tr>'}</table></div>`}

/* ── Ficha individual ── */
async function verFicha(id){
 const R=S.sup;modal('<div class="vacio"><span class="carga oscura"></span><p style="margin-top:10px">Cargando ficha…</p></div>',1000);
 try{S.ficha=await api('fichaPersona',{id,desde:R.desde,hasta:R.hasta},120000);S.ficha.tab='actividades';pintarFicha()}
 catch(e){cerrar();toast(e.message)}
}
function pintarFicha(){
 const F=S.ficha,p=F.persona,hoyS=hoy(),acts=F.actividades.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha));
 const exig=acts.filter(a=>!(a.estatus==='Pendiente'&&a.fecha>=hoyS)),con=acts.filter(a=>['Validada','Con evidencia'].includes(a.estatus)).length,av=exig.length?Math.round(con/exig.length*100):null;
 const ev=F.evidencias,n=k=>ev.filter(e=>e.verificacion===k).length,sup=F.supervisiones||[],esSN=p.rol==='servidor';
 const evDe=id=>ev.filter(e=>e.actividadId===id).pop(),puntos=fichaPuntos(F);
 const T=[['actividades',`Actividades (${acts.length})`],['evidencias',`Evidencias (${ev.length})`],['supervision',`${esSN?'Supervisado':'Visitas de supervisión'} (${sup.length})`],['mapa',`Mapa (${puntos.length})`]];
 const enlace=(v,b)=>/^https?:\/\//.test(v)?v:b+String(v).replace(/^@/,'');
 let cuerpo='';
 if(F.tab==='actividades') cuerpo=`<div class="tabla"><table class="tr"><tr><th>Fecha</th><th>Actividad</th><th>Estatus</th><th>Evidencia</th></tr>${acts.map(a=>{const e=evDe(a.id);
  return`<tr><td class="nowrap sm">${fechaTxt(a.fecha)}${horarioTxt(a)?' · '+esc(horarioTxt(a)):''}</td><td><b>${esc(a.titulo)}</b><div class="sm mute">${esc(a.tipo)} · ${esc(a.lugar||'')}</div></td><td>${badge(estado(a))}</td><td>${e?verifBadge(e):'<span class="sm mute">—</span>'}</td></tr>`}).join('')||'<tr><td colspan="5" class="vacio">Sin actividades en el periodo.</td></tr>'}</table></div>`;
 if(F.tab==='evidencias') cuerpo=ev.length?`<div class="grid tarjetas">${ev.slice().sort((a,b)=>Number(a.puntaje||101)-Number(b.puntaje||101)).map(e=>{const a=acts.find(x=>x.id===e.actividadId)||{};return`<div class="card tarea ev-card" style="padding:12px;box-shadow:none;border:1px solid var(--linea)">
  <div class="ev-foto"><img class="foto" loading="lazy" src="${esc(foto(e.fotos.split(' | ')[0]))}" alt="Evidencia" onclick="ampliar(this.src)">${verifBadge(e)}</div>
  ${e.fotos.split(' | ').length>1?`<div class="minis">${e.fotos.split(' | ').slice(1).map(f=>`<img src="${esc(foto(f))}" alt="" onclick="ampliar(this.src)" style="width:52px;height:52px">`).join('')}</div>`:''}
  <h4>${esc(a.titulo||'Actividad')}</h4><div class="fila">${badge(e.validacion)}<span class="sp"></span><span class="sm mute">${esc(e.fecha)}</span></div>
  ${e.comentario?`<p class="sm">${esc(e.comentario)}</p>`:''}${panelVerificacion(e)}
  ${e.validacion==='Por validar'?`<div class="fila"><button class="btn ok ch sp" onclick="validarFicha('${e.id}','Validada',this)">Validar</button><button class="btn bad ch sp" onclick="validarFicha('${e.id}','Rechazada',this)">Rechazar</button></div>`:''}</div>`}).join('')}</div>`:'<div class="vacio">No subió evidencias en el periodo.</div>';
 if(F.tab==='supervision') cuerpo=sup.length?`<div class="tabla"><table class="tr"><tr><th>Fecha</th><th>${esSN?'Lo supervisó':'Visita'}</th><th>Tipo</th>${esSN?'<th>Calificación</th>':''}<th>Estatus</th><th>Acuerdos</th></tr>${sup.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(v=>`<tr><td class="sm nowrap">${fechaTxt(v.fecha)}</td><td><b>${esc(esSN?v.supervisor:v.titulo)}</b>${v.comentario?`<div class="sm mute">${esc(v.comentario)}</div>`:''}</td><td class="sm">${esc(v.tipo||'—')}</td>${esSN?`<td>${v.calificacion?`<span class="cal cal-${normCal(v.calificacion)}">${esc(v.calificacion)}</span>`:'—'}</td>`:''}<td>${badge(estado(v))}</td><td class="sm">${esc(v.acuerdos||'—')}</td></tr>`).join('')}</table></div>`:`<div class="vacio">${esSN?'Nadie ha supervisado a esta persona en el periodo.':'No registró visitas de supervisión en el periodo.'}</div>`;
 if(F.tab==='mapa') cuerpo=`<div class="leyenda-mapa">${leyendaMapa()}</div><div id="mapaFicha" class="mapa"></div>${puntos.length?'':'<p class="sm mute" style="margin-top:8px">Esta persona no tiene evidencias ni visitas con ubicación en el periodo.</p>'}`;
 modal(`<div class="ficha-cab">${avatar(p,'xg')}<div class="sp"><h2 style="margin:0;padding:0">${esc(p.nombre)}</h2><div class="mute">${[ROL[p.rol],p.zona||p.region].filter(Boolean).map(esc).join(' · ')}</div>
  <div class="redes" style="margin-top:6px">${p.telefono?`<a href="tel:${esc(p.telefono)}" title="Llamar">${ic('tel')}</a>`:''}${p.facebook?`<a target="_blank" rel="noopener" href="${esc(enlace(p.facebook,'https://facebook.com/'))}" title="Facebook">${ic('fb')}</a>`:''}${p.instagram?`<a target="_blank" rel="noopener" href="${esc(enlace(p.instagram,'https://instagram.com/'))}" title="Instagram">${ic('ig')}</a>`:''}<span class="sm mute" style="margin-left:6px">${periodoTxt(S.sup)}</span></div></div></div>
 <div class="tiles2 compactos">
  <div class="tile2" style="--c:${SEMAFORO(av).c}"><b>${pctTxt(av)}</b><span>Avance (${con} de ${exig.length})</span></div>
  <div class="tile2"><b>${acts.length}</b><span>Asignadas</span></div>
  <div class="tile2" style="--c:var(--bad)"><b>${acts.filter(a=>estado(a)==='Vencida').length}</b><span>Vencidas</span></div>
  <div class="tile2" style="--c:var(--ok)"><b>${n('Confiable')}</b><span>Evid. confiables</span></div>
  <div class="tile2" style="--c:var(--bad)"><b>${n('Sospechosa')}</b><span>Evid. sospechosas</span></div>
  <div class="tile2"><b>${sup.filter(v=>['Con evidencia','Validada'].includes(v.estatus)).length}</b><span>${esSN?'Veces supervisado':'Visitas de supervisión'}</span></div></div>
 <div class="seg" style="margin:6px 0 14px">${T.map(([k,t])=>`<button class="${F.tab===k?'on':''}" onclick="S.ficha.tab='${k}';pintarFicha()">${t}</button>`).join('')}</div>${cuerpo}`,1000);
 if(F.tab==='mapa') pintarMapa('mapaFicha',puntos).catch(e=>{const m=$('#mapaFicha');if(m)m.innerHTML=`<div class="vacio">${esc(e.message)}</div>`});
}
function fichaPuntos(F){const p=F.persona;
 return[...F.evidencias.filter(e=>e.lat).map(e=>{const a=F.actividades.find(x=>x.id===e.actividadId)||{};return{tipo:'evidencia',lat:+e.lat,lng:+e.lng,persona:p.nombre,fecha:e.fecha.slice(0,10),titulo:a.titulo||'Evidencia',estado:e.verificacion||'Sin revisar'}}),
  ]}
function validarFicha(id,v,b){let nota='';if(v==='Rechazada'){nota=prompt('Motivo del rechazo (lo verá quien subió la evidencia):');if(nota===null)return}
 ocupado(b,async()=>{await api('validarEvidencia',{id,validacion:v,nota});const e=S.ficha.evidencias.find(x=>x.id===id);if(e)Object.assign(e,{validacion:v,validadoPor:S.user.nombre,nota});
  const a=S.ficha.actividades.find(x=>e&&x.id===e.actividadId);if(a)a.estatus=v;const g=S.evs.find(x=>x.id===id);if(g)Object.assign(g,{validacion:v,nota});
  toast('Evidencia '+v.toLowerCase());pintarFicha();if(S.sup)S.sup.clave=''})}

/* ── Mapa (OpenStreetMap, sin claves ni cuentas) ── */
const COLOR_PUNTO={Confiable:'#2F7D5D',Revisar:'#A9741A',Sospechosa:'#B3312B','Sin revisar':'#8B737A',visita:'#3B6FB6'};
function leyendaMapa(){return[['Confiable','Evidencia confiable'],['Revisar','Evidencia por revisar'],['Sospechosa','Evidencia sospechosa'],['visita','Visita de supervisión']].map(([k,t])=>`<span><i style="background:${COLOR_PUNTO[k]}"></i>${t}</span>`).join('')}
function cargarLeaflet(){if(window.L)return Promise.resolve();return cargarLeaflet.p=cargarLeaflet.p||new Promise((ok,no)=>{
 const c=document.createElement('link');c.rel='stylesheet';c.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(c);
 const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=ok;s.onerror=()=>{cargarLeaflet.p=null;no(new Error('No se pudo cargar el mapa. Revisa tu conexión.'))};document.head.appendChild(s)})}
async function pintarMapa(idEl,puntos){
 await cargarLeaflet();const el=document.getElementById(idEl);if(!el)return;
 const m=L.map(el,{scrollWheelZoom:false});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(m);
 const capa=[];puntos.forEach(p=>{if(!isFinite(p.lat)||!isFinite(p.lng))return;
  const col=p.tipo==='visita'?COLOR_PUNTO.visita:(COLOR_PUNTO[p.estado]||COLOR_PUNTO['Sin revisar']);
  const mk=L.circleMarker([p.lat,p.lng],{radius:8,color:'#fff',weight:2,fillColor:col,fillOpacity:.92}).addTo(m)
   .bindPopup(`<b>${esc(p.persona)}</b><br>${p.tipo==='visita'?'Visita':'Evidencia'} · ${esc(p.fecha)}<br>${esc(p.titulo)}${p.estado?`<br><i>${esc(p.estado)}</i>`:''}${p.personaId&&$('#supCuerpo')?`<br><a href="#" onclick="verFicha('${p.personaId}');return false">Ver ficha</a>`:''}`);
  capa.push(mk)});
 if(capa.length) m.fitBounds(L.featureGroup(capa).getBounds().pad(.15),{maxZoom:15}); else m.setView([17.99,-92.93],8);
 setTimeout(()=>m.invalidateSize(),150);
}
