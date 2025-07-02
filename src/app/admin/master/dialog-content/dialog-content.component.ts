import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'; // Importa MatDialogModule
import {MatIconModule} from '@angular/material/icon';
@Component({
  selector: 'app-dialog-content',
  imports: [MatDialogModule,MatIconModule],
  templateUrl: './dialog-content.component.html',
  styleUrl: './dialog-content.component.css'
})
export class DialogContentComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogContentComponent>
  ) {}  

  confirmar() {
    this.dialogRef.close(true); // Devolver true para confirmar la eliminación
  }

  cancelar() {
    this.dialogRef.close(false); // Devolver false para cancelar
  }

}
