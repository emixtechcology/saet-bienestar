/* SAET Bienestar · Subir evidencia y lista de evidencias por validar
   Lo usa: Servidor de la Nación (subir) · Regional y Encargado (revisar) */

function formaEvidencia(id){
 const a=S.acts.find(x=>x.id===id),n=visitasDe(id).length;S.fotos=[];S.geo=null;
 modal(`<h2>Evidencia</h2><p class="mute" style="margin:-8px 0 14px">${esc(a.titulo)}</p>
 <div class="consejo">${ic('evidencias')}<div><b>Toma la foto en el momento, desde aquí.</b><span>El sistema revisa cada foto: si es original de cámara, si coincide con la fecha y el lugar, y si ya se usó antes. Las capturas de pantalla y las fotos reenviadas se marcan para revisión.</span></div></div>
 <div class="campo"><label>Fotos (hasta 4) *</label><div class="fotos-ev" id="eF"></div>
  <div class="fila wrap" style="margin-top:10px"><label class="btn" style="margin:0">${ic('evidencias')} Tomar foto<input type="file" accept="image/*" capture="environment" class="hide" onchange="agregarFotos(this,'camara')"></label>
  <label class="btn sec" style="margin:0">Elegir de galería<input type="file" accept="image/*" multiple class="hide" onchange="agregarFotos(this,'galeria')"></label></div></div>
 <div class="campo"><label>¿Qué se hizo?</label><textarea id="eC" rows="3" placeholder="Describe brevemente el resultado"></textarea></div>
 <p class="sm mute" id="eG" style="margin-bottom:12px">Obteniendo ubicación…</p>
 ${esVisita(a)?`<div class="ia sm" style="margin-bottom:14px">${n?`Llevas <b>${n}</b> ${n===1?'visita registrada':'visitas registradas'} en esta actividad.`:'Aún no registras visitas en esta actividad.'} Las personas visitadas se capturan aparte, en el botón <b>Visitas</b>; puedes añadirlas o corregirlas antes o después de enviar la evidencia.</div>`:''}
 <button class="btn grande" onclick="enviarEvidencia('${id}',this)">Enviar evidencia</button>`,600);
 if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p=>{S.geo=p.coords;const g=$('#eG');if(g)g.textContent='✓ Ubicación registrada'},()=>{const g=$('#eG');if(g)g.innerHTML='<b style="color:var(--warn)">Sin ubicación:</b> activa la ubicación del teléfono para que tu evidencia cuente como confiable.'},{enableHighAccuracy:true,timeout:9000});
 else $('#eG').textContent='';
}
async function agregarFotos(inp,origen){
 for(const f of [...inp.files].slice(0,4-S.fotos.length)){try{S.fotos.push(await prepararFoto(f,origen))}catch(e){toast(e.message)}}
 inp.value='';pintarFotosEv();
}
function pintarFotosEv(){
 const mias=S.evs.filter(e=>e.usuarioId===S.user.id&&e.huellas).flatMap(e=>e.huellas.split(','));
 $('#eF').innerHTML=S.fotos.map((f,i)=>{const m=f.meta,rep=S.fotos.some((g,j)=>j<i&&distHuella(g.meta.hash,m.hash)<=10)||mias.some(h=>distHuella(h,m.hash)<=10);
  const est=rep?['mal','Foto repetida']:(m.exifFecha||m.exifModelo)?['ok','Original de cámara']:['aviso','Sin datos de cámara'];
  return`<figure class="${est[0]}"><img src="${f.dataUrl}" alt="Foto ${i+1}"><figcaption>${est[0]==='ok'?'✓':'!'} ${est[1]}</figcaption><button aria-label="Quitar foto" onclick="S.fotos.splice(${i},1);pintarFotosEv()">${ic('x')}</button></figure>`}).join('')||'<p class="sm mute">Aún no agregas fotos.</p>';
}
function enviarEvidencia(id,b){ocupado(b,async()=>{
 if(!S.fotos.length) throw new Error('Agrega al menos una foto');
 await encolar('subirEvidencia',{id:idNuevo('E'),actividadId:id,fotos:S.fotos.map(f=>f.dataUrl),meta:S.fotos.map(f=>f.meta),comentario:val('eC'),lat:S.geo?String(S.geo.latitude):'',lng:S.geo?String(S.geo.longitude):'',cuando:hoy()+' '+new Date().toTimeString().slice(0,5)});
 cerrar();pintar();toast(DEMO||navigator.onLine?'Evidencia registrada. ¡Gracias!':'Sin señal: la evidencia quedó guardada y se enviará sola al volver la conexión.')})}

function vEvidencias(){
 const f=S.f,q=(f.q||'').toLowerCase(),base=S.evs.filter(e=>(!f.zona||e.zona===f.zona)&&(!q||(e.usuarioNombre+e.comentario).toLowerCase().includes(q)));
 const l=base.filter(e=>(!f.val||e.validacion===f.val)&&(!f.ver||(f.ver==='Duplicada'?String(e.alertas).includes('DUP:'):f.ver==='Sin verificar'?!e.verificacion:e.verificacion===f.ver)))
  .sort((a,b)=>f.orden==='riesgo'?(Number(a.puntaje||101)-Number(b.puntaje||101)):b.fecha.localeCompare(a.fecha));
 const n=k=>base.filter(e=>e.verificacion===k).length,dup=base.filter(e=>String(e.alertas).includes('DUP:')).length;
 const tile=(k,t,v,c)=>`<button class="tile2 ${f.ver===k?'on':''}" style="--c:${c}" onclick="S.f.ver=S.f.ver==='${k}'?'':'${k}';vEvidencias()"><b>${v}</b><span>${t}</span></button>`;
 $('#vista').innerHTML=`<div class="tiles2">${tile('','Evidencias',base.length,'var(--g700)')}${tile('Confiable','Confiables',n('Confiable'),'var(--ok)')}${tile('Revisar','Por revisar',n('Revisar'),'var(--warn)')}${tile('Sospechosa','Sospechosas',n('Sospechosa'),'var(--bad)')}${tile('Duplicada','Fotos repetidas',dup,'var(--bad)')}</div>
 <div class="filtros"><input placeholder="Buscar persona…" value="${esc(f.q||'')}" onchange="S.f.q=this.value;vEvidencias()">
  <select onchange="S.f.val=this.value;vEvidencias()"><option value="">Toda validación</option>${['Por validar','Validada','Rechazada'].map(e=>`<option ${f.val===e?'selected':''}>${e}</option>`).join('')}</select>
  ${S.user.rol!=='encargado'?`<select onchange="S.f.zona=this.value;vEvidencias()"><option value="">Todas las zonas</option>${zonasVisibles().map(z=>`<option ${f.zona===z?'selected':''}>${esc(z)}</option>`).join('')}</select>`:''}
  <select onchange="S.f.orden=this.value;vEvidencias()"><option value="">Más recientes</option><option value="riesgo" ${f.orden==='riesgo'?'selected':''}>Más sospechosas primero</option></select>
  <span class="sp"></span><span class="mute sm">${l.length} evidencias</span></div>
 <div class="grid tarjetas">${l.slice(0,90).map(e=>{const a=S.acts.find(x=>x.id===e.actividadId)||{},al=primeraAlerta(e);return`<div class="card tarea ev-card" style="padding:12px"><div class="ev-foto"><img class="foto" loading="lazy" src="${esc(foto(e.fotos.split(' | ')[0]))}" alt="Evidencia" onclick="ampliar(this.src)">${verifBadge(e)}</div>
  <div class="fila">${badge(e.validacion)}<span class="sp"></span><span class="sm mute">${esc(e.fecha.slice(0,10))}</span></div><h4>${esc(a.titulo||'Actividad')}</h4>
  <div class="meta">${ic('perfil')}${esc(e.usuarioNombre)} · ${esc(e.zona)}</div>${al?`<p class="alerta-ev">! ${esc(al)}</p>`:''}<button class="btn sec" onclick="detalle('${e.actividadId}')">Revisar</button></div>`}).join('')}</div>
 ${l.length?'':'<div class="card vacio">No hay evidencias con estos filtros.</div>'}`;
}
