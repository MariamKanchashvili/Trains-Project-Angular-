import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
 
export const authorationInterceptor: HttpInterceptorFn = (req, next) => {
  
   if (req.url.startsWith('http://localhost:5678')) {
    return next(req);
  }

  const tokenService = inject(TokenService);
  const accessToken = tokenService.getAcessToken();
 
  if (!accessToken) {
    return next(req);
  }
 
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  });
 
  return next(clonedRequest);
};