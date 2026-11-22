import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import type { Hallazgo } from '../tipos/hallazgo';
import { obtenerHallazgos } from '../servicios/Historial';
import BotonSecundario from '../componentes/BotonSecundario';
import FilaHallazgo from '../componentes/FilaHallazgo';
import FondoDegradado from '../componentes/FondoDegradado';
import TarjetaVidrio from '../componentes/TarjetaVidrio';
import { colores, espacios } from '../tema/tema';
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
      <FondoDegradado>
        <View style={styles.centro}>
          <ActivityIndicator color={colores.texto} />
        </View>
      </FondoDegradado>
    );
  }

  if (estado.tipo === 'error') {
    return (
      <FondoDegradado>
        <View style={styles.centro}>
          <TarjetaVidrio variante="solida" style={styles.estado}>
            <Text style={styles.texto}>{MENSAJE_ERROR_HISTORIAL}</Text>
            <BotonSecundario titulo="Reintentar" onPress={cargar} />
          </TarjetaVidrio>
        </View>
      </FondoDegradado>
    );
  }

  if (estado.hallazgos.length === 0) {
    return (
      <FondoDegradado>
        <View style={styles.centro}>
          <TarjetaVidrio variante="vidrioSinBlur" style={styles.estado}>
            <Text style={styles.texto}>{MENSAJE_HISTORIAL_VACIO}</Text>
          </TarjetaVidrio>
        </View>
      </FondoDegradado>
    );
  }

  return (
    <FondoDegradado>
      <FlatList
        data={estado.hallazgos}
        keyExtractor={(h) => String(h.id)}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <FilaHallazgo
            hallazgo={item}
            alPresionar={() => navigation.navigate('DetalleHallazgo', { id: item.id })}
          />
        )}
      />
    </FondoDegradado>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', padding: espacios.xl },
  estado: { gap: espacios.m, alignItems: 'center' },
  texto: { fontSize: 15, textAlign: 'center', color: colores.texto },
  lista: { gap: espacios.m, padding: espacios.l },
});