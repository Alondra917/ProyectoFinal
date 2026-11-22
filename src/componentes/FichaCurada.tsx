import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Ficha } from '../tipos/ficha';
import TarjetaVidrio from './TarjetaVidrio';
import PrecaucionRiesgo from './PrecaucionRiesgo';
import { colores, espacios, fuentes } from '../tema/tema';
import {
  ETIQUETA_DESCRIPCION,
  ETIQUETA_FUENTE,
  ETIQUETA_SI_HAY_PROBLEMA,
} from '../datos/textos';

export default function FichaCurada({ ficha }: { ficha: Ficha }) {
  const { fuente } = ficha;

  return (
    <View style={styles.ficha}>
      <TarjetaVidrio variante="vidrioSinBlur" style={styles.tarjeta}>
        <Text style={styles.etiqueta}>{ETIQUETA_DESCRIPCION}</Text>
        <Text style={styles.cuerpo}>{ficha.descripcion}</Text>
      </TarjetaVidrio>

      <PrecaucionRiesgo nivel={ficha.nivel_riesgo} lineas={ficha.precaucion} />

      {ficha.si_hay_problema ? (
        <TarjetaVidrio variante="vidrioSinBlur" style={styles.tarjeta}>
          <Text style={styles.etiqueta}>{ETIQUETA_SI_HAY_PROBLEMA}</Text>
          <Text style={styles.cuerpo}>{ficha.si_hay_problema}</Text>
        </TarjetaVidrio>
      ) : null}

      <View style={styles.fuenteFila}>
        <Feather name="book-open" size={13} color={colores.textoSecundario} />
        <Text style={styles.fuente}>
          {ETIQUETA_FUENTE}: {fuente.nombre}
          {fuente.consultado ? ` (consultado: ${fuente.consultado})` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ficha: { gap: espacios.m, alignSelf: 'stretch' },
  tarjeta: { gap: espacios.s },
  etiqueta: { fontFamily: fuentes.tituloSuave, fontSize: 18, color: colores.texto },
  cuerpo: { fontSize: 16, lineHeight: 23, color: colores.texto },
  fuenteFila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: espacios.xs,
  },
  fuente: { flex: 1, fontSize: 13, lineHeight: 18, color: colores.textoSecundario },
});