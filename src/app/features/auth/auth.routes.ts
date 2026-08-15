import { Routes } from '@angular/router';

import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResendEmail } from './pages/resend-email/resend-email';
import { HomeComponent } from '../home-component/home-component';
import { guestGuard } from '../../core/guards/guest-guard/guest-guard';
export const authRoutes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register , canActivate: [guestGuard]},
  { path: 'resend-email', component: ResendEmail,canActivate: [guestGuard]  },
  { path: 'forgot-password', component: ForgotPassword,canActivate: [guestGuard] },
  {path:'home',component:HomeComponent}
];