import { Component, signal, ElementRef, QueryList, ViewChildren, OnInit, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery.js";

@Component({
  selector: 'app-basemap',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatTooltipModule, MatGridListModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './basemap.component.html',
  styleUrl: './basemap.component.css'
})

export class BasemapComponent implements OnInit {
  @Input() view?: MapView
  @Input() webmap?: WebMap
  @Input() layers?: any[]

  isLoading = false;
  // datos: any;

  ngOnInit() {
    const basemapGallery = new BasemapGallery({
      view: this.view,
      container: "Mapa-BaseMap"
    });
    
    
    // setTimeout(() => {
    //   this.datos = { mensaje: 'Datos cargados!' };
    //   this.isLoading = false;
    // }, 2000); // Simula una carga de 2 segundos
  }

  show = true;
  hide = signal(true);

  index = 0;
  activeItem = '';
  activemap($event: MouseEvent) {
    this.hide.set(!this.hide());
  }
  setActive($event: MouseEvent, par2: string) {
    this.activeItem = par2;
    if (par2 == '1') {
      this.hide.set(!this.hide());
    }
    else { this.hide.set(this.hide()); }
  }
  // botonActivo: number | null = null;
  // botones = [
  //   {name:'Charted Territory Map', image:'Charted_Territory.jpeg'}, 
  //   {name:'Colored Pencil Map', image:'Colored_Pencil.jpeg'}, 
  //   {name:'Community Map', image:'Community_Map.jpeg'}, 
  //   {name:'Dark Gray Canvas', image:'darkgray_thumb_b2wm.jpg'},
  //   {name:'Firefly Imagery Hybrid', image:'Firefly_Imagery_Hybrid.png'},
  //   {name:'Human Geography Dark Map', image:'Human_Geography_Dark.jpeg'},
  //   {name:'Human Geography Map', image:'Human_Geography_Map.jpeg'},
  //   {name:'Imagery', image:'thumbnail1591224931210.jpeg'},
  //   {name:'Imagery Hybrid', image:'Jhbrid_thumb_b2.jpg'},
  //   {name:'Light Gray Canvas', image:'lightgray_thumb_b2wm.jpg'},
  //   {name:'Mid-Century Map', image:'Mid_Century_Map.jpeg'},
  //   {name:'Modern Antique Map', image:'Modern_Antique_Map.jpeg'},
  //   {name:'National Geographic Style Map', image:'thumbnail1566584105475.jpeg'},
  //   {name:'Navigation', image:'navigation_thumb_b2.jpg'},
  //   {name:'Navigation (Dark Mode)', image:'Navigation_Dark_Mode.jpeg'},
  //   {name:'Newspaper Map', image:'Newspaper_Map.jpeg'},
  //   {name:'Nova Map', image:'Nova_Map.jpeg'}, 
  //   {name:'Oceans', image:'thumbnail1541180692006.jpeg'},
  //   {name:'OpenStreetMap', image:'thumbnail1547740877120.jpeg'},
  //   {name:'Streets', image:'street_thumb_b2wm.jpg'},
  //   {name:'Streets (Night)', image:'streetnight_thumb_b2.jpg'},
  //   {name:'Terrain with Labels', image:'Terrain_Labels_Web_map.jpg'},
  //   {name:'Topographic', image:'topo_thumb_b2wm.jpg'},
  //   {name:'Híbrido de imágenes', image:'ago_downloaded.png'},

  // ];
  // @ViewChildren('boton') botonesElementos!: QueryList<ElementRef>;

  // activarBoton(index: number) {
  //   this.botonActivo = index;
  //   this.botonesElementos.forEach((boton, i) => {
  //     if (i === index) {
  //       boton.nativeElement.classList.add('active');
  //     } else {
  //       boton.nativeElement.classList.remove('active');
  //     }
  //   });
  // }

}


