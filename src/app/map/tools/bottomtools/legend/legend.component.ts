import { Component, Input, OnInit } from '@angular/core';
 
import {MatIconModule} from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import Legend from "@arcgis/core/widgets/Legend.js";



@Component({
  selector: 'app-legend',
  imports: [ MatIconModule, CommonModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './legend.component.html',
  styleUrl: './legend.component.css'
})
export class LegendComponent implements OnInit  {
  isLoading = false;
  // datos: any;

  @Input() view?: MapView
  @Input() webmap?: WebMap
  @Input() layers?: any[]

  ngOnInit() {
    let legend = new Legend({
      view: this.view, 
      container : "Mapa-Leyenda"
    });

     
  }
}
