import { Component,signal, OnInit } from '@angular/core';
import { RouterModule,  Routes } from '@angular/router';
import { SidebarComponent } from './master/sidebar/sidebar.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSidenavModule} from '@angular/material/sidenav';
import * as AOS from 'aos';
import { Router } from '@angular/router';
 


@Component({
 
  selector: 'app-admin',
  imports: [RouterModule, SidebarComponent, MatSidenavModule,MatButtonModule,FormsModule,MatCheckboxModule, MatIconModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export default class AdminComponent implements OnInit {
  constructor(private router: Router) {}
  show = true;
 
  hide = signal(true);
  hide2 = signal(true);
  elem = document.documentElement;
 
  events: string[] = [];
  opened: boolean = true;
  clickside($event: MouseEvent) {
    this.hide2.set(!this.hide2());
  }
  clickicoexp($event: MouseEvent) {
    this.hide.set(!this.hide());
  
    if(this.elem.requestFullscreen)
      {this.elem.requestFullscreen();
      }
      
      if (document.exitFullscreen)
      {document.exitFullscreen();}
   
    }
  ngOnInit():void{
    AOS.init();
    this.router.navigate(['/admin/index']);
  }
  
}
