import { useCallback, useEffect, useState } from 'react';
import { Button, Linking, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import { cargarModelo } from '../servicios/Clasificador';
import { INDICACION_CAPTURA, MENSAJE_CAMARA_DENEGADA } from '../datos/textos';

type Props = NativeStackScreenProps<RootStackParamList, 'Inicio'>;

type EstadoModelo = 'cargando' | 'listo' | 'error';

export default function InicioScreen({ navigation }: Props) {
  const [modelo, setModelo] = useState<EstadoModelo>('cargando');
  const [errorModelo, setErrorModelo] = useState<string | null>(null);
  const [errorSeleccion, setErrorSeleccion] = useState<string | null>(null);
  const [permisoCamara, pedirPermisoCamara] = ImagePicker.useCameraPermissions();
    const camaraBloqueada = permisoCamara?.status === 'denied' && !permisoCamara.canAskAgain;

    function irAResultado(uri: string) {
        navigation.navigate('Resultado', { uri });
    }
  const cargar = useCallback(() => {
    setModelo('cargando');
    setErrorModelo(null);
    cargarModelo()
      .then(() => setModelo('listo'))
      .catch((e) => {
        setModelo('error');
        setErrorModelo(e instanceof Error ? e.message : String(e));
      });
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function tomarFoto() {
  try {
    setErrorSeleccion(null);
    if (camaraBloqueada) return;
    if (!permisoCamara?.granted) {
      const respuesta = await pedirPermisoCamara();
      if (!respuesta.granted) return;
    }
    const r = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (r.canceled) return;
    irAResultado(r.assets[0].uri);
  } catch (e) {
    setErrorSeleccion(e instanceof Error ? e.message : String(e));
  }
    }

  async function elegirDeGaleria() {
    try {
      setErrorSeleccion(null);
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (r.canceled) return;
      irAResultado(r.assets[0].uri);
    } catch (e) {
      setErrorSeleccion(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>{INDICACION_CAPTURA}</Text>

      {modelo === 'cargando' && <Text>Cargando modelo...</Text>}
      {modelo === 'error' && (
        <>
          <Text style={styles.texto}>No se pudo cargar el modelo: {errorModelo}</Text>
          <Button title="Reintentar" onPress={cargar} />
        </>
      )}
        <Button
            title="Tomar foto"
            onPress={tomarFoto}
            disabled={modelo !== 'listo' || permisoCamara === null} />
            {camaraBloqueada && (
            <>
                <Text style={styles.texto}>{MENSAJE_CAMARA_DENEGADA}</Text>
                <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
            </>
            )}
      <Button title="Elegir de galería" onPress={elegirDeGaleria} disabled={modelo !== 'listo'} />
      {errorSeleccion && <Text style={styles.texto}>Error: {errorSeleccion}</Text>}

      <Button title="Ver historial" onPress={() => navigation.navigate('Historial')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 },
  texto: { textAlign: 'center' },
});