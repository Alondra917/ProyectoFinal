export type Hallazgo = {
  id: number;
  foto: string;
  clase_predicha: string;
  confianza: number;
  confiable: boolean;
  fecha: string;
  latitud: number | null;
  longitud: number | null;
};