import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'; // Importa MatDialogModule
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {
  MatSlideToggleModule
} from '@angular/material/slide-toggle';
import { UserData } from '../../pages/layer/layer.component';
import { AdminService } from '../../services/admin.services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-edit',
  imports: [MatDialogModule
    , MatFormFieldModule
    , MatInputModule
    , MatIconModule
    , MatSelectModule
    , MatSlideToggleModule
    , FormsModule
    , CommonModule
    , MatFormFieldModule
  ],
  templateUrl: './dialog-edit.component.html',
  styleUrl: './dialog-edit.component.css'
})
export class DialogEditComponent {
  
  nombre: string = '';
  id_institucion: number = 0;
  url_servicio: string = '';
  servicios: string = '';
  orden_lista: number = 0;
  orden_dibujo: number = 0;
  disponible: boolean = true;
  activa: boolean = false;
  consulta: boolean = false;
  instituciones: any[] = [];
  tipo: string = 'AG';

  srs: string = 'WGS84';
  wms: boolean = false;
  url_wms: string = '';
  servicio_wms: string = '';


  tipos: any[] = [{tipo: "AG"}, {tipo: "WMS"}];
  
  srss: any[] = [{srs: "WGS84"}, {srs: "PSAD56"}, {srs: "SIRGAS"}];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UserData | null,
    private dialogRef: MatDialogRef<DialogEditComponent>,
    private adminService: AdminService
  ) {
    this.cargarInstituciones();
    if (data) {  
      this.nombre = data.nombre || '';
      this.id_institucion = data.id_institucion || 0;
      this.url_servicio = data.url_servicio || '';
      this.servicios = data.servicios || '';
      this.orden_lista = data.orden_lista || 0;
      this.orden_dibujo = data.orden_dibujo || 0;
      this.disponible = data.disponible === 1;
      this.activa = data.activa === 1;
      this.consulta = data.consulta === 1;
      this.tipo = data.tipo || '';
      
      this.wms = data.wms === 1;
      this.srs = data.srs || '';
      this.url_wms = data.url_wms || '';
      this.servicio_wms = data.servicio_wms || '';
      
    }
  }

  cargarInstituciones() {
    this.adminService.listarInstituciones({}).subscribe(
      (res: any) => {
        if (res.success && res.data && Array.isArray(res.data)) {
          this.instituciones = res.data;
        }
      },
      (error:any) => {
        console.error('Error al cargar instituciones:', error);
      }
    );
  }  

  guardar() {
    const capaData: UserData = {
      id_capa: this.data?.id_capa || 0,
      nombre: this.nombre,
      id_institucion: this.id_institucion,
      institucion: this.instituciones.find(i => i.id === this.id_institucion)?.institucion || '',
      url_servicio: this.url_servicio,
      servicios: this.servicios,
      orden_lista: this.orden_lista,
      orden_dibujo: this.orden_dibujo,
      disponible: this.disponible ? 1 : 0,
      activa: this.activa ? 1 : 0,
      consulta: this.consulta ? 1 : 0,
      edit: '',
      delete: '',
      tipo: this.tipo,
      srs: this.srs,
      wms: this.wms ? 1 : 0,
      url_wms: this.url_wms,
      servicio_wms: this.servicio_wms,
    };

    if (this.data) { 
      this.adminService.actualizarCapa(capaData).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (error) => console.error('Error al actualizar:', error),
      });
    } else {  
      this.adminService.agregarCapa(capaData).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (error) => console.error('Error al agregar:', error),
      });
    }
  }  

}
