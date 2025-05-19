import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

@Component({
  selector: 'app-message-section',
  standalone: true,
  imports: [ReactiveFormsModule, RecaptchaModule, RecaptchaFormsModule],
  templateUrl: './message-section.component.html',
  styleUrls: ['./message-section.component.scss'],
})
export class MessageSectionComponent {
  messageForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.messageForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9,15}$/)]],
      message: ['', [Validators.required, Validators.minLength(2)]],
      captcha: ['', [Validators.required]], // Se espera un token string en lugar de booleano
    });
  }

  validaEnvio(token: string | null) {
    //console.log('Token recibido:', token);
    
    this.messageForm.patchValue({ captcha: token }); // Guardar el token en lugar de un booleano
    this.messageForm.updateValueAndValidity(); // Asegurar que el formulario se actualice correctamente
  }
  
  onSubmit() {
    if (this.messageForm.valid) {
      const formData = this.messageForm.value;
      
      this.http.post('/php/send-message.php', formData).subscribe(
        (response) => {
          console.log('Mensaje enviado con éxito', response);
          alert('Mensaje enviado con éxito');
          this.messageForm.reset();
        },
        (error) => {
          console.error('Error al enviar el mensaje', error);
          alert('Error al enviar el mensaje');
        }
      );
    } else {
      alert('Por favor, completa el formulario correctamente.');
    }
  }
}
