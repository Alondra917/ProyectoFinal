import { loadTensorflowModel } from 'react-native-fast-tflite';
import clases from '../../assets/modelos/clases.json';

type Modelo = Awaited<ReturnType<typeof loadTensorflowModel>>;

// Calibrado con el conjunto de validación del modelo (ver F04).
export const UMBRAL_CONFIANZA = 0.7;

export type Resultado = {
  clase: string;
  confianza: number;
  confiable: boolean;
  probabilidades: number[];
};

let modelo: Modelo | null = null;

import { Asset } from 'expo-asset';

export async function cargarModelo(): Promise<void> {
  if (modelo) return;
  const modulo = require('../../assets/modelos/modelo.tflite');
  try {
    modelo = await loadTensorflowModel(modulo, []);
  } catch (e) {
    // Respaldo para Android en producción
    const asset = Asset.fromModule(modulo);
    try {
      await asset.downloadAsync();
      modelo = await loadTensorflowModel({ url: asset.localUri ?? asset.uri }, []);
    } catch (e2) {
      throw new Error(`${asset.localUri ?? asset.uri} -> ${String(e2)}`);
    }
  }
}

export function clasificar(entrada: Float32Array<ArrayBuffer>): Resultado {
  if (!modelo) throw new Error('El modelo no está cargado');

  const salida = modelo.runSync([entrada.buffer]);

  const probabilidades = Array.from(new Float32Array(salida[0]));
  if (probabilidades.length !== clases.length) {
    throw new Error(
      `El modelo devuelve ${probabilidades.length} clases y clases.json tiene ${clases.length}`
    );
  }
  const confianza = Math.max(...probabilidades);
  const clase = clases[probabilidades.indexOf(confianza)];

  return { clase, confianza, confiable: confianza >= UMBRAL_CONFIANZA, probabilidades };
}