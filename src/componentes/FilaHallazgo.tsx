import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Hallazgo } from '../tipos/hallazgo';
import { fechaLegible, tituloHallazgo } from '../servicios/Presentacion';
import ImagenHallazgo from './ImagenHallazgo';
import TarjetaVidrio from './TarjetaVidrio';
import { colores, espacios, fuentes } from '../tema/tema';

type Props = { hallazgo: Hallazgo; alPresionar: () => void };

export default function FilaHallazgo({ hallazgo, alPresionar }: Props) {
  return (
    <Pressable onPress={alPresionar} accessibilityRole="button">
      <TarjetaVidrio variante="vidrioSinBlur" style={styles.fila}>
        <ImagenHallazgo uri={hallazgo.foto} tamano={64} />
        <View style={styles.textos}>
          <Text style={styles.titulo}>{tituloHallazgo(hallazgo)}</Text>
          <Text style={styles.fecha}>{fechaLegible(hallazgo.fecha)}</Text>
        </View>
        <Text style={styles.flecha}>›</Text>
      </TarjetaVidrio>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacios.m,
    padding: espacios.m,
  },
  textos: { flex: 1, gap: espacios.xs },
  titulo: { fontFamily: fuentes.tituloSuave, fontSize: 20, color: colores.texto },
  fecha: { fontSize: 12, color: colores.textoSecundario },
  flecha: { fontSize: 28, color: colores.textoSecundario },
});