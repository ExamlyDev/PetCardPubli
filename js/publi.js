// PetCard · página publicitaria: menú, apariciones al bajar, acordeones, pestañas y franja
(() => {
  window.__petcardListo = true;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Barra de navegación más sólida al bajar
  const nav = $(".nav");
  const alBajar = () => nav?.classList.toggle("solida", scrollY > 24);
  addEventListener("scroll", alBajar, { passive: true });
  alBajar();

  // Menú del celular
  const boton = $(".nav__menu");
  const menu = $(".menu-movil");
  const usar = (abrir) => {
    if (!menu || !boton) return;
    menu.hidden = !abrir;
    boton.setAttribute("aria-expanded", String(abrir));
    boton.querySelector("use")?.setAttribute("href", abrir ? "#i-x" : "#i-menu");
  };
  boton?.addEventListener("click", () => usar(menu.hidden));
  $$("a", menu || document.createElement("div")).forEach((a) => a.addEventListener("click", () => usar(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") usar(false); });

  // Aparecer al bajar (tarjetas, chat de Ceiba)
  const vistos = $$("[data-aparece], .chat");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });
    vistos.forEach((el) => io.observe(el));
  } else {
    vistos.forEach((el) => el.classList.add("visible"));
  }

  // Barras de color: una abierta a la vez
  $$(".barra").forEach((barra) => {
    const b = $("button", barra);
    b?.addEventListener("click", () => {
      const abrir = !barra.classList.contains("abierta");
      $$(".barra").forEach((x) => { x.classList.remove("abierta"); $("button", x)?.setAttribute("aria-expanded", "false"); });
      if (abrir) { barra.classList.add("abierta"); b.setAttribute("aria-expanded", "true"); }
    });
  });

  // Pestañas de preguntas con indicador que se desliza
  const lista = $(".pestanas");
  if (lista) {
    const pestanas = $$(".pestana", lista);
    const indicador = $(".pestanas__indicador", lista);
    const mover = (p) => {
      if (!indicador) return;
      indicador.style.height = `${p.offsetHeight}px`;
      indicador.style.transform = `translateY(${p.offsetTop}px)`;
    };
    const elegir = (p, foco) => {
      pestanas.forEach((x) => {
        const si = x === p;
        x.setAttribute("aria-selected", String(si));
        x.tabIndex = si ? 0 : -1;
        const panel = document.getElementById(x.getAttribute("aria-controls"));
        if (panel) panel.hidden = !si;
      });
      mover(p);
      if (foco) p.focus();
    };
    pestanas.forEach((p, i) => {
      p.addEventListener("click", () => elegir(p));
      p.addEventListener("keydown", (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); elegir(pestanas[(i + d + pestanas.length) % pestanas.length], true); }
      });
    });
    const actual = pestanas.find((p) => p.getAttribute("aria-selected") === "true") || pestanas[0];
    requestAnimationFrame(() => mover(actual));
    addEventListener("resize", () => mover(pestanas.find((p) => p.getAttribute("aria-selected") === "true") || actual));
  }

  // Preguntas: una abierta por panel
  $$(".panel-faq").forEach((panel) => {
    $$("details", panel).forEach((d) => d.addEventListener("toggle", () => {
      if (d.open) $$("details", panel).forEach((o) => { if (o !== d) o.open = false; });
    }));
  });

  // Franja: se duplica el contenido para que el desplazamiento no tenga cortes
  $$(".franja__fila").forEach((fila) => {
    [...fila.children].forEach((n) => { const c = n.cloneNode(true); c.setAttribute("aria-hidden", "true"); fila.appendChild(c); });
  });

  // Año del pie
  $$("[data-anio]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
