import { Routes } from '@angular/router';

import { AuthLayout } from './auth-layout/auth-layout';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResendEmail } from './pages/resend-email/resend-email';

export const authRoutes: Routes = [

    

      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'resend-email', component: ResendEmail },
      { path: 'forgot-password', component: ForgotPassword },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
   
];