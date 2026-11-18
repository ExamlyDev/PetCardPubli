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

  const vistos = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visto"); vistos.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-aparece]").forEach(el => vistos.observe(el));

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
})();
