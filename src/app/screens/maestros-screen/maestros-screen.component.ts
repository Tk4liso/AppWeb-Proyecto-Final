import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';

//ToDo: Agregar el sorting
import { MatSort } from '@angular/material/sort';
//ToDo: EditDel - xd
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})

export class MaestrosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];

  //Para la tabla
  displayedColumns: string[] = ['id_trabajador', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'cubiculo', 'area_investigacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>([]);

  //ToDo: para el sorting
  private paginatorRef!: MatPaginator;
  private sortRef!: MatSort;

  //SETTERS: inicializa el paginator después de crear el componente
  @ViewChild(MatPaginator)
  set paginator(p: MatPaginator) {
    if (p) {
      this.paginatorRef = p;
      this.dataSource.paginator = p;
    }
  }

  //ToDo: Para el sorting
  @ViewChild(MatSort)
  set sort(s: MatSort) {
    if (s) {
      this.sortRef = s;
      this.dataSource.sort = s;
    }
  }

  ngAfterViewInit(): void {
    //this.dataSource.paginator = this.matPaginator;
    //this.dataSource.sort = this.matSort; //ToDo: agregar sorting y filtering

    //Sorting
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'id_trabajador':
          return Number(item.id_trabajador ?? item.id ?? 0); //operadores ternarios
        case 'nombre':
          return `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
        default:
          const val = (item as any)[property];
          return typeof val === 'string' ? val.toLowerCase() : val;
      }
    };

    //Filtering
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const nombre = `${data.first_name || ''} ${data.last_name || ''}`.toLowerCase();
      return nombre.includes(filter);
    };

  }

  //ToDo: aplicar filtro
  aplicarFiltro(valor: string) {
    this.dataSource.filter = (valor || '').trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  constructor(
    public facadeService: FacadeService,
    public maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log('Brrr MaestrosScreen ngOnInit');
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if (this.token == "") {
      this.router.navigate(["/"]);
    }
    //Obtener maestros
    this.obtenerMaestros();
  }

  // Consumimos el servicio para obtener los maestros
  //Obtener maestros
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        console.log("Lista users: ", this.lista_maestros);
        if (this.lista_maestros.length > 0) {
          //Agregar datos del nombre e email
          this.lista_maestros.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Maestros: ", this.lista_maestros);

          //ToDo: no recrear dataSource para no perder los enlaces previos sort y paginator
          //this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_maestros as DatosUsuario[]);
          this.dataSource.data = this.lista_maestros as DatosUsuario[];

          // ordenar por defecto solo si sort ya está enlazado
          if (this.dataSource.sort) {
            this.dataSource.sort.active = 'nombre';
            this.dataSource.sort.direction = 'asc';
            this.dataSource.sort.sortChange.emit();
          }

        }
      }, (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/maestros/" + idUser]);
  }

  //ToDo: EditDel - brr
  public delete(idUser: number) {
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    const userId = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador' || (this.rol === 'maestro' && userId === idUser)) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        //data: {id: userId, rol: 'maestro'}, //Se pasan valores a través del componente
        data: { id: idUser, rol: 'maestro' }, //ToDo: userId es el id del que se logueó, no del que van a eliminar.
        height: '288px',
        width: '328px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Maestro eliminado");
        alert("Maestro eliminado correctamente.");
        //Recargar página
        window.location.reload();
      }else{
        alert("Maestro no se ha podido eliminar.");
        console.log("No se eliminó el maestro");
      }
    });
    }else{
      alert("No tienes permisos para eliminar este maestro.");
    }
  }

}

//Esto va fuera de la llave que cierra la clase
export interface DatosUsuario {
  id: number,
  id_trabajador: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  cubiculo: string,
  area_investigacion: number,
}
