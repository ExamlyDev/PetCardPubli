#!/bin/bash
# Crea (si hace falta) y sube PetCardPubli al repositorio ExamlyDev/PetCardPubli.
# Uso: bash subir.sh "Mensaje del cambio"
set -e
cd "$(dirname "$0")"
DUENO="ExamlyDev"
NOMBRE="PetCardPubli"
REPO="https://github.com/$DUENO/$NOMBRE.git"
MENSAJE="${1:-Página publicitaria de PetCard}"

if [ ! -f index.html ] || ! grep -q "PetCard | Todo lo de tu mascota" index.html || [ ! -f js/app.js ]; then
  echo "⛔ Esta no es la carpeta de PetCardPubli. No se subió nada."; exit 1
fi

# 1. Crear el repositorio en GitHub si todavía no existe
if ! git ls-remote "$REPO" >/dev/null 2>&1; then
  if command -v gh >/dev/null 2>&1; then
    gh auth status >/dev/null 2>&1 || gh auth login
    gh repo create "$DUENO/$NOMBRE" --public --description "Página publicitaria de PetCard · Todo lo de tu mascota, en una sola app" --homepage "https://petcard.cloud"
  else
    echo "⚠️  El repositorio $DUENO/$NOMBRE no existe y no tienes GitHub CLI."
    echo "   Instálalo con:  brew install gh   y vuelve a correr este script,"
    echo "   o créalo vacío en https://github.com/new (dueño $DUENO, nombre $NOMBRE)."
    exit 1
  fi
fi

# 2. Preparar git local
if [ ! -d .git ]; then
  git init -q -b main
  git remote add origin "$REPO"
fi
if [ -n "$(git rev-parse --show-prefix 2>/dev/null)" ] || ! git remote get-url origin | grep -q "$DUENO/$NOMBRE"; then
  echo "⛔ El remoto no es $DUENO/$NOMBRE. No se subió nada."; exit 1
fi

# 3. Guardar y subir
git add -A
git commit -q -m "$MENSAJE" || echo "Sin cambios nuevos que guardar"
if git ls-remote --exit-code --heads origin main >/dev/null 2>&1; then
  git pull -q --no-rebase --allow-unrelated-histories -X ours origin main -m "Combina con el repositorio" || true
fi
git push -u origin main
echo "✓ Listo: PetCardPubli está en github.com/$DUENO/$NOMBRE"
