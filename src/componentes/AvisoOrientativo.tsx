import { StyleSheet, Text } from 'react-native';
import { AVISO_ORIENTATIVO } from '../datos/textos';

export default function AvisoOrientativo() {
  return <Text style={styles.aviso}>{AVISO_ORIENTATIVO}</Text>;
}

const styles = StyleSheet.create({
  aviso: { textAlign: 'center', fontStyle: 'italic', color: '#555' },
});