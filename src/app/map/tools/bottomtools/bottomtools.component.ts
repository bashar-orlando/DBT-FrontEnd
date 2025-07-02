import { Component, signal, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialoglayerComponent } from './dialoglayer/dialoglayer.component';
import { BasemapComponent } from './basemap/basemap.component';
import { LegendComponent } from './legend/legend.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';

@Component({
  standalone: true,
  selector: 'app-bottomtools',
  imports: [
    FormsModule
    , MatMenuModule
    , MatMenuTrigger
    , MatButtonToggleModule
    , MatCheckboxModule
    , MatIconModule
    , MatDialogModule
    , DialoglayerComponent
    , CdkDrag
    , BasemapComponent
    , LegendComponent
    , CommonModule
    , MatToolbarModule
    , MatTooltipModule,
    
  ],
  templateUrl: './bottomtools.component.html',
  styleUrl: './bottomtools.component.css'
})

export class BottomtoolsComponent implements OnInit {
  @Input() view?: MapView
  @Input() webmap?: WebMap
  @Input() layers?: any[]

  value = '';

  desactivarArrastre = false;

  vcont: number = 0;
  pos1: number = 0;
  pos2: number = 0;
  pos3: number = 0;

  listType1 = '';
  listType2 = '';
  listType3 = '';

  hide1 = false;
  hide2 = false;
  hide3 = false;

  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  @ViewChild('toggleGroup') toggleGroup!: MatButtonToggleGroup;
  @ViewChild('toggle1') toggle1!: MatButtonToggle;
  @ViewChild('toggle3') toggle3!: MatButtonToggle;
  @ViewChild('toggle4') toggle4!: MatButtonToggle;
  @ViewChild('myLayer') myLayer!: DialoglayerComponent;

 
  expandirTodo(): void {
    this.myLayer.expandirTodo();
  }

  contraerTodo(): void {
    this.myLayer.contraerTodo();
  }

  esActivo: boolean = false;
  @ViewChild('elementoObjetivo') elementoObjetivo!: ElementRef;

  activarElemento() {
    this.esActivo = true;   
  }
 
  ngOnInit() {

  }

  activarCapas(sw: boolean): void {
    this.myLayer.dataSource.forEach((item: any) => {

      item.activa = sw;

      item.children.forEach((iSRS: any) => {
        iSRS.activa = sw;

        iSRS.children.forEach((iCapa: any) => {
          iCapa.activa = sw;

          let foundLayer = this.webmap!.allLayers.find((lyr) => {
            return lyr.id === 'layer_' + iCapa.idCapa 
          });

          if (foundLayer) {
            foundLayer.visible = sw
          }

        })
 
      })
    })
  }

  cerrarCapas(): void {
    this.toggle1.checked = false;
    this.vcont--;
    this.pos1 = 0;
  }

  cerrar2(): void {
    this.toggle3.checked = false;
    this.vcont--;
    this.pos2 = 0;
  }
  cerrar3(): void {
    this.toggle4.checked = false;
    this.vcont--;
    this.pos3 = 0;
  }

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update(value => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update(value => !value);
  }

  clicklayer($event: MouseEvent) {
    if (this.hide1 == true) {
      this.vcont++;

      if (this.pos2 == 1) {
        if (this.pos3 == 2) {
          this.listType1 = 'posxy-3'; this.pos1 = 3;
        } else {
          this.listType1 = 'posxy-2'; this.pos1 = 2;
        }
      }
      else {
        if (this.pos2 == 2) {
          if (this.pos3 == 1) {
            this.listType1 = 'posxy-3'; this.pos1 = 3;
          } else {
            this.listType1 = 'posxy-1'; this.pos1 = 1;
          }
        } else {
          if (this.pos2 == 3) {
            if (this.pos3 == 2) {
              this.listType1 = 'posxy-1'; this.pos1 = 1;
            } else {
              this.listType1 = 'posxy-2'; this.pos1 = 2;
            }
          } else {
            if (this.pos3 == 1) {
              this.listType1 = 'posxy-2'; this.pos1 = 2;
            } else {
              this.listType1 = 'posxy-1'; this.pos1 = 1;
            }
          }
        }
      }

    }

    if (this.hide1 == false) {
      this.vcont--;
      this.pos1 = 0;

    }

  }
  clickbasemap($event: MouseEvent) {
    if (this.vcont < 4) {
      if (this.hide2 == true) {
        this.vcont++;
        if (this.pos1 == 1) {
          if (this.pos3 == 2) {
            this.listType2 = 'posxy-3'; this.pos2 = 3;
          } else {
            this.listType2 = 'posxy-2'; this.pos2 = 2;
          }
        }
        else {
          if (this.pos1 == 2) {
            if (this.pos3 == 1) {
              this.listType2 = 'posxy-3'; this.pos2 = 3;
            } else {
              this.listType2 = 'posxy-1'; this.pos2 = 1;
            }
          } else {
            if (this.pos1 == 3) {
              if (this.pos3 == 2) {
                this.listType2 = 'posxy-1'; this.pos2 = 1;
              } else {
                this.listType2 = 'posxy-2'; this.pos2 = 2;
              }
            } else {
              if (this.pos3 == 1) {
                this.listType2 = 'posxy-2'; this.pos2 = 2;
              } else {
                this.listType2 = 'posxy-1'; this.pos2 = 1;
              }
            }
          }
        }

      }
      if (this.hide2 == false) {
        this.vcont--;
        this.pos2 = 0;
      }
    }

  }
  clicklegend($event: MouseEvent) {
    if (this.vcont < 4) {
      if (this.hide3 == true) {
        this.vcont++;
        if (this.pos2 == 1) {
          if (this.pos1 == 2) {
            this.listType3 = 'posxy-3'; this.pos3 = 3;
          } else {
            this.listType3 = 'posxy-2'; this.pos3 = 2;
          }
        }
        else {
          if (this.pos2 == 2) {
            if (this.pos1 == 1) {
              this.listType3 = 'posxy-3'; this.pos3 = 3;
            } else {
              this.listType3 = 'posxy-1'; this.pos3 = 1;
            }
          } else {
            if (this.pos2 == 3) {
              if (this.pos1 == 2) {
                this.listType3 = 'posxy-1'; this.pos3 = 1;
              } else {
                this.listType3 = 'posxy-2'; this.pos3 = 2;
              }
            } else {
              if (this.pos1 == 1) {
                this.listType3 = 'posxy-2'; this.pos3 = 2;
              } else {
                this.listType3 = 'posxy-1'; this.pos3 = 1;
              }
            }
          }
        }


      }
    }
    if (this.hide3 == false) {
      this.vcont--;
      this.pos3 = 0;
    }
  }

}

