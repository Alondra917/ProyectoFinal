import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { decode } from 'base64-arraybuffer';

export async function imagenATensor(uri: string): Promise<Float32Array<ArrayBuffer>> {
  const redimensionada = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 224, height: 224 } }],
    { format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  const { data } = jpeg.decode(new Uint8Array(decode(redimensionada.base64!)), {
    useTArray: true,
  }); // RGBA

  const entrada = new Float32Array(224 * 224 * 3);
  for (let i = 0, j = 0; i < data.length; i += 4) {
    entrada[j++] = data[i] / 127.5 - 1;     // R
    entrada[j++] = data[i + 1] / 127.5 - 1; // G
    entrada[j++] = data[i + 2] / 127.5 - 1; // B
  }
  return entrada;
}