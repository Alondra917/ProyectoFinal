import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colores, espacios, radios } from '../tema/tema';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variante?: 'vidrio' | 'vidrioSinBlur' | 'solida';
};

export default function TarjetaVidrio({ children, style, variante = 'vidrio' }: Props) {
  if (variante === 'vidrio') {
    return (
      <BlurView intensity={30} tint="dark" style={[styles.tarjeta, styles.vidrio, style]}>
        {children}
      </BlurView>
    );
  }
  return (
    <View
      style={[
        styles.tarjeta,
        variante === 'solida' ? styles.solida : styles.vidrio,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    borderRadius: radios.l,
    borderWidth: 1,
    borderColor: colores.bordeVidrio,
    overflow: 'hidden',
    padding: espacios.l,
  },
  vidrio: { backgroundColor: colores.vidrio },
  solida: { backgroundColor: colores.tarjetaSolida },
});