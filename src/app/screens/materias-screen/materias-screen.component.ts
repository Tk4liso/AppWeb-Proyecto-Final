import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { MateriasService } from 'src/app/services/materias.service';
import { FacadeService } from 'src/app/services/facade.service';

import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public lista_materias: any[] = [];
  public rol: string = "";
  public token: string = "";

  displayedColumns: string[] = [
    'nrc',
    'nombre',
    'seccion',
    'dias',
    'horario',
    'salon',
    'programa',
    'maestro_asignado',
    'creditos',
    'editar',
    'eliminar'
  ];

  dataSource = new MatTableDataSource<any>([]);

  private paginatorRef!: MatPaginator;
  private sortRef!: MatSort;

  @ViewChild(MatPaginator)
  set paginator(p: MatPaginator) {
    if (p) {
      this.paginatorRef = p;
      this.dataSource.paginator = p;
    }
  }

  @ViewChild(MatSort)
  set sort(s: MatSort) {
    if (s) {
      this.sortRef = s;
      this.dataSource.sort = s;
    }
  }

  constructor(
    public facadeService: FacadeService,
    private materiasService: MateriasService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if (this.token == "") {
      this.router.navigate(["/"]);
    }

    this.obtenerMaterias();
  }

  ngAfterViewInit(): void {
    // Sorting
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'nrc':
          return Number(item.nrc);
        case 'nombre':
          return (item.nombre || '').toLowerCase();
        case 'maestro_asignado':
          return (item.maestro_asignado || '').toString().toLowerCase();
        default:
          const val = (item as any)[property];
          return typeof val === 'string' ? val.toLowerCase() : val;
      }
    };

    // Filtering por nombre de la materia
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.nombre.toLowerCase().includes(filter);
    };
  }

  aplicarFiltro(valor: string) {
    this.dataSource.filter = (valor || '').trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  public obtenerMaterias() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response) => {
        this.lista_materias = response;

        //Transformar el horario
        this.lista_materias.forEach(m => {
          m.horario = `${m.hora_inicio} - ${m.hora_fin}`;
        });

        this.dataSource.data = this.lista_materias;

        if (this.dataSource.sort) {
          this.dataSource.sort.active = 'nombre';
          this.dataSource.sort.direction = 'asc';
          this.dataSource.sort.sortChange.emit();
        }

      }, (error) => {
        alert("No se pudo obtener la lista de materias");
      }
    );
  }

  public editar(idMateria: number) {
    //this.router.navigate(["registro-usuarios/materias/" + idMateria]);
    this.router.navigate(["/materias", idMateria]);
  }

  public eliminar(idMateria: number) {
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idMateria, rol: 'materia' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isDelete) {
        alert("Materia eliminada correctamente.");
        window.location.reload();
      } else {
        alert("No se ha podido eliminar la materia.");
      }
    });
  }

}
