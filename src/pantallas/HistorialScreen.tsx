import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';

type Props = NativeStackScreenProps<RootStackParamList, 'Historial'>;

export default function HistorialScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text>Historial</Text>
      <Button
        title="Abrir detalle (prueba)"
        onPress={() => navigation.navigate('DetalleHallazgo', { id: 1 })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});