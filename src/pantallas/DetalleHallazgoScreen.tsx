import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import type { Hallazgo } from '../tipos/hallazgo';
import { obtenerHallazgo } from '../servicios/Historial';
import { obtenerFicha } from '../servicios/Fichas';
import { esIdentificado, fechaLegible, tituloHallazgo } from '../servicios/Presentacion';
import AvisoOrientativo from '../componentes/AvisoOrientativo';
import BotonSecundario from '../componentes/BotonSecundario';
import FichaCurada from '../componentes/FichaCurada';
import FondoDegradado from '../componentes/FondoDegradado';
import ImagenHallazgo from '../componentes/ImagenHallazgo';
import TarjetaVidrio from '../componentes/TarjetaVidrio';
import { colores, espacios, fuentes } from '../tema/tema';
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

  if (estado.tipo === 'noEncontrado') {
    return (
      <FondoDegradado>
        <View style={styles.centro}>
          <TarjetaVidrio variante="solida" style={styles.estado}>
            <Text style={styles.texto}>{MENSAJE_HALLAZGO_NO_ENCONTRADO}</Text>
            <BotonSecundario
              titulo="Volver al historial"
              onPress={() => navigation.popTo('Historial')}
            />
          </TarjetaVidrio>
        </View>
      </FondoDegradado>
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
    <FondoDegradado>
      <ScrollView contentContainerStyle={styles.contenido}>
        <ImagenHallazgo uri={h.foto} tamano={300} />
        <Text style={styles.titulo}>{tituloHallazgo(h)}</Text>
        <Text style={styles.meta}>{fechaLegible(h.fecha)}</Text>
        <Text style={styles.meta}>{ubicacion}</Text>

        {identificado ? (
          ficha ? (
            <FichaCurada ficha={ficha} />
          ) : (
            <TarjetaVidrio variante="solida" style={styles.estado}>
              <Text style={styles.texto}>{MENSAJE_FICHA_NO_DISPONIBLE}</Text>
            </TarjetaVidrio>
          )
        ) : (
          <TarjetaVidrio variante="solida" style={styles.precaucion}>
            <Text style={styles.texto}>{PRECAUCION_GENERAL}</Text>
          </TarjetaVidrio>
        )}
        <AvisoOrientativo />
      </ScrollView>
    </FondoDegradado>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', padding: espacios.xl },
  contenido: { alignItems: 'center', gap: espacios.m, padding: espacios.xl },
  estado: { gap: espacios.m, alignItems: 'center', alignSelf: 'stretch' },
  titulo: {
    fontFamily: fuentes.titulo,
    fontSize: 30,
    textAlign: 'center',
    color: colores.texto,
  },
  meta: { fontSize: 12, color: colores.textoSecundario },
  texto: { fontSize: 15, textAlign: 'center', color: colores.texto },
  precaucion: { alignSelf: 'stretch', backgroundColor: colores.precaucionFondo },
});