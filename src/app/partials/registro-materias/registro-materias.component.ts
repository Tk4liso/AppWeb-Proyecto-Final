import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { FacadeService } from 'src/app/services/facade.service';
import { MateriasService } from 'src/app/services/materias.service';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-materias',
  templateUrl: './registro-materias.component.html',
  styleUrls: ['./registro-materias.component.scss']
})
export class RegistroMateriasComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public materia: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = "";
  public idMateria: Number = 0;

  // Listas para selects
  public diasSemana: string[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  public programas: string[] = ["(ICC) Ingeniería en Ciencias de la Computación", "(LCC) Licenciatura en Ciencias de la Computación", "(ITI) Ingeniería en Tecnologías de la Información"];
  public listaMaestros: any[] = [];

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private materiasService: MateriasService,
    private maestrosService: MaestrosService
  ) { }

  // ToDo: EditDel — igual que el profe pero copiado y adaptado desde registro-alumnos/maestros
  ngOnInit(): void {

    // Validar sesión
    this.token = this.facadeService.getSessionToken();
    if (this.token == "") {
      this.router.navigate(["/"]);
      return;
    }

    // Cargar maestros (para el select)
    this.obtenerMaestros();

    // El primer if valida si existe parámetro id en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idMateria = this.activatedRoute.snapshot.params['id'];
      console.log("ID Materia: ", this.idMateria);

      // Al iniciar la vista asignamos los datos
      this.obtenerMateria(this.idMateria);

    } else {
      this.materia = this.materiasService.esquemaMateria();
      this.materia.rol = this.rol;
    }

    console.log("Materia: ", this.materia);
  }

  obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.listaMaestros = response;
      },
      (error) => {
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  obtenerMateria(id: Number) {
    //console.log("Materia que se envía:", this.materia);
    this.materiasService.obtenerMateriaPorID(Number(id)).subscribe(
      (response) => {
        this.materia = response;

        // Si viene como string, parsear (igual que maestros con materias_json)
        if (typeof this.materia.dias === "string") {
          try {
            this.materia.dias = JSON.parse(this.materia.dias);
          } catch {
            this.materia.dias = [];
          }
        }

        console.log("Materia cargada: ", this.materia);
      },
      (error) => {
        alert("Error al obtener datos de la materia");
      }
    );
  }

  public regresar() {
    this.location.back();
  }

  //REGISTRAR
  public registrar() {
    // Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);

    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Crear una copia para enviar al backend:
    let data = { ...this.materia };

    //Convertir array de días a string
    data.dias = data.dias.join(",");

    //Convertir horas a 24h
    data.hora_inicio = this.convertTo24(data.hora_inicio);
    data.hora_fin = this.convertTo24(data.hora_fin);

    console.log("Materia enviada:", data);
    this.materiasService.registrarMateria(data).subscribe(
      (response) => {
        alert("Materia registrada exitosamente");
        this.router.navigate(["materias"]);
      },
      (error) => {
        alert("Error al registrar materia");
        console.error(error);
      }
    );
  }

  public actualizar() {
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);

    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    //Crear copia
    let data = { ...this.materia };

    //Convertir dias a string
    data.dias = data.dias.join(",");

    //Convertir a 24 hrs
    data.hora_inicio = this.convertTo24(data.hora_inicio);
    data.hora_fin = this.convertTo24(data.hora_fin);

    data.id = this.idMateria;

    console.log("Materia enviada. ACTUALIZAR:", data);
    this.materiasService.actualizarMateria(data).subscribe(
      (response) => {
        alert("Materia actualizada correctamente.");
        this.router.navigate(["/materias"]);
      },
      (error) => {
        alert("Error al actualizar materia.");
        console.error(error);
      }
    );
  }


  convertTo24(time: string): string {
    const date = new Date(`1970-01-01 ${time}`);
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  //No me dejó cambiar el nombre a validarEspeciales porque me marcaba error pq según no existía
  validarSalon(event: KeyboardEvent) {
    const tecla = event.key;
    const permitido = /^[a-zA-Z0-9 ]$/.test(tecla);
    const teclasEspeciales = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
    ];

    if (!permitido && !teclasEspeciales.includes(tecla)) {
      event.preventDefault();
    }
  }
}
