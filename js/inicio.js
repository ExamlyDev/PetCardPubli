// PetCard · inicio: menú, barra al bajar, apariciones y tarjetas apiladas
(() => {
  window.__petcardListo = true;
  const nav = document.querySelector(".nav");
  const alBajar = () => nav.classList.toggle("solida", scrollY > 12);
  addEventListener("scroll", alBajar, { passive: true }); alBajar();

  const boton = document.querySelector(".nav__menu"), menu = document.getElementById("menu-movil");
  boton?.addEventListener("click", () => {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", String(!abierto)); menu.hidden = abierto;
  });
  menu?.addEventListener("click", e => { if (e.target.closest("a")) { menu.hidden = true; boton.setAttribute("aria-expanded", "false"); } });

  // Al terminar la aparición se quitan blur y recorte para no afectar el rendimiento
  const asentar = el => setTimeout(() => el.classList.add("asentado"), 1300 + (parseFloat(getComputedStyle(el).getPropertyValue("--i")) || 0) * 70);
  const vistos = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visto"); asentar(e.target); vistos.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-aparece]").forEach(el => vistos.observe(el));

  // Cápsula que sigue al cursor en el menú
  const enlaces = document.querySelector(".nav__links");
  if (enlaces) {
    const pildora = Object.assign(document.createElement("span"), { className: "nav__pildora" });
    pildora.setAttribute("aria-hidden", "true"); enlaces.prepend(pildora);
    const ir = a => { if (!a) return pildora.classList.remove("activa"); pildora.style.setProperty("--x", `${a.offsetLeft}px`); pildora.style.width = `${a.offsetWidth}px`; pildora.classList.add("activa"); };
    const actual = () => enlaces.querySelector("[aria-current]");
    enlaces.querySelectorAll("a").forEach(a => { a.addEventListener("pointerenter", () => ir(a)); a.addEventListener("focus", () => ir(a)); });
    enlaces.addEventListener("pointerleave", () => ir(actual()));
    requestAnimationFrame(() => { pildora.style.transition = "none"; ir(actual()); requestAnimationFrame(() => pildora.style.transition = ""); });
    addEventListener("resize", () => ir(actual()));
  }

  // El relleno de los botones nace donde entra el cursor
  document.querySelectorAll(".boton, .tienda").forEach(b => b.addEventListener("pointerenter", e => {
    const r = b.getBoundingClientRect();
    b.style.setProperty("--mx", `${e.clientX - r.left}px`); b.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));

  document.querySelectorAll("[data-anio]").forEach(el => el.textContent = new Date().getFullYear());

  // La carta de enfrente pasa al fondo con resorte
  const pila = document.querySelector("[data-pila]");
  if (pila) {
    const cartas = [...pila.querySelectorAll(".pila__carta")], pasos = [...pila.querySelectorAll(".pila__pasos span")];
    let paso = 0, reloj;
    const girar = () => {
      cartas.forEach(c => c.dataset.pos = (Number(c.dataset.pos) + cartas.length - 1) % cartas.length);
      paso = (paso + 1) % cartas.length;
      pasos.forEach((p, i) => p.classList.toggle("activo", i === paso));
    };
    const programar = () => { clearInterval(reloj); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) reloj = setInterval(girar, 3800); };
    pila.addEventListener("click", () => { girar(); programar(); });
    pila.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); girar(); programar(); } });
    programar();
  }

  // Pestañas de preguntas con indicador que se desliza
  const lista = document.querySelector(".pestanas");
  if (lista) {
    const pestanas = [...lista.querySelectorAll(".pestana")], indicador = lista.querySelector(".pestanas__indicador");
    const mover = p => { if (indicador) { indicador.style.height = `${p.offsetHeight}px`; indicador.style.transform = `translateY(${p.offsetTop}px)`; } };
    const elegir = (p, foco) => {
      pestanas.forEach(x => {
        const si = x === p;
        x.setAttribute("aria-selected", String(si)); x.tabIndex = si ? 0 : -1;
        const panel = document.getElementById(x.getAttribute("aria-controls")); if (panel) panel.hidden = !si;
      });
      mover(p); if (foco) p.focus();
    };
    pestanas.forEach((p, i) => {
      p.addEventListener("click", () => elegir(p));
      p.addEventListener("keydown", e => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); elegir(pestanas[(i + d + pestanas.length) % pestanas.length], true); } });
    });
    const actual = () => pestanas.find(p => p.getAttribute("aria-selected") === "true") || pestanas[0];
    requestAnimationFrame(() => mover(actual())); addEventListener("resize", () => mover(actual()));
  }

  // Preguntas: una abierta por panel
  document.querySelectorAll(".panel-faq").forEach(panel => panel.querySelectorAll("details").forEach(d => d.addEventListener("toggle", () => {
    if (d.open) panel.querySelectorAll("details").forEach(o => { if (o !== d) o.open = false; });
  })));

  // Contacto: valida y abre el correo con el mensaje listo
  const forma = document.querySelector("[data-contacto]");
  if (forma) {
    const aviso = forma.querySelector(".formulario__aviso");
    const avisar = (t, mal) => { aviso.hidden = false; aviso.textContent = t; aviso.classList.toggle("mal", !!mal); };
    forma.addEventListener("submit", e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(forma)), malos = [];
      if (!String(d.nombre || "").trim()) malos.push("nombre");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.correo || "").trim())) malos.push("correo");
      if (!String(d.mensaje || "").trim()) malos.push("mensaje");
      forma.querySelectorAll(".campo").forEach(c => c.classList.toggle("error", malos.includes(c.querySelector("input, textarea")?.name)));
      if (malos.length) { avisar(malos.includes("correo") && malos.length === 1 ? "Ese correo no parece válido. Revisa que tenga @ y dominio" : "Revisa los campos marcados para continuar", true); forma.querySelector(`[name="${malos[0]}"]`)?.focus(); return; }
      const asunto = `${d.perfil === "Veterinaria" ? "PetCard Vet" : "PetCard"} · Mensaje de ${d.nombre.trim()}`;
      const cuerpo = `${d.mensaje.trim()}\n\n${d.nombre.trim()}\n${d.correo.trim()}\n${d.perfil}`;
      location.href = `mailto:contacto@zootrack.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
      avisar(`Gracias, ${d.nombre.trim().split(" ")[0]}. Abrimos tu correo con el mensaje listo, solo envíalo.`);
    });
    forma.querySelectorAll("input, textarea").forEach(el => el.addEventListener("input", () => el.closest(".campo")?.classList.remove("error")));
  }
})();
