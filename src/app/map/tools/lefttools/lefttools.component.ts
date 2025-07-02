import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';  
import { environment } from '../../../../environments/environment';
import esriConfig from "@arcgis/core/config.js";
import { DialogComponent } from '../../master/dialog/dialog.component'

import * as print from "@arcgis/core/rest/print.js";
 import PrintParameters from "@arcgis/core/rest/support/PrintParameters";
import { MatDialog } from '@angular/material/dialog';
import { MapService } from '../../services/map.services';
 
 
@Component({
  selector: 'app-lefttools',
  standalone: true,
  imports: [
    MatIconModule
    , MatTooltipModule
    , MatRippleModule
    , CommonModule
    , MatProgressSpinnerModule
  ],
  templateUrl: './lefttools.component.html',
  styleUrl: './lefttools.component.css'
})
export class LefttoolsComponent implements OnInit, AfterViewInit {
  @Input() view?: MapView;
  @Input() webmap?: WebMap;
  token: string = ""
 
  isLoading = false
  private _center: Array<number> = [-74.44472569330142, -9.7213829];
  private _zoom = 6;


  private _extentHistory: any = []
  private _extentHistoryIndx: number = 0;
  private _prevExtent: boolean = false;
  private _nextExtent: boolean = false;
  private _currentExtent: any = null;
  private _preExtent: any = null;
 

  constructor(
    public dialog: MatDialog,
    private readonly mapService: MapService
  ) {
      
  }

  ngOnInit(): void {
    this.token = environment.TOKEN;

    esriConfig.request.interceptors!.push({
      urls: environment.PORTAL_AG,
      before: (params) => {
        params.requestOptions.query = params.requestOptions.query || {};
        params.requestOptions.query.token = this.token;
      },
    }
    );
 

    reactiveUtils.watch(
      () => [this.view!.extent, this.view!.stationary], ([extent, stationary]) => {
        if (stationary) {
          this.extentChangeHandler(extent);
        }
      });
  }

  extentChangeHandler(evt: any): void {
    if (this._prevExtent || this._nextExtent) {
      this._currentExtent = evt;
    } else {
      this._preExtent = this._currentExtent;
      this._currentExtent = evt;
      this._extentHistory.push({
        preExtent: this._preExtent,
        currentExtent: this._currentExtent
      });
      this._extentHistoryIndx = this._extentHistory.length - 1;
    }
    this._prevExtent = this._nextExtent = false;
  }
 
  ngAfterViewInit() {

  }

  acercar(): void {
    let zoom = this.view!.zoom + 1
    if (zoom <= 23)
      this.view!.zoom = zoom
  }

  alejar(): void {
    let zoom = this.view!.zoom - 1
    if (zoom >= 0)
      this.view!.zoom = zoom
  }

  inicio(): void {
    this.view!.goTo({
      center: this._center,
      zoom: this._zoom
    },
      {
        duration: 3000
      });
  }


  ubicar(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {

          const userLocation = new Point({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            spatialReference: this.view!.spatialReference
          });

          const locationSymbol = new SimpleMarkerSymbol({
            color: [0, 112, 255], // Azul
            outline: {
              color: [255, 255, 255], // Blanco
              width: 1
            },
            size: 12
          });

          const locationGraphic = new Graphic({
            geometry: userLocation,
            symbol: locationSymbol
          });

          this.view!.graphics.add(locationGraphic);
          let _centerZoom: Array<number> = [position.coords.longitude, position.coords.latitude];

          this.view!.goTo({
            center: _centerZoom,
            zoom: 16
          },
            {
              duration: 3000
            });

        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
 
  }

  vistaPrevia(): void {
    try {
      if (this._extentHistory[this._extentHistoryIndx].preExtent) {
        this._prevExtent = true;
        this.view!.goTo(this._extentHistory[this._extentHistoryIndx].preExtent);
        this._extentHistoryIndx--;
      }
    } catch (ex) {
      this._prevExtent = true;
      this._extentHistoryIndx++;
    }
  }

  vistaPosterior(): void {

    try {
      this._nextExtent = true;
      this._extentHistoryIndx++;
      this.view!.goTo(this._extentHistory[this._extentHistoryIndx].currentExtent);
    } catch (ex) {
      this._extentHistoryIndx--;
    }
  }

  imprimir() : void{
    this.isLoading = true
    const template : any ={
      format: "PDF",
      exportOptions: {
        dpi: 300
      },
      layout: "LayoutSBN",
      layoutOptions: {
        titleText: "Mapa SBN",
        authorText: "SBN"
      }
    }

    const params = new PrintParameters({
      view: this.view,
      template: template
    }) 
     

      print.execute(environment.IMPRESION_GP, params).
      then(((printResult : any) => {

        this.isLoading = false

        this.mapService.downloadFile(printResult.url).subscribe((blob) => {
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = 'myImpresion.pdf';
          a.click();
          URL.revokeObjectURL(objectUrl);
        });


      })).
      catch((printError) => {
        this.verMensaje("Ocurrio un error al generar el archivo")
      });
 
  }


    verMensaje(mensaje: string): void {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: mensaje,
        disableClose: false
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        this.isLoading = false
      });
    }

}
