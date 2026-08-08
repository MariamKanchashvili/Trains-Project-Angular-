import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const aiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('api.anthropic.com')) {
    const cloned = req.clone({
      setHeaders: {
        'x-api-key': environment.aiApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      }
    });
    return next(cloned);
  }
  return next(req);
};