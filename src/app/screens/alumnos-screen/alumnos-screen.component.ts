import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

//ToDo: Copiar y pegar desde admin-screen.component.ts y maestros-screen.component.ts y adaptar según sea el caso
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

//ToDo: EditDel - xd
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})

export class AlumnosScreenComponent {
  // Variables y métodos del componente
  public name_user: string = "";
  public lista_alumnos: any[] = [];

  //ToDo: EditDel - copié de maestros
  public rol: string = "";
  public token: string = "";

  displayedColumns: string[] = [
    'matricula',
    'nombre',
    'email',
    'fecha_nacimiento',
    'curp',
    'rfc',
    'edad',
    'telefono',
    'ocupacion',
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
    private alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();

    //ToDo: EditDel - copié y adapté de maestros
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if (this.token == "") {
      this.router.navigate(["/"]);
    }

    // Obtenemos los alumnos
    this.obtenerAlumnos();
  }

  ngAfterViewInit(): void {
    // Sorting
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'matricula':
          return isNaN(+item.matricula) ? (item.matricula ?? '') : Number(item.matricula ?? 0);
        case 'nombre':
          return `${item.user?.first_name || ''} ${item.user?.last_name || ''}`.toLowerCase();
        default:
          const val = (item as any)[property];
          return typeof val === 'string' ? val.toLowerCase() : val;
      }
    };

    //Filtering por NOMBRE
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const nombre = `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.toLowerCase();
      return nombre.includes(filter);
    };
  }

  //ToDo: aplicar filtro
  aplicarFiltro(valor: string) {
    this.dataSource.filter = (valor || '').trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  //Obtener lista de usuarios
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log("Lista users: ", this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          //Agregar datos del nombre e email
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Alumnos: ", this.lista_alumnos);

          //ToDo: no recrear dataSource para no perder los enlaces previos sort y paginator
          //this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_maestros as DatosUsuario[]);
          this.dataSource.data = this.lista_alumnos;

          // ordenar por defecto solo si sort ya está enlazado
          if (this.dataSource.sort) {
            this.dataSource.sort.active = 'nombre';
            this.dataSource.sort.direction = 'asc';
            this.dataSource.sort.sortChange.emit();
          }

        }
      }, (error) => {
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/alumnos/" + idUser]);
  }

  //ToDo: EditDel - brr
  public delete(idUser: number) {
    // Administrador puede eliminar cualquier alumno
    // Alumno solo puede eliminar su propio registro
    const userId = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador' || (this.rol === 'alumno' && userId === idUser)) {
      //Si es administrador o es alumno, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        //data: {id: userId, rol: 'alumno'}, //Se pasan valores a través del componente
        data: { id: idUser, rol: 'alumno' }, //ToDo: userId es el id del que se logueó, no del que van a eliminar.
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
          console.log("Alumno eliminado");
          alert("Alumno eliminado correctamente.");
          //Recargar página
          window.location.reload();
        } else {
          alert("Alumno no se ha podido eliminar.");
          console.log("No se eliminó el alumno");
        }
      });
    } else {
      alert("No tienes permisos para eliminar este alumno.");
    }
  }

}
