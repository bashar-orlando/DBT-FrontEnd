import { Component, OnInit } from '@angular/core';
 
import { RouterModule } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRippleModule} from '@angular/material/core';
import * as AOS from 'aos';
@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, MatIconModule, MatTooltipModule, MatRippleModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  ngOnInit():void{
    AOS.init();
 
  }
}
