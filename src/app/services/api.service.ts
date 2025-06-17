import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = environment.apiUrl;
//const API_URL = 'https://radiacitesapi.onrender.com/api';

@Injectable({ providedIn: 'root' })

export class ApiService {
  
  constructor(private http: HttpClient) {}

  // Citas
  getCitas(): Observable<any> {  
    return this.http.get(`${API_URL}/Citas`);
  }

  getCita(id_cita: number, id_cliente: number, id_empresa: string): Observable<any> {
    return this.http.get(`${API_URL}/Citas/${id_cita}/${id_cliente}/${id_empresa}`);
  }

  getCitasPorEmpresa(id_empresa: string): Observable<any> {
    return this.http.get(`${API_URL}/Citas/Empresa/${id_empresa}`);
  } 

  createCita(cita: any): Observable<any> {
    return this.http.post(`${API_URL}/Citas`, cita);
  }

  updateCita(id_cita: number, id_cliente: number, id_empresa: string, cita: any): Observable<any> {
    return this.http.put(`${API_URL}/Citas/${id_cita}/${id_cliente}/${id_empresa}`, cita);
  }

  deleteCita(id_cita: number, id_cliente: number, id_empresa: string): Observable<any> {
    return this.http.delete(`${API_URL}/Citas/${id_cita}/${id_cliente}/${id_empresa}`);
  }

  // Clientes
  getClientes(): Observable<any> {
    return this.http.get(`${API_URL}/Clientes`);
  }

  getCliente(id_cliente: number, id_empresa: string): Observable<any> {
    return this.http.get(`${API_URL}/Clientes/${id_cliente}/${id_empresa}`);
  }

  getClientesPorEmpresa(id_empresa: string): Observable<any> {
    return this.http.get(`${API_URL}/Clientes/Empresa/${id_empresa}`);
  } 

  createCliente(cliente: any): Observable<any> {
    return this.http.post(`${API_URL}/Clientes`, cliente);
  }

  updateCliente(id_cliente: number, id_empresa: string, cliente: any): Observable<any> {
    return this.http.put(`${API_URL}/Clientes/${id_cliente}/${id_empresa}`, cliente);
  }

  deleteCliente(id_cliente: number, id_empresa: string): Observable<any> {
    return this.http.delete(`${API_URL}/Clientes/${id_cliente}/${id_empresa}`);
  }

  // Logs
  getLogs(): Observable<any> {
    return this.http.get(`${API_URL}/Logs`);
  }

  getLog(id_log: number, id_cliente: number, id_empresa: string): Observable<any> {
    return this.http.get(`${API_URL}/Logs/${id_log}/${id_cliente}/${id_empresa}`);
  }

  getLogsPorEmpresa(id_empresa: string): Observable<any> {
    return this.http.get(`${API_URL}/Logs/Empresa/${id_empresa}`);
  } 

  createLog(log: any): Observable<any> {
    return this.http.post(`${API_URL}/Logs`, log);
  }

  // Notificaciones
  getNotificaciones(): Observable<any> {
    return this.http.get(`${API_URL}/Notificaciones`);
  }

  getNotificacion(id_notificacion: number, id_cita: number, id_cliente: number, id_empresa: string): Observable<any> {
    return this.http.get(`${API_URL}/Notificaciones/${id_notificacion}/${id_cita}/${id_cliente}/${id_empresa}`);
  }

  getNotificacionesPorCita(id_cita: number, id_cliente: number, id_empresa: string): Observable<any> {
    return this.http.get(`${API_URL}/Notificaciones/Cita/${id_cita}/${id_cliente}/${id_empresa}`);
  }
  
  getNotificacionesPorEmpresa(id_empresa: string): Observable<any> {
    return this.http.get(`${API_URL}/Notificaciones/Empresa/${id_empresa}`);
  } 

  createNotificacion(notificacion: any): Observable<any> {
    return this.http.post(`${API_URL}/Notificaciones`, notificacion);
  }

  getConfiguracionNotificacion(id_empresa: string): Observable<any> {
    return this.http.get(`${API_URL}/ConfiguracionNotificacion/${id_empresa}`);
  }
  
  guardarConfiguracionNotificacion(config: any): Observable<any> {
    return this.http.post(`${API_URL}/ConfiguracionNotificacion`, config);
  }

  enviarNotificacion(data: { id_cita: number, id_cliente: number, id_empresa: string }): Observable<any> {
    console.log(data);
    
    return this.http.post(`${API_URL}/Notificaciones/Enviar`, data);
  }

  getClientePorTelefono(id_empresa: string, telefono: string) {
    return this.http.get<any>(`${API_URL}/Clientes/PorTelefono/${id_empresa}/${telefono}`);
  }

  // Notas
  /*
  getNotasPorEmpresa(id_empresa: string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Notas/${id_empresa}`);
  }*/
  getNotasPorEmpresa(id_empresa: string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Notas/Empresa/${id_empresa}`);
  }


  getNota(id_nota: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/Notas/detalle/${id_nota}`);
  }

  createNota(nota: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/Notas`, nota);
  }

  updateNota(nota: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/Notas/${nota.id_nota}`, nota);
  }

  deleteNota(id_nota: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/Notas/${id_nota}`);
  }

  // LISTA DE ESPERA

  getListaEsperaPorEmpresa(id_empresa: string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/ListaEspera/Empresa/${id_empresa}`);
  }

  createListaEspera(item: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/ListaEspera`, item);
  }

  deleteListaEspera(id_lista: number): Observable<any> {
    return this.http.delete(`${API_URL}/ListaEspera/${id_lista}`);
  }

}
