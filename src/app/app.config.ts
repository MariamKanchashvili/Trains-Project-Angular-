import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiKeyInterceptor } from './core/interceptors/auth.interceptor';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { authorationInterceptor } from './core/interceptors/authoration.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiKeyInterceptor,authorationInterceptor])),
    provideTranslateService({
      fallbackLang:'ka',
      lang:'ka',
      loader:provideTranslateHttpLoader({
        prefix:'/i18n/',
        suffix:'.json'
      })
    })
  ]
};
