import { StyleSheet, Text } from 'react-native';
import { AVISO_ORIENTATIVO } from '../datos/textos';
import TarjetaVidrio from './TarjetaVidrio';
import { colores } from '../tema/tema';

export default function AvisoOrientativo() {
  return (
    <TarjetaVidrio variante="vidrioSinBlur" style={styles.aviso}>
      <Text style={styles.texto}>{AVISO_ORIENTATIVO}</Text>
    </TarjetaVidrio>
  );
}

const styles = StyleSheet.create({
  aviso: { alignSelf: 'stretch' },
  texto: { fontSize: 13, textAlign: 'center', fontStyle: 'italic', color: colores.texto },
});