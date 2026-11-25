/* SAET Bienestar · Entrar y registrarse
   Lo usa: todos (registro: Servidor de la Nación) */

function pantallaAcceso(modo){
 $('#raiz').innerHTML=`<div id="acceso">
 <div class="portada"><svg class="deco" viewBox="0 0 64 64">${CEIBA}</svg>
  <div class="marca"><img src="${LOGO}" alt=""><div><b>${NOMBRE}</b><span>${LEMA}</span></div></div>
  <div class="lema"><h1>El territorio, organizado desde la raíz.</h1><p>Agenda semanal, tareas, evidencias y visitas de las seis regiones en un solo lugar.</p></div>
  <div class="sm lema" style="color:var(--oro2)">${SIGLA}</div></div>
 <div class="forma"><div id="forma"></div></div></div>`;
 modo==='registro'?formaRegistro():formaLogin();
}
function formaLogin(){
 $('#forma').innerHTML=`<h2>Bienvenido</h2><p class="mute" style="margin-bottom:22px">Entra con tu CURP y tu PIN.</p>
 <div class="campo"><label for="lu">CURP o usuario</label><input id="lu" autocomplete="username" style="text-transform:uppercase"></div>
 <div class="campo"><label for="lp">PIN</label><input id="lp" type="password" inputmode="numeric" autocomplete="current-password" onkeydown="if(event.key==='Enter')entrar($('#bEntrar'))"></div>
 <button class="btn" id="bEntrar" style="width:100%" onclick="entrar(this)">Entrar</button>
 <p class="sm" style="margin-top:16px;text-align:center">¿Eres servidor de la nación y es tu primera vez?<br><a href="#" onclick="formaRegistro();return false"><b>Regístrate aquí</b></a></p>
 ${DEMO?`<div class="demo"><b class="sm">Modo demo · datos de ejemplo</b><p class="sm mute" style="margin:4px 0 10px">Mira el sistema como cada perfil:</p><div class="fila wrap">${Object.keys(ROL).map(r=>`<button class="btn sec ch" onclick="entrarDemo('${r}')">${ROL[r]}</button>`).join('')}</div></div>`:''}`;
}
function entrar(b){ocupado(b,async()=>{const d=await api('login',{usuario:val('lu'),pin:val('lp'),...rangoDe(lunes(new Date()))});iniciar(d.token,d.datos)})}
async function entrarDemo(rol){S.user=DB.personal.find(p=>p.rol===rol&&p.estatus==='Activo');iniciar('demo',await api('datos',rangoDe(lunes(new Date()))))}
function guardarToken(t){S.token=t;try{localStorage.setItem('ceiba_t',t)}catch(e){}}
function iniciar(token,d){guardarToken(token);S.sup=null;S.rep=null;S.ficha=null;S.avIni=null;S.semana=lunes(new Date());S.rango=rangoDe(S.semana);aplicar(d);S.vista='inicio';S.f={};pintar();procesarCola()}
function salir(){S.token=null;S.user=null;try{localStorage.removeItem('ceiba_t');localStorage.removeItem('ceiba_c')}catch(e){}cerrar();pantallaAcceso()}

async function formaRegistro(){
 $('#forma').innerHTML='<p class="mute">Cargando…</p>';
 S.selfie=null;
 $('#forma').innerHTML=`<h2>Registro</h2><p class="mute" style="margin-bottom:16px">Servidor de la Nación · solo se hace una vez.</p>
 <div class="campo"><label for="rk">Clave de tu municipio o subregión *</label><input id="rk" style="text-transform:uppercase" placeholder="Te la da tu enlace municipal" autocomplete="off" onchange="revisarClave()" oninput="if(this.value.trim().length>=7)revisarClave()">
  <p class="sm" id="rkz" style="margin:6px 2px 0" aria-live="polite"></p></div>
 <div class="fila" style="margin-bottom:14px"><span class="av g" id="selfiePrev">${ic('perfil')}</span><div><label>Foto tipo selfie *</label>
  <label class="btn sec ch" style="display:inline-flex;margin:0">Tomar foto<input type="file" accept="image/*" capture="user" class="hide" onchange="tomarSelfie(this,'selfiePrev')"></label></div></div>
 <div class="campo"><label for="rpu">Puesto *</label><select id="rpu"><option value="">Servidor de la Nación</option><option value="UBA">UBA</option></select></div>
 <div class="campo"><label>Nombre completo *</label><input id="rn"></div>
 <div class="campo"><label>CURP *</label><input id="rc" maxlength="18" style="text-transform:uppercase"></div>
 <div class="dos"><div class="campo"><label>Correo</label><input id="re" type="email"></div><div class="campo"><label>Teléfono</label><input id="rt" inputmode="tel"></div></div>
 <div class="dos"><div class="campo"><label>Facebook (enlace o usuario)</label><input id="rf"></div><div class="campo"><label>Instagram</label><input id="ri"></div></div>
 <div class="campo"><label>Crea tu PIN (6 a 8 números) *</label><input id="rp" type="password" inputmode="numeric" maxlength="8"></div>
 <button class="btn" style="width:100%" onclick="registrar(this)">Enviar registro</button>
 <p class="sm" style="margin-top:14px;text-align:center"><a href="#" onclick="formaLogin();return false">Ya tengo cuenta</a></p>`;
}
let ultimaClave='';
async function revisarClave(){const c=val('rk').toUpperCase(),p=$('#rkz');if(!p||c===ultimaClave)return;ultimaClave=c;
 if(c.length<4){p.textContent='';return}
 try{const z=await api('revisarClave',{clave:c});if(val('rk').toUpperCase()!==c)return;p.style.color='var(--ok)';p.textContent='✓ '+z.zona+' · '+z.region}
 catch(e){if(val('rk').toUpperCase()!==c)return;p.style.color='var(--bad)';p.textContent=e.message}}
async function tomarSelfie(inp,prev){if(!inp.files[0])return;S.selfie=await comprimir(inp.files[0],600,.75);$('#'+prev).outerHTML=`<img class="av g" id="${prev}" src="${S.selfie}" alt="">`}
function registrar(b){ocupado(b,async()=>{
 if(!S.selfie) throw new Error('Toma tu foto para continuar');
 const r=await api('registro',{nombre:val('rn'),curp:val('rc'),correo:val('re'),telefono:val('rt'),facebook:val('rf'),instagram:val('ri'),pin:val('rp'),clave:val('rk'),selfie:S.selfie,puesto:val('rpu')});
 $('#forma').innerHTML=`<h2>¡Listo!</h2><p style="margin:10px 0 20px">${esc(r.mensaje)}</p><button class="btn" onclick="formaLogin()">Ir a entrar</button>`})}
