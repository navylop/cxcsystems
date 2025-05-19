import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, NgIf, NavBarComponent, FooterComponent, SidebarComponent],
})
export class AppComponent {
  title = 'Management App';

  constructor(public auth: AuthService ) {}
}
