## Bitácora de IA

# Sesion sobre la mejora de el modelo y toques finales
Herramienta: Claude (Anthropic), en conversaciones de claude.ai. Registro las interacciones más relevantes del modelo de clasificación y de los ajustes finales de la app.

### Interacción 1 — Datos: basura de TACO y fauna de iNaturalist
- **Qué le pedí (prompt):** "Analiza esto, dime si tienes alguna duda, si no empecemos directo con el modelo". Después: "ponme algo más que un usuario querría identificar y que afecte la vida marina", y "¿y si mejor metemos una especie... un cangrejo o un ave que se vea seguido en las playas de Ensenada?".
- **Qué me dio (resumen en 1-2 líneas):** Un plan por días y dos notebooks: uno que recorta los objetos de TACO por bounding box y otro que descarga fotos de iNaturalist (una por observación, con paginación). También opciones de clases nuevas y una celda para contar observaciones reales.
- **Qué estaba mal o me faltó:** Probó el código solo con datos simulados. Sus afirmaciones sobre qué animales son comunes en Ensenada y cuánto afectan a la fauna eran suposiciones sin verificar (lo avisó, pero no las comprobó). Calculó unos ~100 recortes de tapas y salieron 166.
- **Qué corregí o cambié yo:** Corrí los notebooks con los datos reales y revisé los conteos y los recortes. Descarté `plastico_film` porque me parecía difícil de identificar. Elegí el cangrejo rayado (650 observaciones) y descarté el cangrejo topo (88). Agregué `tapa_botella` y más adelante la quité.
- **Qué aprendí:** Que conviene contar cuántos datos hay antes de decidir una clase, y revisar a ojo los recortes antes de entrenar.

### Interacción 2 — Notebook de entrenamiento y evaluación
- **Qué le pedí (prompt):** Le pasé el notebook del modelo de prueba y le dije "lo respetaremos, solo agregaremos lo de otros".
- **Qué me dio (resumen en 1-2 líneas):** Un notebook con la misma arquitectura (MobileNetV2 congelada) y la normalización dentro del modelo, partición por grupos con semilla fija, tope por clase, aumento de datos ligero y exportación a TFLite en varias variantes.
- **Qué estaba mal o me faltó:** Me dio una celda para calibrar el umbral usando el conjunto de prueba, y los specs (`03-model.md` y F04) dicen que se calibra con validación. Lo detectó al revisar los specs.
- **Qué corregí o cambié yo:** Volví a correr el cálculo con el conjunto de validación y elegí el umbral con esos números.
- **Qué aprendí:** Que el conjunto de prueba no se usa para ajustar nada, solo para reportar el resultado final.

### Interacción 3 — Pruebas en el iPhone con el modelo v1
- **Qué le pedí (prompt):** "Identifica conchas de mar como tapas de botella con un muy alto porcentaje", las colillas sobre arena salían como lobo marino con 80 % o más, y una imagen de solo arena daba 94 % lobo marino.
- **Qué me dio (resumen en 1-2 líneas):** Logs temporales (`[ENTRADA]`, `[PROBS]`, tiempos) y la hipótesis de una doble normalización del preprocesamiento. Después, que el modelo había aprendido "arena = lobo marino" por el fondo, y un plan para reentrenar con fotos propias sobre arena.
- **Qué estaba mal o me faltó:** La hipótesis de la doble normalización era incorrecta: los logs mostraron la entrada correcta en [0, 255]. Las métricas del modelo (exactitud 0.84) no delataban el problema porque entrenamiento y prueba compartían las mismas fuentes.
- **Qué corregí o cambié yo:** Probé con la prueba de arena sola, que mostró el sesgo del fondo. Tomé fotos propias sobre arena y de las clases sobre arena [confirma cantidades], quité `tapa_botella` y reentrené. En v2, el recall de `otro` subió de 0.57 a 0.76 y la exactitud en prueba fue 0.867.
- **Qué aprendí:** Que las métricas de un conjunto del mismo origen que el entrenamiento pueden ocultar atajos del modelo, y que hay que probar con fotos reales del teléfono.

### Interacción 4 — Carga lenta del modelo
- **Qué le pedí (prompt):** "Tardó como 2 minutos en cargar el modelo, lo cual es mucho, recuerda que la app debe ser liviana", y después "busca una manera de que se descargue más ligero".
- **Qué me dio (resumen en 1-2 líneas):** Mediciones con logs, la hipótesis de que el tamaño del modelo era el problema, versiones cuantizadas (float16 e int8) y una prueba A/B con el modelo viejo.
- **Qué estaba mal o me faltó:** La hipótesis del tamaño era incorrecta: el modelo viejo pesaba casi lo mismo (9.19 MB contra 9.22 MB) y también tardó 28.8 s. Los tiempos casi idénticos sugerían una espera de red, no trabajo de carga.
- **Qué corregí o cambié yo:** Ejecuté la prueba A/B y noté que estaba conectada a una subred. Al cambiar de red volvió a cargar rápido.
- **Qué aprendí:** Que el build de desarrollo descarga los recursos desde Metro por la red, y que hay que medir antes de optimizar.

### Interacción 5 — Umbral de confianza
- **Qué le pedí (prompt):** Le pasé los resultados por umbral en validación del modelo v2.
- **Qué me dio (resumen en 1-2 líneas):** Una lectura del intercambio entre rechazar `otro` e identificar bien las clases reales, y una recomendación de 0.8, donde la curva se quiebra.
- **Qué estaba mal o me faltó:** La diferencia entre 0.7 y 0.8 es de unas pocas fotos de validación, dentro del ruido; la elección dependía de un criterio y no solo de los datos.
- **Qué corregí o cambié yo:** Dejé el umbral en 0.7 en `Clasificador.ts` [confirma tu razón] y quité los logs temporales para la entrega.
- **Qué aprendí:** Que un umbral se elige con validación y que con pocas fotos las diferencias pequeñas no son concluyentes.

### Interacción 6 — Mensaje para la clase `otro`
- **Qué le pedí (prompt):** Le mostré que cuando la foto cae en `otro` (por ejemplo, solo arena) la app decía que no era un hallazgo de playa.
- **Qué me dio (resumen en 1-2 líneas):** Una redacción nueva para `MENSAJE_NO_ES_HALLAZGO` que dice que la foto no coincide con ninguno de los hallazgos que reconoce la app.
- **Qué estaba mal o me faltó:** El texto original partía de una idea que ya no era cierta: `otro` incluye arena, conchas y otros objetos de la playa.
- **Qué corregí o cambié yo:** [confirma si aplicaste el texto nuevo o uno propio en `textos.ts`].
- **Qué aprendí:** Que el texto de la interfaz debe describir lo que el modelo realmente decide.

### Interacción 7 — Permisos al iniciar y SafeAreaView
- **Qué le pedí (prompt):** Que al iniciar la app se pidiera la cámara y en el mismo mensaje la galería, aunque solo usamos una foto elegida, "para que el usuario se sienta seguro"; y que arreglara el `SafeAreaView` deprecado.
- **Qué me dio (resumen en 1-2 líneas):** Me explicó que iOS no combina permisos en un solo diálogo y que pedir el de fotos daría acceso que la app no usa. Propuso una tarjeta explicativa antes del permiso de cámara y verificó en la documentación que `SafeAreaView` de React Native está deprecado.
- **Qué estaba mal o me faltó:** No pudo probar nada en un dispositivo; el código quedó pendiente de mi prueba en el iPhone.
- **Qué corregí o cambié yo:** Elegí la opción de explicar sin pedir permiso de fotos, apliqué los cambios y probé en el iPhone.
- **Qué aprendí:** Que se pueden dar garantías de privacidad sin pedir permisos innecesarios, y que conviene verificar en la documentación actual lo que está deprecado.

### Interacción 8 — Eliminar hallazgos y alcance de la entrega
- **Qué le pedí (prompt):** "Que se puedan eliminar los hallazgos guardados". Después dudé de entregar sin el mapa ni usuarios.
- **Qué me dio (resumen en 1-2 líneas):** Observó que eliminar no existe en ningún spec (F09 dice que el historial es de solo lectura) y que en SDD se necesita spec antes de programar. Propuso opciones (botón en el detalle, mantener presionado o deslizar) y una recomendación.
- **Qué estaba mal o me faltó:** No conocía la rúbrica del profesor, así que no pudo asegurar qué se evalúa.
- **Qué corregí o cambié yo:** Decidí no implementar la eliminación y entregar sin cuentas ni mapa, documentando esa limitación (D8 y D5).
- **Qué aprendí:** Que el alcance se decide y se justifica, y que no tener cuentas implica que el historial se pierde al desinstalar la app.

### Interacción 9 — Colaboración con los specs
- **Qué le pedí (prompt):** "Ya no me des archivos de los specs sin avisarme antes de que lo vayas a hacer".
- **Qué me dio (resumen en 1-2 líneas):** Antes me había entregado un spec editado (F02) sin avisar.
- **Qué estaba mal o me faltó:** Entregó el archivo sin avisarme antes.
- **Qué corregí o cambié yo:** Le fijé la regla: avisarme qué specs editaría y esperar a que se los pida.
- **Qué aprendí:** Que debo decidir yo cuándo cambian los documentos de especificación.

### Interacción 10 — Cómo entregar la app
- **Qué le pedí (prompt):** Le pasé los requisitos de entrega de Classroom (repositorio, enlace para abrir la app o APK, bitácora y diario de decisiones).
- **Qué me dio (resumen en 1-2 líneas):** Observó que la app no corre en Snack ni en Expo Go por usar un módulo nativo y propuso un APK de Android con EAS Build.
- **Qué estaba mal o me faltó:** La app nunca se ha compilado ni probado en Android.
- **Qué corregí o cambié yo:** [completa al terminar el build]
- **Qué aprendí:** [completa al terminar el build]


# Proyecto: Identificador de Hallazgos de Playa. Periodo cubierto: sesión de mejora de diseño y fichas (22/11/2026).

### Interacción 1

- **Qué le pedí (prompt):** Le mandé las 4 capturas de mi app (Inicio, Resultado, Historial y Detalle) y le dije que quería mejorarla, que ya había probado la skill impecable sin ver mucha mejora, y le pedí sugerencias. Le dije que uso React Native con Expo Go.
- **Qué me dio (resumen en 1-2 líneas):** Una lista larga de sugerencias ordenadas por impacto: rediseñar "No se pudo identificar", contenido accionable por tipo de hallazgo, mejoras visuales, experiencia en la playa y mejoras técnicas.
- **Qué estaba mal o me faltó:** Eran sugerencias genéricas. No conocía mi spec, así que propuso cosas que ya tenía decididas (clase `otro`, umbral de confianza) y funciones que no caben en 8 semanas (mapa, tema claro, llamar a PROFEPA).
- **Qué corregí o cambié yo:** Le compartí `00-project.md` (la spec SDD) para que ajustara las sugerencias a mi alcance y cronograma.
- **Qué aprendí:** Antes de pedir ideas hay que darle a la IA el contexto del proyecto (alcance, decisiones, tiempo). Sin eso sugiere de más y no distingue lo que ya está resuelto.

### Interacción 2

- **Qué le pedí (prompt):** Pegué la spec completa (problema, MVP, features, cronograma, registro de decisiones) y le dije que eso explicaba más del trabajo.
- **Qué me dio (resumen en 1-2 líneas):** Reajustó su lectura: separó lo que ya estaba bien resuelto de lo pendiente, recomendó recortar ideas fuera de alcance y señaló que el texto "PROVISIONAL" de las fichas contradice mi propia decisión D4 (fuente verificable).
- **Qué estaba mal o me faltó:** Se quedó en recomendaciones, no en tareas concretas. Además me advirtió que TFLite normalmente no funciona en Expo Go, algo que tengo que confirmar yo contra mi configuración real (dev build).
- **Qué corregí o cambié yo:** Tomé su orden de prioridades (dataset y modelo, F04 y F07, F08 y F09, pulido visual) y pasé a trabajar el contenido de las fichas.
- **Qué aprendí:** La IA razona bien contra una spec, pero sus advertencias técnicas son hipótesis que debo verificar. También aprendí que mi spec ya me daba el criterio para juzgar sus propuestas.

### Interacción 3

- **Qué le pedí (prompt):** Pegué mi `fichas.json` con las seis fichas y le pedí que me ayudara a mejorarlo. Después le pasé mi archivo de textos.
- **Qué me dio (resumen en 1-2 líneas):** Buscó fuentes, corrigió errores de contenido (por ejemplo, el cangrejo "que se clava" y la tapa enredada) y propuso una estructura nueva: precaución como lista, `nivel_riesgo`, `si_hay_problema` y `fuente` como objeto con nombre, url y fecha de consulta. Luego generó el `fichas.json` completo.
- **Qué estaba mal o me faltó:** No encontró una fuente oficial mexicana para los 50 m de distancia al lobo marino, así que ese número no tiene respaldo. Además agregó un campo `categoria` que ninguna pantalla usa. También notó que la foto etiquetada como lobo marino californiano parece un lobo fino, pero no pudo confirmarlo desde una captura.
- **Qué corregí o cambié yo:** Quité el número de distancia del lobo marino hasta verificarlo, dejé `url` y `consultado` en `null` hasta abrir cada fuente, y eliminé el campo `categoria` de las fichas, del tipo y de la validación.
- **Qué aprendí:** Hay que preguntarle para qué sirve cada campo antes de aceptarlo, porque justificó `categoria` con una razón imprecisa. Y las fuentes las tengo que verificar yo: la IA puede proponer candidatas, no garantizar que lo que dice la ficha esté respaldado.

### Interacción 4

- **Qué le pedí (prompt):** Le pasé el código de `FilaHallazgo`, `FichaCurada`, `AvisoOrientativo` y `HistorialScreen`, y después `Fichas.ts`, `Presentacion.ts` y el tipo `Ficha`, para que adaptara todo al formato nuevo de las fichas.
- **Qué me dio (resumen en 1-2 líneas):** Componentes adaptados al JSON nuevo, colores de riesgo en `riesgo.ts`, un filtro "Todos / Identificados" en el historial y los no identificados más tenues.
- **Qué estaba mal o me faltó:** Asumió que un hallazgo no identificado tenía `clase === null`. Mi tipo usa `confiable` y `clase_predicha`, y ya tenía la función `esIdentificado()`. También mi `validar` original en `Fichas.ts` habría fallado con el formato nuevo porque llamaba `.trim()` sobre un arreglo y un objeto.
- **Qué corregí o cambié yo:** Le pasé `Fichas.ts` y `Presentacion.ts` para que corrigiera la suposición, y reemplacé mi tipo `Ficha` viejo por el nuevo.
- **Qué aprendí:** Cuando la IA no ve mi código, rellena huecos con suposiciones. Conviene pasarle los archivos reales y pedirle que marque lo que está asumiendo.

### Interacción 5

- **Qué le pedí (prompt):** Pegué una captura de un error de TypeScript (`Type 'FuenteFicha' is not assignable to type 'ReactNode'`).
- **Qué me dio (resumen en 1-2 líneas):** Explicó que `ficha.fuente` ahora es un objeto y no se puede mostrar dentro de un `<Text>`, y sugirió usar `ficha.fuente.nombre` o reemplazar el componente.
- **Qué estaba mal o me faltó:** Dio por hecho que el archivo era el `FichaCurada.tsx` viejo. En realidad el error venía de `ResultadoScreen`, que dibuja la ficha con su propio código y no usa `FichaCurada`.
- **Qué corregí o cambié yo:** Corregí `ficha.fuente.nombre` en `ResultadoScreen` y seguí revisando las demás pantallas con `tsc`.
- **Qué aprendí:** Un error de TypeScript sin el nombre del archivo lleva a la IA a adivinar. Debo decirle exactamente dónde sale.

### Interacción 6

- **Qué le pedí (prompt):** Le mandé capturas del resultado y del historial y le pregunté para qué servían los colores y el riesgo, si yo no veía que los hubiera implementado. Después le pasé `ResultadoScreen.tsx`.
- **Qué me dio (resumen en 1-2 líneas):** Reconoció que mi pantalla de Resultado no usaba su componente, reescribió `ResultadoScreen` con color e ícono por nivel de riesgo, precauciones en lista, espacio inferior medido con `onLayout` y "Nueva foto" como botón principal cuando no se identifica.
- **Qué estaba mal o me faltó:** Había dado el cambio por hecho sin comprobar que la pantalla usara el componente nuevo. También me dijo que podía borrar `FichaCurada.tsx` si no se usaba, pero `DetalleHallazgoScreen` sí la usa.
- **Qué corregí o cambié yo:** Le señalé que `FichaCurada` se usa en Detalle. Con eso extrajo un componente compartido, `PrecaucionRiesgo`, y dejó que Resultado y Detalle usen `FichaCurada`, en lugar de tener tres copias de la tarjeta.
- **Qué aprendí:** Hay que comprobar en el simulador que el cambio se vea, no confiar en que "ya está". Y antes de borrar un archivo, buscar dónde se importa.

### Interacción 7

- **Qué le pedí (prompt):** Pegué los logs de la consola con seis avisos de fuente sin verificar y uno de `SafeAreaView` obsoleto.
- **Qué me dio (resumen en 1-2 líneas):** Explicó que ninguno era un error: los seis avisos vienen de la validación de fuentes y el de `SafeAreaView` se arregla importándolo de `react-native-safe-area-context` con `edges={['bottom']}`.
- **Qué estaba mal o me faltó:** No podía saber si otros archivos también importaban `SafeAreaView` de `react-native`; me dio un `grep` para buscarlos.
- **Qué corregí o cambié yo:** (completar: qué archivos tenían el import y si el aviso desapareció).
- **Qué aprendí:** Un aviso no es un error. Los seis de fuentes son un recordatorio útil que desaparece cuando verifique cada fuente.

### Interacción 8

- **Qué le pedí (prompt):** Le pedí cómo subir a git solo los cambios de diseño, sin mis otros cambios; después, un commit solo para quitar la categoría.
- **Qué me dio (resumen en 1-2 líneas):** Una secuencia de `git add` archivo por archivo, `git add -p` para archivos mezclados y una verificación con `git diff --staged --stat` antes del commit.
- **Qué estaba mal o me faltó:** Al ver mi `--stat`, notó que `fichas.json` mostraba muchas más líneas borradas de las esperadas (6, una por ficha) y me pidió revisarlo antes de subirlo.
- **Qué corregí o cambié yo:** (completar: qué encontré en el diff de `fichas.json` y cómo lo resolví).
- **Qué aprendí:** Revisar el diff antes del commit evita subir cambios que no quería. Un cambio que rompe la compilación (el tipo `Ficha`) debe ir en un solo commit para que cada commit compile.
