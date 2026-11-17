// PetCard por ahora solo en español: mismas funciones que el selector de idioma de ZooTrack
export const t = (texto, valores = {}) => texto.replace(/\{(\w+)\}/g, (_, k) => valores[k] ?? "");
export function traducirDocumento() { document.documentElement.lang = "es"; }
export function iniciarSelector() {}
