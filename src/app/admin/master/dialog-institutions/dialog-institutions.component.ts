import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'; // Importa MatDialogModule
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { AdminService } from '../../services/admin.services';

export interface ItemData {
  id: number;
  institucion: string;
  capas: string;
  activa: number;
  orden: number;
}

@Component({
  selector: 'app-dialog-institutions',
  imports: [MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,MatSelectModule, MatSlideToggleModule,FormsModule],
  templateUrl: './dialog-institutions.component.html',
  styleUrl: './dialog-institutions.component.css'
})
export class DialogInstitutionsComponent {
  institucion: string = ''; 
  idinstitucion:number=0;
  activa: boolean = true;
  orden:number=0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ItemData | null,
    private dialogRef: MatDialogRef<DialogInstitutionsComponent>,
    private adminService: AdminService
  ) {
    if (data) {
      this.institucion = data.institucion || '';
      this.idinstitucion = data.id || 0; 
      this.activa = data.activa === 1; 
      this.orden = data.orden;
    }
  }

  guardar() {
    const institucionData: ItemData = {
      id: this.data?.id || 0,
      institucion: this.institucion,
      capas: '', 
      activa: this.activa ? 1 : 0, 
      orden : this.orden
    };

    if (this.data) {
      this.adminService.actualizarInstitucion(institucionData).subscribe({
        next: (res) => {
          this.dialogRef.close(res);
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
        },
      });
    } else {
      // Agregar registro
      this.adminService.agregarInstitucion(institucionData).subscribe({
        next: (res) => {
          this.dialogRef.close(res);
        },
        error: (error) => {
          console.error('Error al agregar:', error);
        },
      });
    }
  }

  validateFormat(event : any) {
    let key;
    if (event.type === 'paste') {
      key = event.clipboardData.getData('text/plain');
    } else {
      key = event.keyCode;
      key = String.fromCharCode(key);
    }
    const regex = /[0-9]|\./;
     if (!regex.test(key)) {
      event.returnValue = false;
       if (event.preventDefault) {
        event.preventDefault();
       }
     }
    }

}
