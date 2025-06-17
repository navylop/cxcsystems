import { Component, Inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ]
})
export class ClienteModalComponent implements AfterViewInit {
  clienteForm: FormGroup;

  @ViewChild('inputNombre', { static: false }) inputNombreRef!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<ClienteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.clienteForm = this.fb.group({
      nombre: [data.nombreInicial || '', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      email: [''],
      direccion: [''],
      id_empresa: [data.empresa, Validators.required],
      fecha_creacion: [new Date().toISOString()]
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.inputNombreRef?.nativeElement) {
        this.inputNombreRef.nativeElement.focus();
        this.inputNombreRef.nativeElement.select();
      }
    });
  }

  guardarCliente() {
    if (this.clienteForm.valid) {
      const cliente = { ...this.clienteForm.value };

      if (cliente.email?.trim() === '') cliente.email = null;
      if (cliente.direccion?.trim() === '') cliente.direccion = null;

      // Verificar si ya existe el teléfono
      this.apiService.getClientePorTelefono(cliente.id_empresa, cliente.telefono).subscribe({
        next: (clienteExistente) => {
          alert(`Ya existe un cliente con este teléfono:\n\nNombre: ${clienteExistente.nombre}\nEmail: ${clienteExistente.email ?? '—'}\nDirección: ${clienteExistente.direccion ?? '—'}`);
        },
        error: () => {
          // Si no hay duplicado, se guarda
          this.apiService.createCliente(cliente).subscribe(nuevoCliente => {
            this.dialogRef.close(nuevoCliente);
          });
        }
      });
    }
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}
