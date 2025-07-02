import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, catchError, throwError, map, tap, BehaviorSubject } from 'rxjs';
import { capasSBNRequest, QueryParams } from '../interfaces/capasSBNRequest'

interface TokenResponse {
  token: string;
  expires: number;
}


@Injectable({
  providedIn: 'root'
})


export class MapService {
  private apiUrl = environment.API_URL;
  private apiSBN = environment.API_SBN;
  setLayerEstado: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  setLayer: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor(
    private httpClient: HttpClient,
  ) { }
 

  downloadFile(url: string): Observable<Blob> {
    return this.httpClient.get(url, { responseType: 'blob' });
  }

  obtenerArbol(parametro: any): any {
    return this.httpClient.get(
      this.apiUrl + 'obtenerArbol',
      parametro
    );
  }
 

  getLayerResponse(urlServicio: string, token: string): Observable<string> {
    return this.httpClient.get<any>(urlServicio + `?f=pjson&token=${token}`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = `Error code: ${error.status}, message: ${error.message}`;
        }
        throw new Error(errorMessage);
      })
    )
  }

  layerQuery(
    urlServicio: string,
    geometry: any,
    token: string,
    srs: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('f', 'json')
      .set('where', '') 
      .set('returnGeometry', 'true')
      .set('spatialRel', 'esriSpatialRelIntersects')
      .set('geometry', JSON.stringify(geometry))
      .set('geometryType', 'esriGeometryPolygon')
      .set('inSR', '4326')
      .set('outFields', '*')
      .set('outSR', srs)
      .set('token', token);

      return this.httpClient.get<any>(urlServicio, {params}).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = `Error code: ${error.status}, message: ${error.message}`;
        }
        throw new Error(errorMessage);
      })
    )

      //return this.httpClient.get(urlServicio, { params });
  }

  layerQueryPost(
    urlServicio: string,
    geometry: any,
    token: string,
    srs: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('f', 'json')
      .set('where', '') 
      .set('returnGeometry', 'true')
      .set('spatialRel', 'esriSpatialRelIntersects')
      .set('geometry', JSON.stringify(geometry))
      .set('geometryType', 'esriGeometryPolygon')
      .set('inSR', '4326')
      .set('outFields', '*')
      .set('outSR', srs)
      .set('token', token);

      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      return this.httpClient.post<any>(urlServicio, params.toString(), {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = `Error code: ${error.status}, message: ${error.message}`;
        }
        throw new Error(errorMessage);
      })
    )

      //return this.httpClient.get(urlServicio, { params });
  }

  obtenerLayer(urlServicio: string, token: string): any {
    return this.httpClient.get(
      urlServicio + `?f=pjson&token=${token}`

    );
  }

  obtenerToken(parametro: any): any {
    return this.httpClient.get(
      this.apiUrl + 'obtenerToken',
      parametro
    );
  }

  // generateTokenOld(portalUrl: string, username: string, password: string): Observable<TokenResponse> {
  //   const url = `${portalUrl}/sharing/rest/generateToken`;
  //   const params = new HttpParams()
  //     .set('username', username)
  //     .set('password', password)
  //     .set('client', 'referer')
  //     .set('referer', window.location.hostname)
  //     .set('f', 'json');

  //   return this.httpClient.post<TokenResponse>(url, params);
  // }

  capasSBN(datos: capasSBNRequest): Observable<any> {
    const url = this.apiSBN;

    const formData = new FormData();
    formData.append('file', datos.file!)
    formData.append('fileExt', datos.fileExt!)
    formData.append('tipoproc', datos.tipoproc!)
    formData.append('epsg', datos.epsg!)
    formData.append('sUser', datos.sUser!)
    formData.append('selLyr', datos.selLyr)
    formData.append('valueField', datos.valueField)

    return this.httpClient.post<any>(url, formData);
  }

  obtenerLayerSBN(urlServicio: string, params: QueryParams): any {
     let httpParams = new HttpParams()
      .set('f', params.f)
      .set('where', params.where)
      .set('returnGeometry', params.returnGeometry)
      .set('spatialRel', params.spatialRel)
      .set('outFields', params.outFields);

      return this.httpClient.get(urlServicio, { params: httpParams });

  }

}
