// src/tipos/ficha.ts

export type NivelRiesgo = 'seguro' | 'precaucion' | 'peligro';
export type CategoriaHallazgo = 'basura' | 'fauna';

export type FuenteFicha = {
  nombre: string;
  url: string | null;
  consultado: string | null;
};

export type Ficha = {
  clase: string;
  nombre_visible: string;
  categoria: CategoriaHallazgo;
  nivel_riesgo: NivelRiesgo;
  descripcion: string;
  precaucion: string[];
  si_hay_problema: string | null;
  fuente: FuenteFicha;
};