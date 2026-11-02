import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/tipos';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalleHallazgo'>;

export default function DetalleHallazgoScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text>Detalle del hallazgo</Text>
      <Text>id: {route.params.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});