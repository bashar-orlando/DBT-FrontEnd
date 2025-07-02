import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms'

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
import { DialogEditComponent } from '../../master/dialog-edit/dialog-edit.component';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface UserData {
  id_capa: number;
  nombre: string;
  id_institucion: number;
  institucion: string;
  url_servicio: string;
  servicios: string;
  orden_lista: number;
  orden_dibujo: number;
  disponible: number;
  activa: number;
  consulta: number;
  edit: string;
  delete: string;
  tipo: string;

  srs: string;
  wms: number;
  url_wms: string;
  servicio_wms: string;

}

import { MatSelectModule } from '@angular/material/select';
import { AdminService } from '../../services/admin.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layer',
  imports: [
    MatSelectModule
    , MatTooltipModule
    , MatIconModule
    , MatToolbarModule
    , MatFormFieldModule
    , MatInputModule
    , MatTableModule
    , MatSortModule
    , MatPaginatorModule
    , MatDialogModule
    , CommonModule
    , FormsModule
  ],
  templateUrl: './layer.component.html',
  styleUrl: './layer.component.css'
})
export default class LayerComponent implements AfterViewInit {
  // modal


  displayedColumns: string[] = ['institucion', 'nombre', 'tipo', 'srs', 'disponible', 'orden_lista', 'orden_dibujo', 'edit', 'delete'];
  dataSource: MatTableDataSource<UserData> = new MatTableDataSource<UserData>([]);

  items: UserData[] = [];
  total: number = 0;
  instituciones: any[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator = new MatPaginator;
  @ViewChild(MatSort) sort: MatSort = new MatSort;

  selectedInstitucion: string = 'Todos';
  filterValue: string = '';


  constructor(
    public dialog: MatDialog,
    private adminService: AdminService
  ) {

    this.inicializar()
    this.dataSource.filterPredicate = (data: UserData, filter: string) => {
      try {
        const filterObj = JSON.parse(filter || '{}');
        const nombreMatch = data.nombre
          .toLowerCase()
          .includes(filterObj.nombre?.toLowerCase() || '');

        if (filterObj.institucion === 'Todos') {
          return nombreMatch;
        }

        const institucionMatch = data.institucion === filterObj.institucion;
        return institucionMatch && nombreMatch;
      } catch (error: any) {

        return true; // Mostrar todos los datos si hay un error
      }
    };
 
    this.cargarInstituciones();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event?: Event) {
    if (event) {
      this.filterValue = (event.target as HTMLInputElement).value;
    }

    const filterObj = {
      institucion: this.selectedInstitucion,
      nombre: this.filterValue.trim(),
    };

    this.dataSource.filter = JSON.stringify(filterObj);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

  }

  inicializar() {
    this.adminService.listarCapas({}).subscribe(
      (res: any) => {
        if (res.success && res.data && Array.isArray(res.data)) {
          this.items = res.data;
          this.total = res.total ?? 0
          this.dataSource.data = this.items
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  cargarInstituciones() {
    this.adminService.listarInstituciones({}).subscribe(
      (res: any) => {
        if (res.success && res.data && Array.isArray(res.data)) {
          this.instituciones = res.data;
        }
      },
      (error: any) => {
        console.error('Error al cargar instituciones:', error);
      }
    );
  }

  openDialogedit(row?: UserData) {
    const dialogRef = this.dialog.open(DialogEditComponent, {
      data: row || null,
      disableClose: true 
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.inicializar();
      }
    });
  }


  openDialogdelete(row?: UserData) {
    const dialogRef = this.dialog.open(DialogContentComponent, {
      data: row,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.eliminarCapa(row?.id_capa).subscribe({
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

} 