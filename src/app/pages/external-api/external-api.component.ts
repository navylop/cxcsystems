import { Component, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ApiService } from '../../services/api.service';
import { AuthService } from '@auth0/auth0-angular';
import { CitaModalComponent } from '../cita-modal/cita-modal.component';
import { Subscription, timer, switchMap } from 'rxjs';

@Component({
  selector: 'app-external-api',
  templateUrl: './external-api.component.html',
  styleUrls: ['./external-api.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    MatDialogModule
  ]
})
export class ExternalApiComponent implements OnDestroy {
  user: any;
  empresa: string | undefined;
  citas: any[] = [];
  calendarVisible = false;
  cargando = false;
  toastVisible = false;

  private authSubscription: Subscription | undefined;
  private refreshSubscription: Subscription | undefined;

  calendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    editable: true,
    selectable: true,
    events: [],
    customButtons: {
      refrescar: {
        text: '↻',
        click: () => this.refrescarCitasManualmente()
      }
    },
    headerToolbar: {
      left: 'refrescar',
      center: 'title',
      right: 'today prev,next'
    },
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this)
  };


  constructor(
    public auth: AuthService,
    private apiService: ApiService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authSubscription = this.auth.idTokenClaims$.subscribe(claims => {
      if (claims) {
        this.empresa = claims['https://miapp.com/empresa'];
        this.auth.isAuthenticated$.subscribe(isAuthenticated => {
          if (isAuthenticated && this.empresa) {
            this.iniciarRefrescoCitas();
          }
        });
      }
    });
  }

  iniciarRefrescoCitas() {
    this.refreshSubscription = timer(0, 3600000).pipe(
      switchMap(() => this.apiService.getCitasPorEmpresa(this.empresa!))
    ).subscribe({
      next: (data) => this.actualizarCitas(data),
      error: (error) => {
        this.cargando = false;
        console.error('Error al actualizar citas:', error);
        this.calendarVisible = true;
      }
    });
  }

  refrescarCitasManualmente() {
    this.cargarCitas(true);
  }

  private cargarCitas(mostrarToast: boolean = false) {
    if (!this.empresa) return;

    this.cargando = true;
    this.apiService.getCitasPorEmpresa(this.empresa).subscribe({
      next: (data) => {
        this.cargando = false;
        this.actualizarCitas(data);

        if (mostrarToast) {
          this.toastVisible = true;
          setTimeout(() => this.toastVisible = false, 3000);
        }
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al cargar citas:', error);
      }
    });
  }

  private actualizarCitas(data: any[]) {
    this.citas = data || [];

    this.calendarOptions.events = this.citas.map(cita => ({
      title: `${cita.fecha_cita.split('T')[1].substring(0, 5)} - ${cita.nombre_cliente}`,
      date: cita.fecha_cita.split('T')[0],
      backgroundColor: this.getEventColor(cita.estado),
      borderColor: this.getEventColor(cita.estado),
      extendedProps: { cita }
    }));

    this.calendarVisible = true;
  }

  ngOnDestroy() {
    if (this.authSubscription) this.authSubscription.unsubscribe();
    if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
  }

  handleDateClick(arg: any) {
    const dialogRef = this.dialog.open(CitaModalComponent, {
      width: '90vw',
      maxWidth: '600px',
      data: {
        empresa: this.empresa,
        fechaSeleccionada: arg.dateStr
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCitas();
      }
    });
  }

  handleEventClick(arg: any) {
    const dialogRef = this.dialog.open(CitaModalComponent, {
      width: '90vw',
      maxWidth: '600px',
      data: { empresa: this.empresa, cita: arg.event.extendedProps.cita }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCitas();
      }
    });
  }

  getEventColor(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'grey';
      case 'Confirmada': return 'green';
      case 'Recibida': return 'teal';
      case 'Cancelada': return 'red';
      default: return 'gray';
    }
  }
}
