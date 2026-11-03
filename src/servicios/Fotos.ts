import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const LADO_MAXIMO = 1024;
const CALIDAD_JPEG = 0.7;

function carpetaFotos(): Directory {
  const carpeta = new Directory(Paths.document, 'fotos');
  if (!carpeta.exists) carpeta.create();
  return carpeta;
}

export function uriDeFoto(nombre: string): string {
  return new File(carpetaFotos(), nombre).uri;
}

export async function copiarFoto(uriOrigen: string): Promise<string> {
  const original = await ImageManipulator.manipulate(uriOrigen).renderAsync();
  let imagen = original;
  if (Math.max(original.width, original.height) > LADO_MAXIMO) {
    const tamano =
      original.width >= original.height ? { width: LADO_MAXIMO } : { height: LADO_MAXIMO };
    imagen = await ImageManipulator.manipulate(original).resize(tamano).renderAsync();
  }
  const guardada = await imagen.saveAsync({ compress: CALIDAD_JPEG, format: SaveFormat.JPEG });
  const nombre = `hallazgo-${Date.now()}.jpg`;
  new File(guardada.uri).move(new File(carpetaFotos(), nombre));
  return nombre;
}