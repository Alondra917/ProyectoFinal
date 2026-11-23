# Diario de decisiones

## Desiciones generales 
Proyecto: Identificador de Hallazgos de Playa (Aplicaciones Móviles, UABC ISyTE). Autora: Alondra. Herramienta de IA: Claude.

Nota: el documento que usé como base empieza en F06. La parte inicial (SDD y specs) la reconstruí del resumen que pasé entre conversaciones. Donde dice **[completar]** falta mi dato real.

## 1. Cómo trabajé con la IA

Trabajé con desarrollo guiado por especificaciones (SDD), que es lo que pide mi profesor. La regla es simple: no se programa una feature sin su spec, y si algo cambia, primero se actualiza la spec. Le pedí a la IA que me diera una decisión a la vez, con opciones y una recomendación, y que yo decido. También le pedí commits pequeños en español, que verifique en la documentación todo lo que dependa de versiones (uso Expo SDK 57) y que no marque una prueba como hecha si yo no la confirmé. Todo lo probé en mi iPhone 11 real, usando código temporal con `console.log` que luego quitaba con `git checkout`.

## 2. Cómo empecé: el SDD y las specs

Mi profesor pidió seguir su guía SDD. Le pedí a la IA una primera versión de las specs, que guardé en la carpeta `specs/`: el proyecto (`00-project.md`), el modelo de datos, el modelo de clasificación y una spec por cada feature, de F01 a F10. **[completar: mi prompt original y qué cambié de esa primera versión.]** La carpeta `specs/` está en `.gitignore`, así que vive solo en mi Mac. Me falta la revisión por pares de las specs que pidió el profesor.

## 3. Decisiones principales

Estas son las decisiones que fui registrando (D1 a D16), explicadas en pocas palabras:

- **D1:** agregué una clase `otro`, para que el modelo no obligue a una foto ajena a parecer una clase real.
- **D2 y D3:** los recortes de TACO se hacen por bounding box, y el modelo se evalúa con recall de al menos 0.70 por clase más un conjunto de fotos de campo de Ensenada. **[completar el motivo.]**
- **D4:** cada ficha lleva siempre un aviso de que la identificación es orientativa y una fuente obligatoria.
- **D5:** si algún día existe el mapa comunitario, no subirá fotos, solo clase, fecha y ubicación, por privacidad.
- **D6:** el modelo corre en el teléfono, porque la app debe funcionar sin internet en la playa.
- **D7 y D8:** las fichas son un JSON local y no hay autenticación, porque no hay servidor ni usuarios que proteger.
- **D9:** uso MobileNetV2 congelada y solo entreno la capa final, para aprovechar lo que la red ya aprendió.
- **D10:** guardo latitud y longitud desde el inicio. **[completar el motivo.]**
- **D11:** uso la cámara del sistema y la app recorta el cuadrado central, porque el editor del selector no garantiza una imagen cuadrada.
- **D12 y D13:** la navegación es un native-stack con 4 pantallas, y cada pantalla guarda su estado con `useState`, sin carpeta `stores/`.
- **D14:** la foto se copia al directorio de la app antes de guardar, porque la ruta que da el selector puede borrarse y el historial mostraría fotos rotas.
- **D15:** esa copia se reduce a 1024 px y se comprime a JPEG 0.7. Medí que una foto pasó de 396 293 a 99 199 bytes, cerca de 75 % menos, y se siguen viendo nítidas.
- **D16:** el rediseño visual solo cambia las 4 pantallas existentes, sin tocar la navegación ni el comportamiento.

Otras decisiones menores: la galería no pide permiso (lo comprobé en mi iPhone), en la base de datos guardo solo el nombre de la foto y no la ruta completa (porque la ruta puede cambiar al reinstalar), y decidí no usar el simulador porque no tiene cámara y dio un error por una compilación vieja. La app es un monolito sin backend, organizado por capas: pantallas, servicios y datos locales.

## 4. Diario por fases

**F06, cámara y permisos.** Al correr `expo prebuild` salió el error "Plugin is an unexpected object". La causa era que en `app.json` el plugin `expo-image-picker` y su texto de permiso estaban como dos elementos separados; tenían que ir juntos dentro de un mismo arreglo. Lo corregí y comprobé que mi texto en español quedara en el `Info.plist`. Aprendí que los permisos de `app.json` solo llegan al iPhone si hago `prebuild` y recompilo.

**F07, ficha curada.** Ya tenía mi spec de F07, pero la IA escribió otra sin abrir mi zip. La descarté y usamos la mía. Las fichas que escribió la IA son provisionales: yo redactaré el contenido real con fuentes verificadas, por ejemplo la guía oficial de PROFEPA/SEMARNAT para el lobo marino. Noté que el aviso y la precaución general decían casi lo mismo y pedí cambiar la precaución. El scroll no se movía en el simulador, pero en el iPhone funcionó.

**F08, guardar en historial.** Elegí copiar la foto (D14). Pregunté si se podía bajar la calidad de las fotos y la IA me dio dos formas; elegí comprimir al guardar (D15). Se guarda en este orden: copiar la foto, obtener la ubicación y hacer el insert. Si el insert falla, se borra la copia. La ubicación se pide una sola vez, espera máximo 5 segundos y, si se niega, se guarda vacía sin bloquear nada. Probé en el iPhone que los datos persisten, que un doble toque guarda una sola fila y que sin permiso de ubicación se guarda igual.

**F09, ver historial.** Hice una lista con estados de cargando, vacío, datos y error, y una pantalla de detalle. Probé que si falta la foto aparece un recuadro con ícono y que las miniaturas se ven nítidas.

**Preparación de la defensa.** Le pedí lo mínimo que debo saber: el flujo completo, dónde se piden los permisos, cómo es la base de datos, qué es JPEG 0.7 y SQLite, y cuál es la arquitectura.

**Rediseño visual.** Pasé un mockup oscuro color azul marino. La IA me explicó que casi todo se logra con código, pero que las ilustraciones (algas, medusa, nutria) no, ni las pantallas que no están en mi proyecto. Primero se escribió la spec `04-ui.md` y luego se aplicó por pasos: instalar dependencias, crear el tema de colores, hacer cuatro componentes base y aplicarlos pantalla por pantalla, con un commit en cada una. Al final se activó el tema oscuro en los encabezados de navegación. Los emojis son temporales y los cambiaré por íconos.

## 5. Criterio: qué rechacé de la IA y en qué se equivocó

**Lo que rechacé o cambié.** Primero, descarté la spec de F07 que la IA escribió desde cero sin leer mi zip; le pregunté si no podía acceder a él y reconoció el error. Segundo, la IA recomendó la fuente Playfair Display por ser más legible, pero yo elegí Cormorant Garamond porque se parece más al mockup; para cuidar la legibilidad se usa solo en títulos y en pesos gruesos. Tercero, por el poco tiempo antes de la entrega, la IA sugirió rediseñar solo Inicio y Resultado, pero yo pedí las 4 pantallas. Cuarto, yo noté que el aviso y la precaución general eran casi el mismo texto, y se reescribió la precaución.

**En qué se equivocó la IA y cómo lo detecté:**

- La spec de F07 nueva sin leer mi zip: lo noté yo al recordar que ya tenía una spec 7.
- Su `Fichas.ts` lanzaba un error al cargar si una ficha estaba mal, lo que podía cerrar la app. Se vio al leer mi spec, que pide que la app no se caiga. Ahora solo muestra un aviso en consola y solo en desarrollo.
- Cuando le dije que "no se estaba guardando", supuso que era el `throw` de prueba que se quedó en `Fotos.ts`. No era eso: al pegar el log aparecieron 6 filas, así que sí se guardaba. Lo que pasaba es que el log solo se ejecuta al abrir Inicio, por eso no veía filas nuevas.
- Pensó que el scroll fallaba por mi código. Al probar en el iPhone funcionó; el problema era el simulador.
- El texto blanco sobre el botón naranja tenía un contraste de 2.13, que no cumple. Se calculó al armar la spec de diseño y los botones llevan texto oscuro.
- El título del hallazgo salía repetido en Resultado, y se quitó de la ficha.

**Lo que la IA marcó como suposición suya:** las fuentes de las fichas y la distancia de 50 m para el lobo marino, que la ruta de iOS puede cambiar al reinstalar (no verificado en la documentación de Expo), los valores 1024 px y 0.7 (que yo validé viendo las fotos) y los colores del tema, que salen de mirar el mockup y no de medirlos. También reconoció que no puede mandarme recordatorios, así que lo de la foto vertical lo anoté en mi lista de tareas.

Proyecto: Identificador de Hallazgos de Playa (app móvil, React Native + Expo, modelo propio en el teléfono).
Este diario recoge las decisiones de diseño y de alcance, con su motivo y, cuando existe, el resultado medido. Las decisiones D1 a D15 vienen de los specs; de la D16 en adelante son las de la fase final del modelo y de la entrega.

## Decisiones de diseño (D1 a D15)

| # | Decisión | Motivo |
|---|---|---|
| D1 | Clase `otro` en el modelo | El softmax reparte la probabilidad entre las clases conocidas; una foto fuera de ellas puede salir con confianza alta y el umbral no la detiene. |
| D2 | TACO recortado por bounding box, a cuadrado; la app recorta a 1:1 | Etiquetas limpias de un solo objeto; la foto de la app se parece a las de entrenamiento. |
| D3 | Recall ≥ 0.70 por clase + conjunto de campo propio | El desbalance de clases hace engañosa la exactitud global; el campo mide el uso real. |
| D4 | Aviso orientativo fijo y campo `fuente` obligatorio | Las precauciones sobre fauna pueden causar daño si son erróneas; el contenido debe ser verificable. |
| D5 | Mapa sin fotos | Sin moderación ni cuentas, subir fotos expone a contenido inapropiado y a problemas de privacidad. |
| D6 | Modelo on-device, no servido por API | Requisito de funcionar sin internet en la playa; el modelo pesa pocos MB. |
| D7 | Fichas locales (JSON), no en base de datos remota | Agregar una especie exige reentrenar y publicar de todos modos. |
| D8 | Sin autenticación ni usuarios | Sin datos personales; confirmado a criterio del proyecto con el profesor. |
| D9 | MobileNetV2 congelada; fine-tuning opcional | Arquitectura adecuada para on-device; el fine-tuning es una palanca si hace falta. |
| D10 | Latitud y longitud se guardan desde el inicio | Evita migrar el esquema si entra el mapa. |
| D11 | Cámara del sistema con editor de recorte opcional y recorte central obligatorio al cuadrado en el código | El editor del sistema no garantiza el cuadrado (el iPhone devolvió, entre otras, 827×620, 827×689 y 826×786). |
| D12 | Navegación con `@react-navigation/native-stack` | El proyecto parte de la plantilla de Expo con `App.tsx` como entrada; no obliga a reestructurar nada. |
| D13 | Inicio es la pantalla de captura; sin carpeta `stores/` | Evita un toque extra; el estado compartido es mínimo (parámetros de navegación y SQLite). |
| D14 | La foto se copia al directorio de la app antes de insertar la fila; en la base solo se guarda el nombre del archivo | La `uri` del selector o de la cámara es temporal y el historial mostraría fotos rotas. Costo: más código y más espacio. |
| D15 | La copia se reduce (lado mayor 1024 px) y se comprime (JPEG 0.7); el modelo recibe la foto sin comprimir | Que el historial pese poco. Medido: 396 293 → 99 199 y 233 554 → 60 160 bytes (~75 % menos), con nitidez confirmada. |

## Decisiones de la fase final (D16 en adelante)

### D16 — Clases finales del modelo
- **Decisión:** seis clases: `botella_plastico`, `cangrejo_rayado`, `colilla`, `erizo_morado`, `lobo_marino` y `otro`.
- **Alternativas consideradas:** `plastico_film` (descartada), `tapa_botella` (probada en v1 y retirada), popote, vaso desechable, gaviota, pelícano y cangrejo topo.
- **Motivo:** `plastico_film` me parecía difícil de identificar e irrelevante para el usuario. El cangrejo rayado (*Pachygrapsus crassipes*) tenía 650 observaciones en iNaturalist para Baja California, contra 88 del cangrejo topo; el erizo morado tiene 251 y el lobo marino 582.
- **Resultado:** la tapa de botella dio 166 recortes de TACO y se probó en v1; después la quité (ver D18).

### D17 — Cómo se prepara el dataset
- **Decisión:** recortes de TACO por bounding box con margen del 25 %, cuadrados, descartando los menores de 64 px; de iNaturalist, una foto por observación, solo de grado de investigación y no cautivas; partición por grupos con semilla fija, para que los recortes de una misma foto no queden repartidos entre entrenamiento y prueba; tope de archivos por clase.
- **Motivo:** evitar fugas entre entrenamiento y prueba y mantener etiquetas limpias.
- **Resultado:** 292 de 667 recortes de colilla se descartaron por tamaño y quedaron 375.

### D18 — Quitar `tapa_botella` y corregir el sesgo del fondo (modelo v2)
- **Decisión:** quitar la clase `tapa_botella`, agregar fotos propias sobre arena (de `otro` y de las clases) y subir el tope de `otro`.
- **Problema observado con v1 en el iPhone:** conchas clasificadas como tapa de botella con alta confianza; colillas sobre arena clasificadas como lobo marino con 80 % o más; arena sola clasificada como lobo marino con 94 %. El modelo había aprendido "arena = lobo marino" por el fondo. Las métricas de v1 (exactitud 0.837 en prueba) no lo mostraban porque entrenamiento y prueba compartían las mismas fuentes.
- **Motivo:** romper la relación entre el fondo y la clase, Habia pocas imagenes para entranar el modelo con tapas de botella
- **Resultado (v2):** exactitud 0.867 en prueba, `otro` con recall 0.76 (antes 0.57), todas las clases por encima de 0.70, y 0.857 en el conjunto de campo (28 fotos, orientativo por su tamaño).

### D19 — Más negativos para `otro`
- **Decisión:** alimentar `otro` con otras basuras de TACO (latas, popotes, unicel, vasos, lengüetas, vidrio roto, envolturas) y con fotos de iNaturalist de gaviota, pelícano y cangrejo topo. [confirma si usaste estas fuentes en el entrenamiento final]
- **Motivo:** que `otro` represente lo que un usuario sí fotografía en la playa y no es ninguna clase.

### D20 — La normalización va dentro del modelo
- **Decisión:** la capa `Rescaling` forma parte del modelo y la app pasa píxeles en [0, 255] sin normalizar.
- **Motivo:** una sola fuente de verdad para la normalización y menos riesgo de que la app y el entrenamiento difieran.
- **Verificación:** log temporal de la entrada en el iPhone (mínimo 7, máximo 255, media ~150).

### D21 — Umbral de confianza elegido con validación
- **Decisión:** el umbral se calibra con el conjunto de validación y no con el de prueba; la prueba solo se reporta. Umbral en 0.7.
- **Datos (validación, v2):** 0.7 → `otro` rechazada 0.91 y clases bien identificadas 0.80; 0.8 → 0.96 y 0.78; 0.9 → 0.96 y 0.66.
- **Alternativa:** 0.8, donde la curva se quiebra; la diferencia con 0.7 son pocas fotos y está dentro del ruido.
- **Motivo:** [confirma tu razón para elegir 0.7]

### D22 — Variante exportada del modelo
- **Decisión:** `modelo.tflite` en float32 (9.2 MB).
- **Alternativas medidas en validación:** float16 (4.7 MB, misma exactitud 0.872) e int8 dinámico (2.6 MB, 0.867).
- **Motivo:** [confirma tu razón para elegir float32]
- **Nota:** la carga lenta que se observó (28.8 s) no dependía del peso del modelo: el modelo anterior, casi del mismo tamaño, tardaba igual; la causa fue la red a la que estaba conectado el teléfono durante el desarrollo.

### D23 — Mensaje para la clase `otro`
- **Decisión:** el mensaje dice que la foto no coincide con ninguno de los hallazgos que reconoce la app, en lugar de afirmar que no es un hallazgo de playa. 
- **Motivo:** `otro` incluye arena, conchas y otros objetos de la playa; afirmar que no son de la playa era falso.

### D24 — Permisos al iniciar
- **Decisión:** una tarjeta en Inicio explica el uso de la cámara y que de la galería solo se recibe la foto elegida, antes de disparar el diálogo de la cámara. No se pide permiso de fotos.
- **Alternativa descartada:** pedir también el permiso de fotos al arrancar.
- **Motivo:** iOS no combina los permisos en un solo diálogo, y pedir el de fotos concede acceso que la app no usa. Es coherente con F05 (la galería no pide permiso).

### D25 — `SafeAreaView` de `react-native-safe-area-context`
- **Decisión:** reemplazar el `SafeAreaView` de `react-native`, que la documentación de React Native 0.81 marca como deprecado.

### D26 — Alcance de la entrega
- **Decisión:** entregar sin eliminación de hallazgos, sin cuentas de usuario y sin mapa comunitario (F10).
- **Motivo:** proyecto individual con plazo corto; el mapa se planteó como opcional, y la ausencia de cuentas es coherente con D8 y D5.
- **Consecuencia conocida:** el historial vive solo en el teléfono, por lo que desinstalar la app lo borra.
- **Trabajo futuro:** exportar el historial, cuentas y mapa comunitario.

### D27 — Forma de entrega de la app
- **Decisión:** APK de Android con EAS Build como enlace para abrir la app. [pendiente: completar al terminar el build]
- **Motivo:** la app usa un módulo nativo (`react-native-fast-tflite`) y no puede abrirse en Snack ni en Expo Go; compartir un build de iOS requiere una cuenta de desarrollador de pago.


## Decisiones sobre diseño 
### Decisión 1: "Nueva foto" como botón principal cuando no se identifica

- **Contexto:** En "No se pudo identificar", "Guardar hallazgo" era el botón naranja y mi historial se llenaba de entradas sin identificar.
- **Alternativas:** Dejar todo igual, bloquear el guardado de no identificados, o cambiar la jerarquía visual.
- **Decisión:** Cambiar solo la jerarquía: "Nueva foto" es el botón principal y "Guardar" queda secundario. No bloqueo el guardado.
- **Por qué:** No contradice el MVP #3 de la spec y reduce el ruido sin quitar la opción.

### Decisión 2: Dejar fuera las ideas que no caben en el alcance

- **Contexto:** La IA propuso tema claro, mapa personal, animaciones, llamar a PROFEPA y reporte por WhatsApp.
- **Decisión:** No incluirlas en el MVP; quedan como funcionalidades futuras.
- **Por qué:** F06 a F09 siguen sin empezar y mi riesgo real es no terminarlas, no que la interfaz sea sencilla.

### Decisión 3: Quitar la distancia de 50 m del lobo marino

- **Contexto:** La ficha decía que la distancia de 50 m era una suposición mía y no encontré una guía oficial mexicana que la respalde.
- **Alternativas:** Dejar los 50 m, usar la cifra de guías de otros países, o redactar sin número.
- **Decisión:** Redactar sin número hasta tener la fuente oficial (PROFEPA o CONANP).
- **Por qué:** Mi decisión D4 exige que el contenido sea verificable, y una cifra errónea sobre fauna puede causar daño.

### Decisión 4: `fuente` como objeto con verificación pendiente

- **Decisión:** Cada fuente tiene `nombre`, `url` y `consultado`; las dos últimas quedan en `null` hasta abrir y confirmar cada fuente. La validación en `Fichas.ts` avisa con `console.warn` mientras falten.
- **Por qué:** Me deja mostrar la fuente real y tener evidencia de cuándo la verifiqué, sin bloquear el desarrollo.

### Decisión 5: Precauciones como lista y nivel de riesgo con color e ícono

- **Decisión:** `precaucion` pasa de párrafo a lista de frases cortas, y `nivel_riesgo` (seguro, precaución o peligro) define el color, el ícono y el título de la tarjeta.
- **Por qué:** En la playa nadie lee un párrafo, y una tapa de botella no debería verse igual de "peligrosa" que un erizo. Por ahora ninguna ficha es de nivel peligro.

### Decisión 6: No agregar datos curiosos a las fichas

- **Decisión:** Dejar fuera `dato_curioso`.
- **Por qué:** Cada dato extra es otra afirmación que necesitaría fuente (D4). Puede ir después si sobra tiempo.

### Decisión 7: Quitar el campo `categoria`

- **Contexto:** La IA lo agregó (basura o fauna) y ninguna pantalla lo usaba.
- **Alternativas:** Usarlo para un ícono o un filtro en el historial, o quitarlo.
- **Decisión:** Quitarlo del JSON, del tipo y de la validación.
- **Por qué:** Un campo sin uso es un dato más que mantener, y mi spec no lo pide. Puedo reagregarlo si le encuentro una función.

### Decisión 8: Un componente compartido para la tarjeta de precaución

- **Contexto:** La tarjeta estaba dibujada en tres lugares (Resultado, Detalle y `FichaCurada`).
- **Decisión:** Extraer `PrecaucionRiesgo` y hacer que Resultado y Detalle usen `FichaCurada`.
- **Por qué:** Un solo lugar para cambiar colores e íconos, y menos riesgo de que las pantallas se desincronicen. A cambio, en Resultado las tarjetas ahora usan `TarjetaVidrio` en lugar del blur que tenía.

### Decisión 9: Historial con filtro y no identificados más tenues

- **Decisión:** Agregar el filtro "Todos / Identificados" y mostrar más tenues los no identificados, usando `esIdentificado()`.
- **Por qué:** En mi historial 6 de 8 entradas eran "No identificado"; así no desaparecen, pero no estorban.

### Decisión 10: `otro` con título propio, precaución general igual

- **Contexto:** La spec dice que `otro` se trata igual que confianza baja.
- **Decisión:** Para `otro` el título es "Esto no parece un hallazgo de playa", y la precaución general se mantiene en ambos casos.
- **Por qué:** Es más claro para quien fotografió algo que no es de playa, sin contradecir el resto de la spec. Pendiente: actualizar la spec antes de dar esto por cerrado (SDD).

### Decisión 11: Medir el espacio inferior en lugar de fijarlo

- **Contexto:** La barra fija de botones tapaba el aviso orientativo porque el espacio reservado era un 110 fijo.
- **Decisión:** Medir la altura real de la barra con `onLayout` y reservar ese espacio.
- **Por qué:** Funciona en cualquier iPhone y si cambia el contenido de la barra.

### Decisión 12: Commits separados para el cambio de tipo y para la limpieza

- **Decisión:** El cambio del tipo `Ficha` (con las pantallas que lo usan) va en un solo commit; quitar `categoria` va en otro.
- **Por qué:** Un commit con solo el JSON y el tipo no compilaría, y mi spec pide commits atómicos. Para la limpieza hice un commit nuevo en lugar de `--amend`, porque el anterior ya estaba subido.
