import { AfterViewInit, booleanAttribute, Component, ElementRef, Input, OnInit, signal, ViewChild, ChangeDetectionStrategy, inject, DebugElement, OnDestroy, Signal, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { DialogComponent } from '../../master/dialog/dialog.component'
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Map from '@arcgis/core/Map';

import MapView from '@arcgis/core/views/MapView';
import Graphic from "@arcgis/core/Graphic.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import { capasSBNRequest, QueryParams } from '../../interfaces/capasSBNRequest'
import { MapService } from '../../services/map.services';
import { environment } from '../../../../environments/environment';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Polygon from "@arcgis/core/geometry/Polygon.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import Point from '@arcgis/core/geometry/Point';
import proj4 from 'proj4';
import { loadModules } from 'esri-loader';
import Sketch from "@arcgis/core/widgets/Sketch.js";
import { kml } from "@tmcw/togeojson";
import { MatExpansionModule } from '@angular/material/expansion';
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import shp from 'shpjs';
import WebMap from '@arcgis/core/WebMap';
import esriConfig from "@arcgis/core/config.js";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import { CdkDrag } from '@angular/cdk/drag-drop';
import * as geojson from 'geojson';
import * as shpwrite from '@mapbox/shp-write';
import * as XLSX from 'xlsx';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import dxfParser from "dxf-parser";

interface Criterios {
  value: string;
  viewValue: string;
}
interface Typefile {
  value: string;
  viewValue: string;
  url: string
}
interface sistemacoord {
  value: string;
  viewValue: string;
}
interface campoprocesa {
  value: string
  text: string
  url: string
}

@Component({
  selector: 'app-righttools',
  standalone: true,
  imports: [MatIconModule
    , MatButtonModule
    , MatTooltipModule
    , MatMenuModule
    , CommonModule
    , MatToolbarModule
    , FormsModule
    , MatInputModule
    , MatSelectModule
    , MatFormFieldModule
    , MatTabsModule
    , MatDividerModule
    , MatListModule
    , MatDialogModule
    , MatProgressSpinnerModule
    , MatExpansionModule
    , CdkDrag,
    MatChipsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './righttools.component.html',
  styleUrl: './righttools.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class RighttoolsComponent implements OnInit, AfterViewInit, OnDestroy {

  desactivarArrastre = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];


  // --- Entidad Layer ---
  entityCtrl = new FormControl('');
  entities = signal<string[]>([]);
  allEntities: string[] = [];

  filteredEntities!: Observable<string[]>
  private _allEntitiesSource = new BehaviorSubject<string[]>([]);
  @ViewChild('entityInput') entityInput!: ElementRef<HTMLInputElement>;


  // --- Interés Layer ---
  interestCtrl = new FormControl('');
  interests = signal<string[]>([]);
  allInterests: string[] = []

  filteredInterests!: Observable<string[]>;
  private _allInteresSource = new BehaviorSubject<string[]>([]);
  @ViewChild('interestInput') interestInput!: ElementRef<HTMLInputElement>;

  addInterest(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.interests().includes(value)) {
      this.interests.update(interests => [...interests, value]);
    }
    event.chipInput.clear();
    this.interestCtrl.setValue(null);
  }

  removeInterest(interest: string): void {
    this.interests.update(interests => {
      const index = interests.indexOf(interest);
      if (index >= 0) {

        const currentInteres = this._allInteresSource.getValue();
        currentInteres.push(interest)
        this._allInteresSource.next(currentInteres);

        interests.splice(index, 1);
      }
      return [...interests];
    });
  }

  selectedInterest(event: any): void {
    let entityToRemove = event.option.value
    this.interests.update(interests => {
      const index = interests.indexOf(entityToRemove);
      if (index == -1) {

        const currentInteres = this._allInteresSource.getValue();
        const updateInteres = currentInteres.filter(e => e !== entityToRemove);
        this._allInteresSource.next(updateInteres);

        interests.push(entityToRemove)
      }
      let data = [...interests]
      return data;
    });

    this.interestInput.nativeElement.value = '';
    this.interestCtrl.setValue(null);

  }

  readonly panelOpenState = signal(false);
  @Input() view?: MapView
  @Input() webmap?: WebMap
  @Input() layers?: any[]

  @ViewChild('myLoading') myLoadingRef!: ElementRef;
  @ViewChild('myLayerDisponibles_file') myLayerDisponibles_file!: ElementRef;
  @ViewChild('myLayerDisponibles_dibujo') myLayerDisponibles_dibujo!: ElementRef;
  @ViewChild('myLayerDisponibles_buffer') myLayerDisponibles_buffer!: ElementRef;
  @ViewChild('myLayerDisponibles_sbn') myLayerDisponibles_sbn!: ElementRef;

  graphicsLayer: GraphicsLayer | undefined;
  @ViewChild('capaSBN') capaSBN!: MatSelect;
  @ViewChild('busquedaCapasSBN') busquedaCapasSBN!: ElementRef;
  @ViewChild('archivoBtn') archivoBtn!: ElementRef;

  @ViewChild('busquedaCoordenadasSistema') busquedaCoordenadasSistema!: MatSelect;
  @ViewChild('busquedaCoordenadasNorte') busquedaCoordenadasNorte!: ElementRef;
  @ViewChild('busquedaCoordenadasEste') busquedaCoordenadasEste!: ElementRef;
  @ViewChild('busquedaCoordenadasRadio') busquedaCoordenadasRadio!: ElementRef;

  @ViewChild('institucionSelect') institucionSelect!: MatSelect;
  @ViewChild('tipoArchivoSelect') tipoArchivoSelect!: MatSelect;
  @ViewChild('tipoArchivoSistemaSelect') tipoArchivoSistemaSelect!: MatSelect;

  busquedaCargaDefecto: string = "zip"
  busquedaCargaDefectoVisible: boolean = true
  busquedaCoordenadasDefecto: string = "32718"
  requestSBN!: capasSBNRequest
  queryParams !: QueryParams

  // show = true;
  hide = signal(true);
  hidex = signal(true);
  hideds = signal(true);
  style = signal(true);
  elem = document.documentElement;
  hide1 = false;
  hide2 = false;
  cx: any;
  cy: any;
  cr: any

  nombreArchivo: string = ''
  mostrarDiv = false
  isLoading: boolean = false;
  isResultado: boolean = false;

  resultFeature: any;
  resultFeatureSelected: any;
  geometryEngine: any;
  projectionEngine: any;
  draw!: Sketch
  fillSymbol!: SimpleFillSymbol
  fillSymbolSelected!: SimpleFillSymbol

  layerDisponibles!: any[];
  token: string = ''
  responseLayer: any = signal<[]>;

  listaInstitucionDefecto: Number = 0;
  listaInstitucion: any[] = [];
  listaInstitucionCapas: any[] = [];

  constructor(
    private mapService: MapService
    , public dialog: MatDialog
    , private cdr: ChangeDetectorRef
  ) {

  }

  ngAfterViewInit() {
    this.graphicsLayer = new GraphicsLayer()
    this.draw = new Sketch({
      layer: this.graphicsLayer,
      view: this.view,
      creationMode: "update"
    })
  }

  async ngOnInit() {
    this.token = environment.TOKEN;

    esriConfig.request.interceptors!.push({
      urls: environment.PORTAL_AG,
      before: (params) => {
        params.requestOptions.query = params.requestOptions.query || {};
        params.requestOptions.query.token = this.token;
      },
    }
    );

    this.fillSymbol = new SimpleFillSymbol({
      color: [255, 0, 0, 0.2],
      outline: {
        color: [255, 0, 0],
        width: 2
      }
    });

    this.fillSymbolSelected = new SimpleFillSymbol({
      color: [153, 255, 255, 0.3],
      outline: {
        color: [0, 255, 255],
        width: 2
      }
    });


    try {
      const [geometryEngine, projectionEngine] = await loadModules([
        'esri/geometry/geometryEngine',
        'esri/geometry/projection'
      ]);


      this.geometryEngine = geometryEngine;

      projectionEngine.load().then(() => {
        this.projectionEngine = projectionEngine;
      })

      const overviewMap = new Map({
        basemap: "hybrid"
      });

      const mapView = new MapView({
        container: "overviewDiv",
        map: overviewMap,
        constraints: {
          rotationEnabled: false
        }
      });

      mapView.ui.components = [];

      mapView.when(() => {
        mapView.extent = this.view!.extent.expand(2);

        this.view!.when(() => {

          const extentDgraphic = new Graphic({
            geometry: null,
            symbol: {
              type: "simple-fill",
              color: [0, 0, 0, 0.5],
              outline: null
            }
          });
          mapView.graphics.add(extentDgraphic);

          const extentDebouncer = promiseUtils.debounce(async () => {
            if (this.view!.extent) {
              await mapView.goTo(this.view!.extent.expand(1.5), { animate: false, duration: 0 });
            }
          });

          reactiveUtils.watch(
            () => this.view!.extent,
            (extent) => {
              extentDebouncer().then(() => {
                extentDgraphic.geometry = extent;
              });
            },
            {
              initial: true
            }
          )
        });
      });

    } catch (error) {
      console.error('Error al cargar módulos de Esri:', error);
    }

    setTimeout(() => {
      this.listaInstitucion.push(
        {
          value: 0
          , text: "[Todas las entidades]"
        }
      )

      this.layers!.forEach((institucion: any) => {
        let contiene = institucion.capas.filter((resp: any) => resp.consulta == 1)
        if (contiene.length > 0) {
          this.listaInstitucion.push(
            {
              value: institucion.id
              , text: institucion.institucion
            }
          )

          institucion.capas.filter((resp: any) => resp.consulta == 1 && resp.tipo == "AG").forEach((capa: any) => {
            this.listaInstitucionCapas.push(institucion.institucion + " " + capa.nombre + "(" + capa.srs + ")")
          });

        }

      });

      this.allInterests = this.listaInstitucionCapas

      this._allEntitiesSource.next(this.allEntities);
      this._allInteresSource.next(this.allInterests);

      this.filteredEntities = combineLatest([
        this.entityCtrl.valueChanges.pipe(startWith('')),
        this._allEntitiesSource.asObservable()
      ]).pipe(
        map(([inputValue, allEntities]) => this._filter(inputValue || '', allEntities))
      )

      this.filteredInterests = combineLatest([
        this.interestCtrl.valueChanges.pipe(startWith('')),
        this._allInteresSource.asObservable()
      ]).pipe(
        map(([inputValue, allInterests]) => this._filter(inputValue || '', allInterests))
      )

      this.cdr.detectChanges();

    }, 1000);

  }

  addEntity(newEntity: string): void {
    const currentEntities = this._allEntitiesSource.getValue();
    if (!currentEntities.includes(newEntity)) {
      this._allEntitiesSource.next([...currentEntities, newEntity]);
    }
  }

  removeEntityAll(): void {
    this._allEntitiesSource.next([]);
  }

  removeEntity(entityToRemove: string): void {
    this.entities.update(entities => {
      const index = entities.indexOf(entityToRemove);
      if (index >= 0) {

        const currentEntities = this._allEntitiesSource.getValue();
        currentEntities.push(entityToRemove)
        this._allEntitiesSource.next(currentEntities);
        entities.splice(index, 1);
      }
      let data = [...entities]
      return data;
    });

  }

  selectedEntity(event: any): void {
    let entityToRemove = event.option.value
    this.entities.update(entities => {
      const index = entities.indexOf(entityToRemove);
      if (index == -1) {

        const currentEntities = this._allEntitiesSource.getValue();
        const updatedEntities = currentEntities.filter(e => e !== entityToRemove);
        this._allEntitiesSource.next(updatedEntities);

        entities.push(entityToRemove)
      }
      let data = [...entities]
      // this.layerConsultar = data.length
      return data;
    });

    this.entityInput.nativeElement.value = '';
    this.entityCtrl.setValue(null);
  }

  private _filter(value: string, entities: string[]): string[] {
    const filterValue = value.toLowerCase();
    return entities.filter(entity => entity.toLowerCase().includes(filterValue));
  }


  cambiaInstitucion(evt: any): void {
    let layersDisponibles: any = [];
    if (evt.value == 0) {


    } else {
      layersDisponibles = this.layers!.find((resp: any) => resp.id == evt.value).capas.
        filter((resp: any) => resp.consulta == 1 && resp.tipo == "AG").
        map((resp: any) => resp.nombre + "(" + resp.srs + ")")
    }
    this.removeEntityAll()
    this.entities = signal<string[]>(layersDisponibles);
  }

  private layerQueryPromesaGet(urlServicio: string, geometry: any, srs: any): Promise<void> {
    return new Promise<void>((resolve) => {
      const dataLayer = this.mapService.layerQuery(urlServicio, geometry, this.token, srs);
      dataLayer.subscribe((registros: any) => {
        resolve(registros);
      })
    });
  }

  private layerQueryPromesaPost(urlServicio: string, geometry: any, srs: any): Promise<void> {
    return new Promise<void>((resolve) => {
      const dataLayer = this.mapService.layerQueryPost(urlServicio, geometry, this.token, srs);
      dataLayer.subscribe((registros: any) => {
        resolve(registros);
      })
    });
  }

  async descargarFeatures(accion: string, capa: any) {
    let type = capa.type;
    let srs = 0

    let prj = ""
    let srsDato = this.layers!.find((resp: any) => resp.id == capa.idInstitucion).capas.find((resp: any) => resp.id_capa == capa.idCapa).srs

    if (srsDato == "WGS84") {
      srs = 4326
      prj = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]'
    }

    if (srsDato == "PSAD56") {
      srs = 4248
      prj = 'GEOGCS["GCS_Provisional_S_American_1956",DATUM["D_Provisional_S_American_1956",SPHEROID["International_1924",6378388.0,297.0]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]'
    }

    if (srsDato == "SIRGAS") {
      srs = 4674
      prj = 'GEOGCS["GCS_SIRGAS_2000",DATUM["D_SIRGAS_2000",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]'
    }

    if (accion == "shp") {
      if (type == "esriGeometryPolygon") {
        let allGraphics: any = [];

        if (srs == 4326) {
          capa.features.forEach((feature: any) => {
            var polygon = new Polygon({
              rings: feature.geometry.rings,
              spatialReference: { wkid: 4326 }
            });

            var graphic = new Graphic({
              geometry: polygon,
              attributes: feature.attributes
            });

            allGraphics.push(graphic)
          })
        } else {

          capa.features.forEach((feature: any) => {

            var polygon = new Polygon({
              rings: feature.geometry.rings,
              spatialReference: { wkid: 4326 }
            });

            var graphic = new Graphic({
              geometry: polygon,
              attributes: feature.attributes
            })

            var outSpatialReference = new SpatialReference({
              wkid: srs
            })

            let reproject = this.projectionEngine.project(graphic.geometry, outSpatialReference)

            graphic = new Graphic({
              geometry: reproject,
              attributes: feature.attributes
            })

            allGraphics.push(graphic)
          })
        }

        const geoJsonFeatureCollection = convertArcGISGraphicsToGeoJSONFeatureCollection(allGraphics, "polygon");
        const options: any = {
          prj: prj,
          folder: capa.nombreCapa,
          filename: capa.nombreCapa,
          outputType: "blob",
          compression: "DEFLATE",
          types: {
            point: "features_export_point",
            polygon: "features_export_poly",
            polyline: "features_export_line",
          },
        };

        const zipData = shpwrite.zip(geoJsonFeatureCollection, options)

        zipData.then((response: any) => {
          const anchor = document.createElement('a');
          anchor.href = URL.createObjectURL(response);
          anchor.download = 'features_export.zip';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
        })
          .catch((error) => {
            this.verMensaje("El archivo no pudo ser descargado")
            console.error('Error exporting features to SHP:', error);
          });

      }

      if (type == "esriGeometryPolyline") {
        let allGraphics: any = [];

        if (srs == 4326) {
          capa.features.forEach((feature: any) => {
            var polyline = new Polyline({
              paths: feature.geometry.paths,
              spatialReference: { wkid: 4326 }
            });

            var graphic = new Graphic({
              geometry: polyline,
              attributes: feature.attributes
            });

            allGraphics.push(graphic)
          })
        } else {

          capa.features.forEach((feature: any) => {

            var polyline = new Polyline({
              paths: feature.geometry.paths,
              spatialReference: { wkid: 4326 }
            });

            var graphic = new Graphic({
              geometry: polyline,
              attributes: feature.attributes
            })

            var outSpatialReference = new SpatialReference({
              wkid: srs
            })

            let reproject = this.projectionEngine.project(graphic.geometry, outSpatialReference)

            graphic = new Graphic({
              geometry: reproject,
              attributes: feature.attributes
            })

            allGraphics.push(graphic)
          })
        }

        const geoJsonFeatureCollection = convertArcGISGraphicsToGeoJSONFeatureCollection(allGraphics, "polyline");

        const options: any = {
          prj: prj,
          folder: capa.nombreCapa,
          filename: capa.nombreCapa,
          outputType: "blob",
          compression: "DEFLATE",
          types: {
            point: "features_export_point",
            polygon: "features_export_poly",
            polyline: "features_export_line",
          },
        };
        const zipData = shpwrite.zip(geoJsonFeatureCollection, options)
        zipData.then((response: any) => {
          const anchor = document.createElement('a');
          anchor.href = URL.createObjectURL(response);
          anchor.download = 'features_export.zip';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
        })
          .catch((error) => {
            this.verMensaje("El archivo no pudo ser descargado")
            console.error('Error exporting features to SHP:', error);
          });

      }
    }

    if (accion == "kml") {
      let allGraphics: any = [];
      if (type == "esriGeometryPolygon") {
        capa.features.forEach((feature: any) => {
          var polygon = new Polygon({
            rings: feature.geometry.rings,
            spatialReference: { wkid: 4326 }
          });

          var graphic = new Graphic({
            geometry: polygon,
            attributes: feature.attributes
          });

          allGraphics.push(graphic)
        })
      }

      if (type == "esriGeometryPolyline") {
        capa.features.forEach((feature: any) => {
          var polyline = new Polyline({
            paths: feature.geometry.paths,
            spatialReference: { wkid: 4326 }
          });

          var graphic = new Graphic({
            geometry: polyline,
            attributes: feature.attributes
          });

          allGraphics.push(graphic)
        })

      }

      try {
        const kmlContent = this.generateKML(allGraphics, capa.nombreCapa)
        const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${capa.nombreCapa || '_kml'}.kml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

      } catch (error) {
        console.error('Error exporting features to KML:', error);
      }

    }

    if (accion == "excel") {
      let allGraphics: any = [];
      capa.features.forEach((feature: any) => {
        allGraphics.push(feature.attributes)
      });

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(allGraphics);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, capa.nombreCapa);
      XLSX.writeFile(wb, capa.nombreCapa + '.xlsx');
    }
  }

  accionesFeatures(accion: string, capa: any, feature: any): void {
    let type = capa.type
    let srs = 0
    let prj = ""


    if (capa.srs == "WGS84") {
      srs = 4326
      prj = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]'
    }

    if (capa.srs == "PSAD56") {
      srs = 4248
      prj = 'GEOGCS["GCS_Provisional_S_American_1956",DATUM["D_Provisional_S_American_1956",SPHEROID["International_1924",6378388.0,297.0]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]'
    }

    if (capa.srs == "SIRGAS") {
      srs = 4674
      prj = 'GEOGCS["GCS_SIRGAS_2000",DATUM["D_SIRGAS_2000",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]'
    }

    if (accion == "zoom") {
      this.view?.graphics.remove(this.resultFeatureSelected);
      this.resultFeatureSelected = null
      if (type == "esriGeometryPolygon") {
        const polygon = new Polygon({
          rings: feature.geometry.rings,
          spatialReference: { wkid: 4326 }
        });

        this.resultFeatureSelected = new Graphic({
          geometry: polygon,
          symbol: this.fillSymbolSelected
        });

        this.view!.graphics.add(this.resultFeatureSelected);
        this.view?.goTo({
          target: this.resultFeatureSelected
        }, {
          duration: 3000
        });
      }

      if (type == "esriGeometryPolyline") {
        const polyline = new Polyline({
          paths: feature.geometry.paths,
          spatialReference: { wkid: 4326 }
        });

        this.resultFeatureSelected = new Graphic({
          geometry: polyline,
          symbol: this.fillSymbolSelected
        });

        this.view!.graphics.add(this.resultFeatureSelected);
        this.view?.goTo({
          target: this.resultFeatureSelected
        }, {
          duration: 3000
        });
      }

    }

    if (accion == "download") {
      if (type == "esriGeometryPolygon") {
        let graphic: any = null
        const polygon = new Polygon({
          rings: feature.geometry.rings,
          spatialReference: { wkid: 4326 }
        });

        if (srs != 4326) {

          graphic = new Graphic({
            geometry: polygon,
            attributes: feature.attributes
          });

          var outSpatialReference = new SpatialReference({
            wkid: srs
          })

          let reproject = this.projectionEngine.project(graphic.geometry, outSpatialReference)
          graphic = new Graphic({
            geometry: reproject,
            attributes: feature.attributes
          });
        } else {
          graphic = new Graphic({
            geometry: polygon,
            attributes: feature.attributes
          });
        }



        const allGraphics = [graphic];
        const geoJsonFeatureCollection = convertArcGISGraphicsToGeoJSONFeatureCollection(allGraphics, "polygon");
        const options: any = {
          prj: prj,
          folder: capa.nombreCapa,
          filename: capa.nombreCapa,
          outputType: "blob",
          compression: "DEFLATE",
          types: {
            point: "features_export_point",
            polygon: "features_export_poly",
            polyline: "features_export_line",
          },
        };

        const zipData = shpwrite.zip(geoJsonFeatureCollection, options)

        zipData.then((response: any) => {
          const anchor = document.createElement('a');
          anchor.href = URL.createObjectURL(response);
          anchor.download = 'features_export.zip';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
        })
          .catch((error) => {
            this.verMensaje("El archivo no pudo ser descargado")
          });
      }

      if (type == "esriGeometryPolyline") {
        let graphic: any = null
        const polyline = new Polyline({
          paths: feature.geometry.paths,
          spatialReference: { wkid: 4326 }
        });

        if (srs != 4326) {

          graphic = new Graphic({
            geometry: polyline,
            attributes: feature.attributes
          });

          var outSpatialReference = new SpatialReference({
            wkid: srs
          })

          let reproject = this.projectionEngine.project(graphic.geometry, outSpatialReference)

          graphic = new Graphic({
            geometry: reproject,
            attributes: feature.attributes
          });
        } else {
          graphic = new Graphic({
            geometry: polyline,
            attributes: feature.attributes
          });
        }


        const allGraphics = [graphic];
        const geoJsonFeatureCollection = convertArcGISGraphicsToGeoJSONFeatureCollection(allGraphics, "polyline")

        const options: any = {
          prj: prj,
          folder: capa.nombreCapa,
          filename: capa.nombreCapa,
          outputType: "blob",
          compression: "DEFLATE",
          types: {
            point: "features_export_point",
            polygon: "features_export_poly",
            polyline: "features_export_line",
          },
        };

        const zipData = shpwrite.zip(geoJsonFeatureCollection, options)

        zipData.then((response: any) => {
          const anchor = document.createElement('a');
          anchor.href = URL.createObjectURL(response);
          anchor.download = 'features_export.zip';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
        })
          .catch((error) => {
            this.verMensaje("El archivo no pudo ser descargado")
          });
      }
    }

    if (accion == "kml") {
      let graphic: any = null
      let allGraphics: any = [];
      if (type == "esriGeometryPolygon") {
        const polygon = new Polygon({
          rings: feature.geometry.rings,
          spatialReference: { wkid: 4326 }
        });

        graphic = new Graphic({
          geometry: polygon,
          attributes: feature.attributes
        });

      }

      if (type == "esriGeometryPolyline") {

        const polyline = new Polyline({
          paths: feature.geometry.paths,
          spatialReference: { wkid: 4326 }
        });

        graphic = new Graphic({
          geometry: polyline,
          attributes: feature.attributes
        });
      }

      allGraphics.push(graphic)

      try {
        const kmlContent = this.generateKML(allGraphics, capa.nombreCapa)
        const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${capa.nombreCapa || '_kml'}.kml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

      } catch (error) {
        console.error('Error exporting features to KML:', error);
      }

    }

  }


  procesarGP(modo: string): void {
    if (this.myLoadingRef.nativeElement.style.display == "block") {
      return
    }

    const entidades = this.entities().length;
    const interes = this.interests().length;

    if ((entidades + interes) == 0) {
      this.verMensaje("No hay capa(s) disponible(s) por consultar, primero debe seleccionar estas")
      return;
    }

    if (this.resultFeature == null) {
      this.verMensaje("No existe un área en el mapa por consultar")
      return
    }

    this.layerDisponibles = [];
    if (entidades > 0) {
      let institucion = this.institucionSelect.value
      let layersDisponibles = this.layers!.find((i: any) => i.id == institucion).capas

      this.entities().forEach((capa: any) => {
        let lyr = layersDisponibles.find((item: any) => item.nombre + "(" + item.srs + ")" == capa)
        if (lyr) {
          this.layerDisponibles.push(lyr);
        }
      })
    }

    if (interes > 0) {
      this.interests().forEach((capa: any) => {

        this.layers!.forEach((institucion: any) => {
          let lyr = institucion.capas.find((item: any) => item.institucion + " " + item.nombre + "(" + item.srs + ")" == capa)
          if (lyr) {

            let lyrAux = this.layerDisponibles.find((item: any) => item.institucion + " " + item.nombre + "(" + item.srs + ")" == capa)
            if (lyrAux) {

            } else {
              this.layerDisponibles.push(lyr)
            }
          }
        })

      })
    }

    var geometry = this.resultFeature.geometry;

    let geom: any
    if (
      modo == 'buffer'
      || modo == 'sbn'
      || modo == 'file'
    ) {
      geom = geometry
    } else {
      geom = webMercatorUtils.webMercatorToGeographic(geometry)
    }

    this.myLoadingRef.nativeElement.style.display = "block"
    this.cdr.detectChanges()
    let promesas: any = [];

    this.layerDisponibles.forEach((item: any) => {
      let servicio = `${item.url_servicio}/${item.servicios}/query`
      let srs = "4326"

      if (modo == "file") {
        promesas.push(this.layerQueryPromesaPost(servicio, geom.toJSON(), srs));
      } else {
        promesas.push(this.layerQueryPromesaGet(servicio, geom.toJSON(), srs));
      }
    })

    let layerInstituciones: any = [];
    let layerTemporales: any = [];

    this.responseLayer = [];
    Promise.all(promesas).then(values => {
      for (let item in this.layerDisponibles) {
        let layer: any = this.layerDisponibles[item];
        let response: any = values[item];

        if (response.features) {
          if (response.features.length > 0) {

            layerInstituciones.push(
              {
                idInstitucion: layer.id_institucion,
                institucion: layer.institucion,
              })

            layerTemporales.push(
              {
                idInstitucion: layer.id_institucion,
                institucion: layer.institucion,
                idCapa: layer.id_capa,
                nombreCapa: layer.nombre + '(' + layer.srs + ')',
                displayFieldName: response.displayFieldName,
                type: response.geometryType,
                fields: response.fields,
                srs: layer.srs,
                alias: response.fields.find((resp: any) => resp.name == response.displayFieldName).alias,
                features: response.features
              }
            )
          }
        }
      }

      if (layerTemporales.length == 0) {
        this.verMensaje("No se encontro información en el ámbito de referencia")
        return
      }

      let instituciones = groupBy(layerInstituciones, 'idInstitucion');
      Object.keys(instituciones).forEach((item) => {
        let institucion = layerTemporales.find((i: any) => i.idInstitucion == item)
        this.responseLayer.push(
          {
            idInstitucion: institucion.idInstitucion,
            institucion: institucion.institucion,
            capas: layerTemporales.filter((i: any) => i.idInstitucion == item)
          }
        )
      })
      this.myLoadingRef.nativeElement.style.display = "none"
      this.mostrarDiv = true

      this.cdr.detectChanges()
    })

  }

  dibujarMapa(): void {
    this.style.set(!this.style());
    if (this.style()) {
      this.draw.cancel()
      this.limpiarFeature()
      return
    }

    this.draw.availableCreateTools = ["polygon"]
    this.draw.creationMode = "single"

    this.draw.create("polygon")
    this.draw.on("create", (event) => {
      if (event.state === "complete") {
        this.limpiarFeature()

        this.resultFeature = new Graphic({
          geometry: event.graphic.geometry,
          symbol: this.fillSymbol
        });

        this.view!.graphics.add(this.resultFeature);
        this.style.set(!this.style());

      }
    });

  }

  buscarCoodenada(): void {
    this.limpiarFeature()
    let _sistema = this.busquedaCoordenadasSistema.value
    let _norte = this.busquedaCoordenadasNorte.nativeElement.value
    let _este = this.busquedaCoordenadasEste.nativeElement.value
    let _radio = this.busquedaCoordenadasRadio.nativeElement.value

    if (_sistema == undefined || _sistema == "") {
      this.verMensaje("Seleccione el Sistema de Coordenadas")
      return
    }

    if (_norte == undefined || _norte == "") {
      this.verMensaje("Ingrese la coordenada Norte")
      return
    }

    if (_este == undefined || _este == "") {
      this.verMensaje("Ingrese la coordenada Este")
      return
    }

    if (_radio == undefined || _radio == "") {
      this.verMensaje("Ingese el radio de influencia")
      return
    }

    proj4.defs([
      [
        'EPSG:4326',
        '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
      ],
      [
        'EPSG:32717',
        '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs +type=crs'
      ],
      [
        'EPSG:32718',
        '+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs +type=crs'
      ],
      [
        'EPSG:32719',
        '+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs +type=crs'
      ],
      [
        'EPSG:4248',
        '+proj=longlat +ellps=intl +towgs84=-288,175,-376,0,0,0,0 +no_defs +type=crs'
      ],
      [
        'EPSG:24877',
        '+proj=utm +zone=17 +south +ellps=intl +towgs84=-288,175,-376,0,0,0,0 +units=m +no_defs +type=crs'
      ],
      [
        'EPSG:24878',
        '+proj=utm +zone=18 +south +ellps=intl +towgs84=-288,175,-376,0,0,0,0 +units=m +no_defs +type=crs'
      ],
      [
        'EPSG:24879',
        '+proj=utm +zone=19 +south +ellps=intl +towgs84=-288,175,-376,0,0,0,0 +units=m +no_defs +type=crs'
      ],
    ]);

    let sistema = Number.parseFloat(this.busquedaCoordenadasSistema!.value.toString());
    let radio = Number.parseFloat(this.busquedaCoordenadasRadio.nativeElement.value);
    let norte = Number.parseFloat(this.busquedaCoordenadasNorte.nativeElement.value);
    let este = Number.parseFloat(this.busquedaCoordenadasEste.nativeElement.value);

    let result = proj4(('EPSG:' + sistema), 'EPSG:4326', [este, norte]);
    let point = new Point({
      longitude: result[0],
      latitude: result[1],
      spatialReference: { wkid: 4326 }
    }
    );

    const geodesicBuffer = this.geometryEngine.geodesicBuffer(
      point,
      radio,
      "meters"
    );

    this.resultFeature = new Graphic({
      geometry: geodesicBuffer,
      symbol: this.fillSymbol
    });

    this.view!.graphics.add(this.resultFeature);

    this.view?.goTo({
      target: this.resultFeature
    }, {
      duration: 3000
    });


    this.procesarGP('buffer')

  }

  limpiarFeature(): void {
    this.myLoadingRef.nativeElement.style.display = "none"
    this.nombreArchivo = ''

    this.view!.graphics.remove(this.resultFeature)

    this.resultFeature = null
    this.mostrarDiv = false

    this.view!.graphics.remove(this.resultFeatureSelected)
    this.resultFeatureSelected = null
    this.view!.closePopup()
    this.view!.graphics.removeAll()
    this.archivoBtn.nativeElement.value = ''

    this.view!.goTo(this.view!.extent)
  }

  agregaGeometria(responseLayer: any) {
    const features = responseLayer.features;
    const geometry = responseLayer.features[0].geometry;

    const polygon = new Polygon({
      rings: geometry.rings,
      spatialReference: { wkid: 4326 }
    });

    this.resultFeature = new Graphic({
      geometry: polygon,
      symbol: this.fillSymbol
    });
    this.view!.graphics.add(this.resultFeature);

    this.view?.goTo({
      target: this.resultFeature
    }, {
      duration: 3000
    });

  }

  busquedaSBN(): void {
    this.limpiarFeature()

    let expediente = this.busquedaCapasSBN.nativeElement.value
    if (this.capaSBN.value == undefined) {
      this.verMensaje("Seleccione una capa SBN")
      return
    }

    if (expediente.trim() == "") {
      this.verMensaje("Ingrese un valor de búsqueda")
      this.busquedaCapasSBN.nativeElement.focus()
      return
    }

    switch (this.capaSBN.value) {
      case "cp-1":
        this.requestSBN = {
          file: null,
          tipoproc: "AGE_BusqGen",
          epsg: "32717",
          sUser: environment.USR,
          fileExt: "",
          selLyr: "CUS",
          valueField: expediente
        }

        break;

      case "cp-2":
        this.requestSBN = {
          file: null,
          tipoproc: "AGE_BusqGen",
          epsg: "32717",
          sUser: environment.USR,
          fileExt: "",
          selLyr: "PJUDI",
          valueField: expediente
        }

        break;

      case "cp-3":
        this.requestSBN = {
          file: null,
          tipoproc: "AGE_BusqGen",
          epsg: "32717",
          sUser: environment.USR,
          fileExt: "",
          selLyr: "P1192",
          valueField: expediente
        }

        break;

      case "cp-4":
        this.requestSBN = {
          file: null,
          tipoproc: "AGE_BusqGen",
          epsg: "32717",
          sUser: environment.USR,
          fileExt: "",
          selLyr: "P1192",
          valueField: expediente
        }

        break;

      case "cp-5":
        this.requestSBN = {
          file: null,
          tipoproc: "AGE_BusqGen",
          epsg: "32717",
          sUser: environment.USR,
          fileExt: "",
          selLyr: "PEXTJ",
          valueField: expediente
        }

        break;

      case "cp-6":
        this.requestSBN = {
          file: null,
          tipoproc: "AGE_BusqGen",
          epsg: "32717",
          sUser: environment.USR,
          fileExt: "",
          selLyr: "S_I",
          valueField: expediente
        }

        break;

    }

    this.myLoadingRef.nativeElement.style.display = "block"

    this.mapService.capasSBN(this.requestSBN).subscribe(
      (resp: any) => {
        if (resp.status) {
          if (resp.status.id === 200) {

            let urlServicio = this.campoprocesar.find((r: any) => r.value == this.capaSBN.value)!.url
            let codigo = resp.status.fdb

            this.queryParams = {
              f: "json",
              where: "coduser in ('" + environment.USR + "') and nfile= '" + codigo + "'",
              returnGeometry: "true",
              spatialRel: "esriSpatialRelIntersects",
              outFields: "*"
            }

            this.myLoadingRef.nativeElement.style.display = "block"
            this.mapService.obtenerLayerSBN(urlServicio, this.queryParams).subscribe(
              (responseLayer: any) => {
                if (responseLayer) {
                  this.agregaGeometria(responseLayer);

                  this.procesarGP('sbn')


                } else {
                  this.verMensaje("No se encontro información")
                }
              },
              (errorLayer: any) => {
                this.verMensaje("No se encontro información")
              },
              () => {
                this.myLoadingRef.nativeElement.style.display = "none"
              }
            )

          } else {
            this.verMensaje(resp.status.msg)
          }
        }
      },

      (error: any) => {
        this.verMensaje("No se encontro información")
      },
      () => {
        this.myLoadingRef.nativeElement.style.display = "none"
      }
    )
  }

  setGeometryPolygon(layer: any) {
    this.resultFeature = null

    let geometry = layer.features[0].geometry


    const polygon = new Polygon({
      rings: geometry.coordinates,
      spatialReference: { wkid: 4326 }
    });

    this.resultFeature = new Graphic({
      geometry: polygon,
      symbol: this.fillSymbol
    })


    if (this.resultFeature != null) {
      this.view!.graphics.add(this.resultFeature);
      this.view?.goTo({
        target: this.resultFeature
      }, {
        duration: 3000
      })
    }


  }

  loadKML(kmlData: string) {
    let responseLayer = kml(new DOMParser().parseFromString(kmlData, "text/xml"))
    let layer: any = responseLayer

    if (layer) {
      if (layer.features) {
        if (layer.features.length == 0) {
          this.verMensaje("Solo se permite la carga de 1 feature por archivo")
          return
        }

        if (layer.features.length > 1) {
          this.verMensaje("Solo se permite la carga de 1 feature por archivo")
          return
        }

        let type = layer.features[0].geometry.type

        if (type == "Polygon") {
          this.setGeometryPolygon(layer)
        } else if (type == "MultiPolygon") {
          this.verMensaje("El tipo de feature cargado no es valido, solo se admiten de tipo polígono. El feature actual es Multipoligono")
        } else {
          this.verMensaje("El tipo de feature cargado no es valido, solo se admiten de tipo polígono")
        }
      }
    }
  }

  async loadDXF(dxfData: any) {
    const parser = new dxfParser();
    const rawDxfData = parser.parseSync(dxfData)
    const geoJSONDataLine = this.convertDxfToGeoJSON(rawDxfData);
    const responseLayer = this.convertLineStringsInCollectionToPolygons(geoJSONDataLine);
 
    let layer: any = responseLayer

    if (layer) {
      if (layer.features) {
        if (layer.features.length == 0) {
          this.verMensaje("Solo se permite la carga de 1 feature por archivo")
          return
        }

        if (layer.features.length > 1) {
          this.verMensaje("Solo se permite la carga de 1 feature por archivo")
          return
        }

        let type = layer.features[0].geometry.type

        if (type == "Polygon") {
          this.setGeometryPolygon(layer)
        } else if (type == "MultiPolygon") {
          this.verMensaje("El tipo de feature cargado no es valido, solo se admiten de tipo polígono. El feature actual es Multipoligono")
        } else {
          this.verMensaje("El tipo de feature cargado no es valido, solo se admiten de tipo polígono")
        }
      }
    }
  }

  async loadShapefile(shpData: any) {
    let responseLayer = await shp(shpData)
    let layer: any = responseLayer

    if (layer) {
      if (layer.features) {
        if (layer.features.length == 0) {
          this.verMensaje("Solo se permite la carga de 1 feature por archivo")
          return
        }

        if (layer.features.length > 1) {
          this.verMensaje("Solo se permite la carga de 1 feature por archivo")
          return
        }

        debugger
        let type = layer.features[0].geometry.type
        let geometry = layer.features[0].geometry

        if (type == "Polygon") {
          this.setGeometryPolygon(layer)

        } else if (type == "MultiPolygon") {

          let isSimple = this.geometryEngine.isSimple(geometry)
          console.log(isSimple)


          this.verMensaje("El tipo de feature cargado no es valido, solo se admiten de tipo polígono. El feature actual es Multipoligono")


        } else {
          this.verMensaje("El tipo de feature cargado no es valido, solo se admiten de tipo polígono")
        }
      }
    }
  }

  readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    let tipoArchivo = ""
    let swValido: boolean = false
    let tipo = this.tipoArchivoSelect.value
    if (file) {
      tipoArchivo = file.type
    
      if (tipoArchivo == "application/vnd.google-earth.kml+xml" && tipo == "kml") {
        swValido = true
      } else if (tipoArchivo == "application/x-zip-compressed"  && tipo == "zip") {
        swValido = true
      } else if (tipoArchivo == "") {
        if (this.tipoArchivoSelect.value == "dxf"){
          if (event.target.files[0].name.split('.').pop().toUpperCase() == "DXF") {
            swValido = true
          }
        }        
      }

      if (!swValido) {
        this.verMensaje("Archivo seleccionado no es valido")
        return
      }

      this.nombreArchivo = file.name;

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const result = e.target.result as string;
        if (tipoArchivo == "application/vnd.google-earth.kml+xml") {
          await this.loadKML(result);

        } else if (tipoArchivo == "application/x-zip-compressed") {
          const arrayBuffer = await this.readFileAsArrayBuffer(file)
          await this.loadShapefile(arrayBuffer)

        } else if (tipoArchivo == "") {
          await this.loadDXF(result)
        }

      };
      reader.onerror = () => {
        this.verMensaje("El archivo seleccionado no pudo ser leído")
      };
      reader.readAsText(file);

    } else {
      this.nombreArchivo = '';
    }
  }

  convertDxfToGeoJSON(dxfData: any): GeoJSON.FeatureCollection {
    let sourceProjection = ""

    if (this.tipoArchivoSistemaSelect.value == "32717")
      sourceProjection = "+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs +type=crs"
    if (this.tipoArchivoSistemaSelect.value == "32718")
      sourceProjection = "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs +type=crs"
    if (this.tipoArchivoSistemaSelect.value == "32719")
      sourceProjection = "+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs +type=crs"
    if (this.tipoArchivoSistemaSelect.value == "24877")
      sourceProjection = "+proj=utm +zone=17 +south +ellps=intl +towgs84=-288,175,-376,0,0,0,0 +units=m +no_defs +type=crs"
    if (this.tipoArchivoSistemaSelect.value == "24878")                        
      sourceProjection = "+proj=utm +zone=18 +south +ellps=intl +towgs84=-288,175,-376,0,0,0,0 +units=m +no_defs +type=crs"
    if (this.tipoArchivoSistemaSelect.value == "24879")                              
      sourceProjection = "+proj=utm +zone=19 +south +ellps=intl +towgs84=-288,175,-376,0,0,0,0 +units=m +no_defs +type=crs"

    
    const targetProjection = "+proj=longlat +datum=WGS84 +no_defs";

    if (!dxfData || !dxfData.entities) {
      console.warn('Invalid DXF data provided. Expected an object with an "entities" array.');
      return {
        type: 'FeatureCollection',
        features: [],
      };
    }

    const geoJSONFeatures: GeoJSON.Feature[] = dxfData.entities
      .map((entity: any) => {
        if (
          entity.type === 'LWPOLYLINE' ||
          entity.type === 'POLYLINE' ||
          entity.type === 'LINE'
        ) {
          if (!entity.vertices || entity.vertices.length === 0) {
            console.warn(`Entity of type ${entity.type} has no vertices. Skipping.`);
            return null;
          }

          const coordinates: GeoJSON.Position[] = entity.vertices.map((vertex: any) => {
            if (typeof vertex.x === 'undefined' || typeof vertex.y === 'undefined') {
              console.warn(`Vertex missing x or y coordinate. Skipping vertex.`);
              return null;
            }
            const [x, y] = proj4(sourceProjection, targetProjection, [
              vertex.x,
              vertex.y,
            ]);
            return [x, y];
          }).filter(Boolean); // Filter out any null coordinates

          if (coordinates.length === 0) {
            return null; // If no valid coordinates, skip this feature
          }

          return {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates,
            },
            properties: {},
          };
        } else {
          // You might want to log or handle other entity types here if needed
          // console.log(`Skipping unsupported entity type: ${entity.type}`);
          return null;
        }
      })
      .filter(Boolean); // Filter out any null features

    return {
      type: 'FeatureCollection',
      features: geoJSONFeatures,
    };
  }


  convertLineStringToPolygon(lineStringFeature: GeoJSON.Feature<GeoJSON.LineString>): GeoJSON.Feature<GeoJSON.Polygon> | null {
    if (!lineStringFeature || lineStringFeature.geometry.type !== 'LineString') {
      console.error('Invalid input: Expected a GeoJSON Feature with LineString geometry.');
      return null;
    }

    const coordinates = lineStringFeature.geometry.coordinates;

    if (coordinates.length < 3) {
      console.warn('LineString has fewer than 3 coordinates. Cannot form a valid polygon.');
      return null;
    }

    // Ensure the LineString is closed by checking if the first and last coordinates are the same
    const firstPoint = coordinates[0];
    const lastPoint = coordinates[coordinates.length - 1];

    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      console.warn('LineString is not closed. Attempting to close the loop for Polygon conversion.');
      coordinates.push(firstPoint); // Close the loop
    }

    const polygonGeometry: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [coordinates], // Polygons have an array of linear rings (outer boundary + holes)
    };

    return {
      type: 'Feature',
      geometry: polygonGeometry,
      properties: lineStringFeature.properties, // Preserve existing properties
    };
  }


  convertLineStringsInCollectionToPolygons(featureCollection: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    const convertedFeatures: GeoJSON.Feature[] = featureCollection.features.map(feature => {
      if (feature.geometry.type === 'LineString') {
        const polygonFeature = this.convertLineStringToPolygon(feature as GeoJSON.Feature<GeoJSON.LineString>);
        return polygonFeature || feature; // Return polygon if successful, otherwise return original LineString
      }
      return feature; // Return other feature types as is
    }).filter(Boolean); // Filter out any nulls that might occur if convertLineStringToPolygon returns null

    return {
      type: 'FeatureCollection',
      features: convertedFeatures,
    };
  }
  verMensaje(mensaje: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: mensaje,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.myLoadingRef.nativeElement.style.display = "none"
    });
  }


  cambiarTipoArchivo(event: any) {
    let value = event.value
    this.busquedaCargaDefectoVisible = true
    this.limpiarFeature();

    if (value == "kml")
      this.busquedaCargaDefectoVisible = false
  }

  clickdata($event: MouseEvent) {
    this.hideds.set(!this.hideds());
  }

  clickicopsw($event: MouseEvent) {
    this.hide.set(!this.hide());
  }

  clickicoexp($event: MouseEvent) {
    this.hidex.set(!this.hidex());

    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    }

    if (document.exitFullscreen) { document.exitFullscreen(); }

  }

  Criterios: Criterios[] = [
    { value: 'Insercion-0', viewValue: 'Inserción de archivos' },
    { value: 'dibujo-1', viewValue: ' Dibujo de polígono' },
    { value: 'Insercion-2', viewValue: 'Inserción de coordenadas' },
    { value: 'busquedacapas-2', viewValue: 'Búsqueda en capas' },

  ];

  Typefiles: Typefile[] = [
    { value: 'dxf', viewValue: 'dxf (*.dxf)', url: "https://portalgeo.sbn.gob.pe:8443/wssbn/dc_pg/loadFile_New" },
    { value: 'zip', viewValue: 'shapefile (*.zip)', url: "https://portalgeo.sbn.gob.pe:8443/wssbn/dc_pg/loadFile_New" },
    { value: 'kml', viewValue: 'kml (*.kml)', url: "https://portalgeo.sbn.gob.pe:8443/wssbn/dc_pg/loadFile_New" },
  ];

  sistemacoords: sistemacoord[] = [
    { value: '24877', viewValue: 'PSAD56 Zona 17s' },
    { value: '24878', viewValue: 'PSAD56 Zona 18s' },
    { value: '24879', viewValue: 'PSAD56 Zona 19s' },
    { value: '32717', viewValue: 'WGS84 Zona 17s' },
    { value: '32718', viewValue: 'WGS84 Zona 18s' },
    { value: '32719', viewValue: 'WGS84 Zona 19s' },

  ];

  campoprocesar: campoprocesa[] = [
    { value: 'cp-1', text: 'Número CUS', url: "https://portalgeo.sbn.gob.pe/geosrv/rest/services/loadfiles/wms_loadfiles/MapServer/0/query?" },
    { value: 'cp-2', text: 'Cód. Proceso Judicial', url: "https://portalgeo.sbn.gob.pe/geosrv/rest/services/loadfiles/wms_loadfiles/MapServer/0/query?" },
    { value: 'cp-3', text: 'Cód. Proceso 1192', url: "https://portalgeo.sbn.gob.pe/geosrv/rest/services/loadfiles/wms_loadfiles/MapServer/0/query?" },
    { value: 'cp-4', text: 'Cód. Proceso Extrajudicial', url: "https://portalgeo.sbn.gob.pe/geosrv/rest/services/loadfiles/wms_loadfiles/MapServer/0/query?" },
    { value: 'cp-5', text: 'Cód. Proceso Notarial (JUD)', url: "https://portalgeo.sbn.gob.pe/geosrv/rest/services/loadfiles/wms_loadfiles/MapServer/0/query?" },
    { value: 'cp-6', text: 'Número Sol. Ing.', url: "https://portalgeo.sbn.gob.pe/geosrv/rest/services/loadfiles/wms_loadfiles/MapServer/0/query?" },
  ];

  ngOnDestroy() {

  }

  private generateKML(graphics: Graphic[], layerName: string): string {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${this.escapeXml(layerName)} Export</name>`; // Escape layerName too

    graphics.forEach(graphic => {

      if (graphic.geometry!.type === 'polygon') {
        const polygon = graphic.geometry as Polygon;

        // Start Placemark
        kml += `<Placemark>
          <name>${this.escapeXml(graphic.attributes.Name || graphic.attributes.OBJECTID || 'Polygon Feature')}</name>
          <description><![CDATA[`;
        for (const key in graphic.attributes) {
          if (Object.prototype.hasOwnProperty.call(graphic.attributes, key)) {
            kml += `<b>${this.escapeXml(key)}:</b> ${this.escapeXml(graphic.attributes[key])}<br/>`;
          }
        }
        kml += `]]></description>
          <Style><PolyStyle><color>7d0000ff</color></PolyStyle><LineStyle><color>ff0000ff</color><width>2</width></LineStyle></Style>
          <Polygon>`;

        // Outer Boundary
        if (polygon.rings.length > 0) {
          const outerRing = polygon.rings[0];
          kml += `
            <outerBoundaryIs>
              <LinearRing>
                <coordinates>${this.formatCoordinates(outerRing)}</coordinates>
              </LinearRing>
            </outerBoundaryIs>`;
        }

        // Inner Boundaries (Holes)
        for (let i = 1; i < polygon.rings.length; i++) {
          const innerRing = polygon.rings[i];
          kml += `
            <innerBoundaryIs>
              <LinearRing>
                <coordinates>${this.formatCoordinates(innerRing)}</coordinates>
              </LinearRing>
            </innerBoundaryIs>`;
        }

        kml += `
          </Polygon>
        </Placemark>`;
      }

      if (graphic.geometry!.type === 'polyline') {
        const polyline = graphic.geometry as Polyline;

        kml += `<Placemark>
          <name>${this.escapeXml(graphic.attributes.Name || graphic.attributes.OBJECTID || 'Polyline Feature')}</name>
          <description><![CDATA[`;
        for (const key in graphic.attributes) {
          if (Object.prototype.hasOwnProperty.call(graphic.attributes, key)) {
            kml += `<b>${this.escapeXml(key)}:</b> ${this.escapeXml(graphic.attributes[key])}<br/>`;
          }
        }
        kml += `]]></description>
          <Style>
            <LineStyle>
              <color>ff0000ff</color> <width>4</width>
            </LineStyle>
          </Style>
          <LineString>
            <tessellate>1</tessellate> <altitudeMode>clampToGround</altitudeMode> <coordinates>
${this.formatCoordinatesLine(polyline.paths[0])} </coordinates>
          </LineString>
        </Placemark>`;


      }

    });

    kml += `
  </Document>
</kml>`;
    return kml;
  }

  private formatCoordinatesLine(points: number[][]): string {
    return points
      .map(point => {
        // KML expects longitude,latitude,altitude. Add 0 for altitude if not present.
        return `${point[0]},${point[1]}${point.length > 2 ? ',' + point[2] : ',0'}`;
      })
      .join('\n'); // Each point on a new line for readability in KML
  }

  private escapeXml(text: string): string {
    if (text === null || text === undefined) {
      return '';
    }
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private formatCoordinates(ring: number[][]): string {
    let formatted = ring.map(point => `${point[0]},${point[1]},0`).join(' ');
    if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
      formatted += ` ${ring[0][0]},${ring[0][1]},0`; // Close the ring
    }
    return formatted;
  }

}

export function convertArcGISGraphicsToGeoJSONFeatureCollection(graphics: any, type: string): geojson.FeatureCollection {
  let geoJsonFeatures
  if (type == "polygon") {
    geoJsonFeatures = graphics.map((graphic: any) => {
      if (!graphic.geometry || graphic.geometry.type !== "polygon") {
        console.warn("Skipping graphic as it's not a polygon geometry:", graphic);
        return null;
      }

      const arcgisPolygon = graphic.geometry;
      const geoJsonCoordinates = arcgisPolygon.rings.map((ring: any) => {
        return ring.map((point: any) => [point[0], point[1]]);
      });

      const geoJsonFeature = {
        type: "Feature",
        properties: { ...graphic.attributes },
        geometry: {
          type: "Polygon",
          coordinates: geoJsonCoordinates
        }
      };
      return geoJsonFeature;
    }).filter((feature: any) => feature !== null);
  }

  if (type == "polyline") {
    geoJsonFeatures = graphics.map((graphic: any) => {
      if (!graphic.geometry || graphic.geometry.type !== "polyline") {
        console.warn("Skipping graphic as it's not a polyline geometry:", graphic);
        return null;
      }

      const arcgisPolyline = graphic.geometry;

      const geoJsonFeature = {
        type: "Feature",
        properties: { ...graphic.attributes },
        geometry: {
          type: (arcgisPolyline.paths.length === 1 ? "LineString" : "MultiLineString"),
          coordinates: (arcgisPolyline.paths.length === 1 ? arcgisPolyline.paths[0] : arcgisPolyline.paths),
        }
      };
      return geoJsonFeature;
    }).filter((feature: any) => feature !== null);
  }


  return {
    type: "FeatureCollection",
    features: geoJsonFeatures
  };
}

export function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce((acc, item) => {
    const groupKey = item[key] as any; // Cast to any because keyof T might not be string/number
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as { [key: string]: T[] });
}
