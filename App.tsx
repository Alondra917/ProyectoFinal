//Como no pago lo de desarrollador cada 7 dias se me aduca la secion y ya no puedo acceder a la app, asi que cada semana
//conectar telefono y correr "conectar el iPhone y recompilar con npx expo run:ios --device"

import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { cargarModelo, clasificar, Resultado } from './src/Servicios/Clasificador';
import { imagenATensor } from './src/Servicios/ImagenATensor';

export default function App() {
  const [listo, setListo] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarModelo()
      .then(() => setListo(true))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  async function elegirFoto() {
    try {
      setError(null);
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
      if (r.canceled) return;
      const foto = r.assets[0].uri;
      setUri(foto);
      const entrada = await imagenATensor(foto);
      setResultado(clasificar(entrada));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Elegir foto" onPress={elegirFoto} disabled={!listo} />
      {uri && <Image source={{ uri }} style={styles.foto} />}
      {resultado && (
        <Text style={styles.texto}>
          {resultado.confiable
            ? `${resultado.clase} (${Math.round(resultado.confianza * 100)}%)`
            : `Confianza baja (${Math.round(resultado.confianza * 100)}%)`}
        </Text>
      )}
      {error && <Text style={styles.texto}>Error: {error}</Text>}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 16 },
  foto: { width: 224, height: 224 },
  texto: { textAlign: 'center', paddingHorizontal: 20 },
});