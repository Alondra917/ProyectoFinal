# Identificador de Hallazgos de Playa

App móvil que identifica, a partir de una foto, basura o fauna que encuentras en la playa y te dice qué precaución tomar. Funciona **sin internet**: el modelo de visión por computadora corre dentro del teléfono.

Pensada para quien visita las playas de Ensenada y la costa de Baja California.

> **Identificación orientativa.** El modelo puede equivocarse. Ante la duda, no toques el hallazgo y avisa a las autoridades locales.

## El problema

Un visitante de playa encuentra basura o un animal y no sabe qué es ni qué precaución tomar, y en ese momento no hay señal para averiguarlo. Esta app resuelve esa duda en el momento, sin conexión.

## Qué hace

1. Toma una foto o elige una de la galería (la app la recorta al cuadrado central).
2. Clasifica la foto en el teléfono, sin internet.
3. Muestra el nombre y la confianza. Si la confianza es baja o el modelo responde `otro`, dice "No se pudo identificar" en lugar de forzar una respuesta.
4. Muestra una ficha curada con descripción, precaución según el nivel de riesgo (seguro, precaución o peligro), qué hacer si hay un problema y la fuente.
5. Guarda el hallazgo en un historial local, con la ubicación si hay permiso.
6. Permite ver el historial, filtrar por identificados y abrir el detalle de cada hallazgo.

## Estado del proyecto

| Funcionalidad | Estado |
|---|---|
| Captura de foto (cámara y galería) con recorte cuadrado | Hecho |
| Clasificación en el teléfono (TFLite) | Hecho |
| Umbral de confianza y clase `otro` | Hecho (Calibrado en base al ultimo modelo) |
| Ficha curada con nivel de riesgo | Hecho (fuentes en verificación) |
| Historial local (SQLite) con ubicación | Hecho |
| Mapa comunitario anónimo | No incluido en esta entrega |
| Android | Experimental (ver sección Android) |


## Clases que identifica

| Clase | Tipo | Nivel de riesgo |
|---|---|---|
| Botella de plástico | Basura | Seguro |
| Colilla de cigarro | Basura | Precaución |
| Erizo morado | Fauna | Precaución |
| Lobo marino californiano | Fauna | Precaución |
| Cangrejo rayado de orilla | Fauna | Seguro |
| `otro` | Cualquier cosa fuera de las anteriores | Precaución general |

Cada clase tiene una ficha en `src/datos/fichas.json`.

## Tecnologías

- **React Native** con **Expo** (SDK con *development build*) y **TypeScript**
- **React Navigation** (`native-stack`) para la navegación
- **react-native-fast-tflite** para correr el modelo en el teléfono
- **MobileNetV2** (congelada) como arquitectura del clasificador, entrada de 224×224×3
- **expo-sqlite** para el historial local
- **expo-location** para la ubicación del hallazgo
- **expo-image-picker** para cámara y galería
- **EAS Build** para generar el APK de Android

## Cómo correrla (iPhone)

La app usa código nativo (TFLite), así que **no funciona en Expo Go**. Necesita un *development build*.

Requisitos: Node.js, Xcode y un iPhone (el proyecto se probó en un iPhone 11).

```bash
git clone <URL-DEL-REPOSITORIO>
cd ProyectoFinal
npm install
npx expo run:ios --device
```

La primera vez compila e instala la app en el teléfono. Después, para trabajar:

```bash
npx expo start --dev-client
```

## Android

El APK se genera con EAS Build desde la rama **`build-apk`**, no desde `main`. En esa rama el modelo se carga con un respaldo basado en `expo-asset`, necesario porque en las versiones de producción de Android la carga directa del modelo falla.

```bash
git checkout build-apk
npx eas-cli build -p android --profile preview
```

APK de la entrega: https://expo.dev/accounts/alondrajudith/projects/ProyectoFinal/builds/5e86aec8-5fdc-42c5-94d8-82836a5b086e

Android no era parte del alcance original, por eso se considera experimental, pero paso pruebas basicas, de tomar imagen, clasificar y guardar.

## Estructura del repositorio

```
ProyectoFinal/
├── specs/                  Especificaciones (SDD): proyecto, navegación, datos, modelo y features
├── src/
│   ├── componentes/        Componentes de interfaz (FichaCurada, PrecaucionRiesgo, FilaHallazgo...)
│   ├── datos/              fichas.json y textos fijos
│   ├── navegacion/         Pantallas y rutas
│   ├── pantallas/          Inicio, Resultado, Historial, Detalle
│   ├── servicios/          Clasificador, ImagenATensor, Historial, Fichas, Ubicación
│   ├── tema/               Colores, espacios, tipografías y colores por nivel de riesgo
│   └── tipos/              Tipos de TypeScript
├── assets/modelos/         modelo.tflite y clases.json
├── Modelos_ParaVer/        Scripts de dataset, entrenamiento y notebook
├── docs/                   Notas técnicas
├── App.tsx
└── README.md
```

## El modelo

- Clasificador de imágenes con **MobileNetV2**, entrenado para las clases de la tabla anterior más una clase `otro`.
- La clase `otro` existe porque el softmax reparte la probabilidad entre las clases conocidas: una foto fuera de ellas puede salir con confianza alta, y el umbral solo no la detiene.
- Datos de entrenamiento: basura a partir de **TACO** (recortada por caja delimitadora y llevada a cuadrado) y fauna a partir de **iNaturalist**. Los scripts están en `Modelos_ParaVer/`.
- Criterio de aceptación: recall ≥ 0.70 por clase, más un conjunto de prueba de campo tomado en Ensenada. La exactitud global se evita como métrica porque las clases están desbalanceadas.
- El modelo (`.tflite`), su lista de clases y las fichas van **empaquetados dentro de la app**; no se descargan.

## Privacidad

- Las fotos nunca salen del teléfono.
- No hay cuentas, login ni datos personales. El historial vive solo en el dispositivo.
- La ubicación se guarda localmente con cada hallazgo y solo si el usuario da permiso. Si no hay permiso, el hallazgo se guarda sin ubicación.

## Contenido de las fichas

Las precauciones sobre fauna pueden causar daño si son erróneas, por eso cada ficha lleva un campo `fuente` obligatorio (nombre, enlace y fecha de consulta) y la app muestra siempre el aviso de identificación orientativa. Las fuentes de las fichas están **en proceso de verificación**; mientras falten el enlace o la fecha de consulta, la validación en desarrollo avisa en la consola.

## Decisiones de diseño

El proyecto sigue **Spec-Driven Development**: si algo cambia, primero se actualiza la spec y después el código. El registro completo de decisiones (clase `otro`, modelo en el teléfono, sin autenticación, fichas locales, etc.) está en `specs/00-project.md`.

## Limitaciones conocidas

- La identificación es orientativa y el modelo solo reconoce las clases listadas.
- El umbral de confianza (0.6) es provisional y falta calibrarlo con el conjunto de campo.
- Solo iOS está probado a fondo; Android es experimental.
- Las fuentes de las fichas siguen en verificación.

## Créditos

- Imágenes de entrenamiento: [TACO](http://tacodataset.org/) e [iNaturalist](https://www.inaturalist.org/). Las fotos de iNaturalist tienen licencias distintas según cada observación; 
- Autora: Alondra Judith Gonzalez Borbolla 
- Proyecto final de aplicaciones moviles, UABC, 7to semestre.