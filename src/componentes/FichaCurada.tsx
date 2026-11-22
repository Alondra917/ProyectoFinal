import { StyleSheet, Text, View } from 'react-native';
import type { Ficha } from '../tipos/ficha';
import TarjetaVidrio from './TarjetaVidrio';
import { colores, espacios, fuentes } from '../tema/tema';
import { ETIQUETA_DESCRIPCION, ETIQUETA_FUENTE, ETIQUETA_PRECAUCION } from '../datos/textos';

export default function FichaCurada({ ficha }: { ficha: Ficha }) {
  return (
    <View style={styles.ficha}>
      <TarjetaVidrio variante="vidrioSinBlur" style={styles.tarjeta}>
        <Text style={styles.etiqueta}>{ETIQUETA_DESCRIPCION}</Text>
        <Text style={styles.cuerpo}>{ficha.descripcion}</Text>
      </TarjetaVidrio>

      <TarjetaVidrio variante="solida" style={[styles.tarjeta, styles.precaucion]}>
        <Text style={[styles.etiqueta, styles.etiquetaPrecaucion]}>{ETIQUETA_PRECAUCION}</Text>
        <Text style={styles.cuerpo}>{ficha.precaucion}</Text>
      </TarjetaVidrio>

      <TarjetaVidrio variante="vidrioSinBlur" style={styles.tarjeta}>
        <Text style={styles.fuente}>
          {ETIQUETA_FUENTE}: {ficha.fuente}
        </Text>
      </TarjetaVidrio>
    </View>
  );
}

const styles = StyleSheet.create({
  ficha: { gap: espacios.m, alignSelf: 'stretch' },
  tarjeta: { gap: espacios.s },
  precaucion: { backgroundColor: colores.precaucionFondo },
  etiqueta: { fontFamily: fuentes.tituloSuave, fontSize: 20, color: colores.texto },
  etiquetaPrecaucion: { color: colores.precaucionTitulo },
  cuerpo: { fontSize: 15, lineHeight: 21, color: colores.texto },
  fuente: { fontSize: 12, color: colores.textoSecundario },
});