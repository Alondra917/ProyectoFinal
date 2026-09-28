import { loadTensorflowModel } from 'react-native-fast-tflite';

type Modelo = Awaited<ReturnType<typeof loadTensorflowModel>>;

// Mismo orden que class_names en Colab (alfabético).
export const CLASES = [
    'colilla',
    'plastico_film',
    'botella_plastico',
    'erizo_morado',
    'lobo_marino',
] as const;

export type Clase = (typeof CLASES)[number];

export const UMBRAL_CONFIANZA = 0.6; // provisional, se calibra con el modelo real

export type Resultado = {
  clase: Clase;
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
  const confianza = Math.max(...probabilidades);
  const clase = CLASES[probabilidades.indexOf(confianza)];

  return { clase, confianza, confiable: confianza >= UMBRAL_CONFIANZA, probabilidades };
}