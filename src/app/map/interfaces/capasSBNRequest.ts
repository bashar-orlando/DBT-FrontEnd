export interface capasSBNRequest {
  file?: Blob | null;
  fileExt?: string
  tipoproc?: string
  epsg?: string
  sUser?: string 
  selLyr : string
  valueField: string
}


export interface QueryParams {
  f: string;
  where: string;
  returnGeometry: string;
  spatialRel: string;
  outFields: string;
}

export interface UserData {
  id: number,
  institucion: string,
  capas: UserDataCapas[]
}

export interface UserDataCapas {
  id_capa: number;
  nombre: string;
  id_institucion: number;
  institucion: string;
  url_servicio: string;
  servicios: string;
  orden_lista: number;
  orden_dibujo: number;
  disponible: number;
  activa: number;

  wms: number
  url_wms: string
  servicio: string

  consulta: number;
  edit: string;
  delete: string;
  tipo: string;
}

export interface FoodNode {
  name: string;
  idCapa?: string;
  idInstitucion?: number;
  opacidad?: number,
  activa?: boolean,
  wms?: boolean,
  children?: FoodNode[];
}



