/* SAET Bienestar · Modo demo con datos de ejemplo (solo cuando API_URL está vacío)
   Lo usa: nadie en producción */

const DB={zonas:[],personal:[],acts:[],evs:[],vis:[]};
function sembrarDemo(){
 const R={'Región Centro':['Centro · Distrito 1','Centro · Distrito 2','Centro · Distrito 3','Centro · Distrito 4','Centro · Distrito 5','Centro · Distrito 6','Jalpa de Méndez','Nacajuca'],'Región Chontalpa':['Cárdenas','Comalcalco','Cunduacán','Huimanguillo','Paraíso'],'Región Sierra':['Jalapa','Tacotalpa','Teapa'],'Región Ríos':['Balancán','Emiliano Zapata','Tenosique'],'Región Pantanos':['Centla','Jonuta','Macuspana']};
 const N=['María','José','Guadalupe','Juan','Rosa','Carlos','Leticia','Miguel','Carmen','Luis','Patricia','Jorge','Yolanda','Pedro','Silvia','Manuel','Adriana','Ramón','Verónica','Héctor','Daniela','Óscar','Karla','Rubén'],A=['Hernández','De la Cruz','Jiménez','López','García','Pérez','Sánchez','Morales','Ramos','Córdova','Méndez','Arias','Ovando','Zurita','Priego','Cupil'];
 let s=7;const rnd=n=>{s=(s*9301+49297)%233280;return Math.floor(s/233280*n)},nom=()=>`${N[rnd(N.length)]} ${A[rnd(A.length)]} ${A[rnd(A.length)]}`;
 let k=0;const per=(rol,region,zona,est='Activo')=>{const n=nom(),p={id:'P'+(++k),rol,nombre:n,curp:rol==='admin'?'ADMIN':('DEMO'+String(k).padStart(6,'0')+'HTCXXX0'+k%10),correo:n.split(' ')[0].toLowerCase()+k+'@correo.mx',telefono:'993'+String(1000000+rnd(8999999)),facebook:rnd(3)?'fb.usuario'+k:'',instagram:rnd(2)?'ig.usuario'+k:'',selfie:'',region,zona,estatus:est,registro:hoy()};DB.personal.push(p);return p};
 per('admin','','');
 Object.entries(R).forEach(([r,zs])=>{per('regional',r,'');zs.forEach(z=>{DB.zonas.push({zona:z,tipo:z.includes('Distrito')?'Distrito':'Municipio',region:r,clave:(z.includes('Distrito')?'CD'+z.slice(-1):z.normalize('NFD').replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,3))+(1000+rnd(8999))});per('encargado',r,z);for(let i=0;i<3+rnd(2);i++)per('servidor',r,z,rnd(14)?'Activo':'Pendiente')})});
 for(let i=0;i<11;i++)per('monitor','','');
 const T=['Visitas de seguimiento','Asamblea informativa','Apoyo en operativo de pago','Módulo de atención','Levantamiento de censo','Reunión de coordinación','Difusión de convocatoria','Visitas a derechohabientes'],TT=['Visita domiciliaria','Asamblea informativa','Operativo de pago','Módulo de atención','Censo / registro','Reunión de trabajo','Difusión','Visita domiciliaria'];
 const L=['Col. Gaviotas','Villa Aldama','Ej. Miguel Hidalgo','Centro','Ra. Buenavista','Pob. Ocuiltzapotlán','Col. Tamulté','Villa Benito Juárez'],sem=lunes(new Date());
 const img=(i)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${['#E8CBD4','#EBDDC3','#D9C3CB'][i%3]}"/><stop offset="1" stop-color="${['#B56A82','#C9A56A','#82203F'][i%3]}"/></linearGradient></defs><rect width="400" height="300" fill="url(#a)"/><circle cx="${90+i*37%220}" cy="120" r="46" fill="#fff" opacity=".35"/><path d="M0 230l90-70 80 50 90-80 140 100v70H0z" fill="#fff" opacity=".3"/><text x="200" y="282" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#fff">Foto de ejemplo</text></svg>`);
 let n=0;DB.personal.filter(p=>p.estatus==='Activo'&&['servidor','monitor','encargado'].includes(p.rol)).forEach(p=>{
  const jefeP=DB.personal.find(x=>p.rol==='monitor'?x.id===p.id:x.rol==='regional'&&x.region===p.region);
  for(let i=0;i<(p.rol==='encargado'?1:2+rnd(3));i++){const t=rnd(T.length),d=rnd(7),f=iso(mas(sem,d)),pas=f<hoy(),est=pas?(rnd(10)<7?(rnd(3)?'Validada':'Con evidencia'):'Pendiente'):(f===hoy()&&rnd(3)===0?'Con evidencia':'Pendiente');
   const a={id:'A'+(++n),grupo:'G'+n,titulo:T[t],tipo:TT[t],descripcion:'Reportar resultado y tomar foto del lugar.',fecha:f,hora:['08:00','09:00','10:30','12:00','16:00'][rnd(5)],lugar:L[rnd(L.length)],region:p.region,zona:p.zona,asignadoA:p.id,asignadoNombre:p.nombre,creadoPor:jefeP.id,creadoNombre:jefeP.nombre,estatus:est,creado:hoy()};DB.acts.push(a);
   if(est!=='Pendiente'){const e={id:'E'+n,actividadId:a.id,usuarioId:p.id,usuarioNombre:p.nombre,region:p.region,zona:p.zona,fecha:f+' 14:'+String(10+rnd(49)),fotos:img(n)+' | '+img(n+1),comentario:'Actividad realizada sin contratiempos.',lat:'17.9869',lng:'-92.9303',validacion:est==='Validada'?'Validada':'Por validar',validadoPor:est==='Validada'?jefeP.nombre:'',nota:'',ia:''};DB.evs.push(e);
    if(a.tipo.startsWith('Visita'))for(let v=0;v<2+rnd(4);v++)DB.vis.push({id:'V'+n+'_'+v,actividadId:a.id,evidenciaId:e.id,servidorId:p.id,servidorNombre:p.nombre,region:p.region,zona:p.zona,fecha:f,nombre:nom(),curp:'',telefono:'993'+String(1000000+rnd(8999999)),domicilio:'Calle '+(1+rnd(40))+' s/n',localidad:a.lugar,programa:PROGRAMAS[rnd(PROGRAMAS.length)],motivo:'Seguimiento',resultado:RESULTADOS[rnd(RESULTADOS.length)],observaciones:''})}}});
}
function demoApi(accion,d){
 const u=S.user,alc=r=>!u?false:u.rol==='admin'||(u.rol==='regional'&&r.region===u.region)||(u.rol==='encargado'&&r.zona===u.zona),copia=x=>JSON.parse(JSON.stringify(x));
 const ve=a=>alc(a)||a.asignadoA===u.id||a.creadoPor===u.id,id=p=>p+Date.now().toString(36)+Math.floor(Math.random()*999);
 return new Promise((ok,no)=>setTimeout(()=>{try{ok(copia((()=>{
  if(accion==='zonas') return DB.zonas.map(({clave,...z})=>z);
  const dz=c=>{const z=DB.zonas.find(z=>z.clave===String(c||'').toUpperCase().trim());if(!z)throw new Error('Esa clave no existe. Pídesela a tu encargado de municipio o distrito.');return z};
  if(accion==='revisarClave'){const z=dz(d.clave);return{zona:z.zona,region:z.region}}
  if(accion==='nuevaClaveZona'){const z=DB.zonas.find(x=>x.zona===d.zona);z.clave=z.clave.replace(/\d+$/,'')+(1000+Math.floor(Math.random()*8999));return{zona:z.zona,clave:z.clave}}
  if(accion==='login') throw new Error('En modo demo usa los botones de abajo.');
  if(accion==='registro'){const z=dz(d.clave);DB.personal.push({id:id('P'),rol:'servidor',nombre:d.nombre,curp:d.curp.toUpperCase(),correo:d.correo,telefono:d.telefono,facebook:d.facebook,instagram:d.instagram,selfie:d.selfie,region:z.region,zona:z.zona,estatus:'Pendiente',registro:hoy()});return{mensaje:'Registro enviado para '+z.zona+' (demo). Tu encargado lo aprobará.'}}
  if(accion==='datos'){const acts=DB.acts.filter(a=>a.fecha>=d.desde&&a.fecha<=d.hasta&&ve(a)),ids=new Set(acts.map(a=>a.id));
   return{usuario:DB.personal.find(p=>p.id===u.id),zonas:DB.zonas.map(({clave,...z})=>z),personal:DB.personal.filter(p=>p.id===u.id||alc(p)),actividades:acts,evidencias:DB.evs.filter(e=>ids.has(e.actividadId)),visitas:DB.vis.filter(v=>v.servidorId===u.id||alc(v)),claves:DB.zonas.filter(z=>u.rol==='admin'||(u.rol==='regional'&&z.region===u.region)||(u.rol==='encargado'&&z.zona===u.zona)).map(({zona,region,clave})=>({zona,region,clave}))}}
  if(accion==='exportar') return{Personal:DB.personal.filter(p=>p.id===u.id||alc(p)),Actividades:DB.acts.filter(ve),Evidencias:DB.evs.filter(e=>alc(e)||e.usuarioId===u.id).map(e=>({...e,fotos:'(foto de ejemplo)'})),Visitas:DB.vis.filter(v=>alc(v)||v.servidorId===u.id)};
  if(accion==='guardarActividad'){if(d.id){Object.assign(DB.acts.find(a=>a.id===d.id),{fecha:d.fecha,hora:d.hora});return{nuevas:[]}}
   const asg=(u.rol==='monitor'?[u.id]:d.asignados).map(i=>DB.personal.find(p=>p.id===i));if(!asg.length) throw new Error('Elige al menos a una persona');
   const nuevas=[];d.actividades.forEach(x=>asg.forEach(p=>nuevas.push({id:id('A'),grupo:'G',titulo:x.titulo,tipo:x.tipo||'Otra',descripcion:x.descripcion||'',fecha:x.fecha,hora:x.hora||'',lugar:x.lugar||'',region:p.region,zona:p.zona,asignadoA:p.id,asignadoNombre:p.nombre,creadoPor:u.id,creadoNombre:u.nombre,estatus:'Pendiente',creado:hoy()})));DB.acts.push(...nuevas);return{nuevas}}
  if(accion==='eliminarActividad'){DB.acts=DB.acts.filter(a=>a.id!==d.id);return{}}
  if(accion==='subirEvidencia'){const a=DB.acts.find(x=>x.id===d.actividadId),e={id:d.id||id('E'),actividadId:a.id,usuarioId:u.id,usuarioNombre:u.nombre,region:a.region,zona:a.zona,fecha:hoy()+' '+new Date().toTimeString().slice(0,5),fotos:d.fotos.join(' | '),comentario:d.comentario,lat:String(d.lat),lng:String(d.lng),validacion:'Por validar',validadoPor:'',nota:'',ia:''};DB.evs.push(e);a.estatus='Con evidencia';
   return{}}
  if(accion==='guardarVisita'){const i=DB.vis.findIndex(v=>v.id===d.id),a=DB.acts.find(x=>x.id===d.actividadId),n={...(i>-1?DB.vis[i]:{evidenciaId:'',servidorId:u.id,servidorNombre:u.nombre,fecha:hoy()}),...d,region:a?a.region:u.region,zona:a?a.zona:u.zona};i>-1?DB.vis[i]=n:DB.vis.push(n);return{visita:n}}
  if(accion==='eliminarVisita'){DB.vis=DB.vis.filter(v=>v.id!==d.id);return{}}
  if(accion==='validarEvidencia'){const e=DB.evs.find(x=>x.id===d.id);Object.assign(e,{validacion:d.validacion,validadoPor:u.nombre,nota:d.nota});DB.acts.find(a=>a.id===e.actividadId).estatus=d.validacion;return{}}
  if(accion==='guardarPersona'){if(d.id){DB.personal.find(p=>p.id===d.id).estatus=d.estatus;return{}}
   const z=DB.zonas.find(x=>x.zona===d.zona),np={id:id('P'),rol:d.rol,nombre:d.nombre,curp:(d.curp||'').toUpperCase(),correo:d.correo,telefono:d.telefono,facebook:'',instagram:'',selfie:'',region:d.rol==='regional'?d.region:z?z.region:'',zona:d.rol==='regional'?'':d.zona,estatus:'Activo',registro:hoy()};DB.personal.push(np);return{pin:'482913',usuario:np.curp,persona:np}}
  if(accion==='resetPin') return{pin:'739105',usuario:DB.personal.find(p=>p.id===d.id).curp};
  if(accion==='actualizarPerfil'){const p=DB.personal.find(x=>x.id===u.id);['correo','telefono','facebook','instagram','selfie'].forEach(k=>{if(d[k]!=null)p[k]=d[k]});return{usuario:p}}
  if(accion==='ia'){if(d.tipo==='agenda') return[{titulo:'Asamblea informativa',tipo:'Asamblea informativa',fecha:iso(mas(lunes(new Date()),1)),hora:'09:00',lugar:'Parque de Tamulté',descripcion:''},{titulo:'Visitas domiciliarias',tipo:'Visita domiciliaria',fecha:iso(mas(lunes(new Date()),2)),hora:'',lugar:'Col. Gaviotas',descripcion:''},{titulo:'Reunión de trabajo',tipo:'Reunión de trabajo',fecha:iso(mas(lunes(new Date()),4)),hora:'10:00',lugar:'Delegación',descripcion:''}];
   if(d.tipo==='verificar') return{ia:'✔ La foto muestra una actividad en campo acorde con la tarea (ejemplo de demo).'};
   return{texto:'Ejemplo de demo: al conectar tu clave de Gemini, aquí aparecerá el resumen ejecutivo de la semana con avance general, zonas destacadas, zonas rezagadas y recomendaciones, redactado a partir de tus datos reales.'}}
  throw new Error('Acción no disponible en demo')})()))}catch(e){no(e)}},220));
}
