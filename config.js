/* SAET Bienestar · CONFIGURACIÓN
   Es el único archivo que necesitas editar para conectar la app.
   1) Pega en API_URL la URL de tu aplicación web de Apps Script (termina en /exec).
      Si la dejas vacía, la app abre en MODO DEMO con datos de ejemplo.
   2) Aquí también puedes editar los catálogos: tipos de actividad, programas y resultados de visita. */
const API_URL = 'https://script.google.com/macros/s/AKfycbwykIFkiNx7_nSRieXndKO2B1dglBqUBEFtx0OTQyDC1Ml2GaNHKqcpmYGFWWxH811AJQ/exec';

const NOMBRE = 'SAET Bienestar', LEMA = 'Agenda Territorial', SIGLA = 'Sistema de Agenda y Evidencias Territoriales';
const DEMO = !API_URL;
const TIPOS = ['Visita domiciliaria','Asamblea informativa','Operativo de pago','Módulo de atención','Censo / registro','Reunión de trabajo','Difusión','Capacitación','Otra'];
const PROGRAMAS = ['Pensión Adultos Mayores','Pensión Mujeres Bienestar','Pensión Personas con Discapacidad','Becas','Jóvenes Construyendo el Futuro','Sembrando Vida','Salud Casa por Casa','Otro'];
const RESULTADOS = ['Atendida','No se encontró a la persona','Requiere seguimiento','Canalizada','Domicilio no localizado'];
const ROL = {admin:'Administrador',regional:'Regional',encargado:'Encargado',monitor:'Monitor',servidor:'Servidor de la Nación'};
