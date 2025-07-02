import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';

import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';

@Component({
  selector: 'app-coordenadas',
  imports: [],
  templateUrl: './coordenadas.component.html',
  styleUrl: './coordenadas.component.css'
})
export class CoordenadasComponent implements OnInit, AfterViewInit {
  @Input() view?: MapView
  @Input() webmap?: WebMap
  coordenadas: String = ""

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.view!.on("pointer-move", (evt: any) => {
      try {
        let pt = this.view!.toMap({ x: evt.x, y: evt.y });
        let coords = "Lat/Lon " + pt.latitude?.toFixed(3) + " " + pt.longitude?.toFixed(3);
        this.coordenadas = coords;
        ;
      } catch (ex) {

      }
    })
  }

}
