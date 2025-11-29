import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaMateria() {
    return {
      nrc: '',
      nombre: '',
      seccion: '',
      dias: [],    //en el formulario será un arreglo de checkboxes
      hora_inicio: '',
      hora_fin: '',
      salon: '',
      programa: '',
      maestro_asignado: '',
      creditos: ''
    }
  }

  public validarMateria(data: any, editar: boolean) {
    let error: any = {};

    if (!this.validatorService.required(data["nrc"])) {
      error["nrc"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["nrc"])) {
      error["nrc"] = "Solo números";
    } else if (!this.validatorService.min(data["nrc"], 5) || !this.validatorService.max(data["nrc"], 5)) {
      error["nrc"] = "Debe ser de 5 dígitos";
    }
    if (!this.validatorService.required(data["nombre"])) {
      error["nombre"] = this.errorService.required;
    }
    if (!this.validatorService.required(data["seccion"])) {
      error["seccion"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["seccion"])) {
      error["seccion"] = "Solo números";
    } else if (!this.validatorService.max(data["seccion"], 3)) {
      error["seccion"] = "Máximo 3 dígitos";
    }
    if (!data["dias"] || data["dias"].length === 0) {
      error["dias"] = "Seleccione al menos un día";
    }
    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["hora_fin"])) {
      error["hora_fin"] = this.errorService.required;
    }
    if (!this.validatorService.required(data["salon"])) {
      error["salon"] = this.errorService.required;
    }
    if (!this.validatorService.required(data["programa"])) {
      error["programa"] = this.errorService.required;
    }
    if (!this.validatorService.required(data["maestro_asignado"])) {
      error["maestro_asignado"] = this.errorService.required;
    }
    if (!this.validatorService.required(data["creditos"])) {
      error["creditos"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["creditos"])) {
      error["creditos"] = "Debe ser numérico";
    }

    //Return arreglo
    return error;
  }

  //Aquí van los servicios HTTP
  public registrarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return this.http.post<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  public obtenerListaMaterias(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.get<any>(`${environment.url_api}/lista-materias/`, { headers });
  }

  public obtenerMateriaPorID(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.get<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }

  public actualizarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.put<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  public eliminarMateria(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.delete<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }
}
