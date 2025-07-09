import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.css']
})
export class NotasComponent implements OnInit, OnDestroy {
  notas: any[] = [];
  notasPaginadas: any[] = [];

  notaForm: any = this.resetNotaForm();
  editando = false;
  id_empresa: string | undefined;

  paginaActual = 1;
  elementosPorPagina = 8;
  totalPaginas = 1;

  userSub: Subscription = new Subscription();
  private authSubscription: Subscription | undefined;

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.auth.idTokenClaims$.subscribe(claims => {
      if (claims) {
        this.id_empresa = claims['https://miapp.com/empresa'];
        this.auth.isAuthenticated$.subscribe(isAuthenticated => {
          if (isAuthenticated) {
            this.cargarNotas();
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  resetNotaForm(): any {
    return {
      id_nota: null,
      contenido: '',
      fecha: new Date().toISOString().substring(0, 10),
      fecha_creacion: '',
      id_empresa: '',
      id_cita: null
    };
  }

  cargarNotas(): void {
    if (!this.id_empresa) return;
    this.api.getNotasPorEmpresa(this.id_empresa).subscribe(data => {
      this.notas = data;
      this.actualizarPaginacion();
    });
  }

  guardarNota(): void {
    this.notaForm.id_empresa = this.id_empresa;
    this.notaForm.fecha_creacion = new Date().toISOString();
    this.notaForm.id_cita ??= 0;

    if (!this.editando) {
      delete this.notaForm.id_nota;
    }

    const accion = this.editando
      ? this.api.updateNota(this.notaForm)
      : this.api.createNota(this.notaForm);

    accion.subscribe(() => {
      this.notaForm = this.resetNotaForm();
      this.editando = false;
      this.cargarNotas();
    });
  }

  editarNota(nota: any): void {
    this.notaForm = { ...nota };
    this.editando = true;
  }

  cancelarEdicion(): void {
    this.notaForm = this.resetNotaForm();
    this.editando = false;
  }

  eliminarNota(id_nota: number): void {
    if (confirm('¿Seguro que deseas eliminar esta nota?')) {
      this.api.deleteNota(id_nota).subscribe(() => {
        this.cargarNotas();
      });
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
    this.notasPaginadas = this.notas.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.notas.length / this.elementosPorPagina);
  }

  get totalPaginasArray(): number[] {
    const maxVisible = 5;
    const total = this.totalPaginas;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = this.paginaActual - half;
    let end = this.paginaActual + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
