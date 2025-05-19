import { Component, Inject, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faUser, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe, DOCUMENT, NgIf } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  NgbCollapse,
  NgbDropdown,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';

import * as feather from 'feather-icons';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdown,
    NgbCollapse,
    AsyncPipe,
    NgIf,
    RouterLink,
  ],
})
export class NavBarComponent {
  isCollapsed = true;
  faUser = faUser;
  faPowerOff = faPowerOff;

  @Input() navLight:any;
  @Input()bgWhite:any

  scrolled: boolean = false;
  currentUrl: string = ''; // Para guardar el pathname
  currentHash: string = ''; // Para guardar el hash actual
  showToggleMenu: boolean = false;
  subManu:string = ''

  @HostListener("window:scroll", [])

  onWindowScroll() {
      this.scrolled = window.scrollY > 0;
  }

  @HostListener("window:hashchange", [])

  onHashChange() {
    this.updateActiveSection();
  }

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit(): void {    
    this.currentUrl = window.location.pathname
    this.updateActiveSection();
    window.scrollTo(0, 0);
  }

  openSubManu(item:string){
      this.subManu = item
  }

  toggleMenu(){
    this.showToggleMenu = !this.showToggleMenu
  }

  ngAfterViewInit() {
    feather.replace();
  }

  private updateActiveSection() {    
    //this.currentHash = window.location.hash || '#home'; // Por defecto, #home
    this.currentHash = window.location.hash;
  }

  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }
}
