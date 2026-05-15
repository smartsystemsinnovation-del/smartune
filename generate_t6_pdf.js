const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'Documentacion', '20251_T6.pdf');
const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 60, right: 60 } });
doc.pipe(fs.createWriteStream(OUTPUT));

// ── PALETA ─────────────────────────────────────────────────
const C = {
  bg:      '#0a0a0a',
  pink:    '#f6339a',
  purple:  '#9810fa',
  white:   '#ffffff',
  gray:    '#aaaaaa',
  dark:    '#1a1a2e',
  card:    '#141428',
  accent:  '#00d4ff',
};

// ── HELPERS ────────────────────────────────────────────────
function fillPage(doc, color) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(color);
}

function gradientBar(doc, y, h = 4) {
  const grad = doc.linearGradient(60, y, doc.page.width - 60, y);
  grad.stop(0, C.pink).stop(1, C.purple);
  doc.rect(60, y, doc.page.width - 120, h).fill(grad);
}

function sectionTitle(doc, text, y) {
  gradientBar(doc, y - 2);
  doc.fillColor(C.pink).font('Helvetica-Bold').fontSize(13)
     .text(text, 60, y + 8);
  doc.moveDown(0.3);
  return doc.y;
}

function badge(doc, text, x, y, w = 90, h = 18) {
  doc.roundedRect(x, y, w, h, 5).fill(C.pink);
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(8)
     .text(text, x, y + 5, { width: w, align: 'center' });
}

// ══════════════════════════════════════════════════════════
// PÁGINA 1 — PORTADA
// ══════════════════════════════════════════════════════════
fillPage(doc, C.bg);

// Gradiente decorativo superior
const gTop = doc.linearGradient(0, 0, doc.page.width, 200);
gTop.stop(0, C.pink + '33').stop(1, C.purple + '11');
doc.rect(0, 0, doc.page.width, 200).fill(gTop);

// Logo textual
doc.fillColor(C.white).font('Helvetica-Bold').fontSize(48)
   .text('Smar', 60, 80, { continued: true })
   .fillColor(C.pink).text('Tune');

doc.fillColor(C.gray).font('Helvetica').fontSize(13)
   .text('Sistema de Información Musical Inteligente', 60, 140);

gradientBar(doc, 175, 3);

// Título del reporte
doc.fillColor(C.white).font('Helvetica-Bold').fontSize(22)
   .text('Análisis del Módulo MusicSwipe', 60, 200);
doc.fillColor(C.gray).font('Helvetica').fontSize(12)
   .text('Medición de Variables del Sistema de Información', 60, 228);

gradientBar(doc, 250, 2);

// Ficha técnica
const ficha = [
  ['Módulo Analizado', 'MusicSwipe (Android & Web)'],
  ['Plataformas',      'Jetpack Compose (Android) · Next.js (Web)'],
  ['Base de Datos',    'Supabase – tabla favoritos'],
  ['Tarea',           'T6 – Variables e Indicadores'],
  ['Boleta',          '20251'],
  ['Fecha',           new Date().toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' })],
  ['Materia',         'Sistemas de Información'],
];

let fy = 275;
ficha.forEach(([k, v]) => {
  doc.fillColor(C.pink).font('Helvetica-Bold').fontSize(9).text(k + ':', 60, fy);
  doc.fillColor(C.white).font('Helvetica').fontSize(9).text(v, 200, fy);
  fy += 18;
});

gradientBar(doc, fy + 10, 2);

// Descripción
doc.fillColor(C.gray).font('Helvetica').fontSize(10)
   .text(
     'Este documento presenta la especificación de variables de medición, el diseño ETL del sistema, ' +
     'los datos recolectados y el análisis estadístico de tendencia central para el módulo MusicSwipe ' +
     'de la aplicación SmarTune, en sus versiones Android y Web.',
     60, fy + 22, { width: doc.page.width - 120, align: 'justify' }
   );

// ══════════════════════════════════════════════════════════
// PÁGINA 2 — ETL LOOK & FEEL + VARIABLES
// ══════════════════════════════════════════════════════════
doc.addPage({ size: 'A4' });
fillPage(doc, C.bg);

// Header de página
doc.rect(0, 0, doc.page.width, 40).fill(C.dark);
doc.fillColor(C.pink).font('Helvetica-Bold').fontSize(10)
   .text('SmarTune · Módulo MusicSwipe · T6', 60, 14);
doc.fillColor(C.gray).font('Helvetica').fontSize(9)
   .text('Look & Feel ETL + Variables', doc.page.width - 200, 14, { width: 140, align: 'right' });

let cy = 60;

// ── SECCIÓN ETL ──
cy = sectionTitle(doc, '1. DISEÑO ETL – LOOK & FEEL', cy);
cy = doc.y + 10;

// Diagrama ETL textual
const etlSteps = [
  { fase: 'EXTRACT', color: C.accent, desc: 'Fuentes: YouTube Data API · Supabase (tabla favoritos)\nEntidades: canciones, interacciones, usuarios', icon: '⬇' },
  { fase: 'TRANSFORM', color: C.pink, desc: 'Normalización de títulos/artistas · Cálculo de tasas\nMapeo YouTube ID → metadatos · Deduplicación por upsert', icon: '⚙' },
  { fase: 'LOAD', color: C.purple, desc: 'Destino: tabla favoritos en Supabase\nFormatos: JSON (API) · CSV (análisis) · Estado en ViewModel', icon: '⬆' },
];

etlSteps.forEach((s, i) => {
  // Caja fase
  doc.roundedRect(60, cy, 150, 60, 8).fill(s.color + '22');
  doc.roundedRect(60, cy, 150, 60, 8).stroke(s.color);
  doc.fillColor(s.color).font('Helvetica-Bold').fontSize(11)
     .text(s.fase, 70, cy + 8);
  doc.fillColor(C.white).font('Helvetica').fontSize(8)
     .text(s.desc, 70, cy + 24, { width: 130 });

  // Flecha entre fases
  if (i < etlSteps.length - 1) {
    doc.fillColor(C.gray).font('Helvetica-Bold').fontSize(14)
       .text('→', 218, cy + 20);
  }

  cy += 0; // columnas horizontales
  if (i === 0) { /* primera columna */ }
});

// Rehacer en layout horizontal
cy = doc.y + 70;

// Variables de flujo ETL
doc.fillColor(C.gray).font('Helvetica').fontSize(9)
   .text('Flujo de datos: Usuario interactúa → MusicSwipeViewModel captura acción → API /api/swipe → Supabase upsert → CSV análisis', 60, cy, { width: doc.page.width - 120 });
cy = doc.y + 20;

// ── SECCIÓN VARIABLES ──
cy = sectionTitle(doc, '2. VARIABLES DEL SISTEMA DE INFORMACIÓN', cy);
cy = doc.y + 8;

const variables = [
  { id:'V01', nombre:'canciones_vistas',      tipo:'Cuantitativa Discreta',  desc:'Total de canciones presentadas al usuario por sesión' },
  { id:'V02', nombre:'likes',                 tipo:'Cuantitativa Discreta',  desc:'Canciones que el usuario guardó (swipe ❤️ / botón like)' },
  { id:'V03', nombre:'discards',              tipo:'Cuantitativa Discreta',  desc:'Canciones descartadas (swipe ✕ / botón X)' },
  { id:'V04', nombre:'tasa_like_pct',         tipo:'Cuantitativa Continua',  desc:'Porcentaje de likes sobre canciones vistas (likes/vistas×100)' },
  { id:'V05', nombre:'tiempo_sesion_seg',     tipo:'Cuantitativa Continua',  desc:'Duración total de la sesión en segundos' },
  { id:'V06', nombre:'canciones_por_sesion',  tipo:'Cuantitativa Discreta',  desc:'Número de canciones evaluadas en la sesión activa' },
  { id:'V07', nombre:'genero_preferido',      tipo:'Cualitativa Nominal',    desc:'Género musical más frecuentemente seleccionado (Pop/Phonk/Trap)' },
  { id:'V08', nombre:'swipes_derecha',        tipo:'Cuantitativa Discreta',  desc:'Conteo de gestos de swipe a la derecha (Android)' },
  { id:'V09', nombre:'swipes_izquierda',      tipo:'Cuantitativa Discreta',  desc:'Conteo de gestos de swipe a la izquierda (Android)' },
  { id:'V10', nombre:'favoritos_totales',     tipo:'Cuantitativa Discreta',  desc:'Total acumulado de favoritos en Supabase (tabla favoritos)' },
  { id:'V11', nombre:'errores_carga',         tipo:'Cuantitativa Discreta',  desc:'Número de errores al obtener canciones o cover_url' },
  { id:'V12', nombre:'tiempo_carga_ms',       tipo:'Cuantitativa Continua',  desc:'Tiempo de respuesta de la API /api/songs en milisegundos' },
  { id:'V13', nombre:'reproductions_preview', tipo:'Cuantitativa Discreta',  desc:'Veces que el usuario reprodujo preview de YouTube en sesión' },
  { id:'V14', nombre:'plataforma',            tipo:'Cualitativa Nominal',    desc:'Plataforma de uso: Android (Jetpack Compose) o Web (Next.js)' },
];

// Encabezado tabla
const colX = [60, 100, 210, 320];
const colW = [35, 105, 105, 210];
doc.rect(60, cy, doc.page.width - 120, 16).fill(C.pink + '44');
['ID','Variable','Tipo','Descripción'].forEach((h, i) => {
  doc.fillColor(C.pink).font('Helvetica-Bold').fontSize(8)
     .text(h, colX[i] + 2, cy + 4, { width: colW[i] });
});
cy += 16;

variables.forEach((v, idx) => {
  const rowH = 20;
  if (idx % 2 === 0) doc.rect(60, cy, doc.page.width - 120, rowH).fill(C.card);
  doc.fillColor(C.accent).font('Helvetica-Bold').fontSize(7.5)
     .text(v.id, colX[0] + 2, cy + 6, { width: colW[0] });
  doc.fillColor(C.white).font('Helvetica').fontSize(7)
     .text(v.nombre, colX[1] + 2, cy + 6, { width: colW[1] - 4 });
  doc.fillColor(C.gray).font('Helvetica').fontSize(7)
     .text(v.tipo, colX[2] + 2, cy + 6, { width: colW[2] - 4 });
  doc.fillColor(C.gray).font('Helvetica').fontSize(7)
     .text(v.desc, colX[3] + 2, cy + 6, { width: colW[3] - 4 });
  cy += rowH;
});

// ══════════════════════════════════════════════════════════
// PÁGINA 3 — ANÁLISIS ESTADÍSTICO
// ══════════════════════════════════════════════════════════
doc.addPage({ size: 'A4' });
fillPage(doc, C.bg);

doc.rect(0, 0, doc.page.width, 40).fill(C.dark);
doc.fillColor(C.pink).font('Helvetica-Bold').fontSize(10)
   .text('SmarTune · Módulo MusicSwipe · T6', 60, 14);
doc.fillColor(C.gray).font('Helvetica').fontSize(9)
   .text('Análisis Estadístico', doc.page.width - 200, 14, { width: 140, align: 'right' });

cy = 60;
cy = sectionTitle(doc, '3. ANÁLISIS DE TENDENCIA CENTRAL', cy);
cy = doc.y + 8;

// Descripción
doc.fillColor(C.gray).font('Helvetica').fontSize(9)
   .text('Datos obtenidos de 30 usuarios (15 Android, 15 Web). Se calcularon Media, Mediana y Moda para las variables cuantitativas del módulo MusicSwipe.', 60, cy, { width: doc.page.width - 120 });
cy = doc.y + 12;

// Tabla estadística
const stats = [
  { v: 'canciones_vistas',      media: 16.53, med: 16.00, moda: 15, desv: 6.18, cv: 37.39 },
  { v: 'likes',                 media: 10.87, med: 11.00, moda: 10, desv: 5.56, cv: 51.15 },
  { v: 'discards',              media: 5.67,  med: 5.00,  moda: 5,  desv: 1.27, cv: 22.40 },
  { v: 'tasa_like_pct',         media: 63.11, med: 66.67, moda: 66.67, desv: 13.23, cv: 20.96 },
  { v: 'tiempo_sesion_seg',     media: 450.3, med: 450.0, moda: 420, desv: 183.4, cv: 40.73 },
  { v: 'tiempo_carga_ms',       media: 932.0, med: 945.0, moda: 850, desv: 121.8, cv: 13.07 },
  { v: 'favoritos_totales',     media: 10.87, med: 11.00, moda: 10, desv: 5.56, cv: 51.15 },
  { v: 'errores_carga',         media: 0.37,  med: 0.00,  moda: 0,  desv: 0.61, cv: 165.2 },
  { v: 'reproductions_preview', media: 8.30,  med: 8.50,  moda: 5,  desv: 4.79, cv: 57.71 },
];

const sColX = [60, 185, 240, 295, 350, 415];
const sColW = [120, 52, 52, 52, 62, 55];
const sHdr  = ['Variable','Media','Mediana','Moda','Desv. Est.','C.V. %'];

doc.rect(60, cy, doc.page.width - 120, 16).fill(C.purple + '55');
sHdr.forEach((h, i) => {
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(7.5)
     .text(h, sColX[i] + 2, cy + 4, { width: sColW[i] });
});
cy += 16;

stats.forEach((r, idx) => {
  const rowH = 18;
  if (idx % 2 === 0) doc.rect(60, cy, doc.page.width - 120, rowH).fill(C.card);
  doc.fillColor(C.white).font('Helvetica').fontSize(7.5)
     .text(r.v, sColX[0] + 2, cy + 5, { width: sColW[0] - 4 });
  doc.fillColor(C.accent).font('Helvetica-Bold').fontSize(8)
     .text(r.media.toString(), sColX[1] + 2, cy + 5, { width: sColW[1] });
  doc.fillColor(C.gray).font('Helvetica').fontSize(7.5)
     .text(r.med.toString(), sColX[2] + 2, cy + 5, { width: sColW[2] });
  doc.fillColor(C.gray).font('Helvetica').fontSize(7.5)
     .text(r.moda.toString(), sColX[3] + 2, cy + 5, { width: sColW[3] });
  doc.fillColor(C.pink).font('Helvetica').fontSize(7.5)
     .text(r.desv.toString(), sColX[4] + 2, cy + 5, { width: sColW[4] });
  doc.fillColor(C.gray).font('Helvetica').fontSize(7.5)
     .text(r.cv + '%', sColX[5] + 2, cy + 5, { width: sColW[5] });
  cy += rowH;
});

cy += 16;

// ── Comparativa Android vs Web
cy = sectionTitle(doc, '4. COMPARATIVA ANDROID vs WEB', cy);
cy = doc.y + 8;

const platData = [
  { p:'Android (15 usuarios)', likes:'9.60', tasa:'60.6%', sesion:'396 seg', carga:'842 ms', prev:'7.1' },
  { p:'Web (15 usuarios)',     likes:'12.13', tasa:'65.6%', sesion:'505 seg', carga:'1,022 ms', prev:'9.5' },
];
const pColX = [60, 195, 255, 310, 375, 440];
const pHdr  = ['Plataforma','Likes prom.','Tasa like','Sesión prom.','Carga API','Previews'];
doc.rect(60, cy, doc.page.width - 120, 16).fill(C.pink + '44');
pHdr.forEach((h, i) => {
  doc.fillColor(C.pink).font('Helvetica-Bold').fontSize(7.5)
     .text(h, pColX[i] + 2, cy + 4);
});
cy += 16;
platData.forEach((r, idx) => {
  if (idx % 2 === 0) doc.rect(60, cy, doc.page.width - 120, 18).fill(C.card);
  const vals = [r.p, r.likes, r.tasa, r.sesion, r.carga, r.prev];
  vals.forEach((v, i) => {
    doc.fillColor(i === 0 ? C.white : C.accent).font(i===0?'Helvetica-Bold':'Helvetica').fontSize(8)
       .text(v, pColX[i] + 2, cy + 5);
  });
  cy += 18;
});

cy += 20;

// ══════════════════════════════════════════════════════════
// PÁGINA 4 — CONCLUSIONES
// ══════════════════════════════════════════════════════════
doc.addPage({ size: 'A4' });
fillPage(doc, C.bg);

doc.rect(0, 0, doc.page.width, 40).fill(C.dark);
doc.fillColor(C.pink).font('Helvetica-Bold').fontSize(10)
   .text('SmarTune · Módulo MusicSwipe · T6', 60, 14);
doc.fillColor(C.gray).font('Helvetica').fontSize(9)
   .text('Conclusiones', doc.page.width - 200, 14, { width: 140, align: 'right' });

cy = 60;
cy = sectionTitle(doc, '5. CONCLUSIONES DEL ANÁLISIS', cy);
cy = doc.y + 12;

const conclusiones = [
  {
    num: '01',
    titulo: 'Alto Engagement con las Recomendaciones',
    texto: 'La tasa de like promedio es de 63.11%, con una mediana de 66.67%, lo que indica que más de la mitad de las canciones presentadas resultan de interés para el usuario. Esto valida la efectividad del catálogo curado desde YouTube en el módulo MusicSwipe.'
  },
  {
    num: '02',
    titulo: 'Mayor Retención en Web que en Android',
    texto: 'Los usuarios de la plataforma Web registran sesiones promedio de 505 segundos vs 396 en Android (+27.5%). Además, el promedio de previews reproducidas es 9.5 (Web) vs 7.1 (Android), indicando mayor exploración auditiva en web, posiblemente por la reproducción inline de YouTube.'
  },
  {
    num: '03',
    titulo: 'Tiempo de Carga: Android Superior',
    texto: 'Android muestra tiempos de carga de API promedio de 842ms frente a 1,022ms en Web. El Coeficiente de Variación de tiempo_carga_ms es 13.07%, relativamente bajo, indicando consistencia en el rendimiento de la API /api/songs.'
  },
  {
    num: '04',
    titulo: 'Discards Consistentes y Bajos',
    texto: 'La variable discards tiene Media=5.67 y Desv. Est.=1.27 (CV=22.4%), lo que refleja un comportamiento muy homogéneo entre usuarios. Los usuarios descartan pocas canciones, confirmando que el algoritmo de selección evita contenido irrelevante.'
  },
  {
    num: '05',
    titulo: 'Errores de Carga: Área de Mejora',
    texto: 'El CV de errores_carga es 165.2%, altísima variabilidad. Aunque la media es baja (0.37), algunos usuarios concentran múltiples errores, especialmente en Web con cover_url nulas desde YouTube. Se recomienda implementar un fallback de imagen y manejo de errores robusto.'
  },
  {
    num: '06',
    titulo: 'Correlación Likes–Tiempo de Sesión',
    texto: 'El análisis en R (script 20251_T6.r) muestra correlación fuerte positiva entre likes y tiempo_sesion_seg (r ≈ 0.99). A mayor tiempo de sesión, más likes acumulados. Esto indica que la experiencia de descubrimiento genera retención orgánica.'
  },
];

conclusiones.forEach((c) => {
  // Badge número
  doc.circle(80, cy + 10, 14).fill(C.pink + '33').stroke(C.pink);
  doc.fillColor(C.pink).font('Helvetica-Bold').fontSize(9)
     .text(c.num, 73, cy + 6);

  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(10)
     .text(c.titulo, 105, cy);
  cy = doc.y + 2;
  doc.fillColor(C.gray).font('Helvetica').fontSize(8.5)
     .text(c.texto, 105, cy, { width: doc.page.width - 165, align: 'justify' });
  cy = doc.y + 14;
});

// Footer
gradientBar(doc, doc.page.height - 60, 2);
doc.fillColor(C.gray).font('Helvetica').fontSize(8)
   .text('SmarTune © 2026 · Boleta: 20251 · Módulo MusicSwipe · T6 · Sistemas de Información', 60, doc.page.height - 48, { align: 'center', width: doc.page.width - 120 });

// ── Cerrar
doc.end();
console.log('✅ PDF generado en:', OUTPUT);
