/* SAET Bienestar · Verificación de evidencias en el teléfono y su presentación
   Lo usa: Servidor de la Nación (al tomar la foto) · Regional, Encargado y Administración (al revisar)
   Al elegir cada foto se leen sus datos de cámara (fecha, modelo, GPS) y se calcula su "huella"
   para que el servidor detecte fotos repetidas. Nada de esto se le pide al usuario: es automático. */

/* ── Lectura de datos de cámara (EXIF) de un JPG ── */
async function leerExif(file){
 try{
  if(!/jpe?g/i.test(file.type)&&!/\.jpe?g$/i.test(file.name||''))return{};
  const v=new DataView(await file.slice(0,262144).arrayBuffer());
  if(v.getUint16(0)!==0xFFD8)return{};
  let o=2;
  while(o<v.byteLength-4){
   const m=v.getUint16(o),n=v.getUint16(o+2);
   if(m===0xFFE1&&v.getUint32(o+4)===0x45786966)return tiff(v,o+10);
   if((m&0xFF00)!==0xFF00)break;o+=2+n;
  }
 }catch(e){}
 return{};
 function tiff(v,t){
  const le=v.getUint16(t)===0x4949,u16=p=>v.getUint16(p,le),u32=p=>v.getUint32(p,le),r={};
  const texto=(p,c)=>{let s='';for(let i=0;i<c-1&&p+i<v.byteLength;i++){const ch=v.getUint8(p+i);if(!ch)break;s+=String.fromCharCode(ch)}return s.trim()};
  const ifd=(p,f)=>{const n=u16(t+p);for(let i=0;i<n;i++){const e=t+p+2+i*12,tag=u16(e),tipo=u16(e+2),c=u32(e+4),val=c*({2:1,3:2,4:4,5:8}[tipo]||1)>4?t+u32(e+8):e+8;f(tag,tipo,c,val)}};
  const rac=p=>{const a=u32(p),b=u32(p+4);return b?a/b:0},grados=p=>rac(p)+rac(p+8)/60+rac(p+16)/3600;
  let exifP=0,gpsP=0;
  ifd(u32(t+4),(tag,tipo,c,val)=>{if(tag===0x010F)r.marca=texto(val,c);if(tag===0x0110)r.modelo=texto(val,c);if(tag===0x0132)r.fecha=r.fecha||texto(val,c);if(tag===0x8769)exifP=u32(val);if(tag===0x8825)gpsP=u32(val)});
  if(exifP)ifd(exifP,(tag,tipo,c,val)=>{if(tag===0x9003)r.fecha=texto(val,c)});
  if(gpsP){let la,lo,lr='N',gr='E';ifd(gpsP,(tag,tipo,c,val)=>{if(tag===1)lr=texto(val,2);if(tag===2)la=grados(val);if(tag===3)gr=texto(val,2);if(tag===4)lo=grados(val)});
   if(la&&lo){r.lat=(lr==='S'?-la:la).toFixed(6);r.lng=(gr==='W'?-lo:lo).toFixed(6)}}
  if(r.fecha)r.fecha=r.fecha.replace(/^(\d{4}):(\d{2}):(\d{2})/,'$1-$2-$3').slice(0,16);
  return r;
 }
}
/* ── Huella visual (dHash de 64 bits): dos fotos iguales o casi iguales tienen huellas parecidas ── */
function huella(dataUrl){return new Promise(ok=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=9;c.height=8;const x=c.getContext('2d');x.drawImage(img,0,0,9,8);
 const d=x.getImageData(0,0,9,8).data,g=i=>d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114;let bits='';
 for(let y=0;y<8;y++)for(let k=0;k<8;k++)bits+=g(y*9+k)>g(y*9+k+1)?'1':'0';
 let h='';for(let i=0;i<64;i+=4)h+=parseInt(bits.slice(i,i+4),2).toString(16);ok(h)};img.onerror=()=>ok('');img.src=dataUrl})}
const huellaUtil=h=>{if(!h||h.length!==16)return false;let n=0;for(const c of h){let x=parseInt(c,16);while(x){n+=x&1;x>>=1}}return n>=8&&n<=56};
function distHuella(a,b){if(!huellaUtil(a)||!huellaUtil(b))return 99;let d=0;for(let i=0;i<a.length;i++){let x=parseInt(a[i],16)^parseInt(b[i],16);while(x){d+=x&1;x>>=1}}return d}
/* Prepara una foto: la comprime y junta sus datos de verificación */
async function prepararFoto(file,origen){
 const ex=await leerExif(file),dataUrl=await comprimir(file),h=await huella(dataUrl);
 return{dataUrl,meta:{hash:h,exifFecha:ex.fecha||'',exifModelo:[ex.marca,ex.modelo].filter(Boolean).join(' '),exifLat:ex.lat||'',exifLng:ex.lng||'',origen,tipo:file.type||'',bytes:file.size||0}};
}

/* ── Presentación: estado, puntaje y lista de revisiones ── */
const VERIF={Confiable:{c:'var(--ok)',b:'var(--okb)',i:'✓'},Revisar:{c:'var(--warn)',b:'var(--warnb)',i:'◆'},Sospechosa:{c:'var(--bad)',b:'var(--badb)',i:'▲'}};
function verifBadge(e,conPuntaje){const v=VERIF[e.verificacion];if(!v)return`<span class="vb" style="--c:var(--mute);--b:var(--g50)">○ Sin verificar</span>`;
 return`<span class="vb" style="--c:${v.c};--b:${v.b}" title="Puntaje de confianza ${e.puntaje||'—'} de 100">${v.i} ${e.verificacion}${conPuntaje!==false&&e.puntaje!==''&&e.puntaje!=null?` · ${e.puntaje}`:''}</span>`}
const alertasDe=e=>String(e.alertas||'').split(' | ').filter(Boolean).map(x=>{const i=x.indexOf(':');return{c:x.slice(0,i),t:x.slice(i+1)}});
function primeraAlerta(e){const a=alertasDe(e);return a.length?a[0].t:''}
function panelVerificacion(e){
 const al=alertasDe(e),tiene=(...c)=>al.filter(x=>c.includes(x.c));let meta={};try{meta=JSON.parse(e.metadatos||'{}')}catch(x){}
 const fotos=meta.fotos||[],conCam=fotos.filter(f=>f.exifFecha||f.exifModelo).length;
 const fila=(ok,titulo,detalle,pend)=>`<li class="${pend?'pend':ok?'ok':'mal'}"><i aria-hidden="true">${pend?'…':ok?'✓':'!'}</i><div><b>${titulo}</b>${detalle?`<span>${esc(detalle)}</span>`:''}</div></li>`;
 const d=tiene('DUP'),ex=tiene('EXIF','PNG'),fe=tiene('FECHA'),gp=tiene('GPS','DIST'),iaM=tiene('IA_REAL','IA_REL'),ta=tiene('TARDE','GAL');
 return`<div class="verif"><div class="verif-cab">${anilloVerif(e)}<div><b>Verificación automática</b><span>${VERIF[e.verificacion]?{Confiable:'La evidencia pasó las revisiones.',Revisar:'Hay detalles que conviene revisar antes de validar.',Sospechosa:'Hay señales fuertes de que no es evidencia válida.'}[e.verificacion]:'Esta evidencia se subió antes de activar la verificación.'}</span></div></div>
 <ul class="checks">
 ${fila(!d.length,'Foto única',d.length?d.map(x=>x.t).join(' · '):'No se encontró la misma foto en otras evidencias.')}
 ${fila(!ex.length,'Foto original de cámara',ex.length?ex.map(x=>x.t).join(' · '):fotos.length?`${conCam} de ${fotos.length} fotos con datos de cámara${fotos[0]&&fotos[0].exifModelo?' ('+fotos[0].exifModelo+')':''}.`:'')}
 ${fila(!fe.length,'Fecha de la foto',fe.length?fe[0].t:fotos.some(f=>f.exifFecha)?'Tomada el '+fotos.find(f=>f.exifFecha).exifFecha.slice(0,10)+', coincide con la actividad.':'La foto no trae fecha; se usa la de envío.')}
 ${fila(!gp.length,'Ubicación',gp.length?gp.map(x=>x.t).join(' · '):e.lat?'Registrada al enviar.':'')}
 ${ta.length?fila(false,'Momento de captura',ta.map(x=>x.t).join(' · ')):''}
 ${fila(!iaM.length,'Revisión con IA',iaM.length?iaM.map(x=>x.t).join(' · ')+(e.ia?' — '+e.ia:''):e.ia||'Pendiente: se revisa sola en unos minutos (si la IA está activada).',!e.ia&&!iaM.length)}
 </ul>${e.lat?`<a class="sm" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${encodeURIComponent(e.lat+','+e.lng)}">${ic('visitas')} Ver en el mapa dónde se envió</a>`:''}</div>`;
}
function anilloVerif(e){const p=Number(e.puntaje),v=VERIF[e.verificacion]||{c:'var(--mute)'},C=2*Math.PI*22,ok=e.puntaje!==''&&e.puntaje!=null&&!isNaN(p);
 return`<svg class="anillo" viewBox="0 0 56 56" role="img" aria-label="Puntaje ${ok?p:'sin dato'}"><circle cx="28" cy="28" r="22" fill="none" stroke="var(--g100)" stroke-width="6"/>${ok?`<circle cx="28" cy="28" r="22" fill="none" stroke="${v.c}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C*p/100} ${C}" transform="rotate(-90 28 28)"/>`:''}<text x="28" y="33" text-anchor="middle" font-size="14" font-weight="700" fill="var(--tinta)">${ok?p:'—'}</text></svg>`}
