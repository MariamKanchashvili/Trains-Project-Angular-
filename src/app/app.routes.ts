import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { headerRouts } from './core/layouts/header/header.routes';
import { trainsRoutes } from './features/trains/trains.routes';
import { resetTokenGuard } from './core/guards-reset-token.guard/reset-token-guard-guard';
import { HomeComponent } from './features/home-component/home-component';
export const routes: Routes = [
    ...headerRouts,
    ...authRoutes,
    ...trainsRoutes,
    {  path: '',  component:HomeComponent,  canActivate: [resetTokenGuard],  },
];
