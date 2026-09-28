# Spike: clasificación on-device con TensorFlow Lite (iOS)

Rama `spike/tflite-ios` del proyecto final de Aplicaciones Móviles: **Identificador de Hallazgos de Playa** (basura y fauna costera de Ensenada).

Esta rama **no es la app final**. Es una prueba de viabilidad técnica para confirmar, antes de comprometer el semestre, se verfico:

```
entrenamiento (Colab) → exportación a .tflite → inferencia on-device (iPhone/simulador)
```

## Qué se hizo y por qué

| Paso | Qué se hizo | Por qué |
|---|---|---|
| 1 | Dev build de Expo con `react-native-fast-tflite` corriendo en dispositivo físico (iPhone 11) | La inferencia on-device requiere una librería nativa, así que Expo Go no sirve |
| 2 | Entrenamiento de un modelo miniatura en Colab con transfer learning (MobileNetV2) | Confirmar que el pipeline de entrenamiento funciona antes de invertir en el dataset completo |
| 3 | Exportación a `.tflite` y carga en la app | Confirmar que el modelo entrenado corre sin internet |
| 4 | Inferencia de prueba con una entrada dummy (224x224x3) | Confirmar que la salida es coherente (5 probabilidades que suman ~1) |

### Datos del modelo de prueba

- **5 clases:** `colilla`, `plastico_film`, `botella_plastico` (dataset público [TACO](http://tacodataset.org/), vía Kaggle) y `erizo_morado` (*Strongylocentrotus purpuratus*), `lobo_marino` (*Zalophus californianus*) (fotos research-grade de iNaturalist, filtradas por región).
- **Entrenamiento:** MobileNetV2 preentrenada en ImageNet con base congelada, entrada 224x224, 12 épocas, batch de 8.
- **Resultado:** ~0.86 de exactitud en entrenamiento y ~0.54 en validación (el azar con 5 clases es 0.20). La brecha es esperable con ~30-120 imágenes por clase. **El objetivo era validar el pipeline, no la exactitud**; el modelo real se entrena después con más datos.

## Tecnología

- React Native + Expo (**Development Build**, no Expo Go)
- [`react-native-fast-tflite`](https://github.com/mrousavy/react-native-fast-tflite) v3 (usa `react-native-nitro-modules`)
- Python, TensorFlow/Keras en Google Colab (transfer learning con MobileNetV2)
- TensorFlow Lite para el formato del modelo

## Cómo afecta el desarrollo normal en React Native

- **Ya no se usa Expo Go.** La app se corre con `npx expo run:ios` (los scripts `ios` y `android` en `package.json` cambiaron de `expo start --ios/--android` a `expo run:ios/run:android`).
- **Cambios nativos requieren recompilar.** Instalar una librería nativa o cambiar `app.json` (por ejemplo `bundleIdentifier`) implica volver a correr `npx expo run:ios`. Los cambios solo de JavaScript siguen recargándose con Fast Refresh.
- **`metro.config.js` es aditivo:** solo registra `.tflite` como tipo de asset; no cambia el manejo de imágenes, fuentes ni otros archivos.
- **JavaScript / TypeScript:** el proyecto actual usa JavaScript (`App.js`). La librería incluye tipos de TypeScript, así que migrar a TS después no genera conflicto con esta integración.
- **Detalle de la API v3:** `loadTensorflowModel` requiere un segundo argumento (arreglo de delegados). Sin él falla con `Value is undefined, expected an Object`:

```javascript
const model = await loadTensorflowModel(require('./assets/modelos/modelo_prueba.tflite'), []);
```

## Entrenamiento (Google Colab)

El notebook con todo el proceso (descarga de TACO, descarga de iNaturalist, separación train/val, entrenamiento y exportación) está en:

- Notebook en el repo: [`ml/entrenamiento_modelo_prueba.ipynb`](ml/entrenamiento_modelo_prueba.ipynb)
- Abrir en Colab: _(pega aquí el enlace de Colab)_

Para reproducirlo se necesita una cuenta de Kaggle (credenciales propias, **nunca** se suben al repo) y activar GPU en Colab.

## Cómo correrlo

```bash
npm install
npx expo run:ios
```

Al abrir la app debe mostrar `Inferencia OK ✅` y en la consola de Metro aparece la salida del modelo (5 valores).

## Límites de este spike

- El modelo es de prueba: no se debe usar para identificar nada real.
- La inferencia se probó con una entrada dummy, no con la cámara.
- No incluye mapa, sincronización ni fichas de precauciones; eso corresponde a `main`.