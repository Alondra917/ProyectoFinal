import { File } from 'expo-file-system';
import { obtenerBaseDatos } from './BaseDatos';
import { copiarFoto, uriDeFoto } from './Fotos';
import { obtenerUbicacion } from './Ubicacion';
import type { Resultado } from './Clasificador';

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