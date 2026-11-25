/* SAET Bienestar · Reporte de avance: documento, gráficas, hallazgos, paquete por región/municipio, PDF, Excel y WhatsApp
   Lo usa: Administrador, Regional y Encargado (la pantalla y los filtros están en reportes.js) */

/* ── Semáforo de cumplimiento (siempre con texto, nunca solo color) ── */
const SEMAFORO = p => p==null?{c:'var(--mute)',t:'Sin vencimientos',i:'○'}:p>=80?{c:'var(--ok)',t:'Buen avance',i:'●'}:p>=50?{c:'var(--warn)',t:'Avance medio',i:'◆'}:{c:'var(--bad)',t:'Rezago',i:'▲'};
const COLOR_CUMPLIDA='#A8385A', COLOR_PENDIENTE='#B5822A';           // validados con la herramienta de color (daltonismo y contraste)
const pctTxt = p => p==null?'—':p+'%';
const num = n => Number(n||0).toLocaleString('es-MX');
const pct = (a,b) => b?Math.round(a/b*100):0;
const periodoTxt = r => r.desde===r.hasta?fechaLarga(r.desde):`${fechaLarga(r.desde)} al ${fechaLarga(r.hasta)}`;
const fechaLarga = s => new Date(s+'T12:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'});
const nivelHijo = t => t==='estado'?'región':t==='region'?'municipio o subregión':'servidor';

function semaforoChip(p){const s=SEMAFORO(p);return`<span class="sem" style="--c:${s.c}"><i aria-hidden="true">${s.i}</i>${pctTxt(p)} · ${s.t}</span>`}
function anillo(p){const s=SEMAFORO(p),v=p||0,C=2*Math.PI*26;
 return`<svg class="anillo" viewBox="0 0 64 64" role="img" aria-label="Cumplimiento ${pctTxt(p)}"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--g100)" stroke-width="7"/>
 <circle cx="32" cy="32" r="26" fill="none" stroke="${s.c}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C*v/100} ${C}" transform="rotate(-90 32 32)"/>
 <text x="32" y="37" text-anchor="middle" font-size="15" font-weight="700" fill="var(--tinta)">${pctTxt(p)}</text></svg>`}

/* ── Gráficas ── */
// Barras horizontales de cumplimiento por región / municipio, coloreadas por semáforo y con su porcentaje escrito
function barrasAvance(lista){
 const l=lista.slice().sort((a,b)=>(b.cumplimiento??-1)-(a.cumplimiento??-1)||b.actividades-a.actividades);
 return`<div class="bars">${l.map(x=>{const s=SEMAFORO(x.cumplimiento);return`<div class="bar" title="${esc(x.nombre)}: ${x.conEvidencia} de ${x.exigibles} actividades exigibles con evidencia (${x.actividades} programadas) · ${x.vencidas} vencidas · ${x.visitas} visitas">
  <span class="bl">${esc(x.nombre)}</span><span class="bt"><i style="width:${x.cumplimiento||0}%;background:${s.c}"></i></span><span class="bv">${pctTxt(x.cumplimiento)} <small>${s.t}</small></span></div>`}).join('')}</div>`}
// Barras simples de conteo (tipos, programas, resultados): una sola serie, con el número escrito
function barrasConteo(obj,clave){
 const l=Object.entries(obj).map(([k,v])=>[k,typeof v==='object'?v[clave||'total']:v]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).slice(0,8),max=Math.max(1,...l.map(x=>x[1]));
 if(!l.length) return'<div class="vacio sm">Sin datos en el periodo.</div>';
 return`<div class="bars">${l.map(([k,v])=>`<div class="bar"><span class="bl">${esc(k)}</span><span class="bt"><i style="width:${v/max*100}%;background:${COLOR_CUMPLIDA}"></i></span><span class="bv">${num(v)}</span></div>`).join('')}</div>`}
// Columnas apiladas por día o mes: con evidencia (abajo) y sin evidencia (arriba), con leyenda y detalle al pasar el dedo
function columnasSerie(r){
 const s=r.serie;if(!s.some(x=>x.total)) return'<div class="vacio sm">Sin actividades en el periodo.</div>';
 const max=Math.max(...s.map(x=>x.total)),tope=Math.max(4,Math.ceil(max/4)*4),paso=Math.ceil(s.length/12);
 const et=k=>r.serieTipo==='mes'?new Date(k+'-15T12:00').toLocaleDateString('es-MX',{month:'short',year:'2-digit'}):new Date(k+'T12:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'});
 return`<div class="leyenda"><span><i style="background:${COLOR_CUMPLIDA}"></i>Con evidencia</span><span><i style="background:${COLOR_PENDIENTE}"></i>Sin evidencia</span></div>
 <div class="cols" style="--n:${s.length}"><div class="ejeY">${[tope,tope*3/4,tope/2,tope/4,0].map(v=>`<span>${num(v)}</span>`).join('')}</div><div class="area">
 ${s.map((x,i)=>`<div class="col2" title="${et(x.etiqueta)}: ${x.total} actividades · ${x.cumplidas} con evidencia${x.vencidas?' · '+x.vencidas+' vencidas':''}">
  <div class="pila" style="height:${x.total/tope*100}%">${x.total-x.cumplidas?`<i style="flex:${x.total-x.cumplidas};background:${COLOR_PENDIENTE}"></i>`:''}${x.cumplidas?`<i style="flex:${x.cumplidas};background:${COLOR_CUMPLIDA}"></i>`:''}</div>
  <span class="ex">${i%paso===0?et(x.etiqueta):''}</span></div>`).join('')}</div></div>`}

/* ── Hallazgos automáticos (sin IA: se calculan con los números) ── */
function hallazgos(t,hijos,personas,nivel){
 const h=[],con=hijos.filter(x=>x.cumplimiento!=null),orden=con.slice().sort((a,b)=>b.cumplimiento-a.cumplimiento||b.actividades-a.actividades);
 h.push(!t.actividades?'No hay actividades programadas en este periodo.':t.exigibles?`Cumplimiento de <b>${pctTxt(t.cumplimiento)}</b>: ${num(t.conEvidencia)} de ${num(t.exigibles)} actividades que ya debían hacerse tienen evidencia.`:'Ninguna actividad ha llegado aún a su fecha.');
 if(t.pendientes) h.push(`${num(t.pendientes)} actividades están programadas para los próximos días y todavía no cuentan para el cumplimiento.`);
 if(orden.length>1){const a=orden[0],z=orden[orden.length-1];
  h.push(`Mejor avance: <b>${esc(a.nombre)}</b> con ${a.cumplimiento}%.`);
  if(z.cumplimiento<a.cumplimiento) h.push(`Mayor rezago: <b>${esc(z.nombre)}</b> con ${z.cumplimiento}%${z.vencidas?` y ${num(z.vencidas)} actividades vencidas`:''}.`)}
 const sin=hijos.filter(x=>!x.actividades&&nivel!=='servidor');
 if(sin.length) h.push(`Sin actividades registradas (${sin.length}): ${sin.slice(0,6).map(x=>esc(x.nombre)).join(', ')}${sin.length>6?'…':''}.`);
 if(t.vencidas) h.push(`<b>${num(t.vencidas)}</b> actividades vencidas sin evidencia (${pct(t.vencidas,t.exigibles)}% de las que ya debían hacerse).`);
 if(t.porValidar) h.push(`${num(t.porValidar)} evidencias esperan validación de su encargado o regional.`);
 const evT=(t.evConfiables||0)+(t.evRevisar||0)+(t.evSospechosas||0);
 if(evT) h.push(`Calidad de evidencias: <b>${pct(t.evConfiables,evT)}%</b> confiables${t.evSospechosas?`, <b style="color:var(--bad)">${num(t.evSospechosas)} sospechosas</b> (fotos repetidas, sin datos de cámara o fuera de fecha)`:''}.`);
 if(t.rechazadas) h.push(`${num(t.rechazadas)} evidencias fueron rechazadas y deben volver a subirse.`);
 if(t.servidores) h.push(`${num(t.servidoresConActividad)} de ${num(t.servidores)} servidores de la nación tuvieron actividades (${pct(t.servidoresConActividad,t.servidores)}%).`);
 if(t.visitas){h.push(`${num(t.visitas)} personas visitadas en el periodo.`)}
 return`<ul class="hallazgos">${h.map(x=>`<li>${x}</li>`).join('')}</ul>`;
}

/* ── Tablas ── */
function tablaHijos(lista,conRegion){
 const l=lista.slice().sort((a,b)=>(b.cumplimiento??-1)-(a.cumplimiento??-1)||b.actividades-a.actividades);
 return`<div class="tabla"><table class="tr"><tr><th>#</th><th>${conRegion?'Municipio / subregión':'Nombre'}</th>${conRegion?'<th>Región</th>':''}<th style="min-width:150px">Cumplimiento</th><th>Program.</th><th>Exigibles</th><th>Con evid.</th><th>Validadas</th><th>Vencidas</th><th>Evid. sosp.</th><th>Visitas de<br>supervisión</th><th>Servidores<br><small>con act. / total</small></th></tr>
 ${l.map((x,i)=>`<tr><td class="mute">${x.actividades?i+1:'—'}</td><td><b>${esc(x.nombre)}</b></td>${conRegion?`<td class="sm mute">${esc(x.region||'')}</td>`:''}<td>${semaforoChip(x.cumplimiento)}</td><td>${num(x.actividades)}</td><td>${num(x.exigibles)}</td><td>${num(x.conEvidencia)}</td><td>${num(x.validadas)}</td><td>${x.vencidas?`<b style="color:var(--bad)">${num(x.vencidas)}</b>`:0}</td><td>${x.evSospechosas?`<b style="color:var(--bad)">${num(x.evSospechosas)}</b>`:0}</td><td>${num(x.visitas)}</td><td>${num(x.servidoresConActividad)} / ${num(x.servidores)}</td></tr>`).join('')||'<tr><td colspan="12" class="vacio">Sin datos.</td></tr>'}</table></div>`}
function tablaPersonas(lista,lim){
 const l=lista.slice().sort((a,b)=>(b.cumplimiento??-1)-(a.cumplimiento??-1)||b.conEvidencia-a.conEvidencia).slice(0,lim||500);
 return`<div class="tabla"><table class="tr"><tr><th>#</th><th>Nombre</th><th>Zona</th><th style="min-width:150px">Cumplimiento</th><th>Program.</th><th>Exigibles</th><th>Con evid.</th><th>Vencidas</th><th>Evid. sosp.</th><th>Visitas de<br>supervisión</th></tr>
 ${l.map((x,i)=>`<tr><td class="mute">${i+1}</td><td><b>${esc(x.nombre)}</b><br><small class="mute">${ROL[x.rol]||''}</small></td><td class="sm">${esc(x.zona||'—')}</td><td>${semaforoChip(x.cumplimiento)}</td><td>${num(x.actividades)}</td><td>${num(x.exigibles)}</td><td>${num(x.conEvidencia)}</td><td>${x.vencidas?`<b style="color:var(--bad)">${num(x.vencidas)}</b>`:0}</td><td>${x.evSospechosas?`<b style="color:var(--bad)">${num(x.evSospechosas)}</b>`:0}</td><td>${num(x.visitas)}</td></tr>`).join('')||'<tr><td colspan="10" class="vacio">Sin actividades en el periodo.</td></tr>'}</table></div>`}
function listaCorta(lista,titulo,vacio){return`<div><h4 class="sub">${titulo}</h4>${lista.length?lista.map(x=>`<div class="item"><div class="sp"><div class="t">${esc(x.nombre)}</div><div class="s">${esc(x.zona||'')} · ${x.conEvidencia}/${x.exigibles} con evidencia${x.vencidas?` · ${x.vencidas} vencidas`:''}</div></div>${semaforoChip(x.cumplimiento)}</div>`).join(''):`<div class="vacio sm">${vacio}</div>`}</div>`}

/* ── KPIs ── */
function kpis(t){return`<div class="kpis">
 <div class="kpi grande">${anillo(t.cumplimiento)}<div><b>Cumplimiento</b><span>${num(t.conEvidencia)} de ${num(t.exigibles)} que ya debían hacerse</span></div></div>
 <div class="kpi"><b>${num(t.actividades)}</b><span>Programadas<br><small>${num(t.pendientes)} aún por vencer</small></span></div>
 <div class="kpi"><b>${num(t.validadas)}</b><span>Validadas</span></div>
 <div class="kpi"><b>${num(t.porValidar)}</b><span>Por validar</span></div>
 <div class="kpi alerta"><b>${num(t.vencidas)}</b><span>Vencidas</span></div>
 <div class="kpi alerta" title="Confiables: ${num(t.evConfiables)} · Por revisar: ${num(t.evRevisar)}"><b>${num(t.evSospechosas)}</b><span>Evidencias sospechosas<br><small>${num(t.evConfiables)} confiables · ${num(t.evRevisar)} por revisar</small></span></div>
 <div class="kpi"><b>${num(t.visitas)}</b><span>Visitas de supervisión</span></div>
 <div class="kpi"><b>${num(t.servidoresConActividad)}<small>/${num(t.servidores)}</small></b><span>Servidores con actividad</span></div></div>`}

/* ── Documento completo ── */
function cabecera(titulo,r,sub){return`<header class="doc-cab"><img src="${LOGO}" alt=""><div class="sp"><small>${NOMBRE} · Reporte de avance territorial</small><h2>${esc(titulo)}</h2><p>${periodoTxt(r)}${sub?' · '+sub:''}</p></div></header>`}
function docReporte(r,iaTexto,paquete){
 const A=r.alcance,t=r.total,est=A.tipo==='estado',reg=A.tipo==='region',zon=A.tipo==='zona';
 const zonas=r.zonas,personas=r.personas.filter(p=>p.rol==='servidor'||p.rol==='encargado'||p.rol==='monitor');
 const hijos=est?r.regiones:reg?zonas:personas;
 const conAct=personas.filter(p=>p.exigibles>=2);
 const destacados=conAct.slice().sort((a,b)=>b.cumplimiento-a.cumplimiento||b.conEvidencia-a.conEvidencia).slice(0,6);
 const atencion=personas.filter(p=>p.vencidas).sort((a,b)=>b.vencidas-a.vencidas).slice(0,6);
 let h=`<article class="doc">${cabecera(A.nombre,r,`Generado ${r.generado} por ${esc(r.generadoPor)}`)}
 <section>${kpis(t)}<p class="nota-sem"><span class="sem" style="--c:var(--ok)"><i>●</i>80% o más · Buen avance</span><span class="sem" style="--c:var(--warn)"><i>◆</i>50 a 79% · Medio</span><span class="sem" style="--c:var(--bad)"><i>▲</i>menos de 50% · Rezago</span></p></section>
 <section class="card"><h3>Hallazgos principales</h3>${hallazgos(t,hijos,personas,nivelHijo(A.tipo))}</section>`;
 if(iaTexto) h+=`<section class="card ia-doc"><h3>${ic('ia')} Análisis con IA</h3><p style="white-space:pre-wrap">${esc(iaTexto)}</p></section>`;
 if(est) h+=`<section class="card"><h3>Avance por región</h3>${barrasAvance(r.regiones)}${tablaHijos(r.regiones,false)}</section>`;
 if(est||reg) h+=`<section class="card"><h3>Avance por municipio y subregión <span class="der">${zonas.length} zonas</span></h3>${reg?barrasAvance(zonas):''}${tablaHijos(zonas,est)}</section>`;
 if(zon) h+=`<section class="card"><h3>Avance por servidor <span class="der">${personas.length} personas</span></h3>${tablaPersonas(personas)}</section>`;
 else h+=`<section class="card"><h3>Servidores</h3><div class="dos-col">${listaCorta(destacados,'Mejor desempeño','Sin datos suficientes (mínimo 2 actividades vencidas o hechas).')}${listaCorta(atencion,'Requieren atención (vencidas)','Nadie tiene actividades vencidas.')}</div></section>`;
 h+=`<section class="card"><h3>Tendencia ${r.serieTipo==='mes'?'mensual':'diaria'}</h3>${columnasSerie(r)}</section>
 <section class="tres-col"><div class="card"><h3>Por tipo de actividad</h3>${barrasConteo(r.tipos)}</div><div class="card"><h3>Visitas de supervisión por tipo</h3>${barrasConteo(r.programas)}</div><div class="card"><h3>Calificación de servidores supervisados</h3>${barrasConteo(r.resultados)}</div></section>`;
 if(paquete&&!zon) h+=paqueteHojas(r);
 return h+`<footer class="doc-pie">${NOMBRE} · ${SIGLA} · ${esc(A.nombre)} · ${periodoTxt(r)}</footer></article>`;
}

/* ── Paquete: una hoja por cada región (o por cada municipio si el reporte es de una región) ── */
function sumaStats(lista){const s={actividades:0,conEvidencia:0,validadas:0,porValidar:0,rechazadas:0,pendientes:0,vencidas:0,visitas:0,servidores:0,servidoresConActividad:0,evConfiables:0,evRevisar:0,evSospechosas:0};
 lista.forEach(x=>Object.keys(s).forEach(k=>s[k]+=x[k]||0));s.exigibles=s.actividades-s.pendientes;s.cumplimiento=s.exigibles?Math.round(s.conEvidencia/s.exigibles*100):null;return s}
function paqueteHojas(r){
 const est=r.alcance.tipo==='estado',personas=r.personas;
 const grupos=est?r.regiones.filter(x=>x.nombre!=='Monitores').map(g=>({g,zonas:r.zonas.filter(z=>z.region===g.nombre),pers:personas.filter(p=>p.region===g.nombre)}))
  :r.zonas.map(g=>({g,zonas:null,pers:personas.filter(p=>p.zona===g.nombre)}));
 return grupos.map(({g,zonas,pers})=>{const t=est?g:g;
  return`<div class="salto"></div><section class="hoja">${cabecera(g.nombre,r,est?'Hoja de región':'Hoja de municipio o subregión')}${kpis(t)}
  <div class="card"><h3>Hallazgos</h3>${hallazgos(t,zonas||pers,pers,zonas?'municipio o subregión':'servidor')}</div>
  <div class="card"><h3>${zonas?'Municipios y subregiones de la región':'Servidores'}</h3>${zonas?barrasAvance(zonas)+tablaHijos(zonas,false):tablaPersonas(pers,40)}</div></section>`}).join('');
}

/* ── Salidas: PDF, Excel, WhatsApp ── */
function imprimirReporte(){document.body.classList.add('imprimiendo');setTimeout(()=>{window.print();setTimeout(()=>document.body.classList.remove('imprimiendo'),500)},60)}
function excelReporte(r){
 const fila=x=>({'Nombre':x.nombre,'Cumplimiento %':x.cumplimiento??'','Exigibles':x.exigibles,'Semáforo':SEMAFORO(x.cumplimiento).t,'Actividades':x.actividades,'Con evidencia':x.conEvidencia,'Validadas':x.validadas,'Por validar':x.porValidar,'Rechazadas':x.rechazadas,'Pendientes':x.pendientes,'Vencidas':x.vencidas,'Evidencias confiables':x.evConfiables||0,'Evidencias por revisar':x.evRevisar||0,'Evidencias sospechosas':x.evSospechosas||0,'Visitas de supervisión':x.visitas,'Servidores activos':x.servidores,'Servidores con actividad':x.servidoresConActividad});
 const t=r.total,hojas={
  'Resumen':[['Alcance',r.alcance.nombre],['Periodo',periodoTxt(r)],['Generado',r.generado+' por '+r.generadoPor],['Cumplimiento % (sobre exigibles)',t.cumplimiento??''],['Actividades programadas',t.actividades],['Exigibles (ya debían hacerse)',t.exigibles],['Con evidencia',t.conEvidencia],['Validadas',t.validadas],['Por validar',t.porValidar],['Rechazadas',t.rechazadas],['Pendientes',t.pendientes],['Vencidas',t.vencidas],['Evidencias confiables',t.evConfiables||0],['Evidencias por revisar',t.evRevisar||0],['Evidencias sospechosas',t.evSospechosas||0],['Visitas de supervisión',t.visitas],['Servidores activos',t.servidores],['Servidores con actividad',t.servidoresConActividad]].map(([a,b])=>({'Indicador':a,'Valor':b}))};
 if(r.alcance.tipo==='estado') hojas['Por región']=r.regiones.map(fila);
 if(r.alcance.tipo!=='zona') hojas['Por municipio']=r.zonas.map(x=>({'Región':x.region,...fila(x)}));
 hojas['Por servidor']=r.personas.map(x=>({'Rol':ROL[x.rol]||'','Región':x.region,'Zona':x.zona,...fila(x)}));
 hojas['Por tipo']=Object.entries(r.tipos).map(([k,v])=>({'Tipo':k,'Actividades':v.total,'Con evidencia':v.cumplidas,'Cumplimiento %':pct(v.cumplidas,v.total)}));
 hojas['Supervisión por tipo']=Object.entries(r.programas).map(([k,v])=>({'Tipo de visita':k,'Visitas':v}));
 hojas['Calificaciones']=Object.entries(r.resultados).map(([k,v])=>({'Calificación':k,'Servidores':v}));
 hojas['Tendencia']=r.serie.map(x=>({[r.serieTipo==='mes'?'Mes':'Día']:x.etiqueta,'Actividades':x.total,'Con evidencia':x.cumplidas,'Vencidas':x.vencidas}));
 const a=document.createElement('a');a.href=URL.createObjectURL(libroExcel(hojas));
 a.download=`${NOMBRE.replace(/\s+/g,'_')}_Reporte_${r.alcance.nombre.replace(/[^\wÁÉÍÓÚÑáéíóúñ]+/g,'_')}_${r.desde}_${r.hasta}.xlsx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('Excel del reporte listo');
}
function textoWhatsApp(r){
 const t=r.total,est=r.alcance.tipo==='estado',hijos=(est?r.regiones:r.alcance.tipo==='region'?r.zonas:r.personas).filter(x=>x.cumplimiento!=null).sort((a,b)=>b.cumplimiento-a.cumplimiento);
 const l=[`*${NOMBRE} · Reporte de avance*`,`📍 ${r.alcance.nombre}`,`🗓️ ${periodoTxt(r)}`,'',`✅ Cumplimiento: *${pctTxt(t.cumplimiento)}* (${num(t.conEvidencia)} de ${num(t.exigibles)} que ya debían hacerse)`,`📋 Programadas: ${num(t.actividades)} · por vencer: ${num(t.pendientes)}`,`✔️ Validadas: ${num(t.validadas)} · ⏳ Por validar: ${num(t.porValidar)}`,`⚠️ Vencidas: ${num(t.vencidas)}`,`🔍 Evidencias sospechosas: ${num(t.evSospechosas||0)} (confiables: ${num(t.evConfiables||0)})`,`🔎 Visitas de supervisión de mandos: ${num(t.visitas)}`,`👥 Servidores con actividad: ${num(t.servidoresConActividad)} de ${num(t.servidores)}`];
 if(hijos.length){l.push('',`*Por ${nivelHijo(r.alcance.tipo)}:*`);hijos.slice(0,est?6:10).forEach((x,i)=>l.push(`${i+1}. ${x.nombre}: ${x.cumplimiento}% ${x.cumplimiento>=80?'🟢':x.cumplimiento>=50?'🟡':'🔴'}`))}
 return l.join('\n');
}
function copiarWhatsApp(r){const t=textoWhatsApp(r);(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Resumen copiado: pégalo en WhatsApp'),()=>prompt('Copia este texto:',t))}
