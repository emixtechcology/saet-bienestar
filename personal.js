/* SAET Bienestar · Personal: altas, aprobaciones, bajas y PIN
   Lo usa: Administrador, Regional y Encargado */

const enlace=(v,base)=>/^https?:\/\//.test(v)?v:base+String(v).replace(/^@/,'');
function tarjetaPersona(p){const yo=S.user,gest=yo.rol==='admin'||(yo.rol==='regional'&&['encargado','monitor','servidor'].includes(p.rol))||(yo.rol==='encargado'&&p.rol==='servidor');
 return`<div class="card persona">${avatar(p,'g')}<h4>${esc(p.nombre)}</h4><div class="fila wrap" style="justify-content:center"><span class="badge">${rolTxt(p)}</span>${p.estatus!=='Activo'?badge(p.estatus):''}</div>
 <div class="sm mute">${esc(p.zona||p.region||'Estatal')}</div>${yo.rol!=='encargado'||gest?`<div class="sm mute">${esc(p.curp)}</div>`:''}
 <div class="redes">${p.telefono?`<a href="tel:${esc(p.telefono)}" title="Llamar">${ic('tel')}</a>`:''}${p.facebook?`<a target="_blank" rel="noopener" href="${esc(enlace(p.facebook,'https://facebook.com/'))}" title="Facebook">${ic('fb')}</a>`:''}${p.instagram?`<a target="_blank" rel="noopener" href="${esc(enlace(p.instagram,'https://instagram.com/'))}" title="Instagram">${ic('ig')}</a>`:''}</div>
 ${gest&&p.id!==yo.id?`<div class="fila wrap" style="justify-content:center;margin-top:4px">${p.estatus==='Pendiente'?`<button class="btn ok ch" onclick="estatusPersona('${p.id}','Activo',this)">Aprobar</button>`:''}
  ${p.estatus==='Activo'?`<button class="btn sec ch" onclick="nuevoPin('${p.id}',this)">Nuevo PIN</button><button class="btn bad ch" onclick="estatusPersona('${p.id}','Baja',this)">Baja</button>`:''}${p.estatus==='Baja'?`<button class="btn sec ch" onclick="estatusPersona('${p.id}','Activo',this)">Reactivar</button>`:''}</div>`:''}</div>`}
function vPersonal(){
 const f=S.f,q=(f.q||'').toLowerCase(),cuenta=r=>S.personal.filter(p=>p.rol===r&&p.estatus==='Activo').length;
 const l=S.personal.filter(p=>p.rol!=='admin'&&(!f.rol||p.rol===f.rol)&&(!f.zona||p.zona===f.zona)&&(!f.est||p.estatus===f.est)&&(!q||(p.nombre+p.curp).toLowerCase().includes(q)))
  .sort((a,b)=>(a.estatus==='Pendiente'?0:1)-(b.estatus==='Pendiente'?0:1)||a.nombre.localeCompare(b.nombre));
 $('#vista').innerHTML=`<div class="grid tiles">${[['regional','Direcciones regionales'],['encargado','Enlaces municipales'],['monitor','Monitores'],['servidor','Servidores de la Nación y UBA']].map(([r,t])=>`<div class="tile"><i>${ic('personal')}</i><div><b>${cuenta(r)}</b><span>${t}</span></div></div>`).join('')}</div>
 ${cajaClaves()}
 <div class="filtros"><input placeholder="Buscar nombre o CURP…" value="${esc(f.q||'')}" onchange="S.f.q=this.value;vPersonal()">
  <select onchange="S.f.rol=this.value;vPersonal()"><option value="">Todos los roles</option>${Object.keys(ROL).slice(1).map(r=>`<option value="${r}" ${f.rol===r?'selected':''}>${ROL[r]}</option>`).join('')}</select>
  ${S.user.rol!=='encargado'?`<select onchange="S.f.zona=this.value;vPersonal()"><option value="">Todas las zonas</option>${zonasVisibles().map(z=>`<option ${f.zona===z?'selected':''}>${esc(z)}</option>`).join('')}</select>`:''}
  <select onchange="S.f.est=this.value;vPersonal()"><option value="">Todo estatus</option>${['Activo','Pendiente','Baja'].map(e=>`<option ${f.est===e?'selected':''}>${e}</option>`).join('')}</select><span class="sp"></span>
  <button class="btn sec" onclick="excel('Personal',this)">${ic('reportes')}Excel</button>${S.user.rol!=='encargado'?`<button class="btn" onclick="formaPersona()">${ic('mas')}Agregar</button>`:''}</div>
 <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">${l.slice(0,200).map(tarjetaPersona).join('')}</div>${l.length?'':'<div class="card vacio">Sin resultados.</div>'}`;
}
function estatusPersona(id,estatus){const p=persona(id);if(!p)return;p.estatus=estatus;pintar();toast(estatus==='Activo'?'Persona activada':'Persona dada de baja');fondo(api('guardarPersona',{id,estatus}))}
function mostrarPin(r){modal(`<h2>Acceso generado</h2><p>Comparte estos datos con la persona. Podrá cambiar su PIN en “Mi perfil”.</p>
 <div class="ia" style="margin-top:14px;text-align:center"><div class="sm mute">Usuario</div><b style="font-size:18px">${esc(r.usuario)}</b><div class="sm mute" style="margin-top:8px">PIN</div><b class="serif" style="font-size:34px;letter-spacing:.2em;color:var(--g700)">${esc(r.pin)}</b></div>`,400)}
function nuevoPin(id,b){ocupado(b,async()=>mostrarPin(await api('resetPin',{id})))}
function formaPersona(){
 const adm=S.user.rol==='admin',roles=adm?['regional','encargado','monitor','servidor','admin']:['encargado','monitor','servidor'],regiones=[...new Set(S.zonas.map(z=>z.region))];
 const zonas=S.zonas.filter(z=>adm||z.region===S.user.region);
 modal(`<h2>Agregar persona</h2><div class="dos"><div class="campo"><label>Cargo *</label><select id="pR" onchange="rolForma(this.value)">${roles.map(r=>`<option value="${r}">${ROL[r]}</option>`).join('')}</select></div>
 <div class="campo hide" id="pGc"><label>Región *</label><select id="pG">${regiones.map(r=>`<option>${esc(r)}</option>`).join('')}</select></div>
 <div class="campo" id="pZc"><label>Municipio o subregión *</label><select id="pZ"><option value="">—</option>${zonas.map(z=>`<option>${esc(z.zona)}</option>`).join('')}</select></div></div>
 <div class="campo hide" id="pPc"><label>Puesto</label><select id="pP"><option value="">Servidor de la Nación</option><option value="UBA">UBA</option></select></div>
 <div class="campo"><label>Nombre completo *</label><input id="pN"></div><div class="dos"><div class="campo"><label>CURP (será su usuario) *</label><input id="pC" maxlength="18" style="text-transform:uppercase"></div><div class="campo"><label>Teléfono</label><input id="pT"></div></div>
 <div class="campo"><label>Correo</label><input id="pE"></div><p class="sm mute" style="margin-bottom:12px" id="pAy">El sistema genera un PIN para entregárselo. Los servidores de la nación también pueden registrarse solos desde la pantalla de acceso.</p>
 <button class="btn" style="width:100%" onclick="guardarPersona(this)">Guardar</button>`);
 rolForma(roles[0]);
}
/* Qué datos pide cada cargo: regional y monitor → región; enlace, servidor y UBA → municipio */
function rolForma(r){const adm=S.user.rol==='admin';
 $('#pGc').classList.toggle('hide',!(adm&&['regional','monitor'].includes(r)));$('#pZc').classList.toggle('hide',!['encargado','servidor'].includes(r));$('#pPc').classList.toggle('hide',r!=='servidor');
 $('#pAy').textContent=r==='monitor'?'El monitor supervisa a los servidores de su región y registra sus visitas de supervisión. El sistema genera su PIN.':'El sistema genera un PIN para entregárselo. Los servidores de la nación también pueden registrarse solos desde la pantalla de acceso.'}
function guardarPersona(b){ocupado(b,async()=>{if(!val('pN')) throw new Error('Escribe el nombre');
 const rol=val('pR'),r=await api('guardarPersona',{rol,region:S.user.rol==='admin'?val('pG'):S.user.region,zona:['encargado','servidor'].includes(rol)?val('pZ'):'',puesto:val('pP'),nombre:val('pN'),curp:val('pC'),telefono:val('pT'),correo:val('pE')});S.personal.push(r.persona);pintar();mostrarPin(r)})}

/* Claves de registro por municipio o subregión: el encargado ve la suya; regional y admin, las de su alcance */
function cajaClaves(){
 const l=S.claves;if(!l.length)return'';
 const fila=z=>`<div class="fila clave"><div class="sp"><b>${esc(z.zona)}</b>${S.user.rol==='admin'?`<div class="sm mute">${esc(z.region)}</div>`:''}</div><code>${esc(z.clave)}</code>
  <button class="btn sec ch" onclick="copiarClave('${esc(z.clave)}','${esc(z.zona)}')">Copiar</button><button class="btn sec ch" onclick="cambiarClave('${esc(z.zona)}',this)">Cambiar</button></div>`;
 const ayuda='<p class="sm mute" style="margin:0 0 10px">Compártela con los servidores de la nación junto con el enlace de la app. Al registrarse con ella quedan en ese municipio o subregión, pendientes de tu aprobación. Si se filtra, cámbiala: la anterior deja de servir.</p>';
 if(l.length===1) return`<div class="ia" style="margin-bottom:16px"><h3 class="serif" style="font-size:16px;margin-bottom:6px">Clave de registro</h3>${ayuda}${fila(l[0])}</div>`;
 return`<details class="ia" style="margin-bottom:16px"><summary class="serif" style="font-size:16px;cursor:pointer">Claves de registro por municipio o subregión (${l.length})</summary><div style="margin-top:10px">${ayuda}${l.map(fila).join('')}</div></details>`;
}
function copiarClave(c,zona){const t=`Registro en ${NOMBRE} (${zona})\nEnlace: ${location.href.split('#')[0]}\nClave: ${c}`;
 (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Copiado: enlace y clave listos para enviar'),()=>prompt('Copia este texto:',t))}
function cambiarClave(zona,b){if(!confirm('¿Generar una clave nueva para '+zona+'? La actual dejará de servir para registrarse.'))return;
 ocupado(b,async()=>{const r=await api('nuevaClaveZona',{zona});const z=S.claves.find(x=>x.zona===zona);if(z)z.clave=r.clave;toast('Nueva clave para '+zona+': '+r.clave);
  const abierto=!!document.querySelector('details.ia[open]');vPersonal();if(abierto){const d=document.querySelector('details.ia');if(d)d.open=true}})}
