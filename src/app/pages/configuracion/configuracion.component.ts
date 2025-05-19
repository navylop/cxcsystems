import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ConfiguracionNotificacion } from '../../models/configuracion-notificacion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@auth0/auth0-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  configForm: FormGroup;
  id_empresa: string | undefined;
  private authSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private snackBar: MatSnackBar,
    public auth: AuthService
  ) {
    this.configForm = this.fb.group({
      mensajePlantilla: [
        'Hola {{nombre}}, tienes una cita el {{fecha}} a las {{hora}}.',
        [Validators.required]
      ],
      envioAutomatico: [true],
      horasAnticipacion: [24, [Validators.required, Validators.min(1)]],
      canalesPermitidos: this.fb.group({
        whatsapp: [true],
        email: [false],
        sms: [false]
      })
    });
  }

  ngOnInit(): void {
    this.authSubscription = this.auth.idTokenClaims$.subscribe(claims => {
      if (claims) {
        this.id_empresa = claims['https://miapp.com/empresa'];
        this.auth.isAuthenticated$.subscribe(isAuthenticated => {
          if (isAuthenticated && this.id_empresa) {
            this.cargarConfiguracion();
          }
        });
      }
    });
  }

  cargarConfiguracion(): void {
    this.api.getConfiguracionNotificacion(this.id_empresa).subscribe(config => {
      if (config) {
        this.configForm.patchValue(config);
      }
    });
  }

  guardarConfiguracion(): void {
    if (!this.id_empresa) {
      this.snackBar.open('No se ha podido identificar la empresa', 'Cerrar', {
        duration: 3000, horizontalPosition: 'end', verticalPosition: 'top'
      });
      return;
    }

    const config: ConfiguracionNotificacion = {
      id_empresa: this.id_empresa,
      ...this.configForm.value
    };

    this.api.guardarConfiguracionNotificacion(config).subscribe({
      next: () => {
        this.snackBar.open('Configuración guardada correctamente', 'Cerrar', {
          duration: 3000, horizontalPosition: 'end', verticalPosition: 'top'
        });
      },
      error: () => {
        this.snackBar.open('Error al guardar la configuración', 'Cerrar', {
          duration: 4000, horizontalPosition: 'end', verticalPosition: 'top'
        });
      }
    });
  }
}
