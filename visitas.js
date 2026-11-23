/* SAET Bienestar · Visitas: añadir, corregir y eliminar, una por una
   Lo usa: Servidor de la Nación (registrar) · Regional y Encargado (consultar) */

const esVisita=a=>!!a&&a.tipo.startsWith('Visita');
const visitasDe=id=>S.vis.filter(v=>v.actividadId===id);
const actDe=v=>S.acts.find(a=>a.id===v.actividadId);
/* Una visita se puede corregir mientras su actividad no esté validada */
const editable=v=>v.servidorId===S.user.id&&(!v.actividadId||(actDe(v)&&actDe(v).estatus!=='Validada'));
const filaVisita=(v,i,desde)=>`<div class="vis"><span class="n">${i+1}</span><div class="sp"><div class="t" style="font-weight:700">${esc(v.nombre)}</div><div class="sm mute">${esc([v.localidad,v.programa,v.resultado].filter(Boolean).join(' · '))}</div></div>
 ${editable(v)?`<button class="btn sec ch" onclick="formaVisita('${v.id}','${desde}')">Editar</button><button class="btn bad ch" onclick="quitarVisita('${v.id}','${desde}')" aria-label="Eliminar visita de ${esc(v.nombre)}">${ic('x')}</button>`:''}</div>`;

function vVisitas(){
 const q=(S.f.q||'').toLowerCase(),l=S.vis.filter(v=>!q||(v.nombre+v.localidad+v.servidorNombre+v.programa).toLowerCase().includes(q)).sort((a,b)=>b.fecha.localeCompare(a.fecha));
 const puede=S.user.rol!=='admin';
 $('#vista').innerHTML=`<div class="filtros"><input placeholder="Buscar nombre, localidad, programa…" value="${esc(S.f.q||'')}" onchange="S.f.q=this.value;vVisitas()"><span class="sp"></span><span class="mute sm">${l.length} ${l.length===1?'persona':'personas'}</span>
  ${jefe()?`<button class="btn sec" onclick="excel('Visitas',this)">${ic('reportes')}Excel</button>`:''}${puede?`<button class="btn" onclick="formaVisita('','')">${ic('mas')}Añadir visita</button>`:''}</div>
 ${jefe()?`<div class="card tabla"><table><tr><th>Fecha</th><th>Persona visitada</th><th>Localidad</th><th>Programa</th><th>Resultado</th><th>Registró</th><th></th></tr>
 ${l.slice(0,300).map(v=>`<tr><td class="sm">${esc(v.fecha)}</td><td><b>${esc(v.nombre)}</b><br><span class="sm mute">${esc(v.telefono)}</span></td><td>${esc(v.localidad)}<br><span class="sm mute">${esc(v.zona)}</span></td><td>${esc(v.programa)}</td><td>${esc(v.resultado)}</td><td class="sm">${esc(v.servidorNombre)}</td><td>${editable(v)?`<button class="btn sec ch" onclick="formaVisita('${v.id}','')">Editar</button>`:''}</td></tr>`).join('')||'<tr><td colspan="7" class="vacio">Aún no hay visitas registradas.</td></tr>'}</table></div>`
 :`<div style="max-width:720px">${l.slice(0,300).map((v,i)=>filaVisita(v,l.length-1-i,'')).join('')||`<div class="card vacio">Aún no registras visitas.<br><br><button class="btn" onclick="formaVisita('','')">${ic('mas')}Añadir mi primera visita</button></div>`}</div>`}`;
}

/* Lista de visitas de una actividad: añadir, corregir, eliminar */
function listaVisitas(actId){
 const a=S.acts.find(x=>x.id===actId);if(!a)return;const l=visitasDe(actId);
 modal(`<h2>Visitas</h2><p class="mute" style="margin:-8px 0 14px">${esc(a.titulo)} · ${fechaTxt(a.fecha)}</p>
 ${l.map((v,i)=>filaVisita(v,i,actId)).join('')||'<div class="vacio" style="padding:18px">Aún no hay visitas en esta actividad.</div>'}
 ${a.estatus!=='Validada'?`<button class="btn grande" style="margin-top:8px" onclick="formaVisita('','${actId}')">${ic('mas')}${l.length?'Añadir otra visita':'Añadir visita'}</button>`:'<p class="sm mute">La actividad ya fue validada; sus visitas quedaron cerradas.</p>'}
 ${['Pendiente','Rechazada'].includes(a.estatus)?`<button class="btn sec grande" style="margin-top:8px" onclick="formaEvidencia('${actId}')">${ic('evidencias')}Ya terminé: subir evidencia</button>`:''}`,560);
}

/* Formulario de una visita (nueva o corrección). "desde" = actividad desde la que se abrió, para volver a su lista */
function formaVisita(id,desde,previa){
 const v=id?S.vis.find(x=>x.id===id):null,p=v||previa||{},actId=v?v.actividadId:(desde||p.actividadId||'');
 if(!id&&navigator.geolocation) navigator.geolocation.getCurrentPosition(g=>{S.geoVis={lat:String(g.coords.latitude),lng:String(g.coords.longitude),t:Date.now()}},()=>{},{enableHighAccuracy:true,timeout:9000,maximumAge:120000});
 const mias=S.acts.filter(a=>a.asignadoA===S.user.id&&a.estatus!=='Validada').sort((a,b)=>(esVisita(b)-esVisita(a))||b.fecha.localeCompare(a.fecha));
 const c=(k,et,extra='')=>`<div class="campo"><label for="v_${k}">${et}</label><input id="v_${k}" value="${esc(v?v[k]:'')}" ${extra}></div>`;
 S.vf={id:v?v.id:'',desde:desde||''};
 modal(`<h2>${v?'Corregir visita':'Nueva visita'}</h2><p class="mute sm" style="margin:-8px 0 4px">Solo el nombre es obligatorio. Podrás corregirla después.</p>
 <div class="paso"><i>1</i>¿A quién visitaste?</div>
 ${c('nombre','Nombre completo *','autocomplete="off"')}<div class="dos">${c('telefono','Teléfono','inputmode="tel"')}${c('curp','CURP (si la tiene a la mano)','maxlength="18" style="text-transform:uppercase"')}</div>
 <div class="paso"><i>2</i>¿Dónde?</div>
 <div class="dos"><div class="campo"><label for="v_localidad">Localidad o colonia</label><input id="v_localidad" value="${esc(p.localidad||'')}"></div>${c('domicilio','Domicilio')}</div>
 <div class="paso"><i>3</i>¿Sobre qué programa?</div>
 <div class="dos"><div class="campo"><label for="v_programa">Programa</label><select id="v_programa">${PROGRAMAS.map(x=>`<option ${p.programa===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="campo"><label for="v_motivo">Motivo de la visita</label><input id="v_motivo" value="${esc(p.motivo||'')}"></div></div>
 <div class="paso"><i>4</i>¿Cómo te fue?</div>
 <div class="opc" style="margin-bottom:12px">${RESULTADOS.map((x,i)=>`<label><input type="radio" name="v_res" value="${x}" ${(v?v.resultado===x:i===0)?'checked':''}><span>${x}</span></label>`).join('')}</div>
 ${c('observaciones','Observaciones')}
 <div class="campo"><label for="v_act">Corresponde a la actividad</label><select id="v_act"><option value="">Visita sin actividad asignada</option>${mias.map(a=>`<option value="${a.id}" ${a.id===actId?'selected':''}>${fechaTxt(a.fecha)} · ${esc(a.titulo)}</option>`).join('')}</select></div>
 <button class="btn grande" onclick="guardarVisita(this,false)">${v?'Guardar cambios':'Guardar visita'}</button>
 ${v?'':`<button class="btn sec grande" style="margin-top:8px" onclick="guardarVisita(this,true)">${ic('mas')}Guardar y añadir otra</button>`}`,600);
 setTimeout(()=>{const n=$('#v_nombre');if(n&&!v)n.focus()},50);
}
function guardarVisita(b,otra){ocupado(b,async()=>{
 const d={id:S.vf.id||idNuevo('V'),actividadId:val('v_act'),resultado:(document.querySelector('[name=v_res]:checked')||{}).value||''};
 ['nombre','telefono','curp','localidad','domicilio','programa','motivo','observaciones'].forEach(k=>d[k]=val('v_'+k));
 if(!d.nombre) throw new Error('Escribe el nombre de la persona visitada');
 if(!S.vis.some(x=>x.id===d.id)&&S.geoVis&&Date.now()-S.geoVis.t<600000){d.lat=S.geoVis.lat;d.lng=S.geoVis.lng}   // dónde se registró (solo al crearla)
 await encolar('guardarVisita',d);
 const n=d.actividadId?visitasDe(d.actividadId).length:0;
 toast((S.vf.id?'Visita corregida':'Visita guardada')+(n?` · llevas ${n} en esta actividad`:''));
 if(otra) return formaVisita('',S.vf.desde,{actividadId:d.actividadId,localidad:d.localidad,programa:d.programa,motivo:d.motivo});
 pintar();S.vf.desde?listaVisitas(S.vf.desde):cerrar()})}
async function quitarVisita(id,desde){const v=S.vis.find(x=>x.id===id);if(!v||!confirm('¿Eliminar la visita de '+v.nombre+'?'))return;
 try{await encolar('eliminarVisita',{id});toast('Visita eliminada');pintar();if(desde)listaVisitas(desde)}catch(e){toast(e.message)}}
