import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import { clasificar } from '../servicios/Clasificador';
import type { Resultado } from '../servicios/Clasificador';
import { imagenATensor } from '../servicios/ImagenATensor';
import { obtenerFicha } from '../servicios/Fichas';
import { guardarHallazgo } from '../servicios/Historial';
import AvisoOrientativo from '../componentes/AvisoOrientativo';
import BarraConfianza from '../componentes/BarraConfianza';
import BotonPrincipal from '../componentes/BotonPrincipal';
import BotonSecundario from '../componentes/BotonSecundario';
import FichaCurada from '../componentes/FichaCurada';
import FondoDegradado from '../componentes/FondoDegradado';
import TarjetaVidrio from '../componentes/TarjetaVidrio';
import { colores, espacios, fuentes } from '../tema/tema';
import {
  ETIQUETA_CONFIANZA,
  MENSAJE_ERROR_GUARDADO,
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
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const guardandoRef = useRef(false);

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

  async function guardar() {
    if (guardandoRef.current || !resultado) return;
    guardandoRef.current = true;
    setGuardando(true);
    setErrorGuardado(null);
    try {
      await guardarHallazgo(uri, resultado);
      navigation.replace('Historial');
    } catch (e) {
      console.error('Error al guardar:', e);
      setErrorGuardado(MENSAJE_ERROR_GUARDADO);
      guardandoRef.current = false;
      setGuardando(false);
    }
  }

  return (
    <FondoDegradado>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Image source={{ uri }} style={styles.foto} />

        {estado.tipo === 'clasificando' && (
          <TarjetaVidrio variante="vidrioSinBlur" style={styles.estado}>
            <ActivityIndicator color={colores.texto} />
            <Text style={styles.texto}>Clasificando...</Text>
          </TarjetaVidrio>
        )}

        {resultado && identificado && (
          <>
            <Text style={styles.titulo}>{ficha ? ficha.nombre_visible : resultado.clase}</Text>
            <Text style={styles.confianza}>
              {ETIQUETA_CONFIANZA}: {Math.round(resultado.confianza * 100)}%
            </Text>
            <BarraConfianza valor={resultado.confianza} />
            {ficha ? (
              <FichaCurada ficha={ficha} />
            ) : (
              <TarjetaVidrio variante="solida" style={styles.estado}>
                <Text style={styles.texto}>{MENSAJE_FICHA_NO_DISPONIBLE}</Text>
              </TarjetaVidrio>
            )}
            <AvisoOrientativo />
          </>
        )}

        {resultado && !identificado && (
          <>
            <Text style={styles.titulo}>{MENSAJE_NO_IDENTIFICADO}</Text>
            <TarjetaVidrio variante="solida" style={styles.precaucion}>
              <Text style={styles.texto}>{PRECAUCION_GENERAL}</Text>
            </TarjetaVidrio>
            <AvisoOrientativo />
          </>
        )}

        {estado.tipo === 'error' && (
          <TarjetaVidrio variante="solida" style={styles.estado}>
            <Text style={styles.texto}>Error al clasificar: {estado.mensaje}</Text>
            <BotonSecundario titulo="Reintentar" onPress={() => setIntento((i) => i + 1)} />
          </TarjetaVidrio>
        )}

        {errorGuardado && (
          <TarjetaVidrio variante="solida" style={styles.estado}>
            <Text style={styles.texto}>{errorGuardado}</Text>
          </TarjetaVidrio>
        )}

        <BotonPrincipal
          titulo={guardando ? 'Guardando...' : 'Guardar'}
          disabled={estado.tipo !== 'listo' || guardando}
          onPress={guardar}
        />
        <BotonSecundario titulo="Nueva foto" onPress={() => navigation.popTo('Inicio')} />
      </ScrollView>
    </FondoDegradado>
  );
}

const styles = StyleSheet.create({
  contenido: { flexGrow: 1, alignItems: 'center', gap: espacios.l, padding: espacios.xl },
  foto: { width: 224, height: 224, borderRadius: 24 },
  titulo: {
    fontFamily: fuentes.titulo,
    fontSize: 30,
    textAlign: 'center',
    color: colores.texto,
  },
  confianza: { fontSize: 14, color: colores.textoSecundario },
  texto: { fontSize: 15, textAlign: 'center', color: colores.texto },
  estado: { gap: espacios.m, alignItems: 'center', alignSelf: 'stretch' },
  precaucion: { alignSelf: 'stretch', backgroundColor: colores.precaucionFondo },
});