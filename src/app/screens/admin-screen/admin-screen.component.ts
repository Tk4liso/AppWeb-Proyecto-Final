import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';
//ToDo: EditDel - xd
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit {
  // Variables y métodos del componente
  public name_user: string = "";
  public lista_admins: any[] = [];
  public rol: string = "";
  public token: string = "";

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();

    //ToDO: EditDel - brrr
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if (this.token == "") {
      this.router.navigate(["/"]);
    }

    // Obtenemos los administradores
    this.obtenerAdmins();
  }

  //Obtener lista de usuarios
  public obtenerAdmins() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response) => {
        this.lista_admins = response;
        console.log("Lista users: ", this.lista_admins);
      }, (error) => {
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/administrador/" + idUser]);
  }

  //ToDo: EditDel - brr
  public delete(idUser: number) {
    const userId = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'administrador' }, //ToDo: userId es el id del que se logueó, no del que van a eliminar.
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
          console.log("Admin eliminado");
          alert("Admin eliminado correctamente.");
          //Recargar página
          window.location.reload();
        } else {
          alert("Admin no se ha podido eliminar.");
          console.log("No se eliminó el administrador");
        }
      });
    } else {
      alert("No tienes permisos para eliminar este administrador.");
    }
  }

}
