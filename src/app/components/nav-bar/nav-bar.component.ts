import { Component, Inject, HostListener, Input } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { faUser, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe, NgIf } from '@angular/common';
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

  @Input() navLight: any;
  @Input() bgWhite: any;

  scrolled: boolean = false;
  currentUrl: string = '';
  currentHash: string = '';
  showToggleMenu: boolean = false;
  subManu: string = '';

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit(): void {
    this.currentUrl = window.location.pathname;
    this.detectActiveSection();
    window.scrollTo(0, 0);
  }

  ngAfterViewInit() {
    feather.replace();
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const nav = this.doc.getElementById('topnav');
    this.scrolled = window.scrollY > 0;
    this.detectActiveSection();
  }
  
  scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private detectActiveSection(): void {
    const sections = ['home', 'software-features', 'pricing', 'gestion-citas', 'contact'];
    const scrollPos = window.scrollY + 100;

    for (let id of sections) {
      const section = document.getElementById(id);
      if (section) {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          this.currentHash = `#${id}`;
          break;
        }
      }
    }
  }

  private updateActiveSection(): void {
    this.currentHash = window.location.hash;
  }

  toggleMenu(): void {
    this.showToggleMenu = !this.showToggleMenu;
  }

  openSubManu(item: string): void {
    this.subManu = item;
  }

  loginWithRedirect(): void {
    this.auth.loginWithRedirect();
  }

  logout(): void {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }
}
