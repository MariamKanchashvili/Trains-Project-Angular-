import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { headerRouts } from './core/layouts/header/header.routes';
import { trainsRoutes } from './features/trains/trains.routes';

export const routes: Routes = [
    ...headerRouts,
    ...authRoutes,
    ...trainsRoutes,
    
];
