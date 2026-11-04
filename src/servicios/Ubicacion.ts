import * as Location from 'expo-location';

const TIEMPO_MAXIMO_MS = 5000;

export type Coordenadas = { latitud: number; longitud: number };

async function permisoConcedido(): Promise<boolean> {
  const actual = await Location.getForegroundPermissionsAsync();
  if (actual.granted) return true;
  if (actual.status !== Location.PermissionStatus.UNDETERMINED) return false;
  const respuesta = await Location.requestForegroundPermissionsAsync();
  return respuesta.granted;
}

export async function obtenerUbicacion(): Promise<Coordenadas | null> {
  try {
    if (!(await permisoConcedido())) return null;
    const espera = new Promise<null>((resolver) =>
      setTimeout(() => resolver(null), TIEMPO_MAXIMO_MS),
    );
    const posicion = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      espera,
    ]);
    if (!posicion) return null;
    return { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude };
  } catch {
    return null;
  }
}