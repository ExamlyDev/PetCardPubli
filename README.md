# PetCardPubli · Página de PetCard

Página publicitaria de **PetCard · Todo lo de tu mascota, en una sola app**, la app para iOS y Android con Amelie, nuestra salchicha.
Es un sitio estático (HTML, CSS y JS, sin compilar) con el diseño de la guía de PetCard: Space Grotesk, naranja #FF8A3D, crema, tarjetas redondeadas y animaciones con curvas de resorte.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | Portada, Amelie, funciones, pantallas de la app, cómo funciona y descarga |
| `css/estilos.css` | Estilos, curvas de animación y diseño responsive |
| `js/app.js` | Menú, navegación, animaciones al desplazar y buscador animado |
| `img/amelie.svg` | Amelie completa en vector |
| `img/og-petcard.jpg` | Imagen para compartir en redes (1200 × 630) |
| `favicon.svg`, `favicon-32.png`, `icono-192.png`, `icono-512.png` | Favicon sin fondo |
| `apple-touch-icon.png`, `icono-maskable-512.png` | Ícono con fondo naranja para iPhone y Android |
| `manifest.webmanifest`, `404.html`, `_headers`, `robots.txt`, `sitemap.xml` | Extras para Cloudflare Pages |

## Ajustes rápidos

- **Botones de App Store y Google Play**: hoy dicen «Muy pronto en» y apuntan a `#descargar`. Cuando la app esté publicada, cambia el `href` por el enlace de cada tienda en `index.html` y quita «Muy pronto en».
- **Textos y pantallas de ejemplo**: Max, Luna, Kiwi, Clínica Patitas y los precios son ejemplos.

## Probar en tu compu

```bash
cd ~/Desktop/PetCardPubli && python3 -m http.server 8080
```
y abre `http://localhost:8080`.

## Subir a GitHub

```bash
cd ~/Desktop/PetCardPubli && bash subir.sh
```
Crea el repositorio `ExamlyDev/PetCardPubli` si no existe (con GitHub CLI) y sube todo a la rama `main`.
