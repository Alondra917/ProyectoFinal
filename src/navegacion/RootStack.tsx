import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './tipos';
import InicioScreen from '../pantallas/InicioScreen';
import ResultadoScreen from '../pantallas/ResultadoScreen';
import HistorialScreen from '../pantallas/HistorialScreen';
import DetalleHallazgoScreen from '../pantallas/DetalleHallazgoScreen';
import { colores, fuentes } from '../tema/tema';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondoArriba },
        headerTintColor: colores.texto,
        headerTitleStyle: { fontFamily: fuentes.tituloSuave, fontSize: 22, color: colores.texto },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colores.fondoArriba },
      }}
    >
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