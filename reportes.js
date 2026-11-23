/* SAET Bienestar · Pantalla de Reportes (filtros) y descargas en Excel; el documento del reporte está en avance.js
   Lo usa: Administrador, Regional y Encargado */

/* Estado del reporte: periodo, alcance, paquete y último resultado */
function rangoPeriodo(R){
 const h=new Date(),l=lunes(h),m0=new Date(h.getFullYear(),h.getMonth(),1);
 const P={semana:[l,mas(l,6)],semanaPasada:[mas(l,-7),mas(l,-1)],mes:[m0,new Date(h.getFullYear(),h.getMonth()+1,0)],mesPasado:[new Date(h.getFullYear(),h.getMonth()-1,1),new Date(h.getFullYear(),h.getMonth(),0)]};
 if(P[R.per]){R.desde=iso(P[R.per][0]);R.hasta=iso(P[R.per][1])}
}
const PERIODOS=[['semana','Esta semana'],['semanaPasada','Semana pasada'],['mes','Este mes'],['mesPasado','Mes pasado'],['otro','Otras fechas']];
/* Filtros compartidos por Reportes y Supervisión */
function bloquePeriodo(R,redibujar){
 return`<div class="pf-bloque"><span class="pf-et">Periodo</span><div class="seg">${PERIODOS.map(([k,t])=>`<button class="${R.per===k?'on':''}" onclick="S.${redibujar==='vSupervision'?'sup':'rep'}.per='${k}';${redibujar}()">${t}</button>`).join('')}</div>
 ${R.per==='otro'?`<div class="pf-rango"><input type="date" value="${R.desde}" aria-label="Desde" onchange="S.${redibujar==='vSupervision'?'sup':'rep'}.desde=this.value"><span>al</span><input type="date" value="${R.hasta}" aria-label="Hasta" onchange="S.${redibujar==='vSupervision'?'sup':'rep'}.hasta=this.value"></div>`
  :`<div class="pf-texto">${ic('agenda')} ${periodoTxt(R)}</div>`}</div>`}
function selectorAlcance(R,onchange){
 const u=S.user,zonas=S.zonas.filter(z=>u.rol==='admin'||(u.rol==='regional'&&z.region===u.region)),regiones=[...new Set(zonas.map(z=>z.region))];
 const opt=(v,t)=>`<option value="${esc(v)}" ${R.sel===v?'selected':''}>${esc(t)}</option>`;
 if(u.rol==='encargado') return`<div class="fijo">${ic('visitas')} ${esc(u.zona)}</div>`;
 return`<select onchange="${onchange}">${u.rol==='admin'?opt('','Todo el estado')+regiones.map(r=>`<optgroup label="${esc(r)}">${opt('r:'+r,'Toda la '+r)}${zonas.filter(z=>z.region===r).map(z=>opt('z:'+z.zona,z.zona)).join('')}</optgroup>`).join('')
  :opt('','Toda mi región ('+u.region+')')+zonas.map(z=>opt('z:'+z.zona,z.zona)).join('')}</select>`}
const paramsAlcance=sel=>({region:String(sel||'').startsWith('r:')?sel.slice(2):'',zona:String(sel||'').startsWith('z:')?sel.slice(2):''});
function tipoAlcance(R){const u=S.user;return u.rol==='encargado'||R.sel.startsWith('z:')?'zona':(u.rol==='regional'||R.sel.startsWith('r:'))?'region':'estado'}
function vReportes(){
 const u=S.user,R=S.rep=S.rep||{per:'semana',sel:'',paquete:false,datos:null,ia:''};rangoPeriodo(R);const t=tipoAlcance(R);
 $('#vista').innerHTML=`<div class="card panel-filtros no-print">
  <div class="pf-cab"><div><h3>Reporte de avance territorial</h3><p class="sm mute">Avance por región, municipio y servidor, con semáforo, verificación de evidencias y hallazgos.</p></div>
   <button class="btn" onclick="generarReporte(this)">${ic('reportes')} Generar reporte</button></div>
  <div class="pf-grid">${bloquePeriodo(R,'vReportes')}
   <div class="pf-bloque"><span class="pf-et">Alcance</span>${selectorAlcance(R,"S.rep.sel=this.value;vReportes()")}</div>
   <div class="pf-bloque"><span class="pf-et">Opciones</span>${t==='zona'?'<p class="sm mute" style="margin:0">El reporte de un municipio incluye la tabla completa de sus servidores.</p>':`<label class="check"><input type="checkbox" ${R.paquete?'checked':''} onchange="S.rep.paquete=this.checked"><span>Agregar una hoja por cada ${t==='estado'?'región':'municipio o distrito'}<small>Paquete listo para imprimir o mandar</small></span></label>`}</div></div></div>
 <div id="repDoc">${R.datos?barraAcciones()+docReporte(R.datos,R.ia,R.paqueteHecho):`<div class="vacio-rep no-print">
  <div class="vr-item"><i style="--c:var(--ok)">${ic('reportes')}</i><b>Avance con semáforo</b><span>Por región, municipio y servidor, contando solo lo que ya debía hacerse.</span></div>
  <div class="vr-item"><i style="--c:var(--bad)">${ic('evidencias')}</i><b>Evidencias verificadas</b><span>Confiables, por revisar y sospechosas: fotos repetidas, sin datos de cámara o fuera de fecha.</span></div>
  <div class="vr-item"><i style="--c:var(--oro)">${ic('ia')}</i><b>Listo para entregar</b><span>PDF para el delegado, Excel con todas las tablas o resumen para WhatsApp.</span></div></div>`}</div>
 <details class="card no-print" style="margin-top:18px"><summary class="serif" style="font-size:15px;cursor:pointer">${ic('reportes')} Descargar bases completas en Excel</summary>
  <p class="mute sm" style="margin:10px 0">Todo el historial de tu alcance${u.rol==='admin'?' (todo el estado)':''}, sin filtros.</p>
  ${[['Personal','Directorio del personal con CURP, contacto y redes'],['Actividades','Agenda completa con estatus'],['Evidencias','Evidencias con verificación, enlaces a fotos y ubicación'],['Visitas','Personas visitadas, resultados y ubicación'],['Todo','Un solo libro con las cuatro hojas']].map(([t,d])=>`<div class="item"><div class="sp"><div class="t">${t}</div><div class="s">${d}</div></div><button class="btn ${t==='Todo'?'':'sec'} ch" onclick="excel('${t}',this)">Descargar</button></div>`).join('')}</details>`;
}
function paramsReporte(){const R=S.rep;return{desde:R.desde,hasta:R.hasta,...paramsAlcance(R.sel)}}
function generarReporte(b){ocupado(b,async()=>{const R=S.rep;
 if(!R.desde||!R.hasta||R.desde>R.hasta) throw new Error('Revisa las fechas del periodo');
 R.datos=await api('reporte',paramsReporte(),120000);R.ia='';R.paqueteHecho=R.paquete;
 $('#repDoc').innerHTML=barraAcciones()+docReporte(R.datos,'',R.paquete);$('#repDoc').scrollIntoView({behavior:'smooth',block:'start'})})}
function barraAcciones(){return`<div class="acciones no-print"><button class="btn" onclick="imprimirReporte()">${ic('reportes')} Guardar PDF / imprimir</button>
 <button class="btn sec" onclick="excelReporte(S.rep.datos)">Excel del reporte</button><button class="btn sec" onclick="copiarWhatsApp(S.rep.datos)">Copiar para WhatsApp</button>
 <button class="btn oro" onclick="analizarReporte(this)">${ic('ia')} ${S.rep.ia?'Rehacer':'Agregar'} análisis con IA</button></div>`}
function analizarReporte(b){ocupado(b,async()=>{const R=S.rep;R.ia=(await api('analisisReporte',paramsReporte(),120000)).texto;
 $('#repDoc').innerHTML=barraAcciones()+docReporte(R.datos,R.ia,R.paqueteHecho);toast('Análisis agregado al reporte')})}
/* Atajo desde Inicio u otras pantallas: abre Reportes con un alcance ya elegido */
function abrirReporte(sel){S.rep=Object.assign(S.rep||{per:'semana',paquete:false,datos:null,ia:''},{sel:sel||'',datos:null,ia:''});ir('reportes');setTimeout(()=>{const b=document.querySelector('.panel-filtros .pf-cab .btn');if(b)generarReporte(b)},50)}

/* Generador propio de archivos .xlsx (sin librerías externas) */
function zipSinComprimir(archivos){
 const enc=new TextEncoder(),T=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;T[n]=c>>>0}
 const crc=b=>{let c=~0;for(let i=0;i<b.length;i++)c=T[(c^b[i])&255]^(c>>>8);return(~c)>>>0},u16=n=>[n&255,n>>>8&255],u32=n=>[n&255,n>>>8&255,n>>>16&255,n>>>24&255];
 const partes=[],central=[];let pos=0;
 archivos.forEach(([nombre,texto])=>{const nm=enc.encode(nombre),d=enc.encode(texto),comun=[...u16(0x800),...u16(0),...u16(0),...u16(0x21),...u32(crc(d)),...u32(d.length),...u32(d.length),...u16(nm.length),...u16(0)];
  const loc=new Uint8Array([0x50,0x4b,3,4,...u16(20),...comun]);partes.push(loc,nm,d);
  central.push(new Uint8Array([0x50,0x4b,1,2,...u16(20),...u16(20),...comun,...u16(0),...u16(0),...u16(0),...u32(0),...u32(pos)]),nm);pos+=loc.length+nm.length+d.length});
 const tam=central.reduce((a,b)=>a+b.length,0);
 return new Blob([...partes,...central,new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...u16(archivos.length),...u16(archivos.length),...u32(tam),...u32(pos),0,0])],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function libroExcel(hojas){ // {Nombre:[{col:valor}]}
 const x=s=>String(s??'').slice(0,32000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
 const col=i=>{let s='';for(i++;i>0;i=Math.floor((i-1)/26))s=String.fromCharCode(65+(i-1)%26)+s;return s},nombres=Object.keys(hojas),X='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',M='http://schemas.openxmlformats.org/',R=M+'officeDocument/2006/relationships';
 const hoja=f=>{const k=Object.keys(f[0]||{'Sin datos':''}),filas=[k,...f.map(r=>k.map(c=>r[c]))];
  return X+`<worksheet xmlns="${M}spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" state="frozen"/></sheetView></sheetViews><cols>${k.map((_,i)=>`<col min="${i+1}" max="${i+1}" width="22" customWidth="1"/>`).join('')}</cols><sheetData>${filas.map((fila,i)=>`<row r="${i+1}">${fila.map((v,j)=>`<c r="${col(j)}${i+1}" t="inlineStr"${i?'':' s="1"'}><is><t xml:space="preserve">${x(v)}</t></is></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`};
 return zipSinComprimir([
  ['[Content_Types].xml',X+`<Types xmlns="${M}package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${nombres.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
  ['_rels/.rels',X+`<Relationships xmlns="${M}package/2006/relationships"><Relationship Id="rId1" Type="${R}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
  ['xl/workbook.xml',X+`<workbook xmlns="${M}spreadsheetml/2006/main" xmlns:r="${R}"><sheets>${nombres.map((n,i)=>`<sheet name="${x(n)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`],
  ['xl/_rels/workbook.xml.rels',X+`<Relationships xmlns="${M}package/2006/relationships">${nombres.map((_,i)=>`<Relationship Id="rId${i+1}" Type="${R}/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${nombres.length+1}" Type="${R}/styles" Target="styles.xml"/></Relationships>`],
  ['xl/styles.xml',X+`<styleSheet xmlns="${M}spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF6B1532"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
  ...nombres.map((n,i)=>['xl/worksheets/sheet'+(i+1)+'.xml',hoja(hojas[n])])]);
}
function excel(tabla,b){ocupado(b,async()=>{
 const d=await api('exportar',{},120000),hojas=tabla==='Todo'?d:{[tabla]:d[tabla]};
 const a=document.createElement('a');a.href=URL.createObjectURL(libroExcel(hojas));a.download=`${NOMBRE.replace(/\s+/g,'_')}_${tabla}_${hoy()}.xlsx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
 toast('Descarga lista')})}
