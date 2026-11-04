import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Hallazgo } from '../tipos/hallazgo';
import { fechaLegible, tituloHallazgo } from '../servicios/Presentacion';
import ImagenHallazgo from './ImagenHallazgo';

type Props = { hallazgo: Hallazgo; alPresionar: () => void };

export default function FilaHallazgo({ hallazgo, alPresionar }: Props) {
  return (
    <Pressable onPress={alPresionar} style={styles.fila}>
      <ImagenHallazgo uri={hallazgo.foto} tamano={64} />
      <View style={styles.textos}>
        <Text style={styles.titulo}>{tituloHallazgo(hallazgo)}</Text>
        <Text style={styles.fecha}>{fechaLegible(hallazgo.fecha)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  textos: { flex: 1, gap: 4 },
  titulo: { fontSize: 16, fontWeight: 'bold' },
  fecha: { fontSize: 12, color: '#666' },
});