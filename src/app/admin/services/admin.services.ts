import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.API_URL;

  constructor(
    private httpClient: HttpClient,
  ) { }

  listarInstituciones(parametro: any): any {
    return this.httpClient.get(
      this.apiUrl + 'obtenerInstituciones',
      parametro
    );
  }

  agregarInstitucion(data: any) {
    return this.httpClient.post(this.apiUrl + 'agregarInstitucion', data);
  }

  actualizarInstitucion(data: any) {
    return this.httpClient.put(this.apiUrl + 'actualizarInstitucion', data);
  }  

  eliminarInstitucion(data: any) {
    return this.httpClient.delete(this.apiUrl + 'eliminarInstitucion/'+data);
  }  

  listarCapas(parametro: any): any {
    return this.httpClient.get(
      this.apiUrl + 'obtenerCapas',
      parametro
    );
  }

  agregarCapa(data: any) {
    return this.httpClient.post(this.apiUrl + 'agregarCapa', data);
  }

  actualizarCapa(data: any) {
    return this.httpClient.put(this.apiUrl + 'actualizarCapa', data);
  }  

  eliminarCapa(data: any) {
    return this.httpClient.delete(this.apiUrl + 'eliminarCapa/'+data);
  }  


}
