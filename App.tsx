//Como no pago lo de desarrollador cada 7 dias se me aduca la secion y ya no puedo acceder a la app, asi que cada semana
//conectar telefono y correr "conectar el iPhone y recompilar con npx expo run:ios --device"

import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond/700Bold';
import RootStack from './src/navegacion/RootStack';
import { colores } from './src/tema/tema';

const temaApp = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colores.fondoArriba,
    card: colores.fondoArriba,
    text: colores.texto,
    border: colores.bordeVidrio,
    primary: colores.acentoInicio,
  },
};

export default function App() {
  const [fuentesListas, errorFuentes] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  if (!fuentesListas && !errorFuentes) return null;

  return (
    <NavigationContainer theme={temaApp}>
      <RootStack />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}