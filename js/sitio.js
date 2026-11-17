// PetCard · página publicitaria: menú, animaciones con resorte, escena y contacto (base de ZooTrack)

import { t, traducirDocumento, iniciarSelector } from "./idioma-sitio.js?v=1";
traducirDocumento();
iniciarSelector();

const URL_APP = "https://platform.petcard.cloud";
const CORREO = "contacto@zootrack.com";
const FIRESTORE = "https://firestore.googleapis.com/v1/projects/zootrack-c97ea/databases/(default)/documents/contactos?key=AIzaSyAFGmVbrPdvotGpf1xQHhy28RL3wq4w9x8";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
const conPuntero = matchMedia("(hover: hover) and (pointer: fine)").matches;

$$("[data-app]").forEach((a) => { a.href = URL_APP; });
$$("[data-anio]").forEach((el) => { el.textContent = new Date().getFullYear(); });

// Resorte simple para movimientos que siguen al puntero
function resorte(aplicar, { rigidez = 0.12, friccion = 0.78 } = {}) {
  const e = { x: 0, y: 0, vx: 0, vy: 0, mx: 0, my: 0, activo: false };
  const paso = () => {
    e.vx = (e.vx + (e.mx - e.x) * rigidez) * friccion;
    e.vy = (e.vy + (e.my - e.y) * rigidez) * friccion;
    e.x += e.vx; e.y += e.vy;
    aplicar(e.x, e.y);
    if (Math.abs(e.vx) + Math.abs(e.vy) + Math.abs(e.mx - e.x) + Math.abs(e.my - e.y) > 0.01) requestAnimationFrame(paso);
    else e.activo = false;
  };
  return (x, y) => { e.mx = x; e.my = y; if (!e.activo) { e.activo = true; requestAnimationFrame(paso); } };
}

// Titular palabra por palabra
const titular = $("[data-titular]");
let k = 0;
const partir = (nodo) => {
  [...nodo.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((t) => {
        if (!t) return;
        if (/^\s+$/.test(t)) { frag.append(t); return; }
        const p = document.createElement("span");
        p.className = "palabra";
        p.innerHTML = `<span style="--k:${k++}"></span>`;
        p.firstChild.textContent = t;
        frag.append(p);
      });
      n.replaceWith(frag);
    } else partir(n);
  });
};
if (titular) partir(titular);
const arrancar = () => requestAnimationFrame(() => document.body.classList.add("listo"));
(document.fonts?.ready || Promise.resolve()).then(arrancar);
setTimeout(arrancar, 1200);

// Navegación
const nav = $("[data-nav]");
const alDesplazar = () => nav.classList.toggle("flotando", scrollY > 24);
addEventListener("scroll", alDesplazar, { passive: true });
alDesplazar();

const menu = $("[data-menu]");
const hamburguesa = $("[data-hamburguesa]");
const cerrarMenu = () => { menu.classList.remove("abierto"); hamburguesa.setAttribute("aria-expanded", "false"); };
hamburguesa.addEventListener("click", () => {
  const abrir = !menu.classList.contains("abierto");
  menu.classList.toggle("abierto", abrir);
  hamburguesa.setAttribute("aria-expanded", String(abrir));
});
menu.addEventListener("click", (e) => { if (e.target.closest("a")) cerrarMenu(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarMenu(); });
document.addEventListener("click", (e) => { if (menu.classList.contains("abierto") && !nav.contains(e.target)) cerrarMenu(); });

// Desplegable de Plataformas
const desplegable = $("[data-desplegable]");
const despBoton = $(".desplegable__boton", desplegable);
const despPanel = $(".desplegable__panel", desplegable);
const abrirDesp = (si) => {
  if (innerWidth <= 960) despPanel.style.setProperty("--alto", si ? `${despPanel.scrollHeight + 4}px` : "0px");
  desplegable.classList.toggle("abierto", si); despBoton.setAttribute("aria-expanded", String(si));
};
despBoton.addEventListener("click", (e) => { e.stopPropagation(); abrirDesp(!desplegable.classList.contains("abierto")); });
if (conPuntero) {
  let espera;
  desplegable.addEventListener("pointerenter", () => { clearTimeout(espera); if (innerWidth > 960) abrirDesp(true); });
  desplegable.addEventListener("pointerleave", () => { if (innerWidth > 960) espera = setTimeout(() => abrirDesp(false), 180); });
}
document.addEventListener("click", (e) => { if (!desplegable.contains(e.target)) abrirDesp(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { abrirDesp(false); } });

// Preguntas frecuentes: acordeón con altura animada; siempre queda una abierta
const preguntas = $$("[data-pregunta]");
function ponerPregunta(boton, abrir) {
  const pregunta = boton.closest(".pregunta");
  const respuesta = document.getElementById(boton.getAttribute("aria-controls"));
  if ((boton.getAttribute("aria-expanded") === "true") === abrir) return;
  boton.setAttribute("aria-expanded", String(abrir));
  pregunta.classList.toggle("abierta", abrir);
  if (abrir) {
    respuesta.hidden = false;
    respuesta.style.height = "0px";
    requestAnimationFrame(() => { respuesta.style.height = `${respuesta.scrollHeight}px`; });
    respuesta.addEventListener("transitionend", () => { if (boton.getAttribute("aria-expanded") === "true") respuesta.style.height = "auto"; }, { once: true });
  } else {
    respuesta.style.height = `${respuesta.scrollHeight}px`;
    requestAnimationFrame(() => { respuesta.style.height = "0px"; });
    respuesta.addEventListener("transitionend", () => { if (boton.getAttribute("aria-expanded") === "false") respuesta.hidden = true; }, { once: true });
  }
}
preguntas.forEach((boton) => {
  boton.addEventListener("click", () => {
    if (boton.getAttribute("aria-expanded") === "true") return;
    preguntas.forEach((otro) => { if (otro !== boton) ponerPregunta(otro, false); });
    ponerPregunta(boton, true);
  });
});

// Marcos de selección estilo editor de diseño
$$("[data-marco]").forEach((el) => {
  const marco = document.createElement("div");
  marco.className = `marco marco--${el.dataset.color || "verde"}`;
  marco.innerHTML = `<span class="marco__nombre"></span>${el.dataset.marcoDer ? '<span class="marco__der"></span>' : ""}<i class="asa asa--1"></i><i class="asa asa--2"></i><i class="asa asa--3"></i><i class="asa asa--4"></i>`;
  $(".marco__nombre", marco).textContent = el.dataset.marco;
  if (el.dataset.marcoDer) $(".marco__der", marco).textContent = el.dataset.marcoDer;
  ["revela", "entra"].forEach((c) => { if (el.classList.contains(c)) { el.classList.remove(c); marco.classList.add(c); } });
  if (el.style.getPropertyValue("--i")) marco.style.setProperty("--i", el.style.getPropertyValue("--i"));
  el.before(marco);
  marco.prepend(el);
});

// Etiquetas que se escriben solas dentro de un marco
const observaEtiqueta = new IntersectionObserver((entradas) => {
  entradas.forEach((en) => {
    if (!en.isIntersecting) return;
    observaEtiqueta.unobserve(en.target);
    const texto = en.target.dataset.texto, caja = $(".etiqueta__texto", en.target);
    if (quieto) { caja.textContent = texto; return; }
    let n = 0;
    const paso = () => { caja.textContent = texto.slice(0, ++n); if (n < texto.length) setTimeout(paso, 45 + Math.random() * 50); };
    setTimeout(paso, 250);
  });
}, { threshold: 1 });
$$(".etiqueta").forEach((el) => {
  el.dataset.texto = el.textContent.trim();
  el.setAttribute("aria-label", el.dataset.texto);
  el.innerHTML = '<span class="etiqueta__texto" aria-hidden="true"></span><span class="etiqueta__cursor" aria-hidden="true">_</span><i class="asa asa--1"></i><i class="asa asa--2"></i><i class="asa asa--3"></i><i class="asa asa--4"></i>';
  observaEtiqueta.observe(el);
});

// Listones que se dibujan con el desplazamiento
const listones = $$("[data-liston]").map((svg) => {
  const p = $("path", svg);
  const largo = p.getTotalLength();
  p.style.strokeDasharray = largo;
  p.style.strokeDashoffset = largo;
  return { svg, p, largo };
});

// Texto que se ilumina palabra por palabra
const ilumina = $("[data-ilumina]");
const palabrasIlumina = [];
const partirIlumina = (nodo) => [...nodo.childNodes].forEach((n) => {
  if (n.nodeType === 3) {
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach((t) => {
      if (!t) return;
      if (/^\s+$/.test(t)) { frag.append(t); return; }
      const s = document.createElement("span"); s.className = "pal"; s.textContent = t; frag.append(s); palabrasIlumina.push(s);
    });
    n.replaceWith(frag);
  } else partirIlumina(n);
});
if (ilumina) partirIlumina(ilumina);

const alAvanzar = () => {
  const h = innerHeight;
  listones.forEach(({ svg, p, largo }) => {
    const r = svg.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (h - r.top) / (h * 0.55 + r.height * 0.6)));
    p.style.strokeDashoffset = largo * (1 - (quieto ? 1 : t));
  });
  if (ilumina) {
    const r = ilumina.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (h * 0.85 - r.top) / (h * 0.5)));
    const hasta = Math.round(t * palabrasIlumina.length);
    palabrasIlumina.forEach((s, i) => s.classList.toggle("on", quieto || i < hasta));
  }
};
addEventListener("scroll", alAvanzar, { passive: true });
addEventListener("resize", alAvanzar);
alAvanzar();

// Aparición al desplazar
const observaRevela = new IntersectionObserver((entradas) => {
  entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); observaRevela.unobserve(en.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
$$(".revela, .pie, .liana").forEach((el) => observaRevela.observe(el));

// Marquesina infinita
const pista = $("[data-marquesina]");
if (pista) {
pista.innerHTML += pista.innerHTML;
}

// Escena de sabana con profundidad que sigue al puntero
const sabana = $("[data-sabana]");
if (false && sabana && conPuntero && !quieto) {
  const capas = $$("[data-capa]", sabana).map((el) => ({ el, f: Number(el.dataset.capa) }));
  const mover = resorte((x, y) => capas.forEach(({ el, f }) => { el.style.translate = `${x * f * 10}px ${y * f * 6}px`; }), { rigidez: 0.08, friccion: 0.8 });
  sabana.addEventListener("pointermove", (e) => {
    const r = sabana.getBoundingClientRect();
    mover((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
  });
  sabana.addEventListener("pointerleave", () => mover(0, 0));
}

// Barra de alimentación viva: baja con el tiempo y se llena al comer
const barra = $("[data-barra-viva]");
if (barra) {
const estadoComida = $("[data-estado-comida]");
let nivel = 1;
const pintarBarra = () => {
  barra.style.setProperty("--n", Math.max(nivel, 0.02));
  barra.firstElementChild.style.setProperty("--n", Math.max(nivel, 0.02));
  barra.classList.toggle("ambar", nivel < 0.5 && nivel >= 0.2);
  barra.classList.toggle("rojo", nivel < 0.2);
};
setTimeout(pintarBarra, 900);
if (!quieto) setInterval(() => {
  nivel = Math.round((nivel - 0.15) * 100) / 100;
  if (nivel <= 0) {
    nivel = 0;
    estadoComida.classList.add("vacio");
    estadoComida.innerHTML = `<i class="ph-fill ph-bowl-food"></i>${t("Le toca comer")}`;
    setTimeout(() => { nivel = 1; pintarBarra(); estadoComida.classList.remove("vacio"); estadoComida.innerHTML = `<i class="ph-fill ph-check-circle"></i>${t("Comió justo ahora")}`; }, 1400);
  } else estadoComida.innerHTML = `<i class="ph-fill ph-check-circle"></i>${t("Comió hace {n} h", { n: Math.round((1 - nivel) * 12) })}`;
  pintarBarra();
}, 1700);
}

// Cajas del bento: luz que sigue al cursor e inclinación con resorte
if (conPuntero && !quieto) $$("[data-luz]").forEach((caja) => {
  const inclinar = resorte((x, y) => { caja.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`; });
  caja.addEventListener("pointermove", (e) => {
    const r = caja.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    caja.style.setProperty("--mx", `${px * 100}%`);
    caja.style.setProperty("--my", `${py * 100}%`);
    inclinar(px - 0.5, py - 0.5);
  });
  caja.addEventListener("pointerleave", () => inclinar(0, 0));
});

// Botones magnéticos (desactivados: solo animación de pulsar)
if (false) $$("[data-iman]").forEach((b) => {
  const mover = resorte((x, y) => { b.style.transform = `translate(${x}px, ${y}px)`; }, { rigidez: 0.16, friccion: 0.72 });
  b.addEventListener("pointermove", (e) => {
    const r = b.getBoundingClientRect();
    mover((e.clientX - r.left - r.width / 2) * 0.18, (e.clientY - r.top - r.height / 2) * 0.3);
  });
  b.addEventListener("pointerleave", () => mover(0, 0));
});

// Catálogo de herramientas con pestañas e indicador con resorte
const catalogo = $("[data-catalogo]");
if (catalogo) {
const pestanas = $$('[role="tab"]', catalogo);
const indicador = $(".catalogo__indicador", catalogo);
const moverIndicador = () => {
  const activa = pestanas.find((p) => p.getAttribute("aria-selected") === "true");
  indicador.style.width = `${activa.offsetWidth}px`;
  indicador.style.translate = `${activa.offsetLeft}px 0`;
};
const elegir = (pestana) => {
  pestanas.forEach((p) => {
    const si = p === pestana;
    p.setAttribute("aria-selected", String(si));
    p.tabIndex = si ? 0 : -1;
    const panel = document.getElementById(p.getAttribute("aria-controls"));
    panel.hidden = !si;
    panel.classList.toggle("entra-panel", si);
  });
  moverIndicador();
};
pestanas.forEach((p, i) => {
  p.addEventListener("click", () => elegir(p));
  p.addEventListener("keydown", (e) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const sig = pestanas[(i + d + pestanas.length) % pestanas.length];
    sig.focus(); elegir(sig);
  });
});
moverIndicador();
addEventListener("resize", moverIndicador);
(document.fonts?.ready || Promise.resolve()).then(moverIndicador);
}

// Lectura de temperatura simulada en Dispositivos
const temperatura = $("[data-temperatura]");
if (temperatura && !quieto) setInterval(() => { temperatura.textContent = (24 + Math.random() * 1.4).toFixed(1); }, 1600);

// Cómo funciona: el oso hormiguero avanza con el desplazamiento
const ruta = $("[data-ruta]");
if (ruta && $(".ruta__caminante", ruta)) {
const caminante = $(".ruta__caminante", ruta);
let ultimoAvance = 0;
const avanzar = () => {
  const r = ruta.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
  ruta.style.setProperty("--avance", p.toFixed(4));
  if (Math.abs(p - ultimoAvance) > 0.0005) {
    caminante.style.transform = p < ultimoAvance ? "scaleX(-1)" : "";
    ultimoAvance = p;
  }
};
addEventListener("scroll", avanzar, { passive: true });
avanzar();
}

// Avisos
function avisar({ titulo, texto, icono = "check-circle", error = false, duracion = 5200 }) {
  const zona = $("[data-avisos]");
  if (!zona) return;
  const el = document.createElement("div");
  el.className = `aviso${error ? " aviso--rojo" : ""}`;
  el.setAttribute("role", error ? "alert" : "status");
  el.style.setProperty("--duracion", `${duracion}ms`);
  el.innerHTML = `<span class="aviso__icono" aria-hidden="true"><i class="ph-bold ph-${icono}"></i></span><div class="aviso__texto"><strong></strong>${texto ? "<p></p>" : ""}</div><button class="aviso__cerrar" type="button" aria-label="${t("Cerrar")}"><i class="ph-bold ph-x"></i></button><span class="aviso__tiempo" aria-hidden="true"></span>`;
  el.querySelector("strong").textContent = titulo;
  if (texto) el.querySelector("p").textContent = texto;
  zona.prepend(el);
  [...zona.querySelectorAll(".aviso:not(.sale)")].slice(4).forEach((v) => v.dispatchEvent(new Event("aviso:quitar")));
  let hecho = false, restante = duracion, inicio = Date.now(), reloj = null;
  const quitar = () => {
    if (hecho) return;
    hecho = true; clearTimeout(reloj);
    el.style.setProperty("--alto", `${el.offsetHeight}px`);
    el.style.height = `${el.offsetHeight}px`;
    el.classList.add("sale");
    setTimeout(() => el.remove(), 780);
  };
  const correr = () => { inicio = Date.now(); reloj = setTimeout(quitar, restante); el.classList.remove("pausado"); };
  const pausar = () => { clearTimeout(reloj); restante -= Date.now() - inicio; el.classList.add("pausado"); };
  el.addEventListener("pointerenter", pausar);
  el.addEventListener("pointerleave", () => { if (!hecho) correr(); });
  el.addEventListener("aviso:quitar", quitar);
  el.querySelector(".aviso__cerrar").addEventListener("click", quitar);
  correr();
}

// Campos con X para borrar
$$("[data-limpiar]").forEach((x) => {
  const caja = x.closest(".campo__caja, .boletin__campo"), input = $("input", caja);
  const pintar = () => caja.classList.toggle("con-texto", input.value.length > 0);
  input.addEventListener("input", pintar);
  x.addEventListener("click", () => { input.value = ""; pintar(); input.dispatchEvent(new Event("input", { bubbles: true })); input.focus(); });
  pintar();
});

const correoValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

// Selector propio y formulario de contacto
// Envía el mensaje al correo de contacto (FormSubmit) y guarda copia en Firestore
const MAIL = `https://formsubmit.co/ajax/${CORREO}`;
async function enviarContacto(datos) {
  const demo = datos.modo === "demo";
  const tipos = { familia: "Tengo mascota", veterinaria: "Veterinaria", refugio: "Refugio o rescate", criador: "Criador", otro: "Otro" };
  const correo = fetch(MAIL, {
    method: "POST", headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      _subject: demo ? `Solicitud de demo de ${datos.plataforma || "PetCard Vet"} · ${datos.nombre}` : `Nuevo mensaje de ${datos.nombre} · PetCard`, _replyto: datos.correo, _template: "table", _captcha: "false",
      Solicitud: demo ? "Demo" : "Mensaje de contacto",
      Nombre: datos.nombre, Correo: datos.correo,
      ...(demo ? { Plataforma: datos.plataforma || "PetCard Vet", "Teléfono": datos.telefono || "—", Animales: datos.animales || "—" } : {}),
      "Mascota o veterinaria": datos.organizacion || "—", Tipo: tipos[datos.tipo] || datos.tipo, Mensaje: datos.mensaje || "—", Idioma: document.documentElement.lang,
    }),
  }).then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok || String(j.success) !== "true") throw new Error(j.message || `HTTP ${r.status}`); });
  const base = { nombre: datos.nombre, correo: datos.correo, organizacion: datos.organizacion, tipo: datos.tipo, mensaje: demo ? `[Demo ${datos.plataforma || "PetCard Vet"}] Animales: ${datos.animales || "—"} · Teléfono: ${datos.telefono || "—"}\n${datos.mensaje}` : datos.mensaje };
  const campos = Object.fromEntries(Object.entries(base).map(([c, v]) => [c, { stringValue: v }]));
  campos.fecha = { timestampValue: new Date().toISOString() };
  campos.origen = { stringValue: "petcardpubli" };
  const copia = fetch(FIRESTORE, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fields: campos }) }).then(async (r) => { if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(`HTTP ${r.status} ${j.error?.message || ""}`); } });
  const [m, c] = await Promise.allSettled([correo, copia]);
  if (m.status === "rejected") console.warn("[ZooTrack] FormSubmit:", m.reason?.message || m.reason);
  if (c.status === "rejected") console.warn("[ZooTrack] Firestore:", c.reason?.message || c.reason);
  if (m.status === "rejected" && c.status === "rejected") throw m.reason;
}

// Selector propio y formulario de contacto (sirve para la página y para la hoja)
function montarFormulario(form, { alEnviar } = {}) {
const selector = $("[data-selector]", form);
const selBoton = $(".selector__boton", selector);
const selLista = $(".selector__lista", selector);
const selOculto = $('input[type="hidden"]', selector);
const selValor = $("[data-selector-valor]", selector);
const opciones = $$('[role="option"]', selLista);
let activa = 0;
const marcarActiva = (i) => {
  activa = (i + opciones.length) % opciones.length;
  opciones.forEach((o, k) => o.classList.toggle("activa", k === activa));
  selBoton.setAttribute("aria-activedescendant", opciones[activa].id);
  opciones[activa].scrollIntoView({ block: "nearest" });
};
const abrirSel = () => {
  selector.classList.add("abierto");
  selBoton.setAttribute("aria-expanded", "true");
  marcarActiva(opciones.findIndex((o) => o.getAttribute("aria-selected") === "true"));
};
const cerrarSel = () => { selector.classList.remove("abierto"); selBoton.setAttribute("aria-expanded", "false"); selBoton.removeAttribute("aria-activedescendant"); };
const elegirOpcion = (o, enfocar = true) => {
  opciones.forEach((x) => x.setAttribute("aria-selected", String(x === o)));
  selOculto.value = o.dataset.valor;
  selValor.innerHTML = `${o.querySelector(".selector__icono").outerHTML}${o.textContent.trim()}`;
  cerrarSel();
  if (enfocar) selBoton.focus();
};
selBoton.addEventListener("click", () => (selector.classList.contains("abierto") ? cerrarSel() : abrirSel()));
selBoton.addEventListener("keydown", (e) => {
  const abierto = selector.classList.contains("abierto");
  if (["ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); if (!abierto) abrirSel(); else marcarActiva(activa + (e.key === "ArrowDown" ? 1 : -1)); }
  else if (e.key === "Home" && abierto) { e.preventDefault(); marcarActiva(0); }
  else if (e.key === "End" && abierto) { e.preventDefault(); marcarActiva(opciones.length - 1); }
  else if ((e.key === "Enter" || e.key === " ") && abierto) { e.preventDefault(); elegirOpcion(opciones[activa]); }
  else if (e.key === "Escape" && abierto) { e.preventDefault(); e.stopPropagation(); cerrarSel(); }
  else if (e.key === "Tab" && abierto) cerrarSel();
  else if (e.key.length === 1 && /\S/.test(e.key)) {
    const i = opciones.findIndex((o, k) => k > activa && o.textContent.trim().toLowerCase().startsWith(e.key.toLowerCase()));
    const j = i >= 0 ? i : opciones.findIndex((o) => o.textContent.trim().toLowerCase().startsWith(e.key.toLowerCase()));
    if (j >= 0) { if (!abierto) abrirSel(); marcarActiva(j); }
  }
});
opciones.forEach((o, i) => {
  o.addEventListener("pointermove", () => { if (activa !== i) marcarActiva(i); });
  o.addEventListener("click", () => elegirOpcion(o));
});
document.addEventListener("pointerdown", (e) => { if (!selector.contains(e.target)) cerrarSel(); });

const marcar = (nombre, mensaje) => {
  const campo = $(`[data-campo="${nombre}"]`, form);
  if (!campo) return;
  campo.classList.toggle("error", !!mensaje);
  const p = $(".campo__error", campo);
  if (p) p.textContent = mensaje || "";
};
form.addEventListener("input", (e) => { const c = e.target.closest(".campo"); if (c?.classList.contains("error")) marcar(c.dataset.campo, ""); });

const limpiar = () => {
  form.reset();
  elegirOpcion(opciones[0], false);
  $$(".campo__caja", form).forEach((c) => c.classList.remove("con-texto"));
  ["nombre", "correo", "mensaje"].forEach((c) => marcar(c, ""));
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if (d.sitio) return;
  const modo = form.closest("[data-hoja]")?.dataset.modo || "contacto";
  const datos = { modo, nombre: d.nombre.trim(), correo: d.correo.trim(), organizacion: d.organizacion.trim(), tipo: d.tipo, mensaje: d.mensaje.trim(), telefono: (d.telefono || "").trim(), animales: d.animales || "", plataforma: d.plataforma || "" };
  const errores = {
    nombre: !datos.nombre && t("Escribe tu nombre"),
    correo: !datos.correo ? t("Escribe tu correo") : !correoValido(datos.correo) && t("Revisa que el correo esté bien escrito"),
    mensaje: modo !== "demo" && !datos.mensaje && t("Cuéntanos en qué te ayudamos"),
  };
  Object.entries(errores).forEach(([c, v]) => marcar(c, v));
  const primero = Object.keys(errores).find((c) => errores[c]);
  if (primero) { form.elements[primero].focus(); form.classList.remove("sacude"); void form.offsetWidth; form.classList.add("sacude"); return; }

  const boton = $(".formulario__enviar", form);
  const icono = $("i", boton);
  boton.classList.add("cargando"); boton.disabled = true; icono.className = "ph-bold ph-circle-notch";
  $("span", boton).textContent = t("Enviando…");
  try {
    await enviarContacto(datos);
    limpiar();
    if (alEnviar) alEnviar(true, datos);
    else avisar({ titulo: t("¡Mensaje enviado!"), texto: t("Gracias por escribirnos, te responderemos pronto."), icono: "paw-print" });
  } catch {
    if (alEnviar) alEnviar(false, datos);
    else avisar({ titulo: t("No se pudo enviar"), texto: t("Revisa tu conexión o escríbenos a {correo}", { correo: CORREO }), icono: "warning-circle", error: true });
  } finally {
    boton.classList.remove("cargando"); boton.disabled = false; icono.className = "ph-bold ph-paper-plane-tilt";
    $("span", boton).textContent = modo === "demo" ? t("Solicitar demo") : t("Enviar mensaje");
  }
});

// Llegando desde "PetCard Vet"
if (!alEnviar && new URLSearchParams(location.search).get("plataforma") === "vet") {
  const opcionOtro = opciones.find((o) => o.dataset.valor === "veterinaria");
  if (opcionOtro) elegirOpcion(opcionOtro, false);
  form.elements.mensaje.value = t("Me interesa PetCard Vet para mi clínica. ");
}
return { limpiar };
}

$$("[data-contacto]").forEach((f) => { if (!f.closest("[data-hoja]")) montarFormulario(f); });

// Hoja de "Escríbenos": formulario en medio de la pantalla
const hoja = $("[data-hoja]");
if (hoja) {
  const formHoja = $("[data-contacto]", hoja);
  const pasos = { form: $("[data-hoja-paso='form']", hoja), listo: $("[data-hoja-paso='listo']", hoja), error: $("[data-hoja-paso='error']", hoja) };
  const ver = (paso) => {
    Object.entries(pasos).forEach(([n, el]) => { el.hidden = n !== paso; });
    hoja.dataset.paso = paso;
    const foco = paso === "form" ? formHoja.elements.nombre : $("[data-hoja-foco]", pasos[paso]);
    setTimeout(() => foco?.focus({ preventScroll: true }), 60);
  };
  const { limpiar } = montarFormulario(formHoja, {
    alEnviar: (ok, datos) => {
      if (ok) $("[data-hoja-correo]", hoja).textContent = datos.correo;
      ver(ok ? "listo" : "error");
    },
  });
  let ultimo = null;
  const mensaje = formHoja.elements.mensaje, pista = mensaje.placeholder;
  const abrir = (e, modo = "contacto") => {
    e?.preventDefault();
    ultimo = document.activeElement;
    hoja.dataset.modo = modo;
    if (modo === "demo") {
      const esVet = !!e?.currentTarget?.closest?.(".tema-vet") || location.pathname.replace(/\.html$/, "").endsWith("/veterinarias");
      const radio = formHoja.querySelector(`input[name="plataforma"][value="${esVet ? "PetCard Vet" : "PetCard"}"]`);
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    mensaje.required = modo !== "demo";
    $(".formulario__enviar span", formHoja).textContent = modo === "demo" ? t("Solicitar demo") : t("Enviar mensaje");
    mensaje.placeholder = modo === "demo" ? t("Por ejemplo: agenda, expediente y recetas para mi clínica") : pista;
    ["nombre", "correo", "mensaje"].forEach((c) => { const x = $(`[data-campo="${c}"]`, formHoja); x?.classList.remove("error"); });
    ver("form");
    hoja.classList.remove("cerrando");
    hoja.showModal();
    document.documentElement.classList.add("con-hoja");
  };
  const cerrar = () => {
    if (!hoja.open || hoja.classList.contains("cerrando")) return;
    if (quieto) { hoja.close(); return; }
    hoja.classList.add("cerrando");
    setTimeout(() => { hoja.classList.remove("cerrando"); hoja.close(); }, 260);
  };
  hoja.addEventListener("close", () => {
    document.documentElement.classList.remove("con-hoja");
    if (hoja.dataset.paso === "listo") limpiar();
    ultimo?.focus?.({ preventScroll: true });
  });
  hoja.addEventListener("cancel", (e) => { e.preventDefault(); cerrar(); });
  hoja.addEventListener("pointerdown", (e) => { if (e.target === hoja) cerrar(); });
  $$("[data-hoja-cerrar]", hoja).forEach((b) => b.addEventListener("click", cerrar));
  $("[data-hoja-reintentar]", hoja).addEventListener("click", () => ver("form"));
  $("[data-hoja-otro]", hoja).addEventListener("click", () => ver("form"));
  $$("[data-escribenos]").forEach((b) => b.addEventListener("click", (e) => abrir(e, "contacto")));
  $$("[data-demo]").forEach((b) => b.addEventListener("click", (e) => abrir(e, "demo")));
}

// Boletín de novedades
const boletin = $("[data-boletin]");
if (boletin) {
  const entrada = boletin.elements.correo, error = $(".boletin__error", boletin), boton = $(".boletin__boton", boletin);
  const mostrarError = (txt) => { error.textContent = txt || ""; boletin.classList.toggle("con-error", !!txt); if (txt) { boletin.classList.remove("sacude"); void boletin.offsetWidth; boletin.classList.add("sacude"); } };
  entrada.addEventListener("input", () => mostrarError(""));
  boletin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = entrada.value.trim();
    const falla = !correo ? t("Escribe tu correo") : !correoValido(correo) && t("Revisa que el correo esté bien escrito");
    if (falla) { mostrarError(falla); entrada.focus(); return; }
    const icono = $("i", boton), texto = $("span", boton);
    boton.classList.add("cargando"); boton.disabled = true; icono.className = "ph-bold ph-circle-notch"; texto.textContent = t("Suscribiendo…");
    const campos = { correo: { stringValue: correo }, idioma: { stringValue: document.documentElement.lang }, origen: { stringValue: "petcardpubli" }, fecha: { timestampValue: new Date().toISOString() } };
    const enviar = (url, extra = {}) => fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fields: { ...campos, ...extra } }) });
    try {
      let r = await enviar(FIRESTORE.replace("/contactos?", "/suscriptores?"));
      if (!r.ok) r = await enviar(FIRESTORE, { tipo: { stringValue: "boletin" }, nombre: { stringValue: "Boletín" }, mensaje: { stringValue: "Quiere recibir las novedades de PetCard" } });
      if (!r.ok) throw new Error(String(r.status));
      boletin.reset();
      $(".boletin__campo", boletin).classList.remove("con-texto");
      boletin.classList.add("suscrito");
      setTimeout(() => boletin.classList.remove("suscrito"), 2600);
      avisar({ titulo: t("¡Listo, ya estás suscrito!"), texto: t("Te avisaremos de todas las novedades de PetCard."), icono: "paw-print" });
    } catch {
      avisar({ titulo: t("No se pudo suscribir"), texto: t("Inténtalo de nuevo en un momento."), icono: "warning-circle", error: true });
    } finally {
      boton.classList.remove("cargando"); boton.disabled = false; icono.className = "ph-bold ph-paper-plane-tilt"; texto.textContent = t("Suscribirme");
    }
  });
}

// Editor LaTeX que escribe, muestra el PDF, borra y vuelve a empezar
$$("[data-latex]").forEach((latex) => {
  const lineas = ["\\section{Plan de manejo}", "\\textbf{Especie:} Ajolote", "\\textit{A. mexicanum}", "$$ E = \\sum_i p_i x_i $$"];
  const caja = $(".latex__lineas", latex), hoja = $$(".lh", latex);
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const colorea = (t) => esc(t)
    .replace(/(\$\$[^$]*\$?\$?)/g, '<span class="tk-mat">$1</span>')
    .replace(/(\\[a-zA-Z]+)(?![^<]*<\/span>)/g, '<span class="tk-cmd">$1</span>')
    .replace(/\{([^{}<]*)\}/g, '<span class="tk-llave">{</span><span class="tk-arg">$1</span><span class="tk-llave">}</span>');
  let texto = lineas.map(() => "");
  const pintar = (fila) => {
    caja.innerHTML = texto.map((t, i) => `<div>${colorea(t)}${i === fila ? '<span class="latex__cursor"></span>' : ""}</div>`).join("");
    hoja.forEach((h, i) => h.classList.toggle("on", texto[i] === lineas[i]));
  };
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const ciclo = async () => {
    for (;;) {
      for (let f = 0; f < lineas.length; f++) {
        for (let c = 1; c <= lineas[f].length; c++) { texto[f] = lineas[f].slice(0, c); pintar(f); await espera(55); }
        await espera(350);
      }
      await espera(2200);
      for (let f = lineas.length - 1; f >= 0; f--) {
        while (texto[f].length) { texto[f] = texto[f].slice(0, -2); pintar(f); await espera(18); }
      }
      await espera(500);
    }
  };
  if (quieto) { texto = [...lineas]; pintar(-1); } else ciclo();
});

// Mazo de cartas: se pasan arrastrando, con clic, flechas o la barra de progreso
const mazo = $("[data-mazo]");
if (mazo) {
  const cartas = $$("[data-carta]", mazo), barra = $("[data-mazo-puntos]"), puntos = $$("button", barra), cuenta = $("[data-mazo-cuenta]");
  const LUGAR = [[0, 0, 0, 1], [34, 12, 6, 0.95], [-30, 22, -5, 0.9], [0, 30, 0, 0.86]];
  const total = String(cartas.length).padStart(2, "0");
  let orden = cartas.map((_, i) => i), ocupado = false, arrastre = null, dentro = false;
  const pintar = () => {
    orden.forEach((n, pos) => {
      const c = cartas[n], [x, y, r, e] = LUGAR[Math.min(pos, 3)];
      c.dataset.pos = pos;
      c.style.zIndex = 20 - pos;
      c.style.setProperty("--tx", `${x}px`); c.style.setProperty("--ty", `${y}px`);
      c.style.setProperty("--r", `${r}deg`); c.style.setProperty("--s", e);
      c.classList.toggle("oculta", pos > 2);
      c.setAttribute("aria-hidden", String(pos !== 0));
    });
    const actual = orden[0];
    puntos.forEach((p, i) => { p.classList.remove("on"); p.classList.toggle("lleno", i < actual); p.setAttribute("aria-current", String(i === actual)); });
    void barra.offsetWidth;
    puntos[actual].classList.add("on");
    if (cuenta) cuenta.textContent = `${String(actual + 1).padStart(2, "0")} / ${total}`;
  };
  const pausar = (si) => barra.classList.toggle("pausa", si);
  const pasar = (dir = -1) => {
    if (ocupado) return; ocupado = true;
    const c = cartas[orden[0]];
    if (quieto) { orden.push(orden.shift()); pintar(); ocupado = false; return; }
    c.classList.add("vuela");
    c.style.setProperty("--dx", `${dir * 520}px`); c.style.setProperty("--dr", `${dir * 24}deg`);
    setTimeout(() => {
      c.classList.remove("vuela"); c.classList.add("salta");
      c.style.setProperty("--dx", "0px"); c.style.setProperty("--dr", "0deg");
      orden.push(orden.shift()); pintar();
      void c.offsetWidth; c.classList.remove("salta");
      ocupado = false;
    }, 430);
  };
  const regresar = () => {
    if (ocupado) return;
    const n = orden.pop(), c = cartas[n];
    c.classList.add("salta"); c.style.setProperty("--dx", "-520px"); c.style.setProperty("--dr", "-24deg");
    orden.unshift(n); pintar(); void c.offsetWidth;
    c.classList.remove("salta"); c.style.setProperty("--dx", "0px"); c.style.setProperty("--dr", "0deg");
  };
  // La barra marca el tiempo: al llenarse el tramo actual pasa la carta
  barra.addEventListener("animationend", (e) => { if (e.animationName === "llenar" && !dentro && !arrastre) pasar(-1); });
  $("[data-mazo-next]")?.addEventListener("click", () => pasar(-1));
  $("[data-mazo-prev]")?.addEventListener("click", regresar);
  puntos.forEach((p, i) => p.addEventListener("click", () => { if (orden[0] === i || ocupado) return; while (orden[0] !== i) orden.push(orden.shift()); pintar(); }));
  mazo.addEventListener("pointerdown", (e) => {
    const c = cartas[orden[0]];
    if (ocupado || !c.contains(e.target)) return;
    arrastre = { c, x: e.clientX, dx: 0 };
    c.setPointerCapture(e.pointerId); c.classList.add("arrastra"); pausar(true);
  });
  mazo.addEventListener("pointermove", (e) => {
    if (!arrastre) return;
    arrastre.dx = e.clientX - arrastre.x;
    arrastre.c.style.setProperty("--dx", `${arrastre.dx}px`);
    arrastre.c.style.setProperty("--dr", `${arrastre.dx / 18}deg`);
  });
  const soltar = () => {
    if (!arrastre) return;
    const { c, dx } = arrastre; arrastre = null;
    c.classList.remove("arrastra");
    if (Math.abs(dx) > 90) pasar(Math.sign(dx));
    else if (Math.abs(dx) < 6) { c.style.setProperty("--dx", "0px"); c.style.setProperty("--dr", "0deg"); pasar(-1); }
    else { c.style.setProperty("--dx", "0px"); c.style.setProperty("--dr", "0deg"); }
    pausar(dentro);
  };
  mazo.addEventListener("pointerup", soltar);
  mazo.addEventListener("pointercancel", soltar);
  mazo.addEventListener("mouseenter", () => { dentro = true; pausar(true); });
  mazo.addEventListener("mouseleave", () => { dentro = false; pausar(false); });
  // Solo corre cuando el mazo está a la vista
  new IntersectionObserver(([en]) => { if (!dentro) pausar(!en.isIntersecting); }).observe(mazo);
  pintar();
}

// Carrusel de fotos en Nuestra misión
const fotos = $("[data-fotos]");
if (fotos) {
  const items = $$("[data-foto]", fotos);
  let actual = 0, dentro = false, visible = false, x0 = null, auto;
  const ir = (i) => {
    actual = (i + items.length) % items.length;
    items.forEach((f, k) => { f.classList.toggle("activa", k === actual); f.setAttribute("aria-hidden", String(k !== actual)); });
    reiniciar();
  };
  const reiniciar = () => { clearInterval(auto); if (!quieto && !dentro && visible) auto = setInterval(() => ir(actual + 1), 5000); };
  $("[data-fotos-next]", fotos).addEventListener("click", () => ir(actual + 1));
  $("[data-fotos-prev]", fotos).addEventListener("click", () => ir(actual - 1));
  fotos.addEventListener("pointerdown", (e) => { if (!e.target.closest("button")) x0 = e.clientX; });
  fotos.addEventListener("pointerup", (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) ir(actual + (dx < 0 ? 1 : -1)); });
  fotos.addEventListener("mouseenter", () => { dentro = true; reiniciar(); });
  fotos.addEventListener("mouseleave", () => { dentro = false; reiniciar(); });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; reiniciar(); }).observe(fotos);
  ir(0);
}

// Cápsula de PetCard: aparece al entrar y se queda hasta que la cierras
const petcard = $("[data-petcard]");
let petcardCerrada = false;
try { petcardCerrada = localStorage.getItem("petcard-zootrack") === "cerrada"; } catch {}
if (petcard && !petcardCerrada) setTimeout(() => petcard.classList.add("visible"), 1400);
else if (petcard) petcard.hidden = true;
$("[data-petcard-cerrar]")?.addEventListener("click", () => {
  petcard.classList.add("sale");
  petcard.addEventListener("transitionend", () => { petcard.hidden = true; }, { once: true });
  try { localStorage.setItem("petcard-zootrack", "cerrada"); } catch {}
});

// Pisada al hacer clic: huella negra, puntos que saltan alrededor y "paw" dibujado a mano
if (conPuntero && !quieto) {
  const azar = (min, max) => min + Math.random() * (max - min);
  const PAW = ["M2 8v18", "M2 9c5-5 13-3 12 4-1 6-8 7-12 3", "M28 11c-6-4-12 1-10 7 2 6 9 4 10-2m0-6v11c0 2 1 3 2 3", "M35 9l3 12 4-9 4 9 3-12"];
  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("input, textarea, select")) return;
    const puntos = Array.from({ length: Math.round(azar(4, 7)) }, (_, i) => {
      const angulo = azar(0, Math.PI * 2), dist = azar(30, 62), r = azar(1.6, 5.2);
      return `<g class="pisada__punto${Math.random() < 0.35 ? " pisada__punto--hueco" : ""}" style="--x:${Math.cos(angulo) * dist}px;--y:${Math.sin(angulo) * dist}px;--d:${i * 0.03}s"><circle cx="80" cy="80" r="${r.toFixed(1)}"/></g>`;
    }).join("");
    const anguloTexto = azar(0, Math.PI * 2), distTexto = azar(54, 66);
    const el = document.createElement("div");
    el.className = "pisada";
    el.style.left = `${e.clientX}px`;
    el.style.top = `${e.clientY}px`;
    el.innerHTML = `<svg viewBox="0 0 160 160" aria-hidden="true">
      ${puntos}
      <g class="pisada__huella" style="--r:${Math.round(azar(-30, 30))}deg"><g transform="translate(57 54) scale(0.46)">
        <path d="M50 50C38 50 26 62 24 74C22 84 30 90 38 88C43 87 46 85 50 85C54 85 57 87 62 88C70 90 78 84 76 74C74 62 62 50 50 50Z"/>
        <ellipse cx="24" cy="45" rx="8" ry="10.5" transform="rotate(-25 24 45)"/><ellipse cx="39.5" cy="27" rx="8.5" ry="11" transform="rotate(-8 39.5 27)"/>
        <ellipse cx="60.5" cy="27" rx="8.5" ry="11" transform="rotate(8 60.5 27)"/><ellipse cx="76" cy="45" rx="8" ry="10.5" transform="rotate(25 76 45)"/>
      </g></g>
      <g class="pisada__texto" style="--x:${(Math.cos(anguloTexto) * distTexto - 26).toFixed(1)}px;--y:${(Math.sin(anguloTexto) * distTexto - 16).toFixed(1)}px;--r:${Math.round(azar(-35, 35))}deg">
        <g transform="translate(80 80)">${PAW.map((d) => `<path d="${d}"/>`).join("")}</g>
      </g>
    </svg>`;
    document.body.append(el);
    setTimeout(() => { el.classList.add("sale"); el.addEventListener("animationend", () => el.remove(), { once: true }); }, 950);
  });
}

// Selector de plataforma en cápsula que se despliega
document.querySelectorAll("[data-plat-toggle]").forEach((caja) => {
  const boton = caja.querySelector(".plat-toggle__boton");
  const cerrar = () => { caja.classList.remove("abierto"); boton.setAttribute("aria-expanded", "false"); };
  const pintar = () => {
    const r = caja.querySelector("input:checked");
    if (!r) return;
    caja.querySelector("[data-plat-nombre]").textContent = r.value;
    caja.querySelector("[data-plat-icono]").className = "ph-bold ph-" + r.dataset.icono;
    caja.classList.toggle("es-vet", r.value.includes("Vet"));
  };
  boton.addEventListener("click", () => { const a = !caja.classList.contains("abierto"); caja.classList.toggle("abierto", a); boton.setAttribute("aria-expanded", String(a)); });
  caja.addEventListener("change", () => { pintar(); cerrar(); });
  document.addEventListener("click", (e) => { if (!caja.contains(e.target)) cerrar(); });
  caja.addEventListener("keydown", (e) => { if (e.key === "Escape" && caja.classList.contains("abierto")) { e.stopPropagation(); e.preventDefault(); cerrar(); boton.focus(); } });
  pintar();
});

// App de escritorio: el botón principal descarga la versión del sistema de quien visita
(() => {
  const auto = $("[data-descarga-auto]");
  if (!auto) return;
  const ua = navigator.userAgent, p = navigator.userAgentData?.platform || navigator.platform || "";
  const so = /android|iphone|ipad|ipod/i.test(ua) ? "" : /mac/i.test(p) || /Mac OS X/.test(ua) ? "mac" : /win/i.test(p + ua) ? "windows" : /linux|x11|cros/i.test(p + ua) ? "linux" : "";
  const tarjeta = so && $(`.descarga[data-so="${so}"]`);
  if (!tarjeta) { auto.href = "#descargas"; $("[data-descarga-texto]", auto).textContent = t("Ver descargas"); return; }
  tarjeta.classList.add("sugerida");
  auto.href = $("a", tarjeta).href;
  $("[data-descarga-texto]", auto).textContent = t("Descargar para {so}", { so: { mac: "macOS", windows: "Windows", linux: "Linux" }[so] });
})();
