import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colores } from '../tema/tema';

type Props = { children?: ReactNode; style?: StyleProp<ViewStyle> };

export default function FondoDegradado({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[colores.fondoArriba, colores.fondoAbajo]}
      style={[styles.fondo, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
});