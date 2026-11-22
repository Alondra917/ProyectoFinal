import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import { cargarModelo } from '../servicios/Clasificador';
import FondoDegradado from '../componentes/FondoDegradado';
import TarjetaVidrio from '../componentes/TarjetaVidrio';
import BotonSecundario from '../componentes/BotonSecundario';
import { colores, espacios, fuentes } from '../tema/tema';
import {
  GALERIA_DETALLE,
  GALERIA_TITULO,
  INDICACION_CAPTURA,
  MENSAJE_CAMARA_DENEGADA,
  SIN_CONEXION_DETALLE,
  SIN_CONEXION_TITULO,
  SUBTITULO_APP,
  TITULO_APP,
  TOMAR_FOTO_DETALLE,
  TOMAR_FOTO_TITULO,
} from '../datos/textos';

type Props = NativeStackScreenProps<RootStackParamList, 'Inicio'>;

type EstadoModelo = 'cargando' | 'listo' | 'error';

export default function InicioScreen({ navigation }: Props) {
  const [modelo, setModelo] = useState<EstadoModelo>('cargando');
  const [errorModelo, setErrorModelo] = useState<string | null>(null);
  const [errorSeleccion, setErrorSeleccion] = useState<string | null>(null);
  const [permisoCamara, pedirPermisoCamara] = ImagePicker.useCameraPermissions();
  const camaraBloqueada = permisoCamara?.status === 'denied' && !permisoCamara.canAskAgain;

  function irAResultado(uri: string) {
    navigation.navigate('Resultado', { uri });
  }

  const cargar = useCallback(() => {
    setModelo('cargando');
    setErrorModelo(null);
    cargarModelo()
      .then(() => setModelo('listo'))
      .catch((e) => {
        setModelo('error');
        setErrorModelo(e instanceof Error ? e.message : String(e));
      });
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function tomarFoto() {
    try {
      setErrorSeleccion(null);
      if (camaraBloqueada) return;
      if (!permisoCamara?.granted) {
        const respuesta = await pedirPermisoCamara();
        if (!respuesta.granted) return;
      }
      const r = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (r.canceled) return;
      irAResultado(r.assets[0].uri);
    } catch (e) {
      setErrorSeleccion(e instanceof Error ? e.message : String(e));
    }
  }

  async function elegirDeGaleria() {
    try {
      setErrorSeleccion(null);
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (r.canceled) return;
      irAResultado(r.assets[0].uri);
    } catch (e) {
      setErrorSeleccion(e instanceof Error ? e.message : String(e));
    }
  }

  const camaraDeshabilitada = modelo !== 'listo' || permisoCamara === null;
  const galeriaDeshabilitada = modelo !== 'listo';

  return (
    <FondoDegradado>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>{TITULO_APP}</Text>
        <Text style={styles.subtitulo}>{SUBTITULO_APP}</Text>
        <Text style={styles.indicacion}>{INDICACION_CAPTURA}</Text>

        {modelo === 'cargando' && (
          <TarjetaVidrio variante="vidrioSinBlur" style={styles.estado}>
            <ActivityIndicator color={colores.texto} />
            <Text style={styles.texto}>Cargando modelo...</Text>
          </TarjetaVidrio>
        )}

        {modelo === 'error' && (
          <TarjetaVidrio variante="solida" style={styles.estado}>
            <Text style={styles.texto}>No se pudo cargar el modelo: {errorModelo}</Text>
            <BotonSecundario titulo="Reintentar" onPress={cargar} />
          </TarjetaVidrio>
        )}

        <Pressable
          onPress={tomarFoto}
          disabled={camaraDeshabilitada}
          accessibilityRole="button"
          accessibilityState={{ disabled: camaraDeshabilitada }}
          style={camaraDeshabilitada && styles.deshabilitado}
        >
          <TarjetaVidrio style={styles.tarjetaAccion}>
            <Text style={styles.icono}>📷</Text>
            <Text style={styles.tituloAccion}>{TOMAR_FOTO_TITULO}</Text>
            <Text style={styles.detalle}>{TOMAR_FOTO_DETALLE}</Text>
          </TarjetaVidrio>
        </Pressable>

        {camaraBloqueada && (
          <TarjetaVidrio variante="solida" style={styles.estado}>
            <Text style={styles.texto}>{MENSAJE_CAMARA_DENEGADA}</Text>
            <BotonSecundario titulo="Abrir Ajustes" onPress={() => Linking.openSettings()} />
          </TarjetaVidrio>
        )}

        <Pressable
          onPress={elegirDeGaleria}
          disabled={galeriaDeshabilitada}
          accessibilityRole="button"
          accessibilityState={{ disabled: galeriaDeshabilitada }}
          style={galeriaDeshabilitada && styles.deshabilitado}
        >
          <TarjetaVidrio style={styles.tarjetaFila}>
            <Text style={styles.iconoFila}>🖼️</Text>
            <View style={styles.textosFila}>
              <Text style={styles.tituloFila}>{GALERIA_TITULO}</Text>
              <Text style={styles.detalle}>{GALERIA_DETALLE}</Text>
            </View>
          </TarjetaVidrio>
        </Pressable>

        {errorSeleccion && (
          <TarjetaVidrio variante="solida" style={styles.estado}>
            <Text style={styles.texto}>Error: {errorSeleccion}</Text>
          </TarjetaVidrio>
        )}

        <BotonSecundario titulo="Ver historial" onPress={() => navigation.navigate('Historial')} />

        <TarjetaVidrio variante="vidrioSinBlur" style={styles.pie}>
          <Text style={styles.tituloPie}>{SIN_CONEXION_TITULO}</Text>
          <Text style={styles.detalle}>{SIN_CONEXION_DETALLE}</Text>
        </TarjetaVidrio>
      </ScrollView>
    </FondoDegradado>
  );
}

const styles = StyleSheet.create({
  contenido: { flexGrow: 1, justifyContent: 'center', gap: espacios.l, padding: espacios.xl },
  titulo: {
    fontFamily: fuentes.titulo,
    fontSize: 36,
    lineHeight: 40,
    textAlign: 'center',
    color: colores.texto,
  },
  subtitulo: { fontSize: 15, textAlign: 'center', color: colores.textoSecundario },
  indicacion: { fontSize: 13, textAlign: 'center', color: colores.textoSecundario },
  texto: { fontSize: 14, textAlign: 'center', color: colores.texto },
  estado: { gap: espacios.m, alignItems: 'center' },
  deshabilitado: { opacity: 0.5 },
  tarjetaAccion: { alignItems: 'center', gap: espacios.s, paddingVertical: espacios.xl },
  icono: { fontSize: 44 },
  tituloAccion: { fontFamily: fuentes.tituloSuave, fontSize: 24, color: colores.texto },
  detalle: { fontSize: 13, color: colores.textoSecundario, textAlign: 'center' },
  tarjetaFila: { flexDirection: 'row', alignItems: 'center', gap: espacios.l },
  iconoFila: { fontSize: 28 },
  textosFila: { flex: 1, gap: espacios.xs },
  tituloFila: { fontFamily: fuentes.tituloSuave, fontSize: 20, color: colores.texto },
  pie: { gap: espacios.xs },
  tituloPie: { fontSize: 14, fontWeight: '600', color: colores.precaucionTitulo },
});