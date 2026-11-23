export const INDICACION_CAPTURA =
  'Acércate y centra el objeto: que ocupe casi todo el recuadro.';

export const AVISO_ORIENTATIVO =
  'Identificación orientativa. Ante la duda, no toques el hallazgo y avisa a las autoridades locales.';

export const MENSAJE_NO_IDENTIFICADO = 'No se pudo identificar';

export const PRECAUCION_GENERAL =
  'Mantén la distancia, no lo toques con las manos y aleja a niños y mascotas.';

export const MENSAJE_CAMARA_DENEGADA =
  'Sin acceso a tu cámara no puedes tomar fotos de hallazgos. Actívalo en Ajustes o usa "Elegir de galería".';

export const MENSAJE_FICHA_NO_DISPONIBLE =
  'Ficha no disponible para este hallazgo.';
  
export const MENSAJE_ERROR_GUARDADO =
  'No se pudo guardar el hallazgo. Inténtalo de nuevo.';

export const ETIQUETA_NO_IDENTIFICADO = 'No identificado';

export const MENSAJE_HISTORIAL_VACIO = 'Aún no has guardado hallazgos.';

export const MENSAJE_ERROR_HISTORIAL = 'No se pudo cargar el historial.';

export const MENSAJE_HALLAZGO_NO_ENCONTRADO = 'No se encontró este hallazgo.';

export const MENSAJE_UBICACION_NO_REGISTRADA = 'Ubicación no registrada';

export const TITULO_APP = 'Identificador de Hallazgos de Playa';
export const SUBTITULO_APP = 'Descubre qué encontraste y cuida nuestro mar';
export const TOMAR_FOTO_TITULO = 'Tomar una foto';
export const TOMAR_FOTO_DETALLE = 'Identifica lo que encuentres en la playa';
export const GALERIA_TITULO = 'Elegir de la galería';
export const GALERIA_DETALLE = 'Selecciona una foto de tu dispositivo';
export const SIN_CONEXION_TITULO = 'Funciona sin conexión';
export const SIN_CONEXION_DETALLE = 'Tu información se procesa en tu teléfono';

export const ETIQUETA_DESCRIPCION = 'Descripción';
export const ETIQUETA_PRECAUCION = 'Precaución';
export const ETIQUETA_FUENTE = 'Fuente';
export const ETIQUETA_CONFIANZA = 'Confianza';


import type { NivelRiesgo } from '../tipos/ficha';

export const ETIQUETA_SI_HAY_PROBLEMA = 'Si hay un problema';

// El título de la tarjeta de precauciones cambia según el riesgo:
// "Precaución" sobre una colilla es correcto, sobre una tapa no.
export const ETIQUETA_POR_RIESGO: Record<NivelRiesgo, string> = {
  seguro: 'Qué hacer',
  precaucion: 'Precaución',
  peligro: 'Peligro',
};

// Caso `otro` (D1): la foto no coincide con ninguna de las clases del modelo (puede ser arena, una concha u otro objeto).
export const MENSAJE_NO_ES_HALLAZGO = 'Esta foto no coincide con ninguno de los hallazgos que reconoce la app';
// Caso confianza baja
export const SUGERENCIA_FOTO = 'Acércate, busca buena luz y un fondo simple.';

// Historial
export const FILTRO_TODOS = 'Todos';
export const FILTRO_IDENTIFICADOS = 'Identificados';
export const MENSAJE_SIN_IDENTIFICADOS = 'Aún no tienes hallazgos identificados.';