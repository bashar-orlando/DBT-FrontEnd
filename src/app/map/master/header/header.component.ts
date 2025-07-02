import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import Search from "@arcgis/core/widgets/Search.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import { MapService } from '../../services/map.services';
import esriConfig from "@arcgis/core/config.js";
import { environment } from '../../../../environments/environment';
import * as intl from '@arcgis/core/intl'; // Import the intl module

@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatMenuModule, MatButtonModule, MatInputModule, FormsModule, MatFormFieldModule, MatAutocompleteModule, ReactiveFormsModule
    // , AsyncPipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Input() view?: MapView
  @Input() webmap?: WebMap
  @Input() layers?: any[]
  token: string = ""


  constructor(
    private mapService: MapService
  ) {

  }

  ngOnInit() {
    intl.setLocale('es')

    this.token = environment.TOKEN;

    esriConfig.request.interceptors!.push({
      urls: environment.PORTAL_AG,
      before: (params) => {
        params.requestOptions.query = params.requestOptions.query || {};
        params.requestOptions.query.token = this.token;
      },
    }
    );


    const featureDistritos = new FeatureLayer({
      url:
        "https://portalgeo.sbn.gob.pe/geosrv/rest/services/entidad/wms_lim_politicos/MapServer/2",
      popupTemplate: {
        title: "Distrito",
        content: [{
          type: "fields",
          fieldInfos: [
            {
              fieldName: "iddist",
              label: "Ubigeo"
            },
            {
              fieldName: "nombdep",
              label: "Departamento"
            },
            {
              fieldName: "nombprov",
              label: "Provincia"
            },
            {
              fieldName: "nombdist",
              label: "Distrito"
            },
            {
              fieldName: "nom_cap",
              label: "Nombre Capital"
            },
            {
              fieldName: "dcto",
              label: "Dcto"
            },
            {
              fieldName: "ley",
              label: "Ley"
            },
            {
              fieldName: "fecha",
              label: "Fecha"
            },
            {
              fieldName: "fuente",
              label: "Fuente"
            },
            {
              fieldName: "busqueda",
              label: "Búsqueda"
            }

          ]
        }],
        overwriteActions: true
      }
    });

    const featurePrediosVigentes = new FeatureLayer({
      url: "https://portalgeo.sbn.gob.pe/geosrv/rest/services/predios/mil_predios/MapServer/1",
      popupTemplate: {
        title: "CUS",
        content: [{
          type: "fields",
          fieldInfos: [
            {
              fieldName: "gpre_titular",
              label: "Titular"
            },
            {
              fieldName: "gpre_cond",
              label: "Condición"
            },
            {
              fieldName: "gpre_tipo_cus",
              label: "Tipo de predio"
            },
            {
              fieldName: "gpre_doc_rrpp",
              label: "Doc. Registral"
            },
            {
              fieldName: "gpre_pol_area",
              label: "Área RRPP m²"
            },
            {
              fieldName: "gpre_nmb_lote",
              label: "Denominación"
            },
            {
              fieldName: "gpre_dir_lote",
              label: "Dirección"
            },
            {
              fieldName: "gpre_sinabip_ubi_dsc",
              label: "Ubigeo"
            },
            {
              fieldName: "gpre_pol_epsg",
              label: "DATUM"
            },
            {
              fieldName: "gpre_pol_tip_arch",
              label: "Tipo archivo"
            }

          ]
        }],
        overwriteActions: true
      }
    });

    const featurePrediosCancelados = new FeatureLayer({
      url: "https://portalgeo.sbn.gob.pe/geosrv/rest/services/predios/mil_predios/MapServer/2",
      popupTemplate: {
        title: "CUS",
        content: [{
          type: "fields",
          fieldInfos: [
            {
              fieldName: "gpre_busqueda",
              label: "CUS"
            },
            {
              fieldName: "gpre_cond",
              label: "Condición"
            },
            {
              fieldName: "gpre_tipo_cus",
              label: "Tipo de predio"
            },

            {
              fieldName: "gpre_titular",
              label: "Titular"
            },
            {
              fieldName: "gpre_nmb_lote",
              label: "Nombre Predio"
            },
            {
              fieldName: "gpre_dir_lote",
              label: "Dirección Predio"
            },
            {
              fieldName: "gpre_doc_rrpp",
              label: "Doc. Registral"
            },
            {
              fieldName: "gpre_uso_gen",
              label: "Uso Genérico"
            },
            {
              fieldName: "gpre_uso_esp",
              label: "Uso Específico"
            },
            {
              fieldName: "gpre_sinabip_ubigeo",
              label: "Ubigeo SINABIP"
            },
            {
              fieldName: "gpre_sinabip_ubi_dsc",
              label: "Desc. Ubigeo SINABIP"
            },
            {
              fieldName: "gpre_l27806",
              label: "Reserva Ley Nº 27806"
            },
            {
              fieldName: "gpre_l29151",
              label: "Reserva Ley Nº 29151"
            },
            {
              fieldName: "gpre_pol_ubigeo",
              label: "Ubigeo Políg."
            },
            {
              fieldName: "gpre_pol_ubigeo_dsc",
              label: "Desc. Ubigeo Políg."
            },
            {
              fieldName: "gpre_pol_tip_arch",
              label: "Tipo Arch."
            },
            {
              fieldName: "gpre_pol_epsg",
              label: "Datum"
            },
            {
              fieldName: "gpre_pol_sig_usu",
              label: "Usuario"
            },
            {
              fieldName: "gpre_pol_codusr",
              label: "Cód. Usuario	"
            },
            {
              fieldName: "gpre_pol_coduo",
              label: "Cód. U.O.	"
            },
            {
              fieldName: "gpre_fecreg",
              label: "Fec. Registro	"
            },
            {
              fieldName: "gpre_fecact",
              label: "Fec. Act.	"
            },
            {
              fieldName: "gpre_cus",
              label: "Datos Búsqueda	"
            },
            {
              fieldName: "gpre_label",
              label: "Etiqueta"
            },
            {
              fieldName: "gpre_nro_ip",
              label: "N° de IP	"
            },
            {
              fieldName: "gpre_alertasbn",
              label: "Alerta SBN	"
            }
          ]
        }],
        overwriteActions: true
      }
    });

    const featurePrediosTasacionValorComercialTerreno = new FeatureLayer({
      url: "https://portalgeo.sbn.gob.pe/geosrv/rest/services/tasaciones/mil_tasacion_alias/MapServer/1",
      popupTemplate: {
        title: "CUS",
        content: [{
          type: "fields",
          fieldInfos: [

          ]
        }],
        overwriteActions: true
      }
    });

    const featurePrediosTasacionValorComercialRenta = new FeatureLayer({
      url: "https://portalgeo.sbn.gob.pe/geosrv/rest/services/tasaciones/mil_tasacion_alias/MapServer/2",
      popupTemplate: {
        title: "CUS",
        content: [{
          type: "fields",
          fieldInfos: [

          ]
        }],
        overwriteActions: true
      }
    });

    const sources = [
      {
        layer: featurePrediosVigentes,
        placeholder: "CUS",
        maxResults: 5,
        searchFields: ["gpre_busqueda"],
        displayField: "gpre_busqueda",
        outFields: ["gpre_busqueda", "objectid"],
        name: "Predios - Vigentes",
      },
      {
        layer: featurePrediosCancelados,
        placeholder: "CUS",
        maxResults: 5,
        searchFields: ["gpre_busqueda"],
        displayField: "gpre_busqueda",
        outFields: ["gpre_busqueda", "objectid"],
        name: "Predios - Cancelados",
      },
      {
        layer: featurePrediosTasacionValorComercialTerreno,
        placeholder: "Código Tasación",
        maxResults: 5,
        searchFields: ["gta_busqueda"],
        displayField: "gta_busqueda",
        outFields: ["gta_busqueda", "objectid"],
        name: "Tasación - Valor Comercial Terreno",
      },
      {
        layer: featurePrediosTasacionValorComercialRenta,
        placeholder: "Código Tasación",
        maxResults: 5,
        searchFields: ["gta_busqueda"],
        displayField: "gta_busqueda",
        outFields: ["gta_busqueda", "objectid"],
        name: "Tasación - Valor Comercial Renta",
      },
      {
        layer: featureDistritos,
        placeholder: "Distritos",
        maxResults: 5,
        searchFields: ["busqueda"],
        displayField: "busqueda",
        outFields: ["busqueda", "objectid"],
        name: "Distritos",
      },
    ];

    const searchWidget = new Search({
      view: this.view,
      allPlaceholder: 'Ingrese el criterio de búsqueda.',
      includeDefaultSources: false,
      container: "mapBuscador",
      sources: sources,
    })



  }
}
