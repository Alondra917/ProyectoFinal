import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';
import type { NivelRiesgo } from '../tipos/ficha';
import { colores } from './tema';

export type IconoFeather = ComponentProps<typeof Feather>['name'];

// Precaución reutiliza tus colores actuales. Seguro y peligro son nuevos:
// ajústalos a tu paleta si no combinan.
export const coloresRiesgo: Record<
  NivelRiesgo,
  { fondo: string; titulo: string; borde: string }
> = {
  seguro: { fondo: '#10281F', titulo: '#6FD3A0', borde: 'rgba(111,211,160,0.28)' },
  precaucion: {
    fondo: colores.precaucionFondo,
    titulo: colores.precaucionTitulo,
    borde: 'rgba(255,196,107,0.2)',
  },
  peligro: { fondo: '#2E1414', titulo: '#FF8A80', borde: 'rgba(255,138,128,0.32)' },
};

export const iconosRiesgo: Record<NivelRiesgo, IconoFeather> = {
  seguro: 'check-circle',
  precaucion: 'alert-triangle',
  peligro: 'alert-octagon',
};