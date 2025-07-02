import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentComponent } from '../../master/dialog-content/dialog-content.component';
import { DialogInstitutionsComponent } from '../../master/dialog-institutions/dialog-institutions.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../services/admin.services';


export interface ItemData {
  id: number;
  institucion: string;
  capas: string;
  activa: number;
}



@Component({
  selector: 'app-institutions',
  imports: [
    MatTooltipModule, MatIconModule, MatToolbarModule, MatFormFieldModule,
    MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatDialogModule
  ],
  templateUrl: './institutions.component.html',
  styleUrl: './institutions.component.css'
})
export default class InstitutionsComponent implements AfterViewInit {
  // abrir modal


  displayedColumns: string[] = ['institucion', 'capas', 'activa', 'orden', 'edit', 'delete'];
  dataSource: MatTableDataSource<ItemData> = new MatTableDataSource<ItemData>([]);

  items: ItemData[] = [];
  total: number = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator = new MatPaginator;
  @ViewChild(MatSort) sort: MatSort = new MatSort;


  constructor(
    public dialog: MatDialog,
    private adminService: AdminService
  ) {


    this.inicializar();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialogdelete(row?: ItemData) {
    const dialogRef = this.dialog.open(DialogContentComponent, {
      data: row,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.eliminarInstitucion(row?.id).subscribe({
          next: () => {
            this.inicializar();
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
          },
        });
      }
    })
  }

  openDialogedit(row?: ItemData) {
    const dialogRef = this.dialog.open(DialogInstitutionsComponent, {
      data: row || null,
      disableClose: true 
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.inicializar();
      }
    });
  }

  inicializar() {
    this.adminService.listarInstituciones({}).subscribe(
      (res: any) => {
        if (res.success && res.data && Array.isArray(res.data)) {
          this.items = res.data; // Asignar datos directamente
          this.total = res.total ?? 0;
          this.dataSource.data = this.items;
          //this.dataSource = new MatTableDataSource(this.items); // Inicializar dataSource con los datos
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

}

