import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Image, ScrollView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import { clasificar } from '../servicios/Clasificador';
import type { Resultado } from '../servicios/Clasificador';
import { imagenATensor } from '../servicios/ImagenATensor';
import { obtenerFicha } from '../servicios/Fichas';
import AvisoOrientativo from '../componentes/AvisoOrientativo';
import FichaCurada from '../componentes/FichaCurada';
import {
  MENSAJE_FICHA_NO_DISPONIBLE,
  MENSAJE_NO_IDENTIFICADO,
  PRECAUCION_GENERAL,
} from '../datos/textos';

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

  const resultado = estado.tipo === 'listo' ? estado.resultado : null;
  const identificado =
    resultado !== null && resultado.confiable && resultado.clase !== 'otro';
  const ficha = identificado && resultado ? obtenerFicha(resultado.clase) : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri }} style={styles.foto} />

      {estado.tipo === 'clasificando' && (
        <>
          <ActivityIndicator />
          <Text>Clasificando...</Text>
        </>
      )}

      {resultado && identificado && (
        <>
          <Text style={styles.texto}>
            {ficha ? ficha.nombre_visible : resultado.clase} (
            {Math.round(resultado.confianza * 100)}%)
          </Text>
          {ficha ? (
            <FichaCurada ficha={ficha} />
          ) : (
            <Text style={styles.texto}>{MENSAJE_FICHA_NO_DISPONIBLE}</Text>
          )}
          <AvisoOrientativo />
        </>
      )}

      {resultado && !identificado && (
        <>
          <Text style={styles.texto}>{MENSAJE_NO_IDENTIFICADO}</Text>
          <Text style={styles.texto}>{PRECAUCION_GENERAL}</Text>
          <AvisoOrientativo />
        </>
      )}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 },
  foto: { width: 224, height: 224 },
  texto: { textAlign: 'center' },
});