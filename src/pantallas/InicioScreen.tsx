import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';
import { cargarModelo } from '../servicios/Clasificador';
import FondoDegradado from '../componentes/FondoDegradado';
import { colores, espacios, fuentes } from '../tema/tema';
import {
  GALERIA_DETALLE,
  GALERIA_TITULO,
  INDICACION_CAPTURA,
  MENSAJE_CAMARA_DENEGADA,
  PERMISOS_BOTON, 
  PERMISOS_TEXTO,
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
  const mostrarExplicacion = permisoCamara?.status === 'undetermined';

  // Entrada suave: fade + subida
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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

  async function continuarPermisos() {
  try {
    await pedirPermisoCamara();
  } catch (e) {
    setErrorSeleccion(e instanceof Error ? e.message : String(e));
  }
}

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

  const entradaStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  return (
    <FondoDegradado>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Cabecera ── */}
          <Animated.View style={[styles.cabecera, entradaStyle]}>
            <Text style={styles.titulo}>{TITULO_APP}</Text>
            <Text style={styles.subtitulo}>{SUBTITULO_APP}</Text>
          </Animated.View>

          {/* ── Estado del modelo ── */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <EstadoModeloBadge estado={modelo} error={errorModelo} onReintentar={cargar} />
          </Animated.View>
          {/* ── Explicación previa al permiso de cámara ── */}
            {mostrarExplicacion && (
              <BlurView intensity={20} tint="dark" style={styles.avisoCard}>
                <View style={styles.avisoFila}>
                  <Feather name="shield" size={15} color={colores.acentoInicio} />
                  <Text style={styles.avisoTexto}>{PERMISOS_TEXTO}</Text>
                </View>
                <Pressable onPress={continuarPermisos} accessibilityRole="button" style={styles.botonAjustes}>
                  <Text style={styles.botonAjustesTexto}>{PERMISOS_BOTON}</Text>
                </Pressable>
              </BlurView>
            )}

          {/* ── Acción principal: cámara ── */}
          <Animated.View style={entradaStyle}>
            <Pressable
              onPress={tomarFoto}
              disabled={camaraDeshabilitada}
              accessibilityRole="button"
              accessibilityLabel={TOMAR_FOTO_TITULO}
              accessibilityHint={TOMAR_FOTO_DETALLE}
              accessibilityState={{ disabled: camaraDeshabilitada }}
              style={[camaraDeshabilitada && styles.deshabilitado]}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={[colores.acentoInicio, colores.acentoFin]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.degradadoPrincipal, pressed && !camaraDeshabilitada && styles.presionado]}
                >
                  <View style={styles.iconoGrande}>
                    <Feather name="camera" size={36} color={colores.textoSobreAcento} />
                  </View>
                  <Text style={styles.etiquetaPrincipal}>{TOMAR_FOTO_TITULO}</Text>
                  <Text style={styles.detallePrincipal}>{INDICACION_CAPTURA}</Text>
                </LinearGradient>
              )}
            </Pressable>
          </Animated.View>

          {/* ── Aviso cámara bloqueada ── */}
          {camaraBloqueada && (
            <BlurView intensity={20} tint="dark" style={styles.avisoCard}>
              <View style={styles.avisoFila}>
                <Feather name="alert-circle" size={15} color={colores.precaucionTitulo} />
                <Text style={styles.avisoTexto}>{MENSAJE_CAMARA_DENEGADA}</Text>
              </View>
              <Pressable
                onPress={() => Linking.openSettings()}
                accessibilityRole="button"
                style={styles.botonAjustes}
              >
                <Text style={styles.botonAjustesTexto}>Abrir Ajustes</Text>
              </Pressable>
            </BlurView>
          )}

          {/* ── Acción secundaria: galería ── */}
          <Animated.View
            style={[entradaStyle, galeriaDeshabilitada && styles.deshabilitado]}
          >
            <Pressable
              onPress={elegirDeGaleria}
              disabled={galeriaDeshabilitada}
              accessibilityRole="button"
              accessibilityLabel={GALERIA_TITULO}
              accessibilityHint={GALERIA_DETALLE}
              accessibilityState={{ disabled: galeriaDeshabilitada }}
            >
              {({ pressed }) => (
                <BlurView
                  intensity={25}
                  tint="dark"
                  style={[styles.accionSecundaria, pressed && !galeriaDeshabilitada && styles.presionado]}
                >
                  <View style={styles.iconoSecundario}>
                    <Feather name="image" size={20} color={colores.texto} />
                  </View>
                  <View style={styles.textosSecundaria}>
                    <Text style={styles.etiquetaSecundaria}>{GALERIA_TITULO}</Text>
                    <Text style={styles.detalleSecundaria}>{GALERIA_DETALLE}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colores.textoSecundario} />
                </BlurView>
              )}
            </Pressable>
          </Animated.View>

          {/* ── Error de selección ── */}
          {errorSeleccion && (
            <View style={styles.errorFila}>
              <Feather name="alert-circle" size={14} color={colores.precaucionTitulo} />
              <Text style={styles.errorTexto}>Error: {errorSeleccion}</Text>
            </View>
          )}

          {/* ── Pie ── */}
          <Animated.View style={[styles.pie, { opacity: fadeAnim }]}>
            <Pressable
              onPress={() => navigation.navigate('Historial')}
              accessibilityRole="button"
            >
              {({ pressed }) => (
                <View style={[styles.historialBoton, pressed && styles.presionado]}>
                  <Feather name="clock" size={16} color={colores.acentoInicio} />
                  <Text style={styles.historialTexto}>Ver historial de hallazgos</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.offlineFila}>
              <Feather name="wifi-off" size={11} color={colores.textoSecundario} />
              <Text style={styles.offlineTexto}>
                {SIN_CONEXION_TITULO} · {SIN_CONEXION_DETALLE}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </FondoDegradado>
  );
}

// ─── Badge de estado del modelo ───────────────────────────────────────────────

function EstadoModeloBadge({
  estado,
  error,
  onReintentar,
}: {
  estado: EstadoModelo;
  error: string | null;
  onReintentar: () => void;
}) {
  if (estado === 'listo') return null;

  if (estado === 'cargando') {
    return (
      <View style={styles.badgeCarga}>
        <ActivityIndicator size="small" color={colores.acentoInicio} />
        <Text style={styles.badgeTexto}>Cargando modelo…</Text>
      </View>
    );
  }

  // Error
  return (
    <View style={styles.badgeError}>
      <View style={styles.badgeErrorFila}>
        <Feather name="alert-circle" size={14} color={colores.precaucionTitulo} />
        <Text style={styles.badgeErrorTexto} numberOfLines={2}>
          {error ?? 'No se pudo cargar el modelo'}
        </Text>
      </View>
      <Pressable
        onPress={onReintentar}
        accessibilityRole="button"
        style={styles.reintentarBoton}
      >
        <Text style={styles.reintentarTexto}>Reintentar</Text>
      </Pressable>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: espacios.l,
    paddingHorizontal: espacios.xl,
    paddingVertical: espacios.xl,
  },

  // Cabecera
  cabecera: {
    gap: espacios.m,
    alignItems: 'center',
    paddingTop: espacios.m,
  },
  titulo: {
    fontFamily: fuentes.titulo,
    fontSize: 38,
    lineHeight: 44,
    textAlign: 'center',
    color: colores.texto,
  },
  subtitulo: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: colores.textoSecundario,
  },

  // Badge estado modelo
  badgeCarga: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacios.s,
    paddingVertical: espacios.s,
    paddingHorizontal: espacios.m,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignSelf: 'center',
  },
  badgeTexto: {
    fontSize: 13,
    color: colores.textoSecundario,
  },
  badgeError: {
    backgroundColor: 'rgba(42,30,16,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,196,107,0.25)',
    borderRadius: 14,
    padding: espacios.l,
    gap: espacios.m,
  },
  badgeErrorFila: {
    flexDirection: 'row',
    gap: espacios.s,
    alignItems: 'flex-start',
  },
  badgeErrorTexto: {
    flex: 1,
    fontSize: 13,
    color: colores.precaucionTitulo,
    lineHeight: 18,
  },
  reintentarBoton: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacios.l,
    paddingVertical: espacios.xs,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colores.precaucionTitulo,
  },
  reintentarTexto: {
    fontSize: 12,
    color: colores.precaucionTitulo,
    fontWeight: '600',
  },

  // Acción principal: cámara
  degradadoPrincipal: {
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: espacios.xl,
    alignItems: 'center',
    gap: espacios.m,
  },
  iconoGrande: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiquetaPrincipal: {
    fontFamily: fuentes.tituloSuave,
    fontSize: 22,
    color: colores.textoSobreAcento,
    textAlign: 'center',
  },
  detallePrincipal: {
    fontSize: 13,
    color: colores.textoSobreAcento,
    textAlign: 'center',
    opacity: 0.75,
    lineHeight: 18,
    maxWidth: 240,
  },

  // Aviso cámara bloqueada
  avisoCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,196,107,0.25)',
    padding: espacios.l,
    gap: espacios.m,
  },
  avisoFila: {
    flexDirection: 'row',
    gap: espacios.s,
    alignItems: 'flex-start',
  },
  avisoTexto: {
    flex: 1,
    fontSize: 13,
    color: colores.texto,
    lineHeight: 18,
  },
  botonAjustes: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacios.l,
    paddingVertical: espacios.s,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colores.precaucionTitulo,
  },
  botonAjustesTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: colores.precaucionTitulo,
  },

  // Acción secundaria: galería
  accionSecundaria: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacios.l,
    paddingVertical: espacios.l,
    paddingHorizontal: espacios.l,
  },
  iconoSecundario: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textosSecundaria: {
    flex: 1,
    gap: 2,
  },
  etiquetaSecundaria: {
    fontFamily: fuentes.tituloSuave,
    fontSize: 18,
    color: colores.texto,
  },
  detalleSecundaria: {
    fontSize: 13,
    color: colores.textoSecundario,
  },

  // Error de selección
  errorFila: {
    flexDirection: 'row',
    gap: espacios.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTexto: {
    fontSize: 13,
    color: colores.precaucionTitulo,
    flexShrink: 1,
  },

  // Pie
  pie: {
    gap: espacios.xl,
    alignItems: 'center',
    paddingBottom: espacios.m,
  },
  historialBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacios.s,
    paddingVertical: espacios.m,
    paddingHorizontal: espacios.l,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colores.acentoInicio,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  historialTexto: {
    fontSize: 16,
    color: colores.acentoInicio,
    fontWeight: '600',
  },
  offlineFila: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.75,
  },
  offlineTexto: {
    fontSize: 14,
    color: colores.textoSecundario,
  },

  // Utilitarios
  deshabilitado: { opacity: 0.45 },
  presionado: { opacity: 0.78 },
});
