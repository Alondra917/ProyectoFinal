import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NivelRiesgo } from '../tipos/ficha';
import { colores, espacios, fuentes } from '../tema/tema';
import { coloresRiesgo, iconosRiesgo } from '../tema/riesgo';
import { ETIQUETA_POR_RIESGO } from '../datos/textos';

type Props = { nivel: NivelRiesgo; lineas: string[] };

// Tarjeta de precaución: fondo, borde, ícono y título según el nivel de riesgo.
// Se usa en Resultado, Detalle y FichaCurada para que se vea igual en todos lados.
export default function PrecaucionRiesgo({ nivel, lineas }: Props) {
  const riesgo = coloresRiesgo[nivel];
  return (
    <View style={[styles.tarjeta, { backgroundColor: riesgo.fondo, borderColor: riesgo.borde }]}>
      <View style={styles.encabezado}>
        <Feather name={iconosRiesgo[nivel]} size={16} color={riesgo.titulo} />
        <Text style={[styles.etiqueta, { color: riesgo.titulo }]}>{ETIQUETA_POR_RIESGO[nivel]}</Text>
      </View>
      {lineas.map((linea) => (
        <View key={linea} style={styles.item}>
          <Text style={[styles.vineta, { color: riesgo.titulo }]}>•</Text>
          <Text style={styles.texto}>{linea}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    alignSelf: 'stretch',
    borderRadius: 16,
    borderWidth: 1,
    padding: espacios.l,
    gap: espacios.s,
  },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: espacios.s },
  etiqueta: { fontFamily: fuentes.tituloSuave, fontSize: 18 },
  item: { flexDirection: 'row', gap: espacios.s },
  vineta: { fontSize: 16, lineHeight: 23 },
  texto: { flex: 1, fontSize: 16, lineHeight: 23, color: colores.texto },
});