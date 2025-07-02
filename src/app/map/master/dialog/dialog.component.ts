import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'; // Importa MatDialogModule
import {MatIconModule} from '@angular/material/icon';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
 standalone: true,
   imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,MatDialogModule, MatIconModule
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css'
})
export class DialogComponent {
  mensaje : string = ""

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string | null,
    private dialogRef: MatDialogRef<DialogComponent>,
  ) {
       this.mensaje = data || ""
  }

}
