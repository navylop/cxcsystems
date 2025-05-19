import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDateStruct, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

import { AuthService } from '@auth0/auth0-angular';
import { ApiService } from '../../services/api.service';
import { MessageSectionComponent } from '../message-section/message-section.component';

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    MessageSectionComponent,
    NgbDatepickerModule
  ]
})
export class HomeContentComponent {
  faLink = faLink;

  isOpen: boolean = false;
  user: any;
  empresa: string | undefined;
  citas: any[] = [];

  fechaHoy: Date = new Date();
  fechaSeleccionada: NgbDateStruct | null = null;

  private authSubscription: Subscription | undefined;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(public auth: AuthService, private apiService: ApiService) {}

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.user = user;
    });

    this.authSubscription = this.auth.idTokenClaims$.subscribe(claims => {
      if (claims) {
        this.empresa = claims['https://miapp.com/empresa'];
        this.auth.isAuthenticated$.subscribe(isAuthenticated => {
          if (isAuthenticated) {
            this.obtenerCitas();
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onFechaSeleccionada(date: NgbDateStruct): void {
    this.fechaHoy = new Date(date.year, date.month - 1, date.day);
    this.obtenerCitas();
  }

  obtenerCitas(): void {
    if (!this.empresa) return;

    this.apiService.getCitasPorEmpresa(this.empresa).subscribe({
      next: (data) => {
        const yyyy = this.fechaHoy.getFullYear();
        const mm = this.fechaHoy.getMonth();
        const dd = this.fechaHoy.getDate();

        this.citas = data
          .filter((cita: any) => {
            const fecha = new Date(cita.fecha_cita);
            return (
              fecha.getFullYear() === yyyy &&
              fecha.getMonth() === mm &&
              fecha.getDate() === dd
            );
          })
          .sort((a: any, b: any) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime());
      },
      error: (error) => console.error('Error al obtener citas:', error)
    });
  }

  actualizarEstado(cita: any): void {
    const { id_cita, id_cliente, id_empresa } = cita;

    const citaLimpiada = {
      id_cita,
      id_cliente,
      id_empresa,
      estado: cita.estado,
      fecha_cita: cita.fecha_cita,
      nota: cita.nota,
      fecha_creacion: cita.fecha_creacion || new Date().toISOString(),
      token_confirmacion: cita.token_confirmacion || ""
    };

    this.apiService.updateCita(id_cita, id_cliente, id_empresa, citaLimpiada).subscribe({
      next: () => {},
      error: (err) => {}
    });
  }

  actualizarHora(cita: any, nuevaHora: string): void {
    const [hh, mm] = nuevaHora.split(':').map(Number);
    const fechaOriginal = new Date(cita.fecha_cita);
    fechaOriginal.setHours(hh, mm);
    cita.fecha_cita = fechaOriginal;

    this.actualizarEstado(cita);
  }

  actualizarNota(cita: any): void {
    this.actualizarEstado(cita);
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'text-secondary';
      case 'Confirmada': return 'text-success';
      case 'Recibida': return 'text-info';
      case 'Cancelada': return 'text-danger';
      default: return 'text-dark';
    }
  }

  marcarComoRecibida(cita: any): void {
    cita.estado = 'Recibida';
    this.actualizarEstado(cita);
  }

  toggleModal(event: Event): void {
    event.preventDefault();
    this.isOpen = !this.isOpen;

    if (this.isOpen && this.videoPlayer) {
      setTimeout(() => this.videoPlayer.nativeElement.play(), 0);
    } else if (this.videoPlayer) {
      this.videoPlayer.nativeElement.pause();
      this.videoPlayer.nativeElement.currentTime = 0;
    }
  }

  feature = [
    {
      icon: 'uil uil-desktop',
      title: 'Desarrollos Web',
      desc: "Construir y mantener sitios web y Web Apps. Funcionamiento rápido y un buen desempeño para permitir la mejor experiencia de usuario."
    },
    {
      icon: 'uil uil-forward',
      title: 'Software a Medida',
      desc: "Desarrollamos el sistema o software que mejor se adapta a los procesos de gestión que la empresa ya tiene consolidados."
    },
    {
      icon: 'uil uil-arrow',
      title: 'Erp de Gestión',
      desc: "Implementamos sistemas de gestión ERP para todo tipo de pymes que buscan mejorar su excelencia operativa a través de la automatización de sus procesos de negocio."
    },
    {
      icon: 'uil uil-mobile-android',
      title: 'App Moviles',
      desc: "Desarrollamos APPS para las plataformas Android y iOS. Apps para publicar y distribuir o apps privadas para empresa optimizando recursos y aumentando la productividad."
    },
  ];
}
