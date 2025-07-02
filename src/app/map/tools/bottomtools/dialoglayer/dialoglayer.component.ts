import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import * as _ from 'lodash';
import { FoodNode, UserData, UserDataCapas } from '../../../interfaces/capasSBNRequest';
import { MapService } from '../../../services/map.services';
 
@Component({
  standalone: true,
  selector: 'app-dialoglayer',
  imports: [
    FormsModule
    , MatInputModule
    , MatFormFieldModule
    , MatIconModule
    , MatSliderModule
    , CommonModule
    , MatTooltipModule
    , MatTreeModule
    , MatCardModule
    , MatCheckboxModule
    , MatMenuModule
    , MatProgressSpinnerModule
    , MatSlideToggleModule
  ],
  templateUrl: './dialoglayer.component.html',
  styleUrl: './dialoglayer.component.css'
})
export class DialoglayerComponent implements OnInit {

  @Input() view?: MapView
  @Input() webmap?: WebMap
  @Input() layers?: any[]
  arbol: FoodNode[] = []
  @ViewChild('tree') tree!: MatTree<FoodNode>;
  isLoading = false;
  datos: any;
  layersDisponibles: UserDataCapas[] = [];

  @ViewChild('trigger')
  trigger!: MatMenuTrigger;

  constructor(
    private mapService: MapService  
  ) {
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + '%';
    }

    return `${value}`;
  }


  closeMenu() {
    this.trigger.closeMenu();
  }

  ngOnInit() {
    this.layers!.forEach((institucion: any) => {
      let wgs = institucion.capas.filter((item: any) => item.srs == "WGS84")
      let psad = institucion.capas.filter((item: any) => item.srs == "PSAD56")
      let sirgas = institucion.capas.filter((item: any) => item.srs == "SIRGAS")

      let srs = [];
      if (wgs.length > 0) {


        let node: FoodNode = {
          idCapa: institucion.id + "-WGS",
          idInstitucion: institucion.id,
          name: "WGS84",
          activa: (institucion.capas.filter((resp: any) => resp.activa == 1).length ? true : false),
          wms: false,
          children: wgs.map((resp: any) => (
            {
              idCapa: resp.id_capa
              , idInstitucion: resp.id_institucion
              , name: resp.nombre
              , activa: (resp.activa == 1 ? true : false)
              , wms: (resp.wms == 1 ? true : false)
            })),
        }
        srs.push(node)
      }

      if (psad.length > 0) {

        let node: FoodNode = {
          idCapa: institucion.id + "-PSAD",
          idInstitucion: institucion.id,
          name: "PSAD56",
          activa: (institucion.capas.filter((resp: any) => resp.activa == 1).length ? true : false),
          wms: false,
          children: psad.map((resp: any) => (
            {
              idCapa: resp.id_capa
              , idInstitucion: resp.id_institucion
              , name: resp.nombre
              , activa: (resp.activa == 1 ? true : false)
              , wms: (resp.wms == 1 ? true : false)
            })),
        }
        srs.push(node)
      }

      if (sirgas.length > 0) {

        let node: FoodNode = {
          idCapa: institucion.id + "-SIRGAS",
          idInstitucion: institucion.id,
          name: "SIRGAS",
          wms: false,
          children: sirgas.map((resp: any) => (
            {
              idCapa: resp.id_capa
              , idInstitucion: resp.id_institucion
              , name: resp.nombre
              , activa: (resp.activa == 1 ? true : false)
              , wms: (resp.wms == 1 ? true : false)
            })),
        }
        srs.push(node)
      }

      let institucionNode: FoodNode = {
        idInstitucion: institucion.id,
        name: institucion.institucion,
        wms: false,
        activa: (institucion.capas.filter((resp: any) => resp.activa == 1).length ? true : false),
        children: srs
      }
      this.arbol.push(institucionNode)
    })

  }

  activaLayer(event: any, data: any) {
    let insitucion = this.layers!.find((resp) => resp.id == data.idInstitucion)
    if (insitucion) {
      let layer = insitucion.capas.find((resp: any) => resp.id_capa == data.idCapa)
      if (layer) {
        let foundLayer = this.webmap!.allLayers.find((lyr) => {
          return lyr.id === 'layer_' + layer.id_capa;
        });
        if (foundLayer) {
          layer.activa = (event.checked ? 1 : 0)
          foundLayer.visible = event.checked;
        }
      }
    }

    this.layersDisponibles = []
    this.layers!.forEach((item: UserData) => {
      this.layersDisponibles.unshift(...item.capas)
    })
 
  }

  activaLayerWMS(event: any, data: any) {
    let insitucion = this.layers?.find((resp) => resp.id == data.idInstitucion)
    if (insitucion) {
      let layer = insitucion.capas.find((resp: any) => resp.id_capa == data.idCapa)
      if (layer) {
        let foundLayer = this.webmap!.allLayers.find((lyr) => {
          return lyr.id === 'layer_' + layer.id_capa + "-WMS";
        });

        if (foundLayer) {
          foundLayer.visible = event.checked;
        }
      }
    }
  }

  expandirTodo(): void {
    this.dataSource.forEach(node => {
      this.expandirNodoRecursivamente(node);
    });
  }
  private expandirNodoRecursivamente(node: FoodNode): void {
    if (this.hasChild(0, node) && !this.tree.isExpanded(node)) {
      this.tree.expand(node);
    }
    if (node.children) {
      node.children.forEach(child => this.expandirNodoRecursivamente(child));
    }
  }
  contraerTodo(): void {
    this.dataSource.forEach(node => {
      this.contraerNodoRecursivamente(node);
    });
  }

  private contraerNodoRecursivamente(node: FoodNode): void {
    if (this.hasChild(0, node) && this.tree.isExpanded(node)) {
      this.tree.collapse(node);
    }
    if (node.children) {
      node.children.forEach(child => this.contraerNodoRecursivamente(child));
    }
  }


  dataSource = this.arbol
  childrenAccessor = (node: FoodNode) => node.children ?? [];
  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;
}
