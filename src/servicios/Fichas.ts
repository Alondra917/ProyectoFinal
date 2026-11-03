import fichasJson from '../datos/fichas.json';
import clases from '../../assets/modelos/clases.json';
import type { Ficha } from '../tipos/ficha';

const fichas = fichasJson as Ficha[];

function validar(lista: Ficha[]) {
  const vistas = new Set<string>();
  for (const f of lista) {
    for (const campo of ['clase', 'nombre_visible', 'descripcion', 'precaucion', 'fuente'] as const) {
      if (!f[campo] || f[campo].trim() === '') {
        console.error(`Ficha "${f.clase}": el campo ${campo} está vacío`);
      }
    }
    if (vistas.has(f.clase)) console.error(`Ficha duplicada: ${f.clase}`);
    vistas.add(f.clase);
  }
  for (const clase of clases as string[]) {
    if (clase !== 'otro' && !vistas.has(clase)) {
      console.error(`Falta la ficha de la clase "${clase}"`);
    }
  }
}

if (__DEV__) validar(fichas);

export function obtenerFicha(clase: string): Ficha | null {
  return fichas.find((f) => f.clase === clase) ?? null;
}