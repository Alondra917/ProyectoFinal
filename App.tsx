import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { loadTensorflowModel } from 'react-native-fast-tflite';

export default function App() {
  const [status, setStatus] = useState('Cargando modelo...');

  useEffect(() => {
    async function load() {
      try {
        const model = await loadTensorflowModel(require('./assets/modelos/modelo_prueba.tflite'), []);
        setStatus('Modelo cargado ✅ — probando inferencia...');

        // Datos de prueba: imagen "gris" de 224x224x3
        const dummyInput = new Float32Array(1 * 224 * 224 * 3).fill(0.5);
        const output = model.runSync([dummyInput.buffer]);

        const outputArray = new Float32Array(output[0]);
        console.log('Output:', Array.from(outputArray));

        setStatus('Inferencia OK ✅ — revisa la consola (Metro) para ver el output');
      } catch (e) {
        console.log('Error:', e);
        setStatus('Error: ' + e.message);
      }
    }
    load();
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