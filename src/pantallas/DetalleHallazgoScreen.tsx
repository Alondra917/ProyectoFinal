import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import type { Hallazgo } from '../tipos/hallazgo';
import { obtenerHallazgo } from '../servicios/Historial';
import { obtenerFicha } from '../servicios/Fichas';
import { esIdentificado, fechaLegible, tituloHallazgo } from '../servicios/Presentacion';
import AvisoOrientativo from '../componentes/AvisoOrientativo';
import FichaCurada from '../componentes/FichaCurada';
import ImagenHallazgo from '../componentes/ImagenHallazgo';
import {
  MENSAJE_ERROR_HISTORIAL,
  MENSAJE_FICHA_NO_DISPONIBLE,
  MENSAJE_HALLAZGO_NO_ENCONTRADO,
  MENSAJE_UBICACION_NO_REGISTRADA,
  PRECAUCION_GENERAL,
} from '../datos/textos';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalleHallazgo'>;

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error' }
  | { tipo: 'noEncontrado' }
  | { tipo: 'listo'; hallazgo: Hallazgo };

export default function DetalleHallazgoScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  const cargar = useCallback(() => {
    setEstado({ tipo: 'cargando' });
    obtenerHallazgo(id)
      .then((hallazgo) =>
        setEstado(hallazgo ? { tipo: 'listo', hallazgo } : { tipo: 'noEncontrado' }),
      )
      .catch((e) => {
        console.error('Error al leer el hallazgo:', e);
        setEstado({ tipo: 'error' });
      });
  }, [id]);

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

  if (estado.tipo === 'noEncontrado') {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>{MENSAJE_HALLAZGO_NO_ENCONTRADO}</Text>
        <Button title="Volver al historial" onPress={() => navigation.popTo('Historial')} />
      </View>
    );
  }

  const h = estado.hallazgo;
  const identificado = esIdentificado(h);
  const ficha = identificado ? obtenerFicha(h.clase_predicha) : null;
  const ubicacion =
    h.latitud !== null && h.longitud !== null
      ? `Ubicación: ${h.latitud.toFixed(5)}, ${h.longitud.toFixed(5)}`
      : MENSAJE_UBICACION_NO_REGISTRADA;

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <ImagenHallazgo uri={h.foto} tamano={300} />
      <Text style={styles.titulo}>{tituloHallazgo(h)}</Text>
      <Text style={styles.meta}>{fechaLegible(h.fecha)}</Text>
      <Text style={styles.meta}>{ubicacion}</Text>

      {identificado ? (
        ficha ? (
          <FichaCurada ficha={ficha} />
        ) : (
          <Text style={styles.texto}>{MENSAJE_FICHA_NO_DISPONIBLE}</Text>
        )
      ) : (
        <Text style={styles.texto}>{PRECAUCION_GENERAL}</Text>
      )}
      <AvisoOrientativo />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 },
  contenido: { alignItems: 'center', gap: 12, padding: 20 },
  titulo: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  meta: { fontSize: 12, color: '#666' },
  texto: { textAlign: 'center' },
});