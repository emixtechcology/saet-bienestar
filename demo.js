/* SAET Bienestar · Modo demo con datos de ejemplo (solo cuando API_URL está vacío)
   Lo usa: nadie en producción */

const DB={zonas:[],personal:[],acts:[],evs:[],vis:[]};
function sembrarDemo(){
 const R={'Región Centro':['Centro · Subregión 5','Centro · Subregión 6','Centro · Subregión 7','Centro · Subregión 8','Centro · Subregión 9','Centro · Subregión 10'],'Región Tenosique':['Tenosique','Balancán','Emiliano Zapata'],'Región Cárdenas':['Cárdenas','Huimanguillo','Cunduacán','Comalcalco'],'Región Teapa':['Teapa','Tacotalpa','Jalapa'],'Región Nacajuca':['Nacajuca','Centla','Paraíso','Jalpa de Méndez'],'Región Macuspana':['Macuspana','Jonuta']};
 const N=['María','José','Guadalupe','Juan','Rosa','Carlos','Leticia','Miguel','Carmen','Luis','Patricia','Jorge','Yolanda','Pedro','Silvia','Manuel','Adriana','Ramón','Verónica','Héctor','Daniela','Óscar','Karla','Rubén'],A=['Hernández','De la Cruz','Jiménez','López','García','Pérez','Sánchez','Morales','Ramos','Córdova','Méndez','Arias','Ovando','Zurita','Priego','Cupil'];
 let s=7;const rnd=n=>{s=(s*9301+49297)%233280;return Math.floor(s/233280*n)},nom=()=>`${N[rnd(N.length)]} ${A[rnd(A.length)]} ${A[rnd(A.length)]}`;
 let k=0;const per=(rol,region,zona,est='Activo')=>{const n=nom(),p={id:'P'+(++k),rol,nombre:n,curp:rol==='admin'?'ADMIN':('DEMO'+String(k).padStart(6,'0')+'HTCXXX0'+k%10),correo:n.split(' ')[0].toLowerCase()+k+'@correo.mx',telefono:'993'+String(1000000+rnd(8999999)),facebook:rnd(3)?'fb.usuario'+k:'',instagram:rnd(2)?'ig.usuario'+k:'',selfie:'',region,zona,estatus:est,registro:hoy()};DB.personal.push(p);return p};
 per('admin','','');
 Object.entries(R).forEach(([r,zs])=>{per('regional',r,'');zs.forEach(z=>{DB.zonas.push({zona:z,tipo:z.includes('Subregión')?'Subregión':'Municipio',region:r,clave:(z.includes('Subregión')?'CS'+z.split(' ').pop():z.normalize('NFD').replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,3))+(1000+rnd(8999))});per('encargado',r,z);for(let i=0;i<3+rnd(2);i++)per('servidor',r,z,rnd(14)?'Activo':'Pendiente')})});
 const RR=Object.keys(R);for(let i=0;i<11;i++)per('monitor',RR[i%RR.length],'');
 DB.personal.forEach(p=>{if(p.rol==='servidor'&&rnd(5)===0)p.puesto='UBA'});
 const T=['Visitas de seguimiento','Asamblea informativa','Apoyo en operativo de pago','Módulo de atención','Levantamiento de censo','Reunión de coordinación','Difusión de convocatoria','Visitas a derechohabientes'],TT=['Visita domiciliaria','Asamblea informativa','Operativo de pago','Módulo de atención','Censo / registro','Reunión de trabajo','Difusión','Visita domiciliaria'];
 const L=['Col. Gaviotas','Villa Aldama','Ej. Miguel Hidalgo','Centro','Ra. Buenavista','Pob. Ocuiltzapotlán','Col. Tamulté','Villa Benito Juárez'],sem=lunes(new Date());
 const img=(i)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${['#E8CBD4','#EBDDC3','#D9C3CB'][i%3]}"/><stop offset="1" stop-color="${['#B56A82','#C9A56A','#82203F'][i%3]}"/></linearGradient></defs><rect width="400" height="300" fill="url(#a)"/><circle cx="${90+i*37%220}" cy="120" r="46" fill="#fff" opacity=".35"/><path d="M0 230l90-70 80 50 90-80 140 100v70H0z" fill="#fff" opacity=".3"/><text x="200" y="282" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#fff">Foto de ejemplo</text></svg>`);
 let n=0;DB.personal.filter(p=>p.estatus==='Activo'&&['servidor','monitor','encargado'].includes(p.rol)).forEach(p=>{
  const jefeP=DB.personal.find(x=>x.rol==='regional'&&x.region===p.region);
  for(let i=0;i<(p.rol==='encargado'?1:2+rnd(3));i++){const t=rnd(T.length),d=rnd(7),f=iso(mas(sem,d)),pas=f<hoy(),est=pas?(rnd(10)<7?(rnd(3)?'Validada':'Con evidencia'):'Pendiente'):(f===hoy()&&rnd(3)===0?'Con evidencia':'Pendiente');
   const a={id:'A'+(++n),grupo:'G'+n,titulo:T[t],tipo:TT[t],descripcion:'Reportar resultado y tomar foto del lugar.',fecha:f,...(h=>({hora:h,horaFin:String(+h.slice(0,2)+2).padStart(2,'0')+h.slice(2),horarios:h+'-'+String(+h.slice(0,2)+2).padStart(2,'0')+h.slice(2)}))(['08:00','09:00','10:30','12:00','16:00'][rnd(5)]),lugar:L[rnd(L.length)],region:p.region,zona:p.zona,asignadoA:p.id,asignadoNombre:p.nombre,creadoPor:jefeP.id,creadoNombre:jefeP.nombre,estatus:est,creado:hoy()};DB.acts.push(a);
   if(est!=='Pendiente'){const e={id:'E'+n,actividadId:a.id,usuarioId:p.id,usuarioNombre:p.nombre,region:p.region,zona:p.zona,fecha:f+' 14:'+String(10+rnd(49)),fotos:img(n)+' | '+img(n+1),comentario:'Actividad realizada sin contratiempos.',...punto(p.zona),validacion:est==='Validada'?'Validada':'Por validar',validadoPor:est==='Validada'?jefeP.nombre:'',nota:'',...verifDemo(n,f,rnd)};DB.evs.push(e);
    if(false)DB.vis.push({id:'V'+n+'_'+v,actividadId:a.id,evidenciaId:e.id,servidorId:p.id,servidorNombre:p.nombre,region:p.region,zona:p.zona,fecha:f,nombre:nom(),curp:'',telefono:'993'+String(1000000+rnd(8999999)),domicilio:'Calle '+(1+rnd(40))+' s/n',localidad:a.lugar,programa:PROGRAMAS[rnd(PROGRAMAS.length)],motivo:'Seguimiento',resultado:RESULTADOS[rnd(RESULTADOS.length)],observaciones:'',...punto(p.zona)})}}});
 // Visitas de supervisión de los mandos (enlaces, monitores y regionales)
 const alcM=(m,x)=>m.rol==='encargado'?x.zona===m.zona:x.region===m.region;
 DB.personal.filter(m=>m.estatus==='Activo'&&['encargado','monitor','regional'].includes(m.rol)).forEach((m,mi)=>{
  const objetivos=DB.acts.filter(a=>{const p=DB.personal.find(x=>x.id===a.asignadoA);return p&&p.rol==='servidor'&&alcM(m,p)});
  for(let i=0;i<(m.rol==='regional'?2:1+rnd(2));i++){const ob=objetivos[rnd(objetivos.length)];if(!ob)break;
   const svs=DB.acts.filter(x=>x.grupo===ob.grupo&&x.fecha===ob.fecha).map(x=>DB.personal.find(p=>p.id===x.asignadoA)).filter(Boolean);
   const f=ob.fecha,pas=f<hoy(),est=pas?(rnd(4)?(rnd(2)?'Validada':'Con evidencia'):'Pendiente'):'Pendiente',val=DB.personal.find(x=>m.rol==='regional'?x.rol==='admin':x.rol==='regional'&&x.region===m.region);
   const a={id:'A'+(++n),grupo:'G'+n,titulo:'Supervisar: '+ob.titulo,tipo:'Visita de supervisión',descripcion:'',fecha:f,hora:ob.hora,horaFin:ob.horaFin,horarios:ob.horarios,lugar:ob.lugar,region:m.region||ob.region,zona:m.zona||ob.zona,asignadoA:m.id,asignadoNombre:m.nombre,creadoPor:m.id,creadoNombre:m.nombre,estatus:est,creado:hoy(),
    objetivo:JSON.stringify({actividadId:ob.id,actividadTitulo:ob.titulo,servidores:svs.map(p=>({id:p.id,nombre:p.nombre,zona:p.zona}))})};DB.acts.push(a);
   if(est!=='Pendiente'){const cal={};svs.forEach(p=>cal[p.id]=['Bien','Bien','Regular','Requiere apoyo'][rnd(4)]);
    DB.evs.push({id:'E'+n,actividadId:a.id,usuarioId:m.id,usuarioNombre:m.nombre,region:a.region,zona:a.zona,fecha:f+' 11:'+String(10+rnd(49)),fotos:img(n)+' | '+img(n+2),comentario:['Los encontré trabajando en su ruta.','Acompañé el recorrido; buen avance.','Falta material de difusión.'][rnd(3)],...punto(ob.zona),validacion:est==='Validada'?'Validada':'Por validar',validadoPor:est==='Validada'&&val?val.nombre:'',nota:'',...verifDemo(n,f,rnd),
     detalle:JSON.stringify({tipo:['Supervisión de ruta','Acompañamiento','Capacitación'][rnd(3)],revision:{ruta:'si',identificacion:rnd(4)?'si':'no',material:rnd(3)?'si':'no',registro:'si',trato:'si'},calificaciones:cal,presentes:svs.map(p=>p.id),acuerdos:rnd(2)?'Reforzar el registro en la siguiente visita.':''})})}}});
}
function demoEquipo(a,todos){return todos&&a.grupo?DB.acts.filter(x=>x.grupo===a.grupo&&x.fecha===a.fecha):[a]}
function demoApi(accion,d){
 const u=S.user,alc=r=>!u?false:u.rol==='admin'||(u.rol==='regional'&&r.region===u.region)||(u.rol==='encargado'&&r.zona===u.zona),copia=x=>JSON.parse(JSON.stringify(x));
 const ve=a=>alc(a)||a.asignadoA===u.id||a.creadoPor===u.id,id=p=>p+Date.now().toString(36)+Math.floor(Math.random()*999);
 return new Promise((ok,no)=>setTimeout(()=>{try{ok(copia((()=>{
  if(accion==='zonas') return DB.zonas.map(({clave,...z})=>z);
  const alcM=r=>u.rol==='admin'||(['regional','monitor'].includes(u.rol)&&r.region===u.region)||(u.rol==='encargado'&&r.zona===u.zona);
  if(accion==='objetivosSupervision'){const pers=DB.personal.filter(p=>p.estatus==='Activo'&&p.rol==='servidor'&&alcM(p)),ids=new Set(pers.map(p=>p.id)),G={};
   DB.acts.filter(a=>ids.has(a.asignadoA)&&a.fecha>=d.desde&&a.fecha<=d.hasta).forEach(a=>{const k=a.grupo+'|'+a.fecha,g=G[k]=G[k]||{actividadId:a.id,titulo:a.titulo,tipo:a.tipo,fecha:a.fecha,horarios:a.horarios,lugar:a.lugar,zona:a.zona,personas:[]};g.personas.push({id:a.asignadoA,nombre:a.asignadoNombre})});
   return{servidores:pers.map(p=>({id:p.id,nombre:p.nombre,zona:p.zona,puesto:p.puesto||''})).sort((a,b)=>(a.zona+a.nombre).localeCompare(b.zona+b.nombre)),actividades:Object.values(G).sort((a,b)=>(a.fecha+a.horarios).localeCompare(b.fecha+b.horarios))}}
  if(accion==='planearSupervision'){const ob=d.actividadId?DB.acts.find(a=>a.id===d.actividadId):null;let svs=(d.servidores||[]).map(i=>DB.personal.find(p=>p.id===i));
   if(ob&&!svs.length)svs=DB.acts.filter(x=>x.grupo===ob.grupo&&x.fecha===ob.fecha).map(x=>DB.personal.find(p=>p.id===x.asignadoA)).filter(p=>p&&alcM(p));
   if(!svs.length)throw new Error('Elige la actividad o a los servidores que vas a supervisar');const hs=d.horarios||[],zs=[...new Set(svs.map(p=>p.zona))];
   const a={id:id('A'),grupo:id('G'),titulo:'Supervisar: '+(ob?ob.titulo:svs.slice(0,2).map(p=>p.nombre).join(', ')+(svs.length>2?' y '+(svs.length-2)+' más':'')),tipo:'Visita de supervisión',descripcion:d.descripcion||'',fecha:d.fecha,hora:(hs[0]||{}).inicio||'',horaFin:(hs[hs.length-1]||{}).fin||'',horarios:hs.map(b=>b.inicio+'-'+b.fin).join('|'),lugar:d.lugar||(ob?ob.lugar:''),region:u.region||svs[0].region,zona:u.zona||(zs.length===1?zs[0]:''),asignadoA:u.id,asignadoNombre:u.nombre,creadoPor:u.id,creadoNombre:u.nombre,estatus:'Pendiente',creado:hoy(),modo:'',
    objetivo:JSON.stringify({actividadId:ob?ob.id:'',actividadTitulo:ob?ob.titulo:'',servidores:svs.map(p=>({id:p.id,nombre:p.nombre,zona:p.zona}))})};DB.acts.push(a);return{actividad:a}}
  const dz=c=>{const z=DB.zonas.find(z=>z.clave===String(c||'').toUpperCase().trim());if(!z)throw new Error('Esa clave no existe. Pídesela a tu enlace municipal.');return z};
  if(accion==='revisarClave'){const z=dz(d.clave);return{zona:z.zona,region:z.region}}
  if(accion==='nuevaClaveZona'){const z=DB.zonas.find(x=>x.zona===d.zona);z.clave=z.clave.replace(/\d+$/,'')+(1000+Math.floor(Math.random()*8999));return{zona:z.zona,clave:z.clave}}
  if(accion==='login') throw new Error('En modo demo usa los botones de abajo.');
  if(accion==='registro'){const z=dz(d.clave);DB.personal.push({id:id('P'),rol:'servidor',nombre:d.nombre,curp:d.curp.toUpperCase(),correo:d.correo,telefono:d.telefono,facebook:d.facebook,instagram:d.instagram,selfie:d.selfie,region:z.region,zona:z.zona,estatus:'Pendiente',registro:hoy()});return{mensaje:'Registro enviado para '+z.zona+' (demo). Tu encargado lo aprobará.'}}
  if(accion==='datos'){const acts=DB.acts.filter(a=>a.fecha>=d.desde&&a.fecha<=d.hasta&&ve(a)),ids=new Set(acts.map(a=>a.id)),gk=new Set(acts.map(a=>a.grupo+'|'+a.fecha)),cu={};DB.acts.forEach(a=>{const k=a.grupo+'|'+a.fecha;if(gk.has(k))cu[k]=(cu[k]||0)+1});const compas=DB.acts.filter(a=>cu[a.grupo+'|'+a.fecha]>1);compas.forEach(a=>{if(a.modo==='equipo')ids.add(a.id)});
   return{usuario:DB.personal.find(p=>p.id===u.id),zonas:DB.zonas.map(({clave,...z})=>z),personal:DB.personal.filter(p=>p.id===u.id||alc(p)),actividades:acts,evidencias:DB.evs.filter(e=>ids.has(e.actividadId)),equipo:compas.map(({id,grupo,fecha,asignadoA,asignadoNombre,zona,region,estatus,modo})=>({id,grupo,fecha,asignadoA,asignadoNombre,zona,region,estatus,modo})),visitas:DB.vis.filter(v=>v.servidorId===u.id||alc(v)),claves:DB.zonas.filter(z=>u.rol==='admin'||(u.rol==='regional'&&z.region===u.region)||(u.rol==='encargado'&&z.zona===u.zona)).map(({zona,region,clave})=>({zona,region,clave}))}}
  if(accion==='exportar') return{Personal:DB.personal.filter(p=>p.id===u.id||alc(p)),Actividades:DB.acts.filter(ve),Evidencias:DB.evs.filter(e=>alc(e)||e.usuarioId===u.id).map(e=>({...e,fotos:'(foto de ejemplo)'})),Visitas:DB.vis.filter(v=>alc(v)||v.servidorId===u.id)};
  if(accion==='guardarActividad'){if(d.id){const hs=d.horarios||[],a0=DB.acts.find(a=>a.id===d.id),c={fecha:d.fecha,horarios:hs.map(b=>b.inicio+'-'+b.fin).join('|'),hora:(hs[0]||{}).inicio||'',horaFin:(hs[hs.length-1]||{}).fin||''};const cam=demoEquipo(a0,d.todos).filter(x=>x===a0||(['Pendiente','Rechazada'].includes(x.estatus)&&!DB.evs.some(e=>e.actividadId===x.id)));cam.forEach(x=>Object.assign(x,c));return{nuevas:[],cambiadas:cam}}
   const asg=(u.rol==='monitor'?[u.id]:d.asignados).map(i=>DB.personal.find(p=>p.id===i));if(!asg.length) throw new Error('Elige al menos a una persona');
   const modo=d.modo==='equipo'&&asg.length>1?'equipo':'',nuevas=[];d.actividades.forEach(x=>{const g=id('G');asg.forEach(p=>nuevas.push({id:id('A'),grupo:g,modo,titulo:x.titulo,tipo:x.tipo||'Otra',descripcion:x.descripcion||'',fecha:x.fecha,...(hs=>({hora:(hs[0]||{}).inicio||x.hora||'',horaFin:(hs[hs.length-1]||{}).fin||'',horarios:hs.map(b=>b.inicio+'-'+b.fin).join('|')}))(x.horarios||[]),lugar:x.lugar||'',region:p.region,zona:p.zona,asignadoA:p.id,asignadoNombre:p.nombre,creadoPor:u.id,creadoNombre:u.nombre,estatus:'Pendiente',creado:hoy()}))});DB.acts.push(...nuevas);return{nuevas}}
  if(accion==='eliminarActividad'){const a0=DB.acts.find(a=>a.id===d.id);if(!a0)return{};let b=0,k=0;demoEquipo(a0,d.todos).forEach(x=>{if(x!==a0&&(DB.evs.some(e=>e.actividadId===x.id)||DB.vis.some(v=>v.actividadId===x.id)||!['Pendiente','Rechazada'].includes(x.estatus))){k++;return}DB.acts=DB.acts.filter(y=>y!==x);b++});return{borradas:b,conservadas:k}}
  if(accion==='subirEvidencia'){const a=DB.acts.find(x=>x.id===d.actividadId),e={id:d.id||id('E'),actividadId:a.id,usuarioId:u.id,usuarioNombre:u.nombre,region:a.region,zona:a.zona,fecha:hoy()+' '+new Date().toTimeString().slice(0,5),fotos:d.fotos.join(' | '),comentario:d.comentario,lat:String(d.lat),lng:String(d.lng),validacion:'Por validar',validadoPor:'',nota:'',ia:''};Object.assign(e,demoVerificar(e,a,d.meta||[]));if(a.tipo==='Visita de supervisión'&&d.detalle)e.detalle=JSON.stringify({...d.detalle,revision:Object.fromEntries(Object.entries(d.detalle.revision||{}).map(([k,v])=>[k,v?'si':'no']))});DB.evs.push(e);a.estatus='Con evidencia';if(a.modo==='equipo')demoEquipo(a,true).forEach(x=>{if(['Pendiente','Rechazada'].includes(x.estatus))x.estatus='Con evidencia'});
   return{}}
  if(accion==='guardarVisita'){const i=DB.vis.findIndex(v=>v.id===d.id),a=DB.acts.find(x=>x.id===d.actividadId),n={...(i>-1?DB.vis[i]:{evidenciaId:'',servidorId:u.id,servidorNombre:u.nombre,fecha:hoy()}),...d,region:a?a.region:u.region,zona:a?a.zona:u.zona};i>-1?DB.vis[i]=n:DB.vis.push(n);return{visita:n}}
  if(accion==='eliminarVisita'){DB.vis=DB.vis.filter(v=>v.id!==d.id);return{}}
  if(accion==='validarEvidencia'){const e=DB.evs.find(x=>x.id===d.id);if(e.usuarioId===u.id)throw new Error('No puedes validar tu propia evidencia');const a9=DB.acts.find(a=>a.id===e.actividadId),sup=a9&&DB.personal.find(p=>p.id===a9.asignadoA);if(a9&&a9.tipo==='Visita de supervisión'&&!(u.rol==='admin'||(u.rol==='regional'&&sup&&sup.rol!=='regional')))throw new Error('Esta visita de supervisión la valida el regional o el administrador');Object.assign(e,{validacion:d.validacion,validadoPor:u.nombre,nota:d.nota});const a=DB.acts.find(a=>a.id===e.actividadId);a.estatus=d.validacion;if(a.modo==='equipo')demoEquipo(a,true).forEach(x=>{if(x.estatus==='Con evidencia')x.estatus=d.validacion});return{}}
  if(accion==='guardarPersona'){if(d.id){DB.personal.find(p=>p.id===d.id).estatus=d.estatus;return{}}
   const z=DB.zonas.find(x=>x.zona===d.zona),np={id:id('P'),rol:d.rol,nombre:d.nombre,curp:(d.curp||'').toUpperCase(),correo:d.correo,telefono:d.telefono,facebook:'',instagram:'',selfie:'',region:['regional','monitor'].includes(d.rol)?d.region:z?z.region:'',zona:['regional','monitor'].includes(d.rol)?'':d.zona,estatus:'Activo',registro:hoy(),puesto:d.rol==='servidor'&&d.puesto==='UBA'?'UBA':''};DB.personal.push(np);return{pin:'482913',usuario:np.curp,persona:np}}
  if(accion==='resetPin') return{pin:'739105',usuario:DB.personal.find(p=>p.id===d.id).curp};
  if(accion==='actualizarPerfil'){const p=DB.personal.find(x=>x.id===u.id);['correo','telefono','facebook','instagram','selfie'].forEach(k=>{if(d[k]!=null)p[k]=d[k]});return{usuario:p}}
  if(accion==='reporte') return demoReporte(u,d);
  if(accion==='revisarAsignados') return(d.claves||[]).map(k=>{const n=normT(k),p=DB.personal.find(x=>x.curp.toUpperCase()===k.toUpperCase().split(/—|–| - /).pop().trim()||normT(x.nombre)===normT(k.split(/—|–| - /)[0]));
   if(!p)return{clave:k,estado:'noexiste'};const ve=u.rol==='admin'||(u.rol==='regional'&&p.region===u.region)||(u.rol==='encargado'&&p.zona===u.zona);return ve?{clave:k,estado:p.estatus==='Activo'?'ok':p.estatus==='Baja'?'baja':'pendiente'}:{clave:k,estado:'fuera',zona:p.zona||p.region}});
  if(accion==='cargaMasiva'){DB.cargas=DB.cargas||[];const nuevas=[],omit=[],ex=new Set(DB.acts.map(a=>a.asignadoA+'|'+a.fecha+'|'+a.titulo.toLowerCase()+'|'+(a.horarios||a.hora))),gr={};
   d.actividades.forEach((x,i)=>{const p=DB.personal.find(q=>q.id===x.asignadoA),hs=(x.horarios||[]).map(b=>b.inicio+'-'+b.fin).join('|'),k=x.asignadoA+'|'+x.fecha+'|'+x.titulo.toLowerCase()+'|'+hs;
    if(!p||ex.has(k)){omit.push({i,motivo:'Ya existe'});return}ex.add(k);
    nuevas.push({id:id('A'),grupo:gr[x.grupo]=gr[x.grupo]||id('G'),titulo:x.titulo,tipo:x.tipo,descripcion:x.descripcion,fecha:x.fecha,hora:(x.horarios[0]||{}).inicio||'',horaFin:(x.horarios[x.horarios.length-1]||{}).fin||'',horarios:hs,lugar:x.lugar,region:p.region,zona:p.zona,asignadoA:p.id,asignadoNombre:p.nombre,creadoPor:u.id,creadoNombre:u.nombre,estatus:'Pendiente',creado:hoy(),lote:d.lote})});
   DB.acts.push(...nuevas);const c=DB.cargas.find(c=>c.id===d.lote);if(c)c.actividades=String(+c.actividades+nuevas.length);else DB.cargas.unshift({id:d.lote,fecha:hoy()+' '+new Date().toTimeString().slice(0,5),usuarioId:u.id,usuarioNombre:u.nombre,region:u.region,zona:u.zona,archivo:d.archivo,actividades:String(nuevas.length),estatus:'Activa'});
   return{nuevas,omitidas:omit}}
  if(accion==='cargas') return(DB.cargas||[]).filter(c=>u.rol==='admin'||c.usuarioId===u.id);
  if(accion==='deshacerCarga'){const c=DB.cargas.find(x=>x.id===d.id),con=new Set([...DB.evs.map(e=>e.actividadId),...DB.vis.map(v=>v.actividadId)]);let b=0,k=0;
   DB.acts=DB.acts.filter(a=>{if(a.lote!==c.id)return true;if(con.has(a.id)){k++;return true}b++;return false});c.estatus=k?'Deshecha en parte':'Deshecha';c.actividades=String(k);return{borradas:b,conservadas:k}}
  if(accion==='supervision') return demoSupervision(u,d);
  if(accion==='fichaPersona'){const p=DB.personal.find(x=>x.id===d.id),en=f=>f.slice(0,10)>=d.desde&&f.slice(0,10)<=d.hasta,acts=DB.acts.filter(a=>a.asignadoA===p.id&&en(a.fecha)),ids=new Set(acts.map(a=>a.id));return{persona:p,actividades:acts,evidencias:DB.evs.filter(e=>ids.has(e.actividadId)),visitas:[],supervisiones:DB.acts.filter(a=>a.tipo==='Visita de supervisión'&&en(a.fecha)&&(a.asignadoA===p.id||(JSON.parse(a.objetivo||'{}').servidores||[]).some(x=>x.id===p.id))).map(a=>{const e=DB.evs.find(x=>x.actividadId===a.id)||{};let det={};try{det=JSON.parse(e.detalle||'{}')}catch(x){}return{id:a.id,fecha:a.fecha,titulo:a.titulo,supervisor:a.asignadoNombre,estatus:a.estatus,tipo:det.tipo||'',calificacion:(det.calificaciones||{})[p.id]||'',acuerdos:det.acuerdos||'',comentario:e.comentario||''}})}}
  if(accion==='analisisReporte') return{texto:'Ejemplo de demo. Con tu clave de Gemini, aquí aparece un análisis para el delegado: panorama general, dónde se va bien, dónde hay rezago y tres acciones concretas para la próxima semana, usando solo los números de este reporte.'};
  if(accion==='ia'){if(d.tipo==='agenda') return[{titulo:'Asamblea informativa',tipo:'Asamblea informativa',fecha:iso(mas(lunes(new Date()),1)),hora:'09:00',lugar:'Parque de Tamulté',descripcion:''},{titulo:'Visitas domiciliarias',tipo:'Visita domiciliaria',fecha:iso(mas(lunes(new Date()),2)),hora:'',lugar:'Col. Gaviotas',descripcion:''},{titulo:'Reunión de trabajo',tipo:'Reunión de trabajo',fecha:iso(mas(lunes(new Date()),4)),hora:'10:00',lugar:'Delegación',descripcion:''}];
   if(d.tipo==='verificar'){const e=DB.evs.find(x=>x.id===d.id);e.ia='Personas reunidas al aire libre con lonas del programa · Foto real · coherente con la actividad · 6 personas (confianza alta) — ejemplo de demo';return{ia:e.ia,puntaje:e.puntaje,verificacion:e.verificacion,alertas:e.alertas}}
   return{texto:'Ejemplo de demo: al conectar tu clave de Gemini, aquí aparecerá el resumen ejecutivo de la semana con avance general, zonas destacadas, zonas rezagadas y recomendaciones, redactado a partir de tus datos reales.'}}
  throw new Error('Acción no disponible en demo')})()))}catch(e){no(e)}},220));
}

function demoReporte(u,d){
 const alc=r=>u.rol==='admin'||(u.rol==='regional'&&r.region===u.region)||(u.rol==='encargado'&&r.zona===u.zona);
 let A={tipo:'estado',nombre:'Todo el estado',region:'',zona:''};
 if(u.rol==='regional')A={tipo:'region',nombre:u.region,region:u.region,zona:''};
 if(u.rol==='encargado')A={tipo:'zona',nombre:u.zona,region:u.region,zona:u.zona};
 if(d.zona&&u.rol!=='encargado'){const z=DB.zonas.find(x=>x.zona===d.zona);A={tipo:'zona',nombre:z.zona,region:z.region,zona:z.zona}}
 else if(d.region&&u.rol==='admin')A={tipo:'region',nombre:d.region,region:d.region,zona:''};
 const dentro=r=>A.zona?r.zona===A.zona:A.region?r.region===A.region:true,enR=f=>f.slice(0,10)>=d.desde&&f.slice(0,10)<=d.hasta,hoyS=hoy();
 const V=()=>({actividades:0,conEvidencia:0,validadas:0,porValidar:0,rechazadas:0,pendientes:0,vencidas:0,visitas:0,servidores:0,servidoresConActividad:0,evConfiables:0,evRevisar:0,evSospechosas:0});
 const T=V(),R={},Z={},P={},tipos={},programas={},resultados={},serie={},ca={t:new Set(),R:{},Z:{}},dias=Math.round((new Date(d.hasta)-new Date(d.desde))/864e5)+1,porMes=dias>62;
 DB.zonas.filter(dentro).forEach(z=>{R[z.region]=R[z.region]||V();Z[z.zona]=Object.assign(V(),{region:z.region})});
 const gR=r=>R[r||'Monitores']=R[r||'Monitores']||V();
 const per=(id,n)=>{if(!P[id]){const p=DB.personal.find(x=>x.id===id)||{};P[id]=Object.assign(V(),{nombre:p.nombre||n,rol:p.rol||'',zona:p.zona||'',region:p.region||''})}return P[id]};
 DB.personal.forEach(p=>{if(p.rol!=='servidor'||p.estatus!=='Activo'||!dentro(p))return;T.servidores++;if(R[p.region])R[p.region].servidores++;if(Z[p.zona])Z[p.zona].servidores++});
 const sum=(s,a,v)=>{s.actividades++;if(a.estatus==='Validada'){s.validadas++;s.conEvidencia++}else if(a.estatus==='Con evidencia'){s.porValidar++;s.conEvidencia++}else if(a.estatus==='Rechazada')s.rechazadas++;else if(v)s.vencidas++;else s.pendientes++};
 DB.acts.forEach(a=>{if(!enR(a.fecha)||!dentro(a)||!alc(a)&&u.rol!=='admin')return;const v=a.estatus==='Pendiente'&&a.fecha<hoyS,h=['Validada','Con evidencia'].includes(a.estatus);
  sum(T,a,v);sum(gR(a.region),a,v);if(Z[a.zona])sum(Z[a.zona],a,v);sum(per(a.asignadoA,a.asignadoNombre),a,v);
  const t=tipos[a.tipo]=tipos[a.tipo]||{total:0,cumplidas:0};t.total++;if(h)t.cumplidas++;
  const k=porMes?a.fecha.slice(0,7):a.fecha,s=serie[k]=serie[k]||{total:0,cumplidas:0,vencidas:0};s.total++;if(h)s.cumplidas++;if(v)s.vencidas++;
  const p=DB.personal.find(x=>x.id===a.asignadoA);if(p&&p.rol==='servidor'){ca.t.add(p.id);(ca.R[a.region]=ca.R[a.region]||new Set()).add(p.id);if(a.zona)(ca.Z[a.zona]=ca.Z[a.zona]||new Set()).add(p.id)}});
 T.servidoresConActividad=ca.t.size;Object.keys(R).forEach(r=>R[r].servidoresConActividad=(ca.R[r]||new Set()).size);Object.keys(Z).forEach(z=>Z[z].servidoresConActividad=(ca.Z[z]||new Set()).size);
 const actR=new Map(DB.acts.filter(a=>enR(a.fecha)&&dentro(a)).map(a=>[a.id,a]));DB.evs.forEach(e=>{const a=actR.get(e.actividadId),k={Confiable:'evConfiables',Revisar:'evRevisar',Sospechosa:'evSospechosas'}[e.verificacion];if(!a||!k)return;T[k]++;gR(a.region)[k]++;if(Z[a.zona])Z[a.zona][k]++;per(a.asignadoA,a.asignadoNombre)[k]++});
 DB.evs.forEach(e=>{const a=DB.acts.find(x=>x.id===e.actividadId);if(!a||a.tipo!=='Visita de supervisión'||!enR(a.fecha)||!dentro(a)||e.validacion==='Rechazada')return;T.visitas++;gR(a.region).visitas++;if(Z[a.zona])Z[a.zona].visitas++;per(a.asignadoA,a.asignadoNombre).visitas++;let det={};try{det=JSON.parse(e.detalle||'{}')}catch(x){}const t=det.tipo||'Supervisión de ruta';programas[t]=(programas[t]||0)+1;Object.values(det.calificaciones||{}).forEach(c=>resultados[c]=(resultados[c]||0)+1)});
 const fin=s=>(s.exigibles=s.actividades-s.pendientes,s.cumplimiento=s.exigibles?Math.round(s.conEvidencia/s.exigibles*100):null,s),lista=o=>Object.keys(o).map(k=>Object.assign(fin(o[k]),{nombre:o[k].nombre||k}));
 const et=[];for(let f=new Date(d.desde+'T12:00');f<=new Date(d.hasta+'T12:00');f.setDate(f.getDate()+1)){const k=porMes?iso(f).slice(0,7):iso(f);if(!et.includes(k))et.push(k)}
 return{alcance:A,desde:d.desde,hasta:d.hasta,dias,generado:hoy()+' '+new Date().toTimeString().slice(0,5),generadoPor:u.nombre,total:fin(T),
  regiones:lista(R).filter(r=>r.nombre!=='Monitores'||r.actividades),zonas:lista(Z),personas:lista(P).filter(p=>p.actividades||p.visitas),tipos,programas,resultados,
  serieTipo:porMes?'mes':'dia',serie:et.map(k=>Object.assign({etiqueta:k},serie[k]||{total:0,cumplidas:0,vencidas:0}))};
}

/* Coordenadas aproximadas de cada municipio (solo para el mapa de ejemplo) */
const COORD_DEMO={'Jalpa de Méndez':[18.18,-93.06],'Nacajuca':[18.17,-93.02],'Cárdenas':[18.0,-93.37],'Comalcalco':[18.26,-93.22],'Cunduacán':[18.07,-93.17],'Huimanguillo':[17.83,-93.39],'Paraíso':[18.4,-93.21],'Jalapa':[17.72,-92.81],'Tacotalpa':[17.59,-92.82],'Teapa':[17.55,-92.95],'Balancán':[17.81,-91.53],'Emiliano Zapata':[17.74,-91.77],'Tenosique':[17.47,-91.42],'Centla':[18.53,-92.65],'Jonuta':[18.09,-92.14],'Macuspana':[17.76,-92.6]};
function punto(zona){const nz=zona&&+zona.split(' ').pop();const c=COORD_DEMO[zona]||(zona&&zona.startsWith('Centro')?[17.99+(nz-7.5)*.012,-92.93+(nz%3-1)*.02]:[17.99,-92.93]);
 return{lat:(c[0]+(Math.random()-.5)*.03).toFixed(5),lng:(c[1]+(Math.random()-.5)*.03).toFixed(5)}}
function verifDemo(n,fecha,rnd){
 const h=()=>Array.from({length:16},()=>'0123456789abcdef'[rnd(16)]).join(''),r=rnd(10),cam={exifFecha:fecha+' 11:2'+rnd(9),exifModelo:['Samsung SM-A145M','Motorola moto g32','Xiaomi Redmi Note 12','Apple iPhone 11'][rnd(4)],origen:'camara',tipo:'image/jpeg'};
 if(r<7){const p=78+rnd(21);return{huellas:h(),verificacion:'Confiable',puntaje:String(p),alertas:p<90?'GAL:Las fotos se eligieron de la galería, no se tomaron en el momento':'',metadatos:JSON.stringify({fotos:[{...cam,hash:h()}],base:p}),ia:rnd(2)?'Grupo de personas en una asamblea comunitaria · Foto real · coherente con la actividad (confianza alta)':''}}
 if(r<9){const p=45+rnd(24);return{huellas:h(),verificacion:'Revisar',puntaje:String(p),alertas:'EXIF:Ninguna foto trae datos de cámara (posible captura de pantalla o imagen reenviada) | FECHA:Foto tomada el 2026-10-02; la actividad era el '+fecha,metadatos:JSON.stringify({fotos:[{hash:h(),origen:'galeria',tipo:'image/jpeg'}],base:p}),ia:''}}
 const p=8+rnd(25);return{huellas:h(),verificacion:'Sospechosa',puntaje:String(p),alertas:'DUP:Foto repetida: igual a la evidencia de otro servidor del '+fecha+' | PNG:Hay imágenes PNG; las capturas de pantalla suelen guardarse así | IA_REAL:La IA indica que parece captura de pantalla',metadatos:JSON.stringify({fotos:[{hash:h(),origen:'galeria',tipo:'image/png'}],base:p+45}),ia:'Captura de pantalla de un chat con una foto · No parece foto real · coherente con la actividad (confianza media)'}
}
/* Versión del demo de la revisión automática del servidor (Verificacion.gs) */
function demoVerificar(ev,a,metas){
 const al=[];let p=100;const pon=(c,t,n)=>{al.push(c+':'+t);p-=n};
 const otras=DB.evs.filter(x=>x.huellas).flatMap(x=>x.huellas.split(',').map(h=>[h,x]));
 const dup=metas.map(m=>otras.find(([h])=>distHuella(h,m.hash)<=10)).find(Boolean);
 const dupI=metas.some((m,i)=>metas.slice(0,i).some(n=>distHuella(m.hash,n.hash)<=10));
 if(!dup&&dupI) pon('DUP','Subió la misma foto más de una vez en este envío',15);
 if(dup) pon('DUP','Foto repetida: igual a '+(dup[1].usuarioId===ev.usuarioId?'otra evidencia suya':'la evidencia de '+dup[1].usuarioNombre)+' del '+dup[1].fecha.slice(0,10),60);
 const sin=metas.filter(m=>!m.exifFecha&&!m.exifModelo).length;
 if(metas.length&&sin===metas.length) pon('EXIF','Ninguna foto trae datos de cámara (posible captura de pantalla o imagen reenviada)',20); else if(sin) pon('EXIF',sin+' de '+metas.length+' fotos no traen datos de cámara',8);
 if(metas.some(m=>/png/i.test(m.tipo))) pon('PNG','Hay imágenes PNG; las capturas de pantalla suelen guardarse así',15);
 const fu=metas.find(m=>m.exifFecha&&Math.abs((new Date(m.exifFecha.slice(0,10))-new Date(a.fecha))/864e5)>1);if(fu) pon('FECHA','Foto tomada el '+fu.exifFecha.slice(0,10)+'; la actividad era el '+a.fecha,25);
 if(metas.length&&metas.every(m=>m.origen==='galeria')) pon('GAL','Las fotos se eligieron de la galería, no se tomaron en el momento',5);
 if(!ev.lat) pon('GPS','No se registró la ubicación al enviar',10);
 p=Math.max(0,p);return{huellas:metas.map(m=>m.hash).filter(Boolean).join(','),puntaje:String(p),verificacion:p>=70?'Confiable':p>=40?'Revisar':'Sospechosa',alertas:al.join(' | '),metadatos:JSON.stringify({fotos:metas,base:p})};
}
function demoSupervision(u,d){
 let A={tipo:'estado',nombre:'Todo el estado',region:'',zona:''};
 if(u.rol==='regional')A={tipo:'region',nombre:u.region,region:u.region,zona:''};if(u.rol==='encargado')A={tipo:'zona',nombre:u.zona,region:u.region,zona:u.zona};
 if(d.zona&&u.rol!=='encargado'){const z=DB.zonas.find(x=>x.zona===d.zona);A={tipo:'zona',nombre:z.zona,region:z.region,zona:z.zona}}else if(d.region&&u.rol==='admin')A={tipo:'region',nombre:d.region,region:d.region,zona:''};
 const dentro=r=>A.zona?r.zona===A.zona:A.region?r.region===A.region:true,en=f=>f.slice(0,10)>=d.desde&&f.slice(0,10)<=d.hasta,hoyS=hoy(),P={},puntos=[];
 const fila=p=>P[p.id]=P[p.id]||{supervisado:0,ultimaSupervision:'',supervisiones:0,supervisionesPlaneadas:0,snSup:new Set(),id:p.id,nombre:p.nombre,rol:p.rol,zona:p.zona,region:p.region,selfie:p.selfie,telefono:p.telefono,asignadas:0,exigibles:0,conEvidencia:0,validadas:0,vencidas:0,rechazadas:0,evidencias:0,evConfiables:0,evRevisar:0,evSospechosas:0,evSinRevisar:0,duplicadas:0,visitas:0,localidades:{},ultima:''};
 DB.personal.forEach(p=>{if(p.estatus==='Activo'&&['servidor','encargado','monitor','regional'].includes(p.rol)&&(p.rol!=='regional'||u.rol==='admin')&&dentro(p)&&p.id!==u.id&&(u.rol==='admin'||p.region===u.region&&(u.rol==='regional'||p.zona===u.zona)))fila(p)});
 const acts={};DB.acts.forEach(a=>{if(!en(a.fecha)||!dentro(a))return;const p=DB.personal.find(x=>x.id===a.asignadoA);if(!p||p.id===u.id||!P[p.id]&&u.rol!=='admin')return;acts[a.id]=a;const f=fila(p);f.asignadas++;
  if(!(a.estatus==='Pendiente'&&a.fecha>=hoyS))f.exigibles++;if(['Validada','Con evidencia'].includes(a.estatus))f.conEvidencia++;if(a.estatus==='Validada')f.validadas++;if(a.estatus==='Pendiente'&&a.fecha<hoyS)f.vencidas++});
 DB.evs.forEach(e=>{const a=acts[e.actividadId];if(!a)return;const f=P[a.asignadoA];if(!f)return;f.evidencias++;
  if(e.verificacion==='Confiable')f.evConfiables++;else if(e.verificacion==='Revisar')f.evRevisar++;else if(e.verificacion==='Sospechosa')f.evSospechosas++;else f.evSinRevisar++;
  if(String(e.alertas).includes('DUP:'))f.duplicadas++;if(e.fecha>f.ultima)f.ultima=e.fecha;if(e.lat)puntos.push({tipo:'evidencia',lat:+e.lat,lng:+e.lng,persona:f.nombre,personaId:f.id,fecha:e.fecha.slice(0,10),titulo:a.titulo,estado:e.verificacion||'Sin revisar'})});
 DB.evs.forEach(e=>{const a=DB.acts.find(x=>x.id===e.actividadId);if(!a||a.tipo!=='Visita de supervisión'||!en(a.fecha)||e.validacion==='Rechazada')return;let o={};try{o=JSON.parse(a.objetivo||'{}')}catch(x){}const sv=o.servidores||[],m=P[a.asignadoA];
  if(m){m.supervisiones++;sv.forEach(x=>m.snSup.add(x.id));m.visitas=m.supervisiones}sv.forEach(x=>{const f=P[x.id];if(!f)return;f.supervisado++;if(e.fecha>f.ultimaSupervision)f.ultimaSupervision=e.fecha});
  if(e.lat)puntos.push({tipo:'visita',lat:+e.lat,lng:+e.lng,persona:a.asignadoNombre,personaId:a.asignadoA,fecha:a.fecha,titulo:a.titulo,estado:e.validacion,actividadId:a.id})});
 DB.acts.forEach(a=>{if(a.tipo==='Visita de supervisión'&&en(a.fecha)&&P[a.asignadoA])P[a.asignadoA].supervisionesPlaneadas++});
 return{alcance:A,desde:d.desde,hasta:d.hasta,generado:hoy(),puntos,personas:Object.values(P).map(f=>(f.avance=f.exigibles?Math.round(f.conEvidencia/f.exigibles*100):null,f.snSupervisados=f.snSup.size,delete f.snSup,f.localidades=Object.keys(f.localidades).sort((a,b)=>f.localidades[b]-f.localidades[a]),f))};
}
