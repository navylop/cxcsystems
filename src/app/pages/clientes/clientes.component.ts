import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '@auth0/auth0-angular';
import { TipoNotificacion } from '../../models/tipo-notificacion';

//excel
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  clientesPaginados: any[] = [];

  clienteForm: any = this.resetClienteForm();
  editando = false;

  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;

  id_empresa: string | undefined;
  private authSubscription: Subscription | undefined;

  tipoNotificacionEnum = TipoNotificacion;

  ordenColumna: string = 'nombre';
  ordenAscendente: boolean = true;

  constructor(
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.auth.idTokenClaims$.subscribe(claims => {
      if (claims) {
        this.id_empresa = claims['https://miapp.com/empresa'];
        this.auth.isAuthenticated$.subscribe(isAuthenticated => {
          if (isAuthenticated) {
            this.cargarClientes();
          }
        });
      }
    });
  }

  cargarClientes(): void {
    this.api.getClientesPorEmpresa(this.id_empresa).subscribe(data => {
      this.clientes = data;
      this.clientesFiltrados = [...data];
      this.actualizarPaginacion();
    });
  }

  guardarCliente(form?: any): void {
    const telefonoRegex = /^(\+34\s?)?(\d{9}|\d{3}\s\d{2,3}\s\d{2,3})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    // ✅ Validación de teléfono
    if (!telefonoRegex.test(this.clienteForm.telefono)) {
      alert("Teléfono no válido.");
      return;
    }
  
    // ✅ Validación de email solo si está presente
    if (this.clienteForm.email && !emailRegex.test(this.clienteForm.email)) {
      alert("Email no válido.");
      return;
    }
  
    // ✅ Normalizar campos vacíos a null
    if (this.clienteForm.email?.trim() === '') this.clienteForm.email = null;
    if (this.clienteForm.direccion?.trim() === '') this.clienteForm.direccion = null;
  
    // Asignar empresa
    this.clienteForm.id_empresa = this.id_empresa;
  
    const onFinish = () => {
      this.cargarClientes();
      this.resetFormulario(form);
    };
  
    if (this.editando) {
      this.api.updateCliente(this.clienteForm.id_cliente, this.id_empresa, this.clienteForm)
        .subscribe(() => onFinish());
    } else {
      this.api.getClientePorTelefono(this.id_empresa, this.clienteForm.telefono).subscribe({
        next: (clienteExistente) => {
          alert(`Ya existe un cliente con este teléfono:\n\nNombre: ${clienteExistente.nombre}\nEmail: ${clienteExistente.email ?? '—'}\nDirección: ${clienteExistente.direccion ?? '—'}`);
        },
        error: () => {
          // Si no hay duplicado, lo guarda
          this.clienteForm.id_cliente = 0;
          this.api.createCliente(this.clienteForm).subscribe(() => onFinish());
        }
      });
    }
  }
 

  editarCliente(cliente: any): void {
    this.clienteForm = { ...cliente };
    this.editando = true;
  }

  eliminarCliente(cliente: any): void {
    if (confirm(`¿Seguro que quieres eliminar a ${cliente.nombre}?`)) {
      this.api.deleteCliente(cliente.id_cliente, cliente.id_empresa)
        .subscribe(() => this.cargarClientes());
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }

  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.clientesPaginados = this.clientesFiltrados.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.clientesFiltrados.length / this.elementosPorPagina);
  }

  get totalPaginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  resetFormulario(form?: any): void {
    this.clienteForm = this.resetClienteForm();
    this.editando = false;

    if (form) {
      form.resetForm();
    }

    this.clientesFiltrados = [...this.clientes];
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  resetClienteForm(): any {
    return {
      id_cliente: null,
      id_empresa: '',
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      //tipo_notificacion: TipoNotificacion.WhatsApp
      tipo_notificacion: null
    };
  }

  buscarClientes(): void {
    const filtroNombre = this.clienteForm.nombre?.toLowerCase() ?? '';
    const filtroTelefono = this.clienteForm.telefono?.toLowerCase() ?? '';
    const filtroEmail = this.clienteForm.email?.toLowerCase() ?? '';
    const filtroDireccion = this.clienteForm.direccion?.toLowerCase() ?? '';
    const filtroTipo = this.clienteForm.tipo_notificacion;

    this.clientesFiltrados = this.clientes.filter(cliente => {
      const nombre = cliente.nombre?.toLowerCase() ?? '';
      const telefono = cliente.telefono?.toLowerCase() ?? '';
      const email = cliente.email?.toLowerCase() ?? '';
      const direccion = cliente.direccion?.toLowerCase() ?? '';
      const tipo = cliente.tipo_notificacion;

      return (
        (!filtroNombre || nombre.includes(filtroNombre)) &&
        (!filtroTelefono || telefono.includes(filtroTelefono)) &&
        (!filtroEmail || email.includes(filtroEmail)) &&
        (!filtroDireccion || direccion.includes(filtroDireccion)) &&
        (!filtroTipo || tipo === filtroTipo)
      );
    });

    this.paginaActual = 1;
    this.actualizarPaginacion();
  }


  ordenarPor(columna: string): void {
    if (this.ordenColumna === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenColumna = columna;
      this.ordenAscendente = true;
    }

    this.clientesFiltrados.sort((a, b) => {
      const valorA = (a[columna] ?? '').toString().toLowerCase();
      const valorB = (b[columna] ?? '').toString().toLowerCase();

      if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
      if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
      return 0;
    });

    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  exportarAExcel(): void {
    const clientesExport = this.clientesFiltrados.map(cliente => ({
      Nombre: cliente.nombre,
      Teléfono: cliente.telefono,
      Email: cliente.email,
      Dirección: cliente.direccion,
      'Tipo Notificación': this.getNombreTipo(cliente.tipo_notificacion)
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(clientesExport);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Clientes': worksheet },
      SheetNames: ['Clientes']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, 'clientes.xlsx');
  }

  getNombreTipo(tipo: number): string {
    return TipoNotificacion[tipo] ?? 'Desconocido';
  }
}
