import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';

type Props = NativeStackScreenProps<RootStackParamList, 'Resultado'>;

export default function ResultadoScreen({ navigation, route }: Props) {
  return (
    <View style={styles.container}>
      <Text>Resultado</Text>
      <Text>uri: {route.params.uri}</Text>
      <Button title="Guardar (prueba)" onPress={() => navigation.replace('Historial')} />
      <Button title="Nueva foto" onPress={() => navigation.navigate('Inicio')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});