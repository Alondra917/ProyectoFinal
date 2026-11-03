import { StyleSheet, Text, View } from 'react-native';
import type { Ficha } from '../tipos/ficha';

export default function FichaCurada({ ficha }: { ficha: Ficha }) {
  return (
    <View style={styles.ficha}>
      <Text style={styles.titulo}>{ficha.nombre_visible}</Text>
      <Text>{ficha.descripcion}</Text>
      <Text style={styles.subtitulo}>Precaución</Text>
      <Text>{ficha.precaucion}</Text>
      <Text style={styles.fuente}>Fuente: {ficha.fuente}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ficha: { gap: 8, alignSelf: 'stretch' },
  titulo: { fontSize: 20, fontWeight: 'bold' },
  subtitulo: { fontWeight: 'bold', marginTop: 4 },
  fuente: { fontSize: 11, color: '#666', marginTop: 8 },
});
