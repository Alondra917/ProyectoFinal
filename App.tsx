//Como no pago lo de desarrollador cada 7 dias se me aduca la secion y ya no puedo acceder a la app, asi que cada semana
//conectar telefono y correr "conectar el iPhone y recompilar con npx expo run:ios --device"

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { cargarModelo, clasificar } from './src/Servicios/Clasificador';

export default function App() {
  const [status, setStatus] = useState('Cargando modelo...');

  useEffect(() => {
    async function probar() {
      try {
        await cargarModelo();
        const entradaGris = new Float32Array(224 * 224 * 3).fill(0.5);
        const r = clasificar(entradaGris);
        const pct = Math.round(r.confianza * 100);
        setStatus(r.confiable ? `${r.clase} (${pct}%)` : `Confianza baja (${pct}%)`);
      } catch (e) {
        const mensaje = e instanceof Error ? e.message : String(e);
        setStatus('Error: ' + mensaje);
      }
  }
  probar();
}, []);

  return (
    <View style={styles.container}>
      <Text style={{ textAlign: 'center', paddingHorizontal: 20 }}>{status}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

});