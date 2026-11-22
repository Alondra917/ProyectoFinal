import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import type { Hallazgo } from '../tipos/hallazgo';
import { obtenerHallazgos } from '../servicios/Historial';
import { esIdentificado } from '../servicios/Presentacion';
import BotonSecundario from '../componentes/BotonSecundario';
import FilaHallazgo from '../componentes/FilaHallazgo';
import FondoDegradado from '../componentes/FondoDegradado';
import TarjetaVidrio from '../componentes/TarjetaVidrio';
import { colores, espacios } from '../tema/tema';
import {
  FILTRO_IDENTIFICADOS,
  FILTRO_TODOS,
  MENSAJE_ERROR_HISTORIAL,
  MENSAJE_HISTORIAL_VACIO,
  MENSAJE_SIN_IDENTIFICADOS,
} from '../datos/textos';

type Props = NativeStackScreenProps<RootStackParamList, 'Historial'>;

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error' }
  | { tipo: 'listo'; hallazgos: Hallazgo[] };

type Filtro = 'todos' | 'identificados';

export default function HistorialScreen({ navigation }: Props) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [filtro, setFiltro] = useState<Filtro>('todos');

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

  const visibles = useMemo(() => {
    if (estado.tipo !== 'listo') return [];
    return filtro === 'identificados'
      ? estado.hallazgos.filter((h) => esIdentificado(h))
      : estado.hallazgos;
  }, [estado, filtro]);

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
        data={visibles}
        keyExtractor={(h) => String(h.id)}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={styles.filtros}>
            <Chip
              titulo={FILTRO_TODOS}
              activo={filtro === 'todos'}
              alPresionar={() => setFiltro('todos')}
            />
            <Chip
              titulo={FILTRO_IDENTIFICADOS}
              activo={filtro === 'identificados'}
              alPresionar={() => setFiltro('identificados')}
            />
          </View>
        }
        ListEmptyComponent={
          <TarjetaVidrio variante="vidrioSinBlur" style={styles.estado}>
            <Text style={styles.texto}>{MENSAJE_SIN_IDENTIFICADOS}</Text>
          </TarjetaVidrio>
        }
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

function Chip({
  titulo,
  activo,
  alPresionar,
}: {
  titulo: string;
  activo: boolean;
  alPresionar: () => void;
}) {
  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      style={[styles.chip, activo && styles.chipActivo]}
    >
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', padding: espacios.xl },
  estado: { gap: espacios.m, alignItems: 'center' },
  texto: { fontSize: 15, textAlign: 'center', color: colores.texto },
  lista: { gap: espacios.m, padding: espacios.l },
  filtros: { flexDirection: 'row', gap: espacios.s, marginBottom: espacios.s },
  chip: {
    paddingVertical: espacios.s,
    paddingHorizontal: espacios.m,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colores.textoSecundario,
  },
  chipActivo: { backgroundColor: 'rgba(255,255,255,0.16)', borderColor: colores.texto },
  chipTexto: { fontSize: 14, color: colores.textoSecundario },
  chipTextoActivo: { color: colores.texto },
});