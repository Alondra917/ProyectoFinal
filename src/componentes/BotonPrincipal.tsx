import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colores, espacios, radios } from '../tema/tema';

type Props = { titulo: string; onPress: () => void; disabled?: boolean };

export default function BotonPrincipal({ titulo, onPress, disabled = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[styles.contenedor, disabled && styles.deshabilitado]}
    >
      <LinearGradient
        colors={[colores.acentoInicio, colores.acentoFin]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.degradado}
      >
        <Text style={styles.texto}>{titulo}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedor: { borderRadius: radios.l, overflow: 'hidden', alignSelf: 'stretch' },
  deshabilitado: { opacity: 0.5 },
  degradado: { paddingVertical: espacios.m, alignItems: 'center' },
  texto: { color: colores.textoSobreAcento, fontSize: 16, fontWeight: '600' },
});