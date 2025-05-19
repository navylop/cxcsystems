import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true
})
export class FooterComponent {
  date:any
  ngOnInit(): void {
    this.date = new Date().getFullYear();
  }
}
