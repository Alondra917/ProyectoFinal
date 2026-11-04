import { ETIQUETA_NO_IDENTIFICADO } from '../datos/textos';
import type { Hallazgo } from '../tipos/hallazgo';
import { obtenerFicha } from './Fichas';

export function tituloHallazgo(h: Hallazgo): string {
  if (!h.confiable || h.clase_predicha === 'otro') return ETIQUETA_NO_IDENTIFICADO;
  return obtenerFicha(h.clase_predicha)?.nombre_visible ?? h.clase_predicha;
}

export function fechaLegible(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('es-MX');
}