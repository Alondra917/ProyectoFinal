import { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import { cargarModelo } from '../servicios/Clasificador';
import { INDICACION_CAPTURA } from '../datos/textos';

type Props = NativeStackScreenProps<RootStackParamList, 'Inicio'>;

type EstadoModelo = 'cargando' | 'listo' | 'error';

export default function InicioScreen({ navigation }: Props) {
  const [modelo, setModelo] = useState<EstadoModelo>('cargando');
  const [errorModelo, setErrorModelo] = useState<string | null>(null);
  const [errorSeleccion, setErrorSeleccion] = useState<string | null>(null);

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

  async function elegirDeGaleria() {
    try {
      setErrorSeleccion(null);
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (r.canceled) return;
      navigation.navigate('Resultado', { uri: r.assets[0].uri });
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