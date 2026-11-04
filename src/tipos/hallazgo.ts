export type Hallazgo = {
  id: number;
  foto: string; // URI completa lista para <Image>; en la base solo se guarda el nombre del archivo
  clase_predicha: string;
  confianza: number;
  confiable: boolean;
  fecha: string;
  latitud: number | null;
  longitud: number | null;
};