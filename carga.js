/* SAET Bienestar · Carga masiva de agenda desde Excel
   Lo usa: Administrador (todo el estado), Regional (su región) y Encargado (su municipio o subregión)
   1) Plantilla personalizada con listas desplegables  2) Subir Excel, CSV o pegar filas
   3) Revisión con semáforo antes de guardar (errores, sugerencias, duplicados, choques, cobertura)
   4) Importar por lotes, Excel de errores e historial con "Deshacer carga". */

const COLS_CARGA=[['fecha','Fecha'],['inicio','Hora inicio'],['fin','Hora fin'],['actividad','Actividad'],['tipo','Tipo'],['lugar','Lugar'],['indicaciones','Indicaciones'],['asignar','Asignar a'],['repetir','Repetir']];
const ALIAS_CARGA={fecha:['fecha','dia','día'],inicio:['hora inicio','inicio','hora','hora de inicio','de'],fin:['hora fin','fin','hora de fin','termina','hasta','a'],actividad:['actividad','titulo','título','actividades','nombre de la actividad'],tipo:['tipo','tipo de actividad'],lugar:['lugar','localidad','ubicacion','ubicación','sede'],indicaciones:['indicaciones','descripcion','descripción','observaciones','notas'],asignar:['asignar a','asignar','asignado','responsable','servidor','persona','asignado a'],repetir:['repetir','repeticion','repetición']};
const REPETIR_OPC=['Solo ese día','Lunes a viernes','Toda la semana'];
const normT=t=>String(t??'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();

/* ── Alcance del usuario: zonas y personas que puede asignar ── */
function zonasCarga(){const u=S.user;return S.zonas.filter(z=>u.rol==='admin'||(u.rol==='regional'&&z.region===u.region)||(u.rol==='encargado'&&z.zona===u.zona))}
function personasCarga(){const u=S.user,roles=u.rol==='admin'?['servidor','encargado','monitor','regional']:u.rol==='regional'?['servidor','encargado']:['servidor'];
 return S.personal.filter(p=>p.id!==u.id&&roles.includes(p.rol)).sort((a,b)=>(a.zona+a.nombre).localeCompare(b.zona+b.nombre))}
const etiquetaPersona=p=>`${p.nombre} — ${p.curp}`;

/* ═══════════ Pantalla principal ═══════════ */
function vCarga(){
 const C=S.carga=S.carga||{paso:'inicio'};
 if(C.paso==='revision') return pintarRevision();
 if(C.paso==='listo') return pintarListo();
 const u=S.user,zs=zonasCarga();
 $('#vista').innerHTML=`<div class="card panel-filtros">
  <div class="pf-cab"><div><h3>Carga masiva de agenda</h3><p class="sm mute">Carga la agenda de la semana desde Excel. Antes de guardar, el sistema revisa cada fila y te dice exactamente qué corregir.</p></div></div>
  <div class="pasos-carga">
   <div class="paso-c"><i>1</i><div><b>Descarga tu plantilla</b><span>Viene con ${u.rol==='admin'?'todo el personal del estado':u.rol==='regional'?'el personal de '+esc(u.region):'el personal de '+esc(u.zona)} en listas desplegables (${zs.length} ${zs.length===1?'zona':'zonas'}, ${personasCarga().filter(p=>p.estatus==='Activo').length} personas activas).</span>
    <button class="btn" onclick="descargarPlantilla(this)">${ic('reportes')} Descargar plantilla de Excel</button></div></div>
   <div class="paso-c"><i>2</i><div><b>Llénala</b><span>Una fila por actividad: fecha, horario, actividad, a quién se asigna y si se repite. En "Asignar a" puedes elegir una persona o <b>TODOS · municipio</b>. Para dos horarios el mismo día, repite la fila con el otro horario.</span></div></div>
   <div class="paso-c"><i>3</i><div><b>Súbela y revisa</b><span>Excel (.xlsx), Google Sheets descargado como Excel o CSV.</span>
    <label class="zona-subir" id="zonaSubir" ondragover="event.preventDefault();this.classList.add('sobre')" ondragleave="this.classList.remove('sobre')" ondrop="event.preventDefault();this.classList.remove('sobre');if(event.dataTransfer.files[0])leerArchivoCarga(event.dataTransfer.files[0])">
     ${ic('carga')}<b>Toca para elegir el archivo</b><span>o arrástralo aquí</span><input type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="hide" onchange="if(this.files[0])leerArchivoCarga(this.files[0])"></label>
    <details class="pegar"><summary>O pega las filas copiadas de Excel</summary><textarea id="pegado" rows="6" placeholder="Copia las filas en Excel (con o sin encabezados) y pégalas aquí"></textarea><button class="btn sec" onclick="leerPegado()">Revisar filas pegadas</button></details></div></div>
  </div></div>
 <div class="card"><h3>${ic('agenda')} Cargas anteriores</h3><div id="histCargas"><div class="vacio sm">Cargando…</div></div></div>`;
 pintarHistorial();
}

/* ═══════════ 1. Plantilla personalizada (.xlsx con listas desplegables) ═══════════ */
function descargarPlantilla(b){ocupado(b,async()=>{
 const u=S.user,zs=zonasCarga(),pers=personasCarga().filter(p=>p.estatus==='Activo');
 const asignar=['Yo mismo',...zs.map(z=>'TODOS · '+z.zona),...pers.map(etiquetaPersona)];
 const xe=s=>String(s??'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
 const col=i=>{let s='';for(i++;i>0;i=Math.floor((i-1)/26))s=String.fromCharCode(65+(i-1)%26)+s;return s};
 const serial=f=>Math.round((new Date(f+'T00:00:00Z')-Date.UTC(1899,11,30))/864e5);
 const celda=(r,c,v,s)=>v===''||v==null?(s?`<c r="${col(c)}${r}" s="${s}"/>`:''):typeof v==='number'?`<c r="${col(c)}${r}"${s?` s="${s}"`:''}><v>${v}</v></c>`:`<c r="${col(c)}${r}" t="inlineStr"${s?` s="${s}"`:''}><is><t xml:space="preserve">${xe(v)}</t></is></c>`;
 const fila=(r,vals,est,alto)=>`<row r="${r}"${alto?` ht="${alto}" customHeight="1"`:''}>${vals.map((v,c)=>celda(r,c,v,Array.isArray(est)?est[c]:est)).join('')}</row>`;
 // Estilos: 0 normal · 1 encabezado guinda · 2 fecha · 3 ejemplo (gris itálica) · 4 fecha ejemplo · 5 título · 6 texto ajustado · 7 subtítulo
 const estilos=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
 <numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts>
 <fonts count="5"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><i/><sz val="11"/><color rgb="FF8B737A"/><name val="Calibri"/></font><font><b/><sz val="16"/><color rgb="FF6B1532"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FF6B1532"/><name val="Calibri"/></font></fonts>
 <fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF6B1532"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF7F2EC"/></patternFill></fill></fills>
 <borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/><bottom style="thin"><color rgb="FFEEE3E2"/></bottom><diagonal/></border></borders>
 <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
 <cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
  <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
  <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
  <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1"/>
  <xf numFmtId="164" fontId="2" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1"/>
  <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>
  <xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>
 <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
 <dxfs count="2"><dxf><font><color rgb="FFB3312B"/></font><fill><patternFill><bgColor rgb="FFFBE6E4"/></patternFill></fill></dxf><dxf><fill><patternFill><bgColor rgb="FFFBF0D9"/></patternFill></fill></dxf></dxfs></styleSheet>`;
 // Hoja Agenda: encabezados, 2 filas de ejemplo y formato hasta la fila 1000
 const lun=lunes(mas(new Date(),7)),ej1=iso(lun),ej2=iso(mas(lun,1)),zEj=zs[0]?zs[0].zona:'',pEj=pers.find(p=>p.rol==='servidor')||pers[0];
 const filasAgenda=[fila(1,COLS_CARGA.map(c=>c[1]),1,30),
  fila(2,[serial(ej1),'07:00','10:00','EJEMPLO: Caminata casa por casa (borra esta fila)','Visita domiciliaria','Col. Centro','Llevar volantes',zEj?'TODOS · '+zEj:'Yo mismo','Lunes a viernes'],[4,3,3,3,3,3,3,3,3]),
  fila(3,[serial(ej2),'10:00','12:00','EJEMPLO: Asamblea informativa (borra esta fila)','Asamblea informativa','Parque central','',pEj?etiquetaPersona(pEj):'Yo mismo','Solo ese día'],[4,3,3,3,3,3,3,3,3])];
 const anchos=[13,11,11,46,24,24,32,44,17];
 const nL={t:TIPOS.length+1,h:HORAS.length+1,a:asignar.length+1,r:REPETIR_OPC.length+1};
 const val=(sq,f,msg,estilo)=>`<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1"${estilo?` errorStyle="${estilo}"`:''} errorTitle="Valor no válido" error="${xe(msg)}" sqref="${sq}"><formula1>${f}</formula1></dataValidation>`;
 const hojaAgenda=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
 <sheetViews><sheetView workbookViewId="0" tabSelected="1"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
 <cols>${anchos.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1" style="${i===0?2:0}"/>`).join('')}</cols>
 <sheetData>${filasAgenda.join('')}</sheetData>
 <autoFilter ref="A1:I1"/>
 <conditionalFormatting sqref="C2:C1000"><cfRule type="expression" dxfId="0" priority="1"><formula>AND($B2&lt;&gt;"",$C2&lt;&gt;"",$C2&lt;=$B2)</formula></cfRule></conditionalFormatting>
 <conditionalFormatting sqref="A2:I1000"><cfRule type="expression" dxfId="1" priority="2"><formula>AND(COUNTA($A2:$I2)&gt;0,OR($A2="",$D2="",$H2=""))</formula></cfRule></conditionalFormatting>
 <dataValidations count="6">
  <dataValidation type="date" operator="between" allowBlank="1" showErrorMessage="1" errorTitle="Fecha no válida" error="Escribe la fecha como día/mes/año, por ejemplo 25/11/2026." sqref="A2:A1000"><formula1>45658</formula1><formula2>48579</formula2></dataValidation>
  ${val('B2:C1000',`Listas!$B$2:$B$${nL.h}`,'Elige una hora de la lista (cada 30 minutos) o escríbela como 07:00.','warning')}
  ${val('E2:E1000',`Listas!$A$2:$A$${nL.t}`,'Si no está en la lista, puedes escribir el tipo de actividad.','information')}
  ${val('H2:H1000',`Listas!$C$2:$C$${nL.a}`,'Elige de la lista: una persona, TODOS · municipio o Yo mismo.','information')}
  ${val('I2:I1000',`Listas!$D$2:$D$${nL.r}`,'Elige: Solo ese día, Lunes a viernes o Toda la semana.','stop')}
 </dataValidations></worksheet>`.replace('<dataValidations count="6">','<dataValidations count="5">');
 // Hoja Instrucciones
 const ins=[['Plantilla de agenda · '+NOMBRE,5],['Alcance: '+(u.rol==='admin'?'Todo el estado':u.rol==='regional'?u.region:u.zona)+' · Generada por '+u.nombre+' el '+fechaLarga(hoy()),7],['',0],
  ['Cómo llenarla',7],['1. Llena la hoja "Agenda": una fila por actividad. Borra las dos filas de EJEMPLO.',6],['2. Fecha: día/mes/año (25/11/2026). Hora inicio y Hora fin: elige de la lista o escribe 07:00.',6],
  ['3. Actividad: qué se va a hacer. Tipo: elige de la lista; si no está, escríbelo.',6],['4. Asignar a: elige una persona ("Nombre — CURP"), "TODOS · municipio" para todo su personal, o "Yo mismo".',6],
  ['5. Repetir: "Lunes a viernes" o "Toda la semana" crea la actividad desde esa fecha hasta el viernes o domingo de esa misma semana.',6],
  ['6. ¿Misma actividad en dos horarios el mismo día? Repite la fila con el otro horario: el sistema las junta en una sola actividad.',6],
  ['7. Las celdas se marcan en amarillo si faltan datos obligatorios (Fecha, Actividad, Asignar a) y en rojo si la hora de fin es antes del inicio.',6],
  ['8. Guarda el archivo y súbelo en la app: Carga masiva. Antes de guardar verás cada fila revisada y podrás corregir.',6],['',0],
  ['Las listas desplegables vienen de la hoja "Listas" con el personal activo de tu alcance al día de hoy. Si se da de alta personal nuevo, descarga otra plantilla.',6]];
 const hojaIns=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="120" customWidth="1"/></cols><sheetData>${ins.map((r,i)=>fila(i+1,[r[0]],r[1],r[1]===5?26:r[1]===6?32:0)).join('')}</sheetData></worksheet>`;
 // Hoja Listas (catálogos de las listas desplegables + directorio de referencia)
 const max=Math.max(TIPOS.length,HORAS.length,asignar.length,REPETIR_OPC.length,pers.length);
 const filasL=[fila(1,['Tipo','Hora','Asignar a','Repetir','','Nombre','CURP','Zona','Rol'],1,22)];
 for(let i=0;i<max;i++){const p=pers[i];filasL.push(fila(i+2,[TIPOS[i]||'',HORAS[i]||'',asignar[i]||'',REPETIR_OPC[i]||'','',p?p.nombre:'',p?p.curp:'',p?p.zona||p.region:'',p?ROL[p.rol]:''],0))}
 const hojaL=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${[24,9,46,16,3,34,22,24,22].map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${filasL.join('')}</sheetData></worksheet>`;
 const X='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',M='http://schemas.openxmlformats.org/',R=M+'officeDocument/2006/relationships',nombres=['Agenda','Instrucciones','Listas'];
 const blob=zipSinComprimir([
  ['[Content_Types].xml',X+`<Types xmlns="${M}package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${nombres.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
  ['_rels/.rels',X+`<Relationships xmlns="${M}package/2006/relationships"><Relationship Id="rId1" Type="${R}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
  ['xl/workbook.xml',X+`<workbook xmlns="${M}spreadsheetml/2006/main" xmlns:r="${R}"><sheets>${nombres.map((n,i)=>`<sheet name="${n}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets><definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">Agenda!$A$1:$I$1</definedName></definedNames></workbook>`],
  ['xl/_rels/workbook.xml.rels',X+`<Relationships xmlns="${M}package/2006/relationships">${nombres.map((_,i)=>`<Relationship Id="rId${i+1}" Type="${R}/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId9" Type="${R}/styles" Target="styles.xml"/></Relationships>`],
  ['xl/styles.xml',estilos],['xl/worksheets/sheet1.xml',hojaAgenda],['xl/worksheets/sheet2.xml',hojaIns],['xl/worksheets/sheet3.xml',hojaL]]);
 const alc=(u.rol==='admin'?'Estado':u.rol==='regional'?u.region:u.zona).replace(/[^\wÁÉÍÓÚÑáéíóúñ]+/g,'_');
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`SAET_Plantilla_Agenda_${alc}_${hoy()}.xlsx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
 toast('Plantilla descargada con '+pers.length+' personas en las listas');
})}

/* ═══════════ 2. Leer el archivo: .xlsx (sin librerías), .csv o filas pegadas ═══════════ */
async function abrirZip(buf){
 const v=new DataView(buf);let e=buf.byteLength-22;while(e>=0&&v.getUint32(e,true)!==0x06054b50)e--;
 if(e<0)throw new Error('El archivo no es un Excel válido (.xlsx). Si es .xls antiguo, guárdalo como "Libro de Excel (.xlsx)".');
 const n=v.getUint16(e+10,true),archivos={};let p=v.getUint32(e+16,true);const td=new TextDecoder();
 for(let i=0;i<n;i++){const metodo=v.getUint16(p+10,true),comp=v.getUint32(p+20,true),nl=v.getUint16(p+28,true),xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),off=v.getUint32(p+42,true);
  archivos[td.decode(new Uint8Array(buf,p+46,nl))]={metodo,comp,off};p+=46+nl+xl+cl}
 return async nombre=>{const f=archivos[nombre];if(!f)return null;const ln=v.getUint16(f.off+26,true),lx=v.getUint16(f.off+28,true),datos=new Uint8Array(buf,f.off+30+ln+lx,f.comp);
  if(f.metodo===0)return td.decode(datos);
  if(f.metodo===8){if(!window.DecompressionStream)throw new Error('Tu navegador es muy antiguo para leer Excel. Actualízalo o sube el archivo como CSV.');
   return td.decode(await new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}
  throw new Error('El Excel usa un formato que no se puede leer. Guárdalo de nuevo como .xlsx.')}
}
async function leerXlsx(buf){
 const leer=await abrirZip(buf),dp=new DOMParser(),xml=t=>dp.parseFromString(t||'<x/>','application/xml');
 const wb=xml(await leer('xl/workbook.xml')),rels=xml(await leer('xl/_rels/workbook.xml.rels'));
 const ss=[...xml(await leer('xl/sharedStrings.xml')).getElementsByTagName('si')].map(si=>[...si.getElementsByTagName('t')].map(t=>t.textContent).join(''));
 const destino={};[...rels.getElementsByTagName('Relationship')].forEach(r=>destino[r.getAttribute('Id')]=r.getAttribute('Target'));
 const hojas=[...wb.getElementsByTagName('sheet')].map(s=>({nombre:s.getAttribute('name'),ruta:'xl/'+String(destino[s.getAttribute('r:id')]||'').replace(/^\/?xl\//,'').replace(/^\//,'')}));
 const leerHoja=async h=>{const d=xml(await leer(h.ruta));const filas=[];
  [...d.getElementsByTagName('row')].forEach(row=>{const fila=[];[...row.getElementsByTagName('c')].forEach(c=>{const ref=c.getAttribute('r')||'',letras=ref.replace(/\d+/g,'');let ci=0;for(const ch of letras)ci=ci*26+ch.charCodeAt(0)-64;
   const t=c.getAttribute('t'),vv=c.getElementsByTagName('v')[0];let val=vv?vv.textContent:'';
   if(t==='s')val=ss[+val]??'';else if(t==='inlineStr')val=[...c.getElementsByTagName('t')].map(x=>x.textContent).join('');else if(t==='b')val=val==='1'?'VERDADERO':'FALSO';else if(!t||t==='n'){if(val!=='')val=Number(val)}
   fila[ci-1]=val});filas[+row.getAttribute('r')-1]=fila});return Array.from(filas,f=>f||[])};
 const orden=[...hojas.filter(h=>normT(h.nombre)==='agenda'),...hojas.filter(h=>normT(h.nombre)!=='agenda'&&!['instrucciones','listas'].includes(normT(h.nombre)))];
 for(const h of orden){const f=await leerHoja(h);if(f.slice(0,15).some(r=>r.some(c=>normT(c)==='actividad')))return f}
 return orden[0]?await leerHoja(orden[0]):[];
}
function leerCsv(texto){const sep=(texto.split('\n')[0].match(/;/g)||[]).length>(texto.split('\n')[0].match(/,/g)||[]).length?';':texto.split('\n')[0].includes('\t')?'\t':',';
 const filas=[];let fila=[],cel='',q=false;
 for(let i=0;i<texto.length;i++){const ch=texto[i];if(q){if(ch==='"'&&texto[i+1]==='"'){cel+='"';i++}else if(ch==='"')q=false;else cel+=ch}
  else if(ch==='"')q=true;else if(ch===sep){fila.push(cel);cel=''}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&texto[i+1]==='\n')i++;fila.push(cel);filas.push(fila);fila=[];cel=''}else cel+=ch}
 if(cel||fila.length){fila.push(cel);filas.push(fila)}return filas}
async function leerArchivoCarga(file){
 const z=$('#zonaSubir');if(z)z.innerHTML='<span class="carga oscura"></span><b>Leyendo el archivo…</b>';
 try{let filas;
  if(/\.csv$/i.test(file.name)||file.type==='text/csv'){const b=await file.arrayBuffer();let t=new TextDecoder('utf-8').decode(b);if(t.includes('�'))t=new TextDecoder('windows-1252').decode(b);filas=leerCsv(t.replace(/^﻿/,''))}
  else filas=await leerXlsx(await file.arrayBuffer());
  await prepararRevision(filas,file.name);
 }catch(e){toast(e.message);S.carga={paso:'inicio'};vCarga()}
}
function leerPegado(){const t=val('pegado');if(!t)return toast('Pega primero las filas copiadas de Excel');prepararRevision(t.split(/\r?\n/).filter(l=>l.trim()).map(l=>l.split('\t')),'Filas pegadas').catch(e=>toast(e.message))}

/* Convierte la tabla leída en registros, reconociendo los encabezados aunque cambien de orden */
function aRegistros(filas){
 let h=filas.findIndex((r,i)=>i<15&&r&&r.some(c=>normT(c)==='actividad'));
 let mapa={};
 if(h>-1){filas[h].forEach((c,i)=>{const n=normT(c);for(const k in ALIAS_CARGA)if(mapa[k]==null&&ALIAS_CARGA[k].some(a=>normT(a)===n))mapa[k]=i})}
 else{h=-1;COLS_CARGA.forEach(([k],i)=>mapa[k]=i)}
 if(mapa.actividad==null)throw new Error('No encontré la columna "Actividad". Usa la plantilla del sistema o pon encabezados en la primera fila.');
 const out=[];
 filas.slice(h+1).forEach((r,i)=>{if(!r||!r.some(c=>String(c??'').trim()))return;const o={n:h+2+i};for(const k in ALIAS_CARGA)o[k]=mapa[k]!=null?r[mapa[k]]??'':'';
  if(/^ejemplo/i.test(String(o.actividad).trim()))return;out.push(o)});
 return out;
}
async function prepararRevision(filas,archivo){
 const regs=aRegistros(filas);
 if(!regs.length)throw new Error('El archivo no tiene actividades (las filas de EJEMPLO no se cuentan).');
 if(regs.length>1500)throw new Error('El archivo tiene '+regs.length+' filas; el máximo por carga es 1,500. Divídelo en dos.');
 S.carga={paso:'revision',archivo,regs,filtro:'',vista:'tabla',lote:''};
 await validarCarga();pintarRevision();
}

/* ═══════════ 3. Revisión ═══════════ */
function fechaCelda(v){
 if(typeof v==='number'&&v>20000&&v<80000){const d=new Date(Date.UTC(1899,11,30)+Math.round(v)*864e5);return d.toISOString().slice(0,10)}
 const s=String(v??'').trim();if(!s)return '';let m;
 if(m=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/))return chk(+m[1],+m[2],+m[3]);
 if(m=s.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/))return chk(+m[3]<100?2000+ +m[3]:+m[3],+m[2],+m[1]);
 return 'X';
 function chk(a,me,d){const f=new Date(Date.UTC(a,me-1,d));return f.getUTCMonth()===me-1&&f.getUTCDate()===d?f.toISOString().slice(0,10):'X'}
}
function horaCelda(v){
 if(v===''||v==null)return '';
 if(typeof v==='number'){if(v>=0&&v<1){const m=Math.round(v*1440);return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}if(v>=0&&v<24&&Number.isInteger(v))return String(v).padStart(2,'0')+':00';return 'X'}
 const s=String(v).trim().toLowerCase().replace(/\s+/g,'').replace(/\./g,':').replace(/hrs?|horas?/,'');let m=s.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?(am|pm|a\.?m\.?|p\.?m\.?)?$/);
 if(!m&&(m=s.match(/^(\d{2})(\d{2})$/)))m=[s,m[1],m[2],''];if(!m)return 'X';
 let h=+m[1];const mi=+(m[2]||0),ap=(m[3]||'')[0];if(ap==='p'&&h<12)h+=12;if(ap==='a'&&h===12)h=0;
 return h<24&&mi<60?String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0'):'X';
}
function repetirCelda(v){const n=normT(v);if(!n||n.startsWith('solo'))return['',''];if(n.includes('viernes')||n==='lv'||n.includes('lunes a vier'))return['lv',''];if(n.includes('semana')||n.includes('domingo'))return['semana',''];return['','"Repetir" no se reconoció ("'+v+'"): se toma solo ese día']}
function similitud(a,b){a=normT(a);b=normT(b);if(!a||!b)return 0;const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;
 for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return 1-d[m][n]/Math.max(m,n)}
function zonaDeTexto(t){const n=normT(t).replace(/^(el )?equipo (de )?/,'').replace(/^de /,'');if(!n)return null;
 const todas=S.zonas;return todas.find(z=>normT(z.zona)===n)||todas.find(z=>normT(z.zona.split('·').pop())===n)||todas.find(z=>normT(z.zona).endsWith(' '+n))||todas.find(z=>n.length>3&&normT(z.zona).includes(n))||null}

async function validarCarga(){
 const C=S.carga,u=S.user,pers=S.personal,zsMias=zonasCarga(),zonasOk=new Set(zsMias.map(z=>z.zona));
 const porCurp={},porNombre={};pers.forEach(p=>{porCurp[p.curp.toUpperCase()]=p;porNombre[normT(p.nombre)]=p});
 const resolver=txt=>{const s=String(txt??'').trim();if(!s)return{err:'Falta a quién se asigna ("Asignar a")'};
  const n=normT(s);
  if(/^(yo|yo mismo|solo yo|a mi)$/.test(n))return{ids:[u.id],etq:'Yo mismo'};
  if(/^todos?\b/.test(n)){const z=zonaDeTexto(s.replace(/^\s*todos?\s*[·:\-–—]?\s*/i,''));
   if(!z)return{err:`No reconozco el municipio o subregión de "${s}"`};
   if(!zonasOk.has(z.zona))return{err:`${z.zona} no está a tu cargo`};
   const ids=pers.filter(p=>p.zona===z.zona&&p.rol==='servidor'&&p.estatus==='Activo').map(p=>p.id);
   return ids.length?{ids,etq:'Todos · '+z.zona+' ('+ids.length+')'}:{err:`No hay servidores activos en ${z.zona}`}}
  const curp=(s.toUpperCase().match(/[A-Z]{4}\d{6}[A-Z0-9]{8}/)||[])[0]||s.split(/—|–| - /).pop().trim().toUpperCase();
  const p=porCurp[curp]||porCurp[s.toUpperCase()]||porNombre[normT(s.split(/—|–| - /)[0])];
  if(p){if(p.estatus==='Baja')return{err:`${p.nombre} está dado de baja`};if(p.estatus==='Pendiente')return{err:`El registro de ${p.nombre} aún no está aprobado`};return{ids:[p.id],etq:p.nombre}}
  const nom=s.split(/—|–| - /)[0];
  const sug=pers.filter(q=>q.estatus==='Activo'&&q.id!==u.id).map(q=>[q,Math.max(similitud(q.nombre,nom),similitud(q.curp,curp))]).filter(x=>x[1]>=.6).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
  return{pendiente:s,sug};
 };
 // a) fila por fila
 C.regs.forEach(r=>{r.err=[];r.av=[];r.sug=[];r.ids=[];
  r.f=fechaCelda(r.fecha);if(!r.f)r.err.push('Falta la fecha');else if(r.f==='X')r.err.push(`La fecha "${r.fecha}" no es válida (usa día/mes/año)`);else if(r.f<hoy())r.av.push('La fecha ya pasó');
  r.hi=horaCelda(r.inicio);r.hf=horaCelda(r.fin);
  if(r.hi==='X')r.err.push(`La hora de inicio "${r.inicio}" no es válida`);if(r.hf==='X')r.err.push(`La hora de fin "${r.fin}" no es válida`);
  if(r.hi&&r.hf&&r.hi!=='X'&&r.hf!=='X'&&r.hf<=r.hi)r.err.push(`La hora de fin (${r.hf}) es antes del inicio (${r.hi})`);
  if(!r.hi&&r.hf&&r.hf!=='X')r.err.push('Tiene hora de fin pero no de inicio');
  if(!r.hi&&!r.hf)r.av.push('Sin horario');
  r.tit=String(r.actividad??'').trim();if(!r.tit)r.err.push('Falta el nombre de la actividad');
  const tn=normT(r.tipo),t=TIPOS.find(x=>normT(x)===tn)||TIPOS.find(x=>tn&&normT(x).startsWith(tn));
  r.tp=t||(tn?String(r.tipo).trim().replace(/^./,c=>c.toUpperCase()):'Otra');if(tn&&!t)r.av.push(`Tipo nuevo: se guardará como "${r.tp}"`);
  const[rep,avR]=repetirCelda(r.repetir);r.rep=rep;if(avR)r.av.push(avR);
  r.fechas=r.f&&r.f!=='X'?fechasRepetir(r.f,rep):[];if(rep&&r.fechas.length===1)r.av.push('La fecha cae en fin de semana: "Repetir" no agrega días');
  const a=resolver(r.asignar);if(a.err)r.err.push(a.err);else if(a.pendiente){r.pend=a.pendiente;r.sug=a.sug}else{r.ids=a.ids;r.etq=a.etq}
 });
 // b) los que no se encontraron: el servidor dice si existen en otra zona, de baja o no existen
 const pend=[...new Set(C.regs.filter(r=>r.pend).map(r=>r.pend))];
 let estado={};if(pend.length){try{(await api('revisarAsignados',{claves:pend})).forEach(x=>estado[x.clave]=x)}catch(e){}}
 C.regs.filter(r=>r.pend).forEach(r=>{const x=estado[r.pend]||{estado:'noexiste'};
  r.err.push(x.estado==='fuera'?`"${r.pend}" pertenece a ${x.zona}: no está a tu cargo`:x.estado==='baja'?`"${r.pend}" está dado de baja`:x.estado==='pendiente'?`El registro de "${r.pend}" aún no está aprobado`:`"${r.pend}" no existe en el sistema`);delete r.pend});
 // c) juntar filas iguales con distinto horario en una sola actividad
 const grupos={};C.regs.filter(r=>!r.err.length).forEach(r=>{const k=[r.f,normT(r.tit),normT(r.asignar),normT(r.tp),r.rep].join('|');(grupos[k]=grupos[k]||[]).push(r)});
 Object.values(grupos).forEach(g=>{g.sort((a,b)=>(a.hi||'').localeCompare(b.hi||''));
  g.forEach((r,i)=>{const a=g[i-1];if(a&&a.hi&&r.hi&&(a.hf?r.hi<a.hf:r.hi===a.hi))r.err.push(`Su horario se encima con la fila ${a.n} (misma actividad)`)});
  const ok=g.filter(r=>!r.err.length);ok.forEach(r=>{r.grupo=ok;if(ok.length>1)r.junta=ok.filter(x=>x!==r).map(x=>x.n)})});
 // d) generar las actividades finales
 const nuevas=[],vistos={},existe={};
 S.acts.forEach(a=>existe[a.asignadoA+'|'+a.fecha+'|'+a.titulo.toLowerCase()+'|'+(a.horarios||a.hora)]=1);
 C.regs.forEach(r=>{r.acts=[];r.omit=0;r.dupFile=0});
 Object.values(grupos).forEach(g=>{const ok=g.filter(r=>!r.err.length);if(!ok.length)return;const r0=ok[0];
  const horarios=ok.filter(r=>r.hi).map(r=>({inicio:r.hi,fin:r.hf||''})),hs=horarios.map(b=>b.inicio+'-'+b.fin).join('|'),gk='G'+r0.n;
  r0.fechas.forEach(f=>r0.ids.forEach(id=>{const k=id+'|'+f+'|'+r0.tit.toLowerCase()+'|'+hs;
   if(existe[k]){r0.omit++;return}if(vistos[k]){r0.dupFile++;return}vistos[k]=1;
   const act={grupo:gk,filas:ok.map(r=>r.n),asignadoA:id,fecha:f,titulo:r0.tit,tipo:r0.tp,lugar:String(r0.lugar??'').trim(),descripcion:String(r0.indicaciones??'').trim(),horarios};
   nuevas.push(act);r0.acts.push(act)}))});
 // e) choques de horario, sobrecarga y cobertura
 const porDia={};const add=(id,f,b,t,nueva,r)=>{const k=id+'|'+f;(porDia[k]=porDia[k]||[]).push({b,t,nueva,r})};
 S.acts.forEach(a=>bloquesDe(a).forEach(b=>add(a.asignadoA,a.fecha,b,a.titulo,false)));
 C.regs.forEach(r=>r.acts&&r.acts.forEach(a=>a.horarios.forEach(b=>add(a.asignadoA,a.fecha,b,a.titulo,true,r))));
 const nombre=id=>(pers.find(p=>p.id===id)||{}).nombre||'';
 Object.entries(porDia).forEach(([k,l])=>{const[id,f]=k.split('|');l.sort((a,b)=>a.b.inicio.localeCompare(b.b.inicio));
  l.forEach((x,i)=>{const a=l[i-1];if(!a||!x.nueva)return;const finA=a.b.fin||a.b.inicio;if(x.b.inicio<finA&&a.t!==x.t){const m=`Choque de horario: ${nombre(id)} ya tiene "${a.t}" el ${fechaTxt(f)} de ${a.b.inicio}${a.b.fin?'–'+a.b.fin:''}`;if(!x.r.av.includes(m))x.r.av.push(m)}});
  const n=new Set(l.map(x=>x.t)).size;if(n>6){const r=l.find(x=>x.nueva&&x.r);if(r){const m=`Sobrecarga: ${nombre(id)} tendría ${n} actividades el ${fechaTxt(f)}`;if(!r.r.av.includes(m))r.r.av.push(m)}}});
 C.regs.forEach(r=>{if(r.omit)r.av.push(r.omit===1?'Ya existe en el sistema: no se volverá a crear':`${r.omit} de sus actividades ya existen: no se volverán a crear`);if(r.dupFile)r.av.push('Repetida en el archivo: se crea una sola vez');
  if(r.junta)r.info=`Se junta con la fila ${r.junta.join(', ')}: una actividad con ${r.grupo.length} horarios`;
  r.est=r.err.length?'error':r.acts.length===0&&!r.junta?'omitida':r.acts.length===0&&r.grupo&&r.grupo[0]!==r?(r.av.length?'aviso':'ok'):r.av.length?'aviso':'ok'});
 const semanas=new Set(nuevas.map(a=>iso(lunes(new Date(a.fecha+'T12:00')))));
 const conAct=new Set([...S.acts.filter(a=>semanas.has(iso(lunes(new Date(a.fecha+'T12:00'))))).map(a=>a.asignadoA),...nuevas.map(a=>a.asignadoA)]);
 const zonasTocadas=new Set(nuevas.map(a=>(pers.find(p=>p.id===a.asignadoA)||{}).zona).filter(Boolean));
 C.sinActividad=pers.filter(p=>p.rol==='servidor'&&p.estatus==='Activo'&&zonasTocadas.has(p.zona)&&!conAct.has(p.id));
 C.nuevas=nuevas;
}

function pintarRevision(){
 const C=S.carga;if(!C||!C.regs)return;const R=C.regs,n=k=>R.filter(r=>r.est===k).length,porZona={};
 C.nuevas.forEach(a=>{const q=S.personal.find(p=>p.id===a.asignadoA)||(a.asignadoA===S.user.id?S.user:{}),z=q.zona||q.region||'Sin zona';porZona[z]=(porZona[z]||0)+1});
 const l=R.filter(r=>!C.filtro||r.est===C.filtro),icono={ok:'✓',aviso:'!',error:'✕',omitida:'–'};
 const sinZ={};C.sinActividad.forEach(p=>(sinZ[p.zona]=sinZ[p.zona]||[]).push(p.nombre));
 $('#vista').innerHTML=`<div class="card panel-filtros"><div class="pf-cab"><div><h3>Revisión de la carga</h3><p class="sm mute">${esc(C.archivo)} · ${R.length} filas. Nada se ha guardado todavía.</p></div>
  <button class="btn sec" onclick="S.carga={paso:'inicio'};vCarga()">${ic('x')} Cancelar</button></div>
  <div class="tiles2">
   <button class="tile2 ${C.filtro===''?'on':''}" onclick="S.carga.filtro='';pintarRevision()"><b>${R.length}</b><span>Filas</span></button>
   <button class="tile2 ${C.filtro==='ok'?'on':''}" style="--c:var(--ok)" onclick="S.carga.filtro='ok';pintarRevision()"><b>${n('ok')}</b><span>Listas</span></button>
   <button class="tile2 ${C.filtro==='aviso'?'on':''}" style="--c:var(--warn)" onclick="S.carga.filtro='aviso';pintarRevision()"><b>${n('aviso')}</b><span>Con advertencia</span></button>
   <button class="tile2 ${C.filtro==='error'?'on':''}" style="--c:var(--bad)" onclick="S.carga.filtro='error';pintarRevision()"><b>${n('error')}</b><span>Con error (no se importan)</span></button>
   <button class="tile2 ${C.filtro==='omitida'?'on':''}" style="--c:var(--mute)" onclick="S.carga.filtro='omitida';pintarRevision()"><b>${n('omitida')}</b><span>Ya existen</span></button>
   <div class="tile2" style="--c:var(--g700)"><b>${C.nuevas.length}</b><span>Actividades a crear</span></div></div>
  ${Object.keys(porZona).length?`<div class="por-zona">${Object.entries(porZona).sort((a,b)=>b[1]-a[1]).map(([z,c])=>`<span><b>${c}</b> ${esc(z)}</span>`).join('')}</div>`:''}
  ${C.sinActividad.length?`<details class="cobertura"><summary>! ${C.sinActividad.length} servidores de estas zonas no tendrán ninguna actividad esa semana</summary>${Object.entries(sinZ).map(([z,ns])=>`<p><b>${esc(z)}:</b> ${ns.map(esc).join(', ')}</p>`).join('')}</details>`:''}</div>
 <div class="filtros"><div class="seg"><button class="${C.vista!=='cal'?'on':''}" onclick="S.carga.vista='tabla';pintarRevision()">Tabla de revisión</button><button class="${C.vista==='cal'?'on':''}" onclick="S.carga.vista='cal';pintarRevision()">${ic('agenda')} Vista de calendario</button></div></div>
 ${C.vista==='cal'?calendarioCarga():`<div class="card tabla"><table class="tr revision"><tr class="cab"><th>Fila</th><th></th><th>Fecha</th><th>Horario</th><th>Actividad</th><th>Asignar a</th><th>Revisión</th><th></th></tr>
 ${l.map(r=>`<tr class="r-${r.est}"><td class="mute" data-l="Fila">${r.n}</td><td><span class="est est-${r.est}" title="${{ok:'Lista',aviso:'Advertencia',error:'Error',omitida:'Ya existe'}[r.est]}">${icono[r.est]}</span></td>
  <td class="nowrap sm">${r.f&&r.f!=='X'?fechaTxt(r.f):esc(r.fecha)}${r.rep?`<div class="mute">${r.rep==='lv'?'hasta el viernes':'hasta el domingo'} (${r.fechas.length} días)</div>`:''}</td>
  <td class="nowrap sm">${r.hi&&r.hi!=='X'?r.hi+(r.hf&&r.hf!=='X'?'–'+r.hf:''):esc([r.inicio,r.fin].filter(Boolean).join('–'))||'—'}</td>
  <td><b>${esc(r.tit||'(sin nombre)')}</b><div class="sm mute">${esc(r.tp||'')}${r.lugar?' · '+esc(r.lugar):''}</div></td>
  <td class="sm">${r.etq?esc(r.etq):esc(r.asignar)||'—'}${r.acts.length>1?`<div class="mute">→ ${r.acts.length} actividades</div>`:''}</td>
  <td class="msgs">${r.err.map(m=>`<div class="m-err">✕ ${esc(m)}</div>`).join('')}${r.sug.length?`<div class="sugs">¿Quisiste decir? ${r.sug.map(p=>`<button class="btn sec ch" onclick="aplicarSugerencia(${r.n},'${p.id}')">${esc(p.nombre)}${p.zona?` <small>· ${esc(p.zona)}</small>`:''}</button>`).join('')}</div>`:''}${r.av.map(m=>`<div class="m-av">! ${esc(m)}</div>`).join('')}${r.info?`<div class="m-info">↔ ${esc(r.info)}</div>`:''}${!r.err.length&&!r.av.length&&!r.info?'<span class="sm" style="color:var(--ok)">Lista para importar</span>':''}</td>
  <td><button class="btn sec ch" onclick="editarFila(${r.n})">Editar</button></td></tr>`).join('')||'<tr><td colspan="8" class="vacio">No hay filas con este filtro.</td></tr>'}</table></div>`}
 <div class="barra-import"><div class="sm"><b>${C.nuevas.length}</b> actividades listas${n('error')?` · <span style="color:var(--bad)">${n('error')} filas con error no se importarán</span>`:''}</div><span class="sp"></span>
  ${n('error')?`<button class="btn sec" onclick="descargarErrores()">Descargar filas con error</button>`:''}
  <button class="btn" ${C.nuevas.length?'':'disabled'} onclick="importarCarga(this)">${ic('carga')} Importar ${C.nuevas.length} actividades</button></div>`;
}
function calendarioCarga(){
 const C=S.carga,nuevas=C.nuevas;if(!nuevas.length)return'<div class="card vacio">No hay actividades para mostrar.</div>';
 const semanas=[...new Set(nuevas.map(a=>iso(lunes(new Date(a.fecha+'T12:00')))))].sort();C.sem=semanas.includes(C.sem)?C.sem:semanas[0];
 const ini=new Date(C.sem+'T12:00'),dias=[0,1,2,3,4,5,6].map(i=>iso(mas(ini,i))),i=semanas.indexOf(C.sem);
 const agr={};nuevas.filter(a=>dias.includes(a.fecha)).forEach(a=>{const k=a.fecha+'|'+a.grupo;const x=agr[k]=agr[k]||{...a,n:0};x.n++});
 return`<div class="filtros"><button class="btn sec ch" ${i>0?'':'disabled'} onclick="S.carga.sem='${semanas[i-1]||''}';pintarRevision()">${ic('izq')}</button><b>Semana del ${fechaTxt(C.sem)}</b><button class="btn sec ch" ${i<semanas.length-1?'':'disabled'} onclick="S.carga.sem='${semanas[i+1]||''}';pintarRevision()">${ic('der')}</button><span class="mute sm">${semanas.length>1?`Semana ${i+1} de ${semanas.length}`:''}</span></div>
 <div class="semana">${dias.map(f=>{const l=Object.values(agr).filter(a=>a.fecha===f).sort((a,b)=>((a.horarios[0]||{}).inicio||'').localeCompare((b.horarios[0]||{}).inicio||''));
  return`<div class="col"><header><span>${new Date(f+'T12:00').toLocaleDateString('es-MX',{weekday:'long'})}</span><b>${new Date(f+'T12:00').getDate()}</b></header>
  ${l.map(a=>`<div class="chip e-Pendiente"><b>${esc(a.horarios.map(b=>b.inicio+(b.fin?'–'+b.fin:'')).join(' y ')||'Sin hora')}</b><b>${esc(a.titulo)}</b><span>${a.n>1?a.n+' personas':esc((S.personal.find(p=>p.id===a.asignadoA)||{}).nombre||'')}</span></div>`).join('')||'<div class="mute sm" style="padding:4px">—</div>'}</div>`}).join('')}</div>`;
}
function aplicarSugerencia(n,id){const r=S.carga.regs.find(x=>x.n===n),p=S.personal.find(x=>x.id===id);if(!r||!p)return;r.asignar=etiquetaPersona(p);
 validarCarga().then(()=>{pintarRevision();toast('Corregido: '+p.nombre)})}
function editarFila(n){const r=S.carga.regs.find(x=>x.n===n);if(!r)return;
 const opciones=['Yo mismo',...zonasCarga().map(z=>'TODOS · '+z.zona),...personasCarga().filter(p=>p.estatus==='Activo').map(etiquetaPersona)];
 const vf=r.f&&r.f!=='X'?r.f:'',vi=r.hi&&r.hi!=='X'?r.hi:'',vfi=r.hf&&r.hf!=='X'?r.hf:'';
 modal(`<h2>Editar fila ${n}</h2>${r.err.length?`<div class="m-err" style="margin-bottom:12px">${r.err.map(esc).join('<br>')}</div>`:''}
 <div class="campo"><label>Actividad *</label><input id="cfA" value="${esc(r.actividad)}"></div>
 <div class="dos"><div class="campo"><label>Fecha *</label><input id="cfF" type="date" value="${vf}"></div><div class="campo"><label>Repetir</label><select id="cfR">${REPETIR_OPC.map((o,i)=>`<option ${['','lv','semana'][i]===r.rep?'selected':''}>${o}</option>`).join('')}</select></div></div>
 <div class="dos"><div class="campo"><label>Hora inicio</label><input id="cfI" type="time" value="${vi}"></div><div class="campo"><label>Hora fin</label><input id="cfFi" type="time" value="${vfi}"></div></div>
 <div class="dos"><div class="campo"><label>Tipo</label><input id="cfT" list="dlTipos" value="${esc(r.tipo)}"><datalist id="dlTipos">${TIPOS.map(t=>`<option value="${esc(t)}">`).join('')}</datalist></div><div class="campo"><label>Lugar</label><input id="cfL" value="${esc(r.lugar)}"></div></div>
 <div class="campo"><label>Asignar a *</label><input id="cfS" list="dlAsig" value="${esc(r.asignar)}" placeholder="Escribe para buscar"><datalist id="dlAsig">${opciones.map(o=>`<option value="${esc(o)}">`).join('')}</datalist></div>
 <div class="campo"><label>Indicaciones</label><input id="cfD" value="${esc(r.indicaciones)}"></div>
 <button class="btn grande" onclick="guardarFila(${n})">Guardar y volver a revisar</button>`,600)}
async function guardarFila(n){const r=S.carga.regs.find(x=>x.n===n);if(!r)return;
 Object.assign(r,{actividad:val('cfA'),fecha:val('cfF'),inicio:val('cfI'),fin:val('cfFi'),tipo:val('cfT'),lugar:val('cfL'),asignar:val('cfS'),indicaciones:val('cfD'),repetir:val('cfR')});
 cerrar();await validarCarga();pintarRevision();const e=S.carga.regs.find(x=>x.n===n);toast(e&&e.est==='error'?'La fila todavía tiene errores':'Fila '+n+' corregida')}
function descargarErrores(){const C=S.carga,f=C.regs.filter(r=>r.est==='error');
 const fmtF=r=>r.f&&r.f!=='X'?r.f.split('-').reverse().join('/'):String(r.fecha??'');
 const hojas={'Filas con error':f.map(r=>({'Fecha':fmtF(r),'Hora inicio':r.hi&&r.hi!=='X'?r.hi:String(r.inicio??''),'Hora fin':r.hf&&r.hf!=='X'?r.hf:String(r.fin??''),'Actividad':r.actividad,'Tipo':r.tipo,'Lugar':r.lugar,'Indicaciones':r.indicaciones,'Asignar a':r.asignar,'Repetir':r.repetir,'Fila original':r.n,'Motivo':r.err.join(' · ')+(r.sug.length?' · ¿Quisiste decir '+r.sug.map(p=>etiquetaPersona(p)).join(' o ')+'?':'')}))};
 const a=document.createElement('a');a.href=URL.createObjectURL(libroExcel(hojas));a.download=`SAET_Errores_carga_${hoy()}.xlsx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
 toast('Corrige estas filas y vuelve a subir el archivo; las que ya se importaron no se duplican')}

/* ═══════════ 4. Importar por lotes ═══════════ */
function importarCarga(b){ocupado(b,async()=>{
 const C=S.carga,lista=C.nuevas;if(!lista.length)return;
 C.lote=C.lote||('L'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)).toUpperCase();
 let creadas=[],omitidas=[];const tam=300;
 for(let i=0;i<lista.length;i+=tam){
  b.innerHTML=`<span class="carga"></span> Importando ${Math.min(i+tam,lista.length)} de ${lista.length}…`;
  const r=await api('cargaMasiva',{lote:C.lote,archivo:C.archivo,actividades:lista.slice(i,i+tam).map(({filas,...a})=>a)},120000);
  creadas=creadas.concat(r.nuevas);omitidas=omitidas.concat(r.omitidas||[]);
 }
 S.acts.push(...creadas.filter(a=>a.fecha>=S.rango.desde&&a.fecha<=S.rango.hasta));
 S.carga={paso:'listo',archivo:C.archivo,creadas:creadas.length,omitidas:omitidas.length,errores:C.regs.filter(r=>r.est==='error'),regsErr:C.regs,zonas:new Set(creadas.map(a=>a.zona)).size,personas:new Set(creadas.map(a=>a.asignadoA)).size,lote:C.lote};
 pintarListo();sync();
})}
function pintarListo(){const C=S.carga;
 $('#vista').innerHTML=`<div class="card listo-carga"><div class="ok-grande">✓</div><h2>Carga terminada</h2>
  <p>Se crearon <b>${num(C.creadas)}</b> actividades para <b>${num(C.personas)}</b> personas en <b>${C.zonas}</b> ${C.zonas===1?'zona':'zonas'}.</p>
  ${C.omitidas?`<p class="sm mute">${C.omitidas} no se crearon porque ya existían o cambió el personal mientras revisabas.</p>`:''}
  ${C.errores.length?`<p class="sm" style="color:var(--bad)">${C.errores.length} filas tenían errores y no se importaron.</p>`:''}
  <div class="fila wrap" style="justify-content:center;margin-top:14px">${C.errores.length?`<button class="btn sec" onclick="S.carga.regs=S.carga.regsErr;descargarErrores()">Descargar filas con error</button>`:''}
  <button class="btn sec" onclick="ir('agenda')">${ic('agenda')} Ver la agenda</button><button class="btn" onclick="S.carga={paso:'inicio'};vCarga()">${ic('carga')} Nueva carga</button></div>
  <p class="sm mute" style="margin-top:14px">Si te equivocaste, puedes deshacer esta carga completa en "Cargas anteriores".</p></div>`}

/* ═══════════ Historial y deshacer ═══════════ */
async function pintarHistorial(){const el=$('#histCargas');if(!el)return;
 try{const l=await api('cargas');if(!$('#histCargas'))return;
  el.innerHTML=l.length?`<div class="tabla"><table class="tr"><tr><th>Fecha</th><th>Quién</th><th>Archivo</th><th>Actividades</th><th>Estado</th><th></th></tr>${l.map(c=>`<tr><td class="sm nowrap">${esc(c.fecha)}</td><td class="sm">${esc(c.usuarioNombre)}</td><td class="sm">${esc(c.archivo)}</td><td>${num(c.actividades)}</td><td>${badge(c.estatus==='Activa'?'Activo':c.estatus==='Deshecha'?'Baja':'Pendiente').replace(/>Activo<|>Baja<|>Pendiente</,'>'+esc(c.estatus)+'<')}</td>
   <td>${c.estatus==='Activa'&&(S.user.rol==='admin'||c.usuarioId===S.user.id)?`<button class="btn bad ch" onclick="deshacerCarga('${c.id}',this)">Deshacer carga</button>`:''}</td></tr>`).join('')}</table></div>`:'<div class="vacio sm">Aún no hay cargas masivas.</div>';
 }catch(e){el.innerHTML=`<div class="vacio sm">${esc(e.message)}</div>`}}
function deshacerCarga(id,b){if(!confirm('¿Deshacer esta carga? Se borrarán sus actividades que todavía no tengan evidencia ni visitas.'))return;
 ocupado(b,async()=>{const r=await api('deshacerCarga',{id});toast(`Se borraron ${r.borradas} actividades`+(r.conservadas?` · ${r.conservadas} se conservaron porque ya tienen evidencia o visitas`:''));await refrescar()})}
