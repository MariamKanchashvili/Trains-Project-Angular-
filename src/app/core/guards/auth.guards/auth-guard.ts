import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../../services/auth-state';
import { TokenService } from '../../services/token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthState);
  const router = inject(Router);
  const tokenService=inject(TokenService)
  if (authState.isLoggedIn()) {
    return true;

  } const token = tokenService.getAcessToken(); //  პირდაპირ storage-ის შემოწმება

  if (token) {
    return true;
  }

  //  გადავცემთ returnUrl-ს, რომ login-ის შემდეგ იქვე დაბრუნდეს, საიდანაც წამოვიდა
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};