import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colores } from '../tema/tema';

export default function ImagenHallazgo({ uri, tamano }: { uri: string; tamano: number }) {
  const [fallo, setFallo] = useState(false);
  const medida = { width: tamano, height: tamano, borderRadius: tamano > 100 ? 24 : 12 };

  if (fallo) {
    return (
      <View style={[styles.alternativo, medida]}>
        <Text style={{ fontSize: tamano / 3 }}>🖼️</Text>
        {tamano > 100 && <Text style={styles.leyenda}>Foto no disponible</Text>}
      </View>
    );
  }
  return <Image source={{ uri }} style={medida} onError={() => setFallo(true)} />;
}

const styles = StyleSheet.create({
  alternativo: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.tarjetaSolida,
    borderWidth: 1,
    borderColor: colores.bordeVidrio,
  },
  leyenda: { fontSize: 12, color: colores.textoSecundario },
});