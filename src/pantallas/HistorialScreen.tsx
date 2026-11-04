import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import type { Hallazgo } from '../tipos/hallazgo';
import { obtenerHallazgos } from '../servicios/Historial';
import FilaHallazgo from '../componentes/FilaHallazgo';
import { MENSAJE_ERROR_HISTORIAL, MENSAJE_HISTORIAL_VACIO } from '../datos/textos';

type Props = NativeStackScreenProps<RootStackParamList, 'Historial'>;

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error' }
  | { tipo: 'listo'; hallazgos: Hallazgo[] };

export default function HistorialScreen({ navigation }: Props) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  const cargar = useCallback(() => {
    setEstado({ tipo: 'cargando' });
    obtenerHallazgos()
      .then((hallazgos) => setEstado({ tipo: 'listo', hallazgos }))
      .catch((e) => {
        console.error('Error al leer el historial:', e);
        setEstado({ tipo: 'error' });
      });
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (estado.tipo === 'cargando') {
    return (
      <View style={styles.centro}>
        <ActivityIndicator />
      </View>
    );
  }

  if (estado.tipo === 'error') {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>{MENSAJE_ERROR_HISTORIAL}</Text>
        <Button title="Reintentar" onPress={cargar} />
      </View>
    );
  }

  if (estado.hallazgos.length === 0) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>{MENSAJE_HISTORIAL_VACIO}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={estado.hallazgos}
      keyExtractor={(h) => String(h.id)}
      renderItem={({ item }) => (
        <FilaHallazgo
          hallazgo={item}
          alPresionar={() => navigation.navigate('DetalleHallazgo', { id: item.id })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 },
  texto: { textAlign: 'center' },
});