import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import { clasificar } from '../servicios/Clasificador';
import type { Resultado } from '../servicios/Clasificador';
import { imagenATensor } from '../servicios/ImagenATensor';
import { obtenerFicha } from '../servicios/Fichas';
import { guardarHallazgo } from '../servicios/Historial';
import FichaCurada from '../componentes/FichaCurada';
import FondoDegradado from '../componentes/FondoDegradado';
import PrecaucionRiesgo from '../componentes/PrecaucionRiesgo';
import { colores, espacios, fuentes } from '../tema/tema';
import {
  AVISO_ORIENTATIVO,
  ETIQUETA_CONFIANZA,
  MENSAJE_ERROR_GUARDADO,
  MENSAJE_FICHA_NO_DISPONIBLE,
  MENSAJE_NO_ES_HALLAZGO,
  MENSAJE_NO_IDENTIFICADO,
  PRECAUCION_GENERAL,
  SUGERENCIA_FOTO,
} from '../datos/textos';

type Props = NativeStackScreenProps<RootStackParamList, 'Resultado'>;

type Estado =
  | { tipo: 'clasificando' }
  | { tipo: 'listo'; resultado: Resultado }
  | { tipo: 'error'; mensaje: string };

const FOTO_ALTO = 300;

export default function ResultadoScreen({ navigation, route }: Props) {
  const { uri } = route.params;
  const [estado, setEstado] = useState<Estado>({ tipo: 'clasificando' });
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [alturaPie, setAlturaPie] = useState(160);
  const guardandoRef = useRef(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (estado.tipo === 'listo') {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [estado.tipo, fadeAnim, slideAnim]);

  useEffect(() => {
    let cancelado = false;
    fadeAnim.setValue(0);
    slideAnim.setValue(12);
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
  }, [uri, intento, fadeAnim, slideAnim]);

  const resultado = estado.tipo === 'listo' ? estado.resultado : null;
  const identificado = resultado !== null && resultado.confiable && resultado.clase !== 'otro';
  const esOtro = resultado !== null && resultado.clase === 'otro';
  const ficha = identificado && resultado ? obtenerFicha(resultado.clase) : null;
  // Si no se identificó, "Nueva foto" pasa a ser la acción principal.
  const nuevaEsPrincipal = resultado !== null && !identificado;

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

  function nuevaFoto() {
    navigation.popTo('Inicio');
  }

  const puedeGuardar = estado.tipo === 'listo' && !guardando;

  function alMedirPie(e: LayoutChangeEvent) {
    setAlturaPie(e.nativeEvent.layout.height);
  }

  const botonGuardar = (principal: boolean) => (
    <Pressable
      onPress={guardar}
      disabled={!puedeGuardar}
      accessibilityRole="button"
      accessibilityLabel="Guardar hallazgo"
      accessibilityState={{ disabled: !puedeGuardar }}
      style={[principal ? styles.botonPrincipalWrapper : styles.botonContorno, !puedeGuardar && styles.deshabilitado]}
    >
      {({ pressed }) =>
        principal ? (
          <LinearGradient
            colors={[colores.acentoInicio, colores.acentoFin]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.botonPrincipal, pressed && puedeGuardar && styles.presionado]}
          >
            {guardando ? (
              <ActivityIndicator size="small" color={colores.textoSobreAcento} />
            ) : (
              <Feather name="save" size={18} color={colores.textoSobreAcento} />
            )}
            <Text style={styles.botonPrincipalTexto}>
              {guardando ? 'Guardando…' : 'Guardar hallazgo'}
            </Text>
          </LinearGradient>
        ) : (
          <View style={[styles.botonContornoInterno, pressed && puedeGuardar && styles.presionado]}>
            {guardando ? (
              <ActivityIndicator size="small" color={colores.texto} />
            ) : (
              <Feather name="save" size={16} color={colores.texto} />
            )}
            <Text style={styles.botonContornoTexto}>
              {guardando ? 'Guardando…' : 'Guardar hallazgo'}
            </Text>
          </View>
        )
      }
    </Pressable>
  );

  const botonNueva = (principal: boolean) => (
    <Pressable
      onPress={nuevaFoto}
      accessibilityRole="button"
      accessibilityLabel="Nueva foto"
      style={principal ? styles.botonPrincipalWrapper : styles.botonContorno}
    >
      {({ pressed }) =>
        principal ? (
          <LinearGradient
            colors={[colores.acentoInicio, colores.acentoFin]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.botonPrincipal, pressed && styles.presionado]}
          >
            <Feather name="camera" size={18} color={colores.textoSobreAcento} />
            <Text style={styles.botonPrincipalTexto}>Nueva foto</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.botonContornoInterno, pressed && styles.presionado]}>
            <Feather name="camera" size={16} color={colores.texto} />
            <Text style={styles.botonContornoTexto}>Nueva foto</Text>
          </View>
        )
      }
    </Pressable>
  );

  return (
    <FondoDegradado>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroContenedor}>
          <Image source={{ uri }} style={styles.foto} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', colores.fondoAbajo]}
            style={styles.fadeInferior}
            pointerEvents="none"
          />

          {estado.tipo === 'clasificando' && (
            <BlurView intensity={40} tint="dark" style={styles.overlayClasificando}>
              <ActivityIndicator color={colores.acentoInicio} size="large" />
              <Text style={styles.textoClasificando}>Clasificando…</Text>
            </BlurView>
          )}

          {estado.tipo === 'error' && (
            <BlurView intensity={50} tint="dark" style={styles.overlayClasificando}>
              <Feather name="alert-circle" size={28} color={colores.precaucionTitulo} />
              <Text style={styles.textoErrorHero}>Error al clasificar</Text>
              <Text style={styles.textoErrorDetalle}>{estado.mensaje}</Text>
              <Pressable
                onPress={() => setIntento((i) => i + 1)}
                style={styles.botonReintentarHero}
                accessibilityRole="button"
              >
                <Text style={styles.botonReintentarTexto}>Reintentar</Text>
              </Pressable>
            </BlurView>
          )}
        </View>

        {/* Cuerpo */}
        {resultado && (
          <Animated.View
            style={[styles.cuerpo, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <View style={styles.encabezado}>
              <Text style={styles.titulo}>
                {identificado
                  ? ficha
                    ? ficha.nombre_visible
                    : resultado.clase
                  : esOtro
                    ? MENSAJE_NO_ES_HALLAZGO
                    : MENSAJE_NO_IDENTIFICADO}
              </Text>

              {!identificado && !esOtro && (
                <Text style={styles.sugerencia}>{SUGERENCIA_FOTO}</Text>
              )}

              {identificado && (
                <View style={styles.confianzaBloque}>
                  <View style={styles.confianzaFila}>
                    <Text style={styles.confianzaEtiqueta}>{ETIQUETA_CONFIANZA}</Text>
                    <View style={styles.confianzaBadge}>
                      <Text style={styles.confianzaPorcentaje}>
                        {Math.round(resultado.confianza * 100)}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.barraPista}>
                    <LinearGradient
                      colors={[colores.acentoInicio, colores.acentoFin]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.barraRelleno,
                        { width: `${Math.round(resultado.confianza * 100)}%` },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Ficha curada */}
            {identificado && ficha && <FichaCurada ficha={ficha} />}

            {identificado && !ficha && (
              <View style={styles.seccionPrecaucion}>
                <Feather name="info" size={15} color={colores.textoSecundario} />
                <Text style={styles.seccionCuerpo}>{MENSAJE_FICHA_NO_DISPONIBLE}</Text>
              </View>
            )}

            {/* No identificado u "otro": precaución general (según la spec, igual en ambos casos) */}
            {!identificado && (
              <PrecaucionRiesgo nivel="precaucion" lineas={[PRECAUCION_GENERAL]} />
            )}

            <View style={styles.avisoFila}>
              <Feather name="info" size={14} color={colores.textoSecundario} />
              <Text style={styles.avisoTexto}>{AVISO_ORIENTATIVO}</Text>
            </View>

            {errorGuardado && (
              <View style={styles.errorGuardadoFila}>
                <Feather name="alert-circle" size={14} color={colores.precaucionTitulo} />
                <Text style={styles.errorGuardadoTexto}>{errorGuardado}</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Espacio = altura real medida de la barra de botones */}
        <View style={{ height: alturaPie + espacios.l }} />
      </ScrollView>

      {/* Botones fijos al pie */}
      <SafeAreaView style={styles.pieContenedor} edges={['bottom']} onLayout={alMedirPie}>
        <View style={styles.pie}>
          {nuevaEsPrincipal ? (
            <>
              {botonNueva(true)}
              {botonGuardar(false)}
            </>
          ) : (
            <>
              {botonGuardar(true)}
              {botonNueva(false)}
            </>
          )}
        </View>
      </SafeAreaView>
    </FondoDegradado>
  );
}

const styles = StyleSheet.create({
  contenido: { flexGrow: 1 },

  // Hero
  heroContenedor: {
    width: '100%',
    height: FOTO_ALTO,
    position: 'relative',
    backgroundColor: colores.fondoArriba,
  },
  foto: { width: '100%', height: FOTO_ALTO },
  fadeInferior: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  overlayClasificando: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacios.m,
    overflow: 'hidden',
  },
  textoClasificando: { fontSize: 15, color: colores.texto },
  textoErrorHero: {
    fontFamily: fuentes.tituloSuave,
    fontSize: 20,
    color: colores.precaucionTitulo,
    textAlign: 'center',
  },
  textoErrorDetalle: {
    fontSize: 13,
    color: colores.texto,
    textAlign: 'center',
    opacity: 0.8,
    maxWidth: 260,
  },
  botonReintentarHero: {
    marginTop: espacios.s,
    paddingHorizontal: espacios.xl,
    paddingVertical: espacios.m,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colores.precaucionTitulo,
  },
  botonReintentarTexto: { fontSize: 14, fontWeight: '600', color: colores.precaucionTitulo },

  // Cuerpo
  cuerpo: { padding: espacios.xl, gap: espacios.l },

  // Encabezado
  encabezado: { gap: espacios.m },
  titulo: { fontFamily: fuentes.titulo, fontSize: 34, lineHeight: 40, color: colores.texto },
  sugerencia: { fontSize: 16, lineHeight: 22, color: colores.textoSecundario },
  confianzaBloque: { gap: espacios.s },
  confianzaFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  confianzaEtiqueta: { fontSize: 14, color: colores.textoSecundario },
  confianzaBadge: {
    paddingHorizontal: espacios.m,
    paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: 'rgba(245,158,59,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,59,0.3)',
  },
  confianzaPorcentaje: { fontSize: 14, fontWeight: '600', color: colores.acentoInicio },
  barraPista: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  barraRelleno: { height: '100%', borderRadius: 3 },

  // Ficha
  fichaContenedor: { gap: espacios.m },
  seccion: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: espacios.l,
    gap: espacios.s,
  },
  seccionPrecaucion: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,196,107,0.2)',
    backgroundColor: colores.precaucionFondo,
    padding: espacios.l,
    gap: espacios.s,
  },
  seccionPrecaucionFila: { flexDirection: 'row', alignItems: 'center', gap: espacios.s },
  seccionEtiqueta: { fontFamily: fuentes.tituloSuave, fontSize: 18, color: colores.texto },
  seccionCuerpo: { fontSize: 16, lineHeight: 23, color: colores.texto },
  itemFila: { flexDirection: 'row', gap: espacios.s },
  itemVineta: { fontSize: 16, lineHeight: 23 },
  itemTexto: { flex: 1 },
  fuenteFila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: espacios.xs,
  },
  fuenteTexto: { flex: 1, fontSize: 13, color: colores.textoSecundario, lineHeight: 18 },

  // Aviso orientativo
  avisoFila: {
    flexDirection: 'row',
    gap: espacios.s,
    alignItems: 'flex-start',
    paddingHorizontal: espacios.xs,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: colores.textoSecundario,
    lineHeight: 19,
  },

  // Error de guardado
  errorGuardadoFila: { flexDirection: 'row', gap: espacios.s, alignItems: 'center' },
  errorGuardadoTexto: { flex: 1, fontSize: 13, color: colores.precaucionTitulo },

  // Pie fijo
  pieContenedor: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent' },
  pie: {
    paddingHorizontal: espacios.xl,
    paddingBottom: espacios.l,
    paddingTop: espacios.m,
    gap: espacios.m,
    backgroundColor: 'rgba(11,27,58,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  botonPrincipalWrapper: { borderRadius: 16, overflow: 'hidden' },
  botonPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacios.s,
    paddingVertical: espacios.l,
    borderRadius: 16,
  },
  botonPrincipalTexto: { fontSize: 16, fontWeight: '600', color: colores.textoSobreAcento },
  botonContorno: { borderRadius: 14 },
  botonContornoInterno: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacios.s,
    paddingVertical: espacios.m,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  botonContornoTexto: { fontSize: 15, fontWeight: '500', color: colores.texto },

  // Utilitarios
  deshabilitado: { opacity: 0.45 },
  presionado: { opacity: 0.78 },
});