import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { environment as env } from './environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LOCALE_ID } from '@angular/core';

import '@angular/localize/init';

// 👉 Añadimos el locale español
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs, 'es');

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideRouter(routes),
    provideAuth0({
      domain: 'dev-843za7dt.eu.auth0.com',
      clientId: '12SpisOyr4xZZXduXiVot9TdC7hbxPhU',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    }),
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          json: () => import('highlight.js/lib/languages/json'),
        },
      },
    },
    provideAnimations(),
    // 👉 Configurar LOCALE_ID en español
    { provide: LOCALE_ID, useValue: 'es' },
  ],
});
