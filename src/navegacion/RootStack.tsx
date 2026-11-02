import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './tipos';
import InicioScreen from '../pantallas/InicioScreen';
import ResultadoScreen from '../pantallas/ResultadoScreen';
import HistorialScreen from '../pantallas/HistorialScreen';
import DetalleHallazgoScreen from '../pantallas/DetalleHallazgoScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Inicio">
      <Stack.Screen name="Inicio" component={InicioScreen} />
      <Stack.Screen name="Resultado" component={ResultadoScreen} />
      <Stack.Screen name="Historial" component={HistorialScreen} />
      <Stack.Screen
        name="DetalleHallazgo"
        component={DetalleHallazgoScreen}
        options={{ title: 'Detalle' }}
      />
    </Stack.Navigator>
  );
}