import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import { clasificar } from '../servicios/Clasificador';
import type { Resultado } from '../servicios/Clasificador';
import { imagenATensor } from '../servicios/ImagenATensor';
import { MENSAJE_NO_IDENTIFICADO, PRECAUCION_GENERAL } from '../datos/textos';

type Props = NativeStackScreenProps<RootStackParamList, 'Resultado'>;

type Estado =
  | { tipo: 'clasificando' }
  | { tipo: 'listo'; resultado: Resultado }
  | { tipo: 'error'; mensaje: string };

export default function ResultadoScreen({ navigation, route }: Props) {
  const { uri } = route.params;
  const [estado, setEstado] = useState<Estado>({ tipo: 'clasificando' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: 'clasificando' });
    (async () => {
      try {
        const entrada = await imagenATensor(uri);
        const resultado = clasificar(entrada);
        if (!cancelado) setEstado({ tipo: 'listo', resultado });
      } catch (e) {
        if (!cancelado) {
          setEstado({ tipo: 'error', mensaje: e instanceof Error ? e.message : String(e) });
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [uri, intento]);

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.foto} />

      {estado.tipo === 'clasificando' && (
        <>
          <ActivityIndicator />
          <Text>Clasificando...</Text>
        </>
      )}

      {estado.tipo === 'listo' &&
        (estado.resultado.confiable && estado.resultado.clase !== 'otro' ? (
          <Text style={styles.texto}>
            {estado.resultado.clase} ({Math.round(estado.resultado.confianza * 100)}%)
          </Text>
        ) : (
          <>
            <Text style={styles.texto}>{MENSAJE_NO_IDENTIFICADO}</Text>
            <Text style={styles.texto}>{PRECAUCION_GENERAL}</Text>
          </>
        ))}

      {estado.tipo === 'error' && (
        <>
          <Text style={styles.texto}>Error al clasificar: {estado.mensaje}</Text>
          <Button title="Reintentar" onPress={() => setIntento((i) => i + 1)} />
        </>
      )}

      <Button
        title="Guardar (prueba)"
        disabled={estado.tipo !== 'listo'}
        onPress={() => navigation.replace('Historial')}
      />
      <Button title="Nueva foto" onPress={() => navigation.popTo('Inicio')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 },
  foto: { width: 224, height: 224 },
  texto: { textAlign: 'center' },
});