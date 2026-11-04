import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function ImagenHallazgo({ uri, tamano }: { uri: string; tamano: number }) {
  const [fallo, setFallo] = useState(false);
  const medida = { width: tamano, height: tamano };

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
  alternativo: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#ddd' },
  leyenda: { fontSize: 12, color: '#555' },
});