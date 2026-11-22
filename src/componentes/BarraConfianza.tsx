import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colores } from '../tema/tema';

export default function BarraConfianza({ valor }: { valor: number }) {
  const porcentaje = Math.max(0, Math.min(100, Math.round(valor * 100)));
  return (
    <View style={styles.pista}>
      <LinearGradient
        colors={[colores.acentoInicio, colores.acentoFin]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.relleno, { width: `${porcentaje}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pista: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colores.bordeVidrio,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  relleno: { height: '100%' },
});