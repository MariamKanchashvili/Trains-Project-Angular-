import { Routes } from '@angular/router';

import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResendEmail } from './pages/resend-email/resend-email';
import { HomeComponent } from '../home-component/home-component';
import { guestGuard } from '../../core/guards/guest-guard/guest-guard';
import { ResetPassword } from './pages/reset-password/reset-password';


export const authRoutes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register , canActivate: [guestGuard]},
  { path: 'resend-email', component: ResendEmail },
  { path: 'forgot-password', component: ForgotPassword,canActivate: [guestGuard] },
  {path:'home',component:HomeComponent},
{  path: 'auth/reset-password',     loadComponent: () =>import('./pages/reset-password/reset-password').then(m => m.ResetPassword)}

 
];