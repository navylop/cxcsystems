import {
  Routes,
} from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { ExternalApiComponent } from './pages/external-api/external-api.component';
import { ErrorComponent } from './pages/error/error.component';
import { authGuardFn } from '@auth0/auth0-angular';
import { HomeContentComponent } from './components/home-content/home-content.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { NotasComponent } from './pages/notas/notas.component';
import { ListaEsperaComponent } from './pages/listaespera/listaespera.component';
import { PublicidadCitasComponent } from './components/publicidad-citas/publicidad-citas.component';

export const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'config',
    component: ConfiguracionComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'external-api',
    component: ExternalApiComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'clientes',
    component: ClientesComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'home',
    component: HomeContentComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'notas',
    component: NotasComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'listaespera',
    component: ListaEsperaComponent,
    canActivate: [authGuardFn],
  },
  ,
  {
    path: 'publicidad-citas',
    component: PublicidadCitasComponent,
  },
  {
    path: 'error',
    component: ErrorComponent,
  },
  {
    path: '',
    component: HomeContentComponent,
    pathMatch: 'full',
  },
];
