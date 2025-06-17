import { Component, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ApiService } from '../../services/api.service';
import { AuthService } from '@auth0/auth0-angular';
import { CitaModalComponent } from '../cita-modal/cita-modal.component';
import { Subscription, timer, switchMap, forkJoin } from 'rxjs';

import { ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';


const VISTA_CALENDARIO_KEY = 'vistaCalendario';

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
  notas: any[] = [];
  calendarVisible = false;
  cargando = false;
  toastVisible = false;

  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent;

  private authSubscription: Subscription | undefined;
  private refreshSubscription: Subscription | undefined;

  calendarOptions = {
    initialView: localStorage.getItem(VISTA_CALENDARIO_KEY) || 'dayGridWeek',
    plugins: [dayGridPlugin, interactionPlugin],
    editable: true,
    selectable: true,
    events: [],
    customButtons: {
      refrescar: {
        text: '↻',
        click: () => this.refrescarCitasManualmente()
      },
      vistaMes: {
        text: 'Month',
        click: () => this.setVistaCalendario('dayGridMonth')
      },
      vistaSemana: {
        text: 'Week',
        click: () => this.setVistaCalendario('dayGridWeek')
      }
    },
    headerToolbar: {
      left: 'refrescar vistaMes,vistaSemana',
      center: 'title',
      right: 'today prev,next'
    },
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    /*
    eventContent: (arg: any) => {
      const isNota = arg.event.extendedProps?.nota;
      if (isNota) {
        const notaTexto = arg.event.extendedProps.nota?.contenido || 'Nota';
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="color: black; background-color: orange; padding: 2px 4px; border-radius: 4px; font-size: 12px; font-weight: bold;">
            📝 ${notaTexto}
          </div>`;
        return { domNodes: [el] };
      }

      return {
        html: `<div>${arg.event.title}</div>`
      };
    },
    */
    eventContent: (arg: any) => {
      const isNota = arg.event.extendedProps?.nota;
      if (isNota) {
        const notaTexto = arg.event.extendedProps.nota?.contenido || 'Nota';
        const el = document.createElement('div');

        el.innerHTML = `
          <div 
            title="${notaTexto.replace(/"/g, '&quot;')}" 
            style="
              color: black;
              background-color: orange;
              padding: 2px 4px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              max-width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">
            📝 ${notaTexto}
          </div>`;

        return { domNodes: [el] };
      }

      return {
        html: `<div>${arg.event.title}</div>`
      };
    },

    eventOrder: (a, b) => {
      const isNotaA = !!a.extendedProps?.nota;
      const isNotaB = !!b.extendedProps?.nota;

      if (isNotaA && !isNotaB) return -1;
      if (!isNotaA && isNotaB) return 1;

      return 0;
    },

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
  /*
  setVistaCalendario(vista: string) {
    localStorage.setItem(VISTA_CALENDARIO_KEY, vista);    
  }
  */
  setVistaCalendario(vista: string) {
    localStorage.setItem(VISTA_CALENDARIO_KEY, vista);

    // Cambiar la vista del calendario si está disponible
    const calendarApi = this.calendarComponent?.getApi();
    if (calendarApi) {
      calendarApi.changeView(vista);
    }
  }


  iniciarRefrescoCitas() {
    this.refreshSubscription = timer(0, 3600000).pipe(
      switchMap(() => forkJoin([
        this.apiService.getCitasPorEmpresa(this.empresa!),
        this.apiService.getNotasPorEmpresa(this.empresa!)
      ]))
    ).subscribe({
      next: ([citas, notas]) => this.actualizarEventosCalendario(citas, notas),
      error: (error) => {
        this.cargando = false;
        console.error('Error al actualizar eventos:', error);
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
    forkJoin([
      this.apiService.getCitasPorEmpresa(this.empresa),
      this.apiService.getNotasPorEmpresa(this.empresa)
    ]).subscribe({
      next: ([citas, notas]) => {
        this.cargando = false;
        this.actualizarEventosCalendario(citas, notas);

        if (mostrarToast) {
          this.toastVisible = true;
          setTimeout(() => this.toastVisible = false, 3000);
        }
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al cargar eventos:', error);
      }
    });
  }

  private actualizarEventosCalendario(citas: any[], notas: any[]) {
    this.citas = citas || [];
    this.notas = notas || [];

    const eventosCitas = this.citas.map(cita => ({
      title: `${cita.fecha_cita.split('T')[1].substring(0, 5)} - ${cita.nombre_cliente}`,
      date: cita.fecha_cita.split('T')[0],
      backgroundColor: this.getEventColor(cita.estado),
      borderColor: this.getEventColor(cita.estado),
      extendedProps: { cita }
    }));

    const eventosNotas = this.notas.map(nota => ({
      title: 'Nota',
      date: nota.fecha.split('T')[0],
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: '#000',
      allDay: true,
      extendedProps: { nota }
    }));  

    //this.calendarOptions.events = [...eventosCitas, ...eventosNotas];
    this.calendarOptions.events = [...eventosNotas, ...eventosCitas];
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
    if (arg.event.extendedProps?.nota) return; // No abrir modal si es nota

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