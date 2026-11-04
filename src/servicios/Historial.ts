import { File } from 'expo-file-system';
import { obtenerBaseDatos } from './BaseDatos';
import { copiarFoto, uriDeFoto } from './Fotos';
import { obtenerUbicacion } from './Ubicacion';
import type { Resultado } from './Clasificador';
import type { Hallazgo } from '../tipos/hallazgo';

export async function guardarHallazgo(uri: string, resultado: Resultado): Promise<number> {
  const foto = await copiarFoto(uri);
  try {
    const ubicacion = await obtenerUbicacion();
    const db = await obtenerBaseDatos();
    const r = await db.runAsync(
      `INSERT INTO hallazgos
         (foto, clase_predicha, confianza, confiable, fecha, latitud, longitud)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        foto,
        resultado.clase,
        resultado.confianza,
        resultado.confiable ? 1 : 0,
        new Date().toISOString(),
        ubicacion?.latitud ?? null,
        ubicacion?.longitud ?? null,
      ],
    );
    return r.lastInsertRowId;
  } catch (e) {
    try {
      new File(uriDeFoto(foto)).delete();
    } catch {}
    throw e;
  }
}

type Fila = Omit<Hallazgo, 'confiable'> & { confiable: number };

function aHallazgo(f: Fila): Hallazgo {
  return { ...f, foto: uriDeFoto(f.foto), confiable: f.confiable === 1 };
}

export async function obtenerHallazgos(): Promise<Hallazgo[]> {
  const db = await obtenerBaseDatos();
  const filas = await db.getAllAsync<Fila>(
    'SELECT * FROM hallazgos ORDER BY fecha DESC, id DESC',
  );
  return filas.map(aHallazgo);
}

export async function obtenerHallazgo(id: number): Promise<Hallazgo | null> {
  const db = await obtenerBaseDatos();
  const fila = await db.getFirstAsync<Fila>('SELECT * FROM hallazgos WHERE id = ?', [id]);
  return fila ? aHallazgo(fila) : null;
}