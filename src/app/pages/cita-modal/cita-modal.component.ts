import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';


import { ClienteModalComponent } from '../cliente-modal/cliente-modal.component';

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-cita-modal',
  templateUrl: './cita-modal.component.html',
  styleUrls: ['./cita-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatIconModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class CitaModalComponent {
  citaForm: FormGroup;
  isEditMode = false;
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  nombreCliente = '';
  mostrarAutocomplete = false;
  notificando = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CitaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data.cita;
    this.citaForm = this.fb.group({
      id_cita: [data.cita?.id_cita || 0],
      id_cliente: [data.cita?.id_cliente || '', Validators.required],
      nombre_cliente: [data.cita?.nombre_cliente || '', Validators.required],
      id_empresa: [data.cita?.id_empresa || data.empresa, Validators.required],
      fecha_cita: [data.cita?.fecha_cita ? new Date(data.cita.fecha_cita) : (data.fechaSeleccionada ? new Date(data.fechaSeleccionada) : null), Validators.required],
      hora_cita: [data.cita?.fecha_cita ? this.extraerHora(data.cita.fecha_cita) : '', Validators.required],
      estado: [data.cita?.estado || 'Pendiente'],
      nota: [data.cita?.nota || ''],
      fecha_creacion: [data.cita?.fecha_creacion || new Date().toISOString()]
    });

    this.cargarClientes();
  }

  cargarClientes() {
    this.apiService.getClientesPorEmpresa(this.data.empresa).subscribe(clientes => {
      this.clientes = clientes;
      this.clientesFiltrados = [...this.clientes];
    });
  }

  limpiarFiltro() {
    if (!this.citaForm.controls['nombre_cliente'].value) {
      this.mostrarAutocomplete = false;
      this.clientesFiltrados = [];
    }
  }

  filtrarClientes(event: any) {
    if (this.isEditMode) return;
    const valor = event.target.value.toLowerCase();
    this.nombreCliente = event.target.value;
    this.mostrarAutocomplete = valor.length > 0;

    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(valor)
    );
  }

  seleccionarCliente(event: any) {
    if (this.isEditMode) return;
    const clienteSeleccionado = this.clientes.find(c => c.id_cliente === event.option.value);
    if (clienteSeleccionado) {
      this.citaForm.controls['id_cliente'].setValue(clienteSeleccionado.id_cliente);
      this.citaForm.controls['nombre_cliente'].setValue(clienteSeleccionado.nombre);
    }
  }

  abrirModalNuevoCliente() {
    const dialogRef = this.dialog.open(ClienteModalComponent, {
      width: '500px',
      data: { empresa: this.data.empresa }
    });

    dialogRef.afterClosed().subscribe(nuevoCliente => {
      if (nuevoCliente) {
        this.clientes.push(nuevoCliente);
        this.clientesFiltrados = [...this.clientes];
        this.citaForm.controls['id_cliente'].setValue(nuevoCliente.id_cliente);
        this.citaForm.controls['nombre_cliente'].setValue(nuevoCliente.nombre);
      }
    });
  }

  crearNuevoCliente() {
    const nuevoCliente = {
      id_cliente: 0,
      id_empresa: this.data.empresa,
      nombre: this.nombreCliente,
      telefono: '',
      email: '',
      direccion: '',
      fecha_creacion: new Date().toISOString()
    };

    this.apiService.createCliente(nuevoCliente).subscribe(clienteCreado => {
      this.clientes.push(clienteCreado);
      this.citaForm.controls['id_cliente'].setValue(clienteCreado.id_cliente);
      this.nombreCliente = clienteCreado.nombre;
      this.clientesFiltrados = [...this.clientes];
    });
  }

  extraerHora(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  guardarCita() {
    if (this.citaForm.valid) {
      const fecha = this.citaForm.value.fecha_cita;
      const hora = this.citaForm.value.hora_cita;

      const fechaHoraCompleta = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
      const [horas, minutos] = hora.split(':').map(Number);
      fechaHoraCompleta.setHours(horas, minutos);

      const offset = fechaHoraCompleta.getTimezoneOffset() * 60000;
      const fechaFinal = new Date(fechaHoraCompleta.getTime() - offset);

      const citaData = {
        ...this.citaForm.value,
        fecha_cita: fechaFinal.toISOString(),
        token_confirmacion: ""
      };

      if (this.isEditMode) {
        this.apiService.updateCita(
          citaData.id_cita,
          citaData.id_cliente,
          citaData.id_empresa,
          citaData
        ).subscribe({
          next: () => {
            this.snackBar.open('Cita actualizada correctamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.dialogRef.close(true);
          },
          error: () => {
            this.snackBar.open('Error al actualizar la cita', 'Cerrar', {
              duration: 4000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['snackbar-error']
            });
          }
        });
      } else {        
        this.apiService.createCita(citaData).subscribe({
          next: () => {
            this.snackBar.open('Cita creada correctamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.dialogRef.close(true);
          },
          error: () => {
            this.snackBar.open('Error al crear la cita', 'Cerrar', {
              duration: 4000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['snackbar-error']
            });
          }
        });
      }
    } else {
      this.snackBar.open('Por favor, completa todos los campos obligatorios', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }

  eliminarCita() {
    if (confirm('¿Seguro que quieres eliminar esta cita?')) {
      this.apiService.deleteCita(
        this.citaForm.value.id_cita,
        this.citaForm.value.id_cliente,
        this.citaForm.value.id_empresa
      ).subscribe({
        next: () => {
          this.snackBar.open('Cita eliminada correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
          this.dialogRef.close(true);
        },
        error: err => {
          console.error('Error al eliminar cita:', err);
          this.snackBar.open('Error al eliminar la cita', 'Cerrar', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  cerrarModal() {
    this.dialogRef.close();
  }

  enviarNotificacion() {
    this.apiService.enviarNotificacion({
      id_cita: this.citaForm.value.id_cita,
      id_cliente: this.citaForm.value.id_cliente,
      id_empresa: this.citaForm.value.id_empresa,
    }).subscribe(() => {
      this.snackBar.open('Notificación enviada correctamente', 'Cerrar', { duration: 3000 });
      this.notificando = false;
    });
  }

  accionNotificacion() {
    this.notificando = true;
    this.confirmarAccion('notificar');
    setTimeout(() => this.notificando = false, 3000);
  }

  confirmarAccion(tipo: 'guardar' | 'eliminar' | 'notificar') {
    let mensaje = '';
    switch (tipo) {
      case 'guardar':
        mensaje = this.isEditMode ? '¿Deseas actualizar esta cita?' : '¿Deseas guardar esta nueva cita?';
        break;
      case 'eliminar':
        mensaje = '¿Seguro que deseas eliminar esta cita? Esta acción no se puede deshacer.';
        break;
      case 'notificar':
        mensaje = '¿Deseas enviar la notificación al cliente?';
        break;
    }
  
    if (confirm(mensaje)) {
      if (tipo === 'guardar') {
        this.guardarCita();
      } else if (tipo === 'eliminar') {
        this.eliminarCita();
        this.snackBar.open('Cita eliminada correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
      } else if (tipo === 'notificar') {
        this.enviarNotificacion();
        this.snackBar.open('Notificación enviada correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
      }
    }
  }  

  get infoBotonNotificacion() {
    if (!this.isEditMode || !this.citaForm?.value?.fecha_cita) {
      return { mostrar: false, clase: '', texto: '', icon: '', tooltip: '' };
    }

    const fechaCita = new Date(this.citaForm.value.fecha_cita);
    const hoy = new Date();
    fechaCita.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);

    const estado = this.citaForm.value.estado;

    if (fechaCita < hoy || this.esEstadoInactivo(estado)) {
      return { mostrar: false, clase: '', texto: '', icon: '', tooltip: '' };
    }

    if (estado === 'Confirmada') {
      return {
        mostrar: true,
        clase: 'btn-success',
        texto: 'Reenviar Confirmación',
        icon: 'check_circle',
        tooltip: 'Haz clic para reenviar la confirmación al cliente'
      };
    }

    return {
      mostrar: true,
      clase: 'btn-info',
      texto: 'Enviar Notificación',
      icon: 'send',
      tooltip: 'Haz clic para notificar al cliente'
    };
  }

  esEstadoInactivo(estado: string): boolean {
    return estado === 'Cancelada' || estado === 'Recibida';
  }
}
