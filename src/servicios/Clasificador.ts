import { loadTensorflowModel } from 'react-native-fast-tflite';
import clases from '../../assets/modelos/clases.json';

type Modelo = Awaited<ReturnType<typeof loadTensorflowModel>>;

export const UMBRAL_CONFIANZA = 0.6; // provisional, se calibra con el modelo real

export type Resultado = {
  clase: string;
  confianza: number;
  confiable: boolean;
  probabilidades: number[];
};

let modelo: Modelo | null = null;

export async function cargarModelo(): Promise<void> {
  if (modelo) return;
  modelo = await loadTensorflowModel(
    require('../../assets/modelos/modelo_prueba.tflite'),
    []
  );
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