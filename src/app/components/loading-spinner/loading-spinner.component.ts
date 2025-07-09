import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="loading-backdrop">
               <div class="spinner-border text-primary" role="status">
                 <span class="visually-hidden">Cargando...</span>
               </div>
             </div>`,
  styles: [`
    .loading-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class LoadingSpinnerComponent {

}
