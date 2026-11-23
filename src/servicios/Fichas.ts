import fichasJson from '../datos/fichas.json';
import clases from '../../assets/modelos/clases.json';
import type { Ficha } from '../tipos/ficha';

const fichas = fichasJson as Ficha[];

const NIVELES = ['seguro', 'precaucion', 'peligro'];

const vacio = (v: unknown) => typeof v !== 'string' || v.trim() === '';

function validar(lista: Ficha[]) {
  const vistas = new Set<string>();

  for (const f of lista) {
    for (const campo of ['clase', 'nombre_visible', 'descripcion'] as const) {
      if (vacio(f[campo])) console.error(`Ficha "${f.clase}": el campo ${campo} está vacío`);
    }

    if (!Array.isArray(f.precaucion) || f.precaucion.length === 0 || f.precaucion.some(vacio)) {
      console.error(`Ficha "${f.clase}": precaucion debe ser una lista de textos no vacíos`);
    }

    if (!NIVELES.includes(f.nivel_riesgo)) {
      console.error(`Ficha "${f.clase}": nivel_riesgo inválido (${f.nivel_riesgo})`);
    }

    // D4: la fuente es obligatoria
    if (!f.fuente || vacio(f.fuente.nombre)) {
      console.error(`Ficha "${f.clase}": falta fuente.nombre`);
    } else if (!f.fuente.url || !f.fuente.consultado) {
      // Solo aviso: recuerda verificar antes de entregar
      console.warn(`Ficha "${f.clase}": fuente sin verificar (falta url o fecha de consulta)`);
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