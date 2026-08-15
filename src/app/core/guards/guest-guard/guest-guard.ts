import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../../services/auth-state';

export const guestGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (!authState.isLoggedIn()) {
    return true;
  }

  //  უკვე დალოგინებულს, აზრი არ აქვს ისევ Login-გვერდი ნახოს
  router.navigate(['/home']);
  return false;
};