import type { OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import MapView from '@arcgis/core/views/MapView';

import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer.js";
import esriConfig from "@arcgis/core/config.js";
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";

 
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './master/header/header.component';
import { LefttoolsComponent } from './tools/lefttools/lefttools.component';
import { RighttoolsComponent } from './tools/righttools/righttools.component';
import { BottomtoolsComponent } from './tools/bottomtools/bottomtools.component';
import { CoordenadasComponent } from './tools/coordenadas/coordenadas.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as AOS from 'aos';

import { CalciteComponentsModule } from '@esri/calcite-components-angular';
import { MapService } from '../map/services/map.services';
import { environment } from '../../environments/environment';
import { UserData, UserDataCapas } from './interfaces/capasSBNRequest';



@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    MatIconModule
    , HeaderComponent
    , LefttoolsComponent
    , RighttoolsComponent
    , BottomtoolsComponent
    , CoordenadasComponent
    , CommonModule
    , MatProgressSpinnerModule
    , CalciteComponentsModule
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export default class MapComponent implements OnInit, OnDestroy {
  public view: any = null;
  private _zoom = 6;
  private _center: Array<number> = [-74.44472569330142, -9.7213829];
  public map: any = null;
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  layers: UserData[] = [];
  layersDisponibles: UserDataCapas[] = [];
  token: string | null = null;
  excepcion: string[] = ["shape_leng", "shape_Length", "shape_Area", "FID", "fid_", "objectid_1", "objectid"];

  constructor(
    private mapService: MapService
  ) {
  }

  isLoading = true;
  ngOnInit(): void {
    AOS.init();

    this.initializeMap().then(() => {
      this.inicializar();

    });
  }

  inicializar() {

    this.mapService.obtenerArbol({}).subscribe(
      (res: any) => {
        if (res.success && res.data && Array.isArray(res.data)) {
          this.layers = res.data;
          this.layers.forEach((item: UserData) => {
            this.layersDisponibles.unshift(...item.capas)
          })
        }
 

        this.generaToken()
      },
      (error: any) => {
        console.error(error);
      }
    )
  }

  async generaToken() {

    this.mapService.obtenerToken({}).subscribe(
      (res: any) => {
        if (res.success && res.data) {
          this.token = environment.TOKEN;
          esriConfig.request.interceptors!.push({
            urls: environment.PORTAL_AG,
            before: (params) => {
              params.requestOptions.query = params.requestOptions.query || {};
              params.requestOptions.query.token = this.token;
            },
          }
          ); 

          this.agregarCapas();
        }
      },
      (error: any) => {
        console.error('Error al obtener Token:', error);
      }
    );

  }
 

  async agregarCapas() {
    let acciones: any = [];

    let promesas: any = [];
    let layersOrder = this.layersDisponibles
      .sort((a, b) => a.orden_dibujo - b.orden_dibujo);


    layersOrder.forEach((item: UserDataCapas) => {
      if (item.tipo == "AG") {
        let servicio = `${item.url_servicio}/${item.servicios}`
        promesas.push(this.obtenerLayerPromesa(servicio, this.token!));
      }

      if (item.tipo == "WMS") {
        promesas.push(item)
      }
    })


    Promise.all(promesas).then(values => {
      for (let item in layersOrder) {
        let layer: any = layersOrder[item];


        if (layer.tipo == "AG") {
          let resp: any = values[item];
          let atributos: any = [];
          let fields = resp.fields;

          Array.from(fields).forEach((field: any) => {

            if (this.excepcion.lastIndexOf(field.name) < 0) {
              if (field.alias.substring(0, 1) != "0") {
                atributos.push({
                  fieldName: field.name,
                  label: field.alias
                })
              }
            }
          });

          let popupTemplate = {
            title: layer.nombre + "(" + layer.srs + ")",
            content: [{
              type: "fields",
              fieldInfos: atributos
            }],
            actions: acciones
          }

          let config: any = {
            url: layer.url_servicio,
            id: 'layer_' + layer.id_capa,
            title: layer.institucion + " - " + layer.nombre + "(" + layer.srs + ")",
            opacity: 1,
            legendEnabled: true,
            customParameters : {
              token  : this.token 
            },
            sublayers: [{
              id: parseInt(layer.servicios),
              title: layer.nombre,
              visible: true,
              outFields: ["*"],
              legendEnabled: true,
              popupEnabled: true,
              popupTemplate: popupTemplate
            }]
          }

          let layerAG = new MapImageLayer(config)
          layerAG.visible = (layer.activa == 1 ? true : false)

          this.map.add(layerAG);

          layerAG.on("layerview-create", (event: any) => {
             
          }) 

          layerAG.on("layerview-create-error", (event: any) => {
            console.log("Error", event)
          })

          let subLayer = layer.servicio_wms.split(',').map((resp: any) => ({
            name: resp
            , title: layer.nombre
            , legendUrl: `${layer.url_wms}?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=${layer.servicio_wms}`
          }))

          let layerWMSAux = new WMSLayer({
            id: 'layer_' + layer.id_capa + "-WMS",
            title: layer.institucion + " - " + layer.nombre + "(" + layer.srs + ")" + "(WMS)",
            url: layer.url_wms,
            imageFormat: "png",
            opacity: 0.75,
            legendEnabled: true,
            sublayers: subLayer
          })
          layerWMSAux.visible = false
          this.map.add(layerWMSAux)
          layerWMSAux.on("layerview-create-error", (event: any) => {
            console.log("Error", event)
          })
        }

        if (layer.tipo == "WMS") {
          let subLayer = layer.servicios.split(',').map((resp: any) => ({
            name: resp
            , title: layer.nombre
            , legendUrl: `${layer.url_servicio}?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=${layer.servicios}`
          }))

          let layerWMS = new WMSLayer({
            id: 'layer_' + layer.id_capa,
            title: layer.institucion + " - " + layer.nombre + "(" + layer.srs + ")" + "(WMS)",
            url: layer.url_servicio,
            imageFormat: "png",
            opacity: 0.75,
            legendEnabled: true,
            sublayers: subLayer
          })
          layerWMS.visible = (layer.activa == 1 ? true : false)
          this.map.add(layerWMS)

          let layerWMSAux = new WMSLayer({
            id: 'layer_' + layer.id_capa + "-WMS",
            title: layer.institucion + " - " + layer.nombre + "(" + layer.srs + ")" + "(WMS)",
            url: layer.url_wms,
            imageFormat: "png",
            opacity: 0.75,
            legendEnabled: true,
            sublayers: subLayer
          })
          layerWMSAux.visible = false
          this.map.add(layerWMSAux)

          layerWMSAux.on("layerview-create-error", (event: any) => {
            console.log("Error", event)
          })
        }
      }

      this.isLoading = false;
    })
  }

  private obtenerLayerPromesa(urlServicio: string, token: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const dataLayer = this.mapService.getLayerResponse(urlServicio, token);
      dataLayer.subscribe((registros: any) => {
        resolve(registros);
      })
    });
  }

  async initializeMap(): Promise<any> {
    const container = this.mapViewEl.nativeElement;

    // const googlemapBasemap = new Basemap({
    //   baseLayers: [new WebTileLayer({
    //     urlTemplate: 'https://mts1.google.com/vt/lyrs=s,h@186112443&hl=x-local&src=app&x={col}&y={row}&z={level}&s=Galile',
    //     copyright: 'Google Maps: Satelital',
    //   })],
    //   id: 'googlesat',
    //   title: 'Google Satelital',
    // });

    this.map = new Map({
      basemap: 'hybrid'
      , layers: []
    });

    this.view = new MapView({
      container: container,
      zoom: this._zoom,
      center: this._center,
      map: this.map,
      popup: {
        dockEnabled: true,
        autoCloseEnabled: false,
        dockOptions: {
          buttonEnabled: true,
          position: "bottom-right"
        }
      },
      ui: {
        components: ["attribution"]
      }
    });


    return this.view.when();
  }

  ngOnDestroy(): void {
    if (this.view) {
      this.view.destroy();
    }
  }
}
