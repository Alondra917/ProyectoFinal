import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';

type Props = NativeStackScreenProps<RootStackParamList, 'Inicio'>;

export default function InicioScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text>Inicio</Text>
      <Button
        title="Ir a Resultado (prueba)"
        onPress={() => navigation.navigate('Resultado', { uri: 'prueba' })}
      />
      <Button title="Ver historial" onPress={() => navigation.navigate('Historial')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});