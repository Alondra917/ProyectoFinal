//Como no pago lo de desarrollador cada 7 dias se me aduca la secion y ya no puedo acceder a la app, asi que cada semana
//conectar telefono y correr "conectar el iPhone y recompilar con npx expo run:ios --device"

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootStack from './src/navegacion/RootStack';

export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}