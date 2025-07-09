import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '@auth0/auth0-angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClienteModalComponent } from '../cliente-modal/cliente-modal.component';
import { CitaModalComponent } from '../cita-modal/cita-modal.component';

@Component({
  selector: 'app-listaespera',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatAutocompleteModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './listaespera.component.html',
  styleUrls: ['./listaespera.component.css']
})
export class ListaEsperaComponent implements OnInit {
  empresa: string = '';
  listaEspera: any[] = [];
  listaEsperaPaginada: any[] = [];

  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  mostrarAutocomplete = false;
  nombreCliente = '';
  telefonoCliente = '';

  paginaActual = 1;
  elementosPorPagina = 8;
  totalPaginas = 1;

  waitForm: FormGroup;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.waitForm = this.fb.group({
      id_cliente: ['', Validators.required],
      nombre_cliente: ['', Validators.required],
      nota: ['']
    });
  }

  ngOnInit(): void {
    this.auth.idTokenClaims$.subscribe(claims => {
      this.empresa = claims?.['https://miapp.com/empresa'] || '';
      if (this.empresa) {
        this.cargarLista();
        this.api.getClientesPorEmpresa(this.empresa).subscribe(c => this.clientes = c);
      }
    });
  }

  cargarLista() {
    this.api.getListaEsperaPorEmpresa(this.empresa).subscribe(lista => {
      this.listaEspera = lista;
      this.actualizarPaginacion();
    });
  }

  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.listaEsperaPaginada = this.listaEspera.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.listaEspera.length / this.elementosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
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

  filtrarClientes(event: any) {
    const valor = event.target.value.toLowerCase();
    this.mostrarAutocomplete = valor.length > 0;

    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(valor) ||
      cliente.telefono?.toLowerCase().includes(valor)
    );
  }

  onInputChange(event: any) {
    const valor = event.target.value.trim();
    const soloNumeros = /^[- +()0-9]{7,15}$/.test(valor);

    if (soloNumeros) {
      this.telefonoCliente = valor;
      this.nombreCliente = '';
    } else {
      this.nombreCliente = valor;
      this.telefonoCliente = '';
    }
  }

  seleccionarCliente(event: any) {
    const clienteSeleccionado = this.clientes.find(c => c.id_cliente === event.option.value);
    if (clienteSeleccionado) {
      this.waitForm.controls['id_cliente'].setValue(clienteSeleccionado.id_cliente);
      this.waitForm.controls['nombre_cliente'].setValue(clienteSeleccionado.nombre);
    }
  }

  limpiarFiltro() {
    if (!this.waitForm.controls['nombre_cliente'].value) {
      this.mostrarAutocomplete = false;
      this.clientesFiltrados = [];
    }
  }

  abrirModalNuevoCliente() {
    const nombreInicial = this.nombreCliente;
    const telefonoInicial = this.telefonoCliente;

    const telefonoValido = /^((\+34|0034)?[\s-]?)([6789]\d{2})[\s-]?(\d{3})[\s-]?(\d{3})$/;

    if (telefonoInicial && !telefonoValido.test(telefonoInicial)) {
      alert('El teléfono introducido no es válido en España (debe comenzar por 6, 7, 8 o 9 y tener 9 dígitos).');
      return;
    }

    const dialogRef = this.dialog.open(ClienteModalComponent, {
      width: '500px',
      data: {
        empresa: this.empresa,
        nombreInicial: nombreInicial,
        telefonoInicial: telefonoInicial
      }
    });

    dialogRef.afterClosed().subscribe(nuevoCliente => {
      if (nuevoCliente) {
        this.clientes.push(nuevoCliente);
        this.clientesFiltrados = [...this.clientes];
        this.waitForm.controls['id_cliente'].setValue(nuevoCliente.id_cliente);
        this.waitForm.controls['nombre_cliente'].setValue(nuevoCliente.nombre);
      }
    });
  }

  crearEntrada() {
    if (this.waitForm.invalid) return;

    const item = {
      id_cliente: this.waitForm.value.id_cliente,
      id_empresa: this.empresa,
      nota: this.waitForm.value.nota
    };

    this.api.createListaEspera(item).subscribe(() => {
      this.waitForm.reset();
      this.cargarLista();
    });
  }

  eliminar(id_lista: number) {
    if (!confirm('¿Eliminar esta entrada de la lista de espera?')) return;
    this.api.deleteListaEspera(id_lista).subscribe(() => this.cargarLista());
  }

  crearCitaDesdeEspera(entrada: any) {
    const cliente = this.clientes.find(c => c.id_cliente === entrada.id_cliente);
    if (!cliente) return;

    const dialogRef = this.dialog.open(CitaModalComponent, {
      width: '90vw',
      maxWidth: '600px',
      data: {
        empresa: this.empresa,
        cita: {
          id_cita: 0,
          id_cliente: cliente.id_cliente,
          id_empresa: this.empresa,
          nombre_cliente: cliente.nombre,
          fecha_cita: null,
          hora_cita: '',
          estado: 'Pendiente',
          nota: entrada.nota || '',
          fecha_creacion: new Date().toISOString(),
          token_confirmacion: '',
          telefono: cliente.telefono
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deleteListaEspera(entrada.id_lista).subscribe(() => this.cargarLista());
      }
    });
  }
}
