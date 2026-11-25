/* SAET Bienestar · Núcleo: estado, utilidades, conexión con el servidor, cola sin señal y menú
   Lo usa: todas las pantallas */

/* Estado de la app en memoria */
const S = {user:null,token:null,zonas:[],personal:[],acts:[],evs:[],vis:[],vista:'inicio',semana:null,rango:null,f:{},tab:'Pendientes',cola:[],claves:[]};
const LOGO = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E %3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%238A1F45%22/%3E%3Cstop offset=%221%22 stop-color=%22%234F0E25%22/%3E%3C/linearGradient%3E%3C/defs%3E %3Crect width=%2264%22 height=%2264%22 rx=%2218%22 fill=%22url%28%23g%29%22/%3E %3Cg fill=%22none%22 stroke=%22%23EBDDC3%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E %3Cpath d=%22M32 52V31%22 stroke-width=%224.5%22/%3E %3Cpath d=%22M32 36c0-9-9-8-16-15M32 33c-1-8-5-12-8-19M32 32V11M32 33c1-8 5-12 8-19M32 36c0-9 9-8 16-15%22 stroke-width=%222.6%22/%3E %3Cpath d=%22M21 52h22%22 stroke-width=%222.6%22/%3E %3C/g%3E %3Cg fill=%22%23C9A56A%22%3E%3Ccircle cx=%2216%22 cy=%2221%22 r=%223.6%22/%3E%3Ccircle cx=%2224%22 cy=%2213.5%22 r=%223.6%22/%3E%3Ccircle cx=%2232%22 cy=%2210.5%22 r=%223.6%22/%3E%3Ccircle cx=%2240%22 cy=%2213.5%22 r=%223.6%22/%3E%3Ccircle cx=%2248%22 cy=%2221%22 r=%223.6%22/%3E%3C/g%3E %3C/svg%3E ";
const $ = (s,r=document)=>r.querySelector(s);
const val = id => ($('#'+id)?.value||'').trim();
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso = d => new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const mas = (d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const lunes = d=>{const x=new Date(d);x.setHours(12,0,0,0);return mas(x,-((x.getDay()+6)%7))};
const hoy = ()=>iso(new Date());
const fechaTxt = s=>{const d=new Date(s.slice(0,10)+'T12:00');return d.toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short'})};
const jefe = ()=>['admin','regional','encargado'].includes(S.user.rol);
const estado = a => a.estatus==='Pendiente'&&a.fecha<hoy()?'Vencida':a.estatus;
const cls = s=>String(s).replace(/\s/g,'');
const badge = s=>`<span class="badge b-${cls(s)}">${esc(s)}</span>`;
const iniciales = n=>String(n||'?').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const foto = u=>{if(!u||u.startsWith('data:'))return u;const m=u.match(/\/d\/([\w-]+)/);return m?`https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000`:u};
const avatar = (p,c='')=>p&&p.selfie?`<img class="av ${c}" src="${esc(foto(p.selfie))}" alt="" onclick="ampliar(this.src)">`:`<span class="av ${c}">${esc(iniciales(p&&p.nombre))}</span>`;
const persona = id=>S.personal.find(p=>p.id===id);
const P = {
 inicio:'<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
 agenda:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 tareas:'<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/>',
 evidencias:'<rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/>',
 visitas:'<path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.500C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>',
 personal:'<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c.6-3.600 3.200-5.500 6.500-5.500s5.900 1.900 6.500 5.500M16 4.800a3.500 3.500 0 010 6.400M18 14.800c2 .7 3.200 2.400 3.600 5.200"/>',
 monitores:'<path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 reportes:'<path d="M12 3v12m0 0l-4.500-4.500M12 15l4.500-4.500M4 19h16"/>',
 carga:'<path d="M12 16V4m0 0L7.500 8.500M12 4l4.500 4.500M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"/>',
 supervision:'<circle cx="11" cy="11" r="6.500"/><path d="M20 20l-4.300-4.300M8.500 11l1.800 1.800 3.400-3.600"/>',
 ia:'<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800zM19 16l.8 2.200L22 19l-2.200.8L19 22l-.8-2.200L16 19l2.200-.8z"/>',
 perfil:'<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.200 2 8 6"/>',
 salir:'<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 16l-4-4 4-4M6 12h10"/>',
 mas:'<path d="M12 5v14M5 12h14"/>', menu:'<path d="M4 7h16M4 12h16M4 17h10"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
 izq:'<path d="M15 5l-7 7 7 7"/>', der:'<path d="M9 5l7 7-7 7"/>', reloj:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 fb:'<path d="M14 8h3V4h-3a4 4 0 00-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>', ig:'<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.500"/><circle cx="17" cy="7" r=".6"/>',
 tel:'<path d="M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"/>'
};
const ic = n=>`<svg class="ic" viewBox="0 0 24 24">${P[n]||''}</svg>`;
const CEIBA = '<path d="M32 60V31M32 36c0-9-9-8-16-15M32 33c-1-8-5-12-8-19M32 32V11M32 33c1-8 5-12 8-19M32 36c0-9 9-8 16-15"/><circle cx="16" cy="21" r="3"/><circle cx="24" cy="13.500" r="3"/><circle cx="32" cy="10.500" r="3"/><circle cx="40" cy="13.500" r="3"/><circle cx="48" cy="21" r="3"/>';

/* Horarios: una actividad puede tener uno o varios bloques en el mismo día */
const bloquesDe=a=>{const h=String(a.horarios||'');if(h)return h.split('|').map(x=>{const[i,f]=x.split('-');return{inicio:i||'',fin:f||''}}).filter(b=>b.inicio);return a.hora?[{inicio:a.hora,fin:a.horaFin||''}]:[]};
const horarioTxt=a=>bloquesDe(a).map(b=>b.fin?b.inicio+'–'+b.fin:b.inicio).join(' y ');
const HORAS=Array.from({length:35},(_,i)=>{const m=360+i*30;return String(Math.floor(m/60)).padStart(2,'0')+':'+(m%60?'30':'00')});
function editorHorarios(id,bloques){S.edH=S.edH||{};S.edH[id]=bloques&&bloques.length?bloques.map(b=>({...b})):[{inicio:'',fin:''}];return`<div id="${id}" class="horarios">${filasHorario(id)}</div>`}
function filasHorario(id){const l=S.edH[id];return l.map((b,i)=>`<div class="hfila"><input type="time" step="900" value="${b.inicio}" aria-label="Inicio" onchange="S.edH['${id}'][${i}].inicio=this.value"><span>a</span><input type="time" step="900" value="${b.fin}" aria-label="Fin" onchange="S.edH['${id}'][${i}].fin=this.value">${l.length>1?`<button class="x" aria-label="Quitar horario" onclick="S.edH['${id}'].splice(${i},1);$('#${id}').innerHTML=filasHorario('${id}')">${ic('x')}</button>`:''}</div>`).join('')+(l.length<6?`<button class="btn sec ch" onclick="S.edH['${id}'].push({inicio:'',fin:''});$('#${id}').innerHTML=filasHorario('${id}')">${ic('mas')} Agregar otro horario</button>`:'')}
function leerHorarios(id){const l=(S.edH[id]||[]).filter(b=>b.inicio||b.fin).map(b=>({inicio:b.inicio,fin:b.fin})).sort((a,b)=>a.inicio.localeCompare(b.inicio));
 l.forEach((b,i)=>{if(!b.inicio)throw new Error('Falta la hora de inicio de un horario');if(b.fin&&b.fin<=b.inicio)throw new Error(`La hora de fin (${b.fin}) debe ser después del inicio (${b.inicio})`);
  const a=l[i-1];if(a&&(a.fin?b.inicio<a.fin:b.inicio===a.inicio))throw new Error(`Los horarios se enciman: ${a.inicio} y ${b.inicio}`)});return l}
/* Fechas que genera "Repetir": desde la fecha elegida hasta el viernes (o domingo) de esa misma semana */
function fechasRepetir(f,rep){const d=new Date(f+'T12:00'),dia=(d.getDay()+6)%7,hasta=rep==='lv'?4:rep==='semana'?6:dia,out=[];for(let i=dia;i<=Math.max(dia,hasta);i++)out.push(iso(mas(d,i-dia)));return out}
/* Lista con opción "Otra/Otro": al elegirla se abre un cuadro para escribir cuál */
const esOtra=v=>/^otr[ao]$/i.test(String(v||'').trim());
function selectConOtra(id,opciones,actual,pregunta,ejemplo){
 const otra=opciones.find(esOtra)||'Otra',libre=actual&&!opciones.includes(actual);
 return`<select id="${id}" onchange="const c=document.getElementById('${id}_c');c.classList.toggle('hide',!esOtra(this.value));if(esOtra(this.value))document.getElementById('${id}_o').focus()">${opciones.map(x=>`<option ${(libre?x===otra:x===actual)?'selected':''}>${esc(x)}</option>`).join('')}</select>
 <div id="${id}_c" class="otra-caja ${libre||esOtra(actual)?'':'hide'}"><label for="${id}_o">${esc(pregunta)} *</label><input id="${id}_o" maxlength="60" value="${libre?esc(actual):''}" placeholder="${esc(ejemplo||'')}"></div>`}
function valOtra(id,mensaje){const v=val(id);if(!esOtra(v))return v;const o=val(id+'_o');if(!o)throw new Error(mensaje);return o.charAt(0).toUpperCase()+o.slice(1)}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.remove('hide');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.add('hide'),3800)}
function ampliar(src){$('#luz img').src=src;$('#luz').classList.remove('hide')}
function modal(html,ancho){$('#modal').innerHTML=`<div class="caja" style="max-width:${ancho||560}px"><button class="cerrar" onclick="cerrar()" aria-label="Cerrar">${ic('x')}</button>${html}</div>`;$('#modal').classList.remove('hide')}
function cerrar(){$('#modal').classList.add('hide');$('#modal').innerHTML=''}
async function ocupado(btn,f){const h=btn&&btn.innerHTML;if(btn){btn.disabled=true;btn.innerHTML='<span class="carga"></span> Un momento…'}
 try{await f()}catch(e){if(e.message==='SESION'){salir();toast('Tu sesión terminó. Entra de nuevo.')}else toast(e.message||'Ocurrió un error')}
 finally{if(btn&&btn.isConnected){btn.disabled=false;btn.innerHTML=h}}}
function comprimir(file,max=1280,q=.72){return new Promise((ok,no)=>{const img=new Image(),url=URL.createObjectURL(file);
 img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=img.width*k;c.height=img.height*k;
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);ok(c.toDataURL('image/jpeg',q))};
 img.onerror=()=>no(new Error('No se pudo leer la imagen'));img.src=url})}

/* Llamada al servidor con reintentos.
   Si Google está saturado (más de 30 peticiones al mismo tiempo) o el servidor está ocupado, espera unos segundos
   y vuelve a intentar sola, sin mostrar error. Cada petición lleva un identificador (rid): si llega dos veces,
   el servidor devuelve la respuesta de la primera y no guarda nada doble. */
const ESPERAS=[1500,3000,6000,10000,15000];let avisoDemanda=0;
const dormir=ms=>new Promise(r=>setTimeout(r,ms));
async function api(accion,datos={},ms=45000,rid){
 if(DEMO) return demoApi(accion,datos);
 rid=rid||('R'+Date.now().toString(36)+Math.random().toString(36).slice(2,10));
 for(let intento=0;;intento++){
  let j=null,falla='';const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),ms);
  try{const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({accion,token:S.token,datos,rid}),signal:ctl.signal});
   const tx=await r.text();try{j=JSON.parse(tx)}catch(e){falla='saturado'}}       // Google responde una página de error cuando se satura
  catch(e){falla=e.name==='AbortError'?'lento':'red'}
  finally{clearTimeout(t)}
  if(j&&!j.ok&&j.reintentar)falla='ocupado';
  if(!falla){if(!j.ok)throw new Error(j.error);return j.data}
  const max=falla==='saturado'||falla==='ocupado'?ESPERAS.length:2;
  if(intento<max&&!(falla==='red'&&navigator.onLine===false)){
   if(intento===1&&Date.now()-avisoDemanda>30000&&falla!=='red'){avisoDemanda=Date.now();try{toast('Hay mucha gente conectada. Seguimos intentando…')}catch(e){}}
   await dormir(ESPERAS[intento]*(0.6+Math.random()*0.8));continue}
  const x=new Error(falla==='red'||falla==='lento'?'Sin conexión con el servidor. Revisa tu señal e intenta de nuevo.':'El sistema tiene mucha demanda en este momento. Intenta de nuevo en un minuto.');
  x.red=true;x.temporal=true;throw x;
 }
}
const rangoDe=c=>({desde:iso(mas(c,-49)),hasta:iso(mas(c,56))});
/* Recibe los datos del servidor, los deja en memoria y guarda copia local para que la app abra al instante. */
function aplicar(d){
 Object.assign(S,{user:d.usuario,zonas:d.zonas,personal:d.personal,acts:d.actividades,evs:d.evidencias,vis:d.visitas,claves:d.claves||[]});
 try{localStorage.setItem('ceiba_c',JSON.stringify({r:S.rango,d}))}catch(e){try{localStorage.removeItem('ceiba_c')}catch(_){}}
 aplicarCola();
}
async function cargar(centro){const r=rangoDe(centro||S.semana||lunes(new Date())),d=await api('datos',r);S.rango=r;aplicar(d)}
async function refrescar(){await cargar();pintar()}
/* Actualización silenciosa en segundo plano: no interrumpe si hay una ventana abierta o se está escribiendo. */
let sincronizando=false;
async function sync(){
 if(!S.user||sincronizando) return; sincronizando=true;
 try{await cargar();const ae=document.activeElement;if(S.user&&$('#modal').classList.contains('hide')&&!(ae&&/INPUT|SELECT|TEXTAREA/.test(ae.tagName)))pintar()}
 catch(e){if(e.message==='SESION'){salir();toast('Tu sesión terminó. Entra de nuevo.')}}
 finally{sincronizando=false}
}
/* Para acciones que se aplican primero en pantalla y luego se confirman en el servidor. */
const fondo=p=>p.then(()=>{},e=>{toast(e.message==='SESION'?'Tu sesión terminó. Entra de nuevo.':e.message);e.message==='SESION'?salir():sync()});

/* ── Cola de evidencias: si no hay señal se guardan en el teléfono y se envían solas ── */
const cola={db:null,
 abrir(){return this.db||(this.db=new Promise((ok,no)=>{const r=indexedDB.open('ceiba',1);r.onupgradeneeded=()=>r.result.createObjectStore('cola',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}))},
 async op(modo,f){const db=await this.abrir();return new Promise((ok,no)=>{const tx=db.transaction('cola',modo),q=f(tx.objectStore('cola'));tx.oncomplete=()=>ok(q&&q.result);tx.onerror=tx.onabort=()=>no(tx.error)})},
 poner(x){return this.op('readwrite',s=>s.put(x))},quitar(id){return this.op('readwrite',s=>s.delete(id))},todos(){return this.op('readonly',s=>s.getAll())}};
const miCola=()=>S.user?S.cola.filter(x=>x.uid===S.user.id&&x.accion).sort((a,b)=>a.t-b.t):[];
/* Refleja en pantalla lo que aún está en camino al servidor */
function aplicarCola(){miCola().forEach(x=>{const d=x.datos;
 if(x.accion==='subirEvidencia'){const a=S.acts.find(y=>y.id===d.actividadId);
  if(!a||S.evs.some(e=>e.id===d.id)||!['Pendiente','Rechazada'].includes(a.estatus)) return;
  a.estatus='Con evidencia';
  S.evs.push({id:d.id,actividadId:a.id,usuarioId:S.user.id,usuarioNombre:S.user.nombre,region:a.region,zona:a.zona,fecha:d.cuando,fotos:d.fotos.join(' | '),comentario:d.comentario,lat:d.lat,lng:d.lng,validacion:'Por validar',validadoPor:'',nota:'',ia:''})}
 if(x.accion==='guardarVisita'){const i=S.vis.findIndex(v=>v.id===d.id),a=S.acts.find(y=>y.id===d.actividadId);
  const base=i>-1?S.vis[i]:{evidenciaId:'',servidorId:S.user.id,servidorNombre:S.user.nombre,fecha:hoy()};
  const n={...base,...d,region:a?a.region:S.user.region,zona:a?a.zona:S.user.zona};i>-1?S.vis[i]=n:S.vis.push(n)}
 if(x.accion==='eliminarVisita') S.vis=S.vis.filter(v=>v.id!==d.id)})}
function pintarCola(){const el=$('#colaInd');if(!el)return;const n=miCola().length;el.textContent=n+' por enviar';el.classList.toggle('hide',!n)}
const idNuevo=p=>(p+Date.now().toString(36)+Math.random().toString(36).slice(2,10)).toUpperCase();
/* Guarda una acción en el teléfono, la muestra de inmediato y la manda al servidor en cuanto hay señal */
async function encolar(accion,datos){
 if(DEMO){await api(accion,datos);await cargar();return}
 const x={id:idNuevo('Q'),uid:S.user.id,t:Date.now(),accion,datos};
 try{await cola.poner(x)}catch(e){await api(accion,datos,120000);await cargar();return}   // sin almacenamiento local: envío directo
 S.cola.push(x);aplicarCola();procesarCola();
}
let enviando=false;
async function procesarCola(){
 if(DEMO||enviando||!S.user) return; enviando=true;let enviadas=0,sinRed=false;
 try{S.cola=await cola.todos();
  if(miCola().length){aplicarCola();if($('#modal').classList.contains('hide'))pintar()}
  for(const x of miCola()){
   try{await api(x.accion,x.datos,120000,x.id);await cola.quitar(x.id);enviadas++}
   catch(e){if(e.red){sinRed=true;break} if(e.message==='SESION') throw e; await cola.quitar(x.id);toast('No se pudo guardar: '+e.message);enviadas++}
  }
  S.cola=await cola.todos();
  if(enviadas&&!miCola().length){toast('Guardado en el servidor ✓');await sync()}
  pintarCola();
 }catch(e){if(e.message==='SESION'){salir();toast('Tu sesión terminó. Entra de nuevo; lo que capturaste sigue guardado en este teléfono.')}}
 finally{enviando=false}
 if(!sinRed&&S.user&&miCola().length) setTimeout(procesarCola,60);     // llegó algo nuevo mientras se enviaba
}

function menu(){
 const r=S.user.rol,m=[['inicio','Inicio']];
 if(jefe()){
  if(r!=='admin'&&S.acts.some(a=>a.asignadoA===S.user.id)) m.push(['tareas','Mis actividades']);
  m.push(['agenda','Agenda'],['evidencias','Evidencias'],['visitas','Visitas'],['personal','Personal']);
 } else m.push(['tareas','Mis actividades'],['visitas','Mis visitas']);
 if(r==='admin') m.push(['monitores','Monitores']);
 if(jefe()) m.push(['carga','Carga masiva'],['supervision','Supervisión'],['reportes','Reportes']);
 m.push(['perfil','Mi perfil']);
 return m;
}
const TITULOS={inicio:'Inicio',agenda:'Agenda semanal',tareas:'Mis actividades',evidencias:'Evidencias',visitas:'Visitas',personal:'Personal',monitores:'Monitores',reportes:'Reportes de avance',supervision:'Supervisión',carga:'Carga masiva de agenda',perfil:'Mi perfil'};
function ir(v){S.vista=v;S.f={};pintar();window.scrollTo(0,0)}
function pintar(){
 const pend={personal:S.personal.filter(p=>p.estatus==='Pendiente').length,evidencias:S.evs.filter(e=>e.validacion==='Por validar').length,
  tareas:S.acts.filter(a=>a.asignadoA===S.user.id&&['Pendiente','Rechazada'].includes(a.estatus)).length};
 $('#raiz').innerHTML=`<div id="app"><div id="velo" onclick="cajon(0)"></div>
 <aside class="side" id="side"><div class="marca"><img src="${LOGO}" alt=""><div><b>${NOMBRE}</b><span>${LEMA}</span></div></div>
  ${menu().map(([v,t])=>`<button class="nav ${S.vista===v?'on':''}" onclick="ir('${v}')">${ic(v)}${t}${pend[v]?`<span class="cnt">${pend[v]}</span>`:''}</button>`).join('')}
  <div class="pie"><button class="nav" onclick="salir()">${ic('salir')}Salir</button></div></aside>
 <main class="main"><div class="top"><button id="btnMenu" onclick="cajon(1)" aria-label="Menú">${ic('menu')}</button><h1>${TITULOS[S.vista]}</h1><span id="colaInd" class="badge b-Pendiente ${miCola().length?'':'hide'}">${miCola().length} por enviar</span>
  <button class="yo" onclick="ir('perfil')">${avatar(S.user)}<div style="text-align:left"><b>${esc(S.user.nombre.split(' ').slice(0,2).join(' '))}</b><small>${ROL[S.user.rol]}${S.user.zona?' · '+esc(S.user.zona):S.user.region?' · '+esc(S.user.region):''}</small></div></button></div>
  <div id="vista"></div></main></div>`;
 ({inicio:vInicio,agenda:vAgenda,tareas:vTareas,evidencias:vEvidencias,visitas:vVisitas,personal:vPersonal,monitores:vMonitores,reportes:vReportes,supervision:vSupervision,carga:vCarga,perfil:vPerfil})[S.vista]();
}
function cajon(a){$('#side').classList.toggle('abierto',!!a);$('#velo').classList.toggle('abierto',!!a)}
const dias7=()=>[0,1,2,3,4,5,6].map(i=>mas(S.semana,i));
const deSemana=()=>{const a=iso(S.semana),b=iso(mas(S.semana,6));return S.acts.filter(x=>x.fecha>=a&&x.fecha<=b)};
const hecha=a=>['Validada','Con evidencia'].includes(a.estatus);
