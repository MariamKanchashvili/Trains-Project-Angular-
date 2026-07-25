import { HttpInterceptorFn } from '@angular/common/http';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    setHeaders: { 'x-api-key': 'b8b3a17d-54e7-43e8-96ee-33d9122e757a' },
  });

  return next(cloned);
};
