// PetCard · landing: scroll nativo, apariciones suaves y teléfono que cambia de pantalla
(() => {
  const raiz = document.documentElement;
  window.__petcardListo = true;
  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Año del pie
  document.querySelectorAll("[data-anio]").forEach((n) => (n.textContent = new Date().getFullYear()));

  // Navegación sólida al bajar
  const nav = document.querySelector("[data-nav]");
  const alBajar = () => nav.classList.toggle("solida", scrollY > 12);
  addEventListener("scroll", alBajar, { passive: true });
  alBajar();

  // Menú móvil
  const boton = document.querySelector("[data-menu]");
  const panel = document.querySelector("[data-menu-panel]");
  const cerrarMenu = () => { panel.classList.remove("abierto"); boton.setAttribute("aria-expanded", "false"); };
  boton.addEventListener("click", () => {
    const abrir = !panel.classList.contains("abierto");
    panel.classList.toggle("abierto", abrir);
    boton.setAttribute("aria-expanded", String(abrir));
  });
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", cerrarMenu));

  // Apariciones
  const aparecer = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      aparecer.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  document.querySelectorAll(".aparecer").forEach((n) => aparecer.observe(n));

  // Portada: entra escalonada al cargar
  document.querySelectorAll(".portada .aparecer").forEach((n, i) => {
    n.style.setProperty("--retraso", `${0.08 * i}s`);
    requestAnimationFrame(() => n.classList.add("visible"));
  });

  // Funciones ↔ pantallas del teléfono
  const funciones = [...document.querySelectorAll(".funcion")];
  const pantallas = [...document.querySelectorAll(".pantalla")];
  let actual = 0;
  const mostrar = (i) => {
    if (i === actual) return;
    actual = i;
    funciones.forEach((f, k) => f.classList.toggle("activa", k === i));
    pantallas.forEach((p, k) => p.classList.toggle("activa", k === i));
  };
  const escritorio = matchMedia("(min-width: 961px)");
  let rotacion;
  const configurar = () => {
    clearInterval(rotacion);
    if (escritorio.matches) return;
    if (!sinMovimiento) rotacion = setInterval(() => mostrar((actual + 1) % pantallas.length), 2800);
  };
  const vigia = new IntersectionObserver((entradas) => {
    if (!escritorio.matches) return;
    entradas.forEach((e) => e.isIntersecting && mostrar(Number(e.target.dataset.paso)));
  }, { rootMargin: "-45% 0px -45% 0px" });
  funciones.forEach((f) => vigia.observe(f));
  escritorio.addEventListener("change", configurar);
  configurar();

  // Acordeón con altura animada
  document.querySelectorAll(".acordeon details").forEach((d) => {
    const resumen = d.querySelector("summary");
    const cuerpo = d.querySelector(".acordeon__cuerpo");
    let animacion;
    resumen.addEventListener("click", (ev) => {
      if (sinMovimiento || !cuerpo.animate) return;
      ev.preventDefault();
      animacion?.cancel();
      const abriendo = !d.open;
      if (abriendo) d.open = true;
      const alto = cuerpo.scrollHeight;
      animacion = cuerpo.animate(
        { height: abriendo ? ["0px", `${alto}px`] : [`${alto}px`, "0px"], opacity: abriendo ? [0, 1] : [1, 0] },
        { duration: abriendo ? 520 : 380, easing: "cubic-bezier(.22, 1, .36, 1)" }
      );
      animacion.onfinish = () => { if (!abriendo) d.open = false; };
    });
  });
})();
