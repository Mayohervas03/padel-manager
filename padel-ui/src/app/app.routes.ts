import { Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios/usuarios';
import { PistasComponent } from './pistas/pistas';
import { ReservasComponent } from './reservas/reservas';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { DashboardComponent } from './dashboard/dashboard';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { rootGuard } from './auth/root.guard';
import { HomeComponent } from './home/home';
import { PerfilComponent } from './perfil/perfil';

import { AdminLayoutComponent } from './admin/layout/admin-layout';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'admin', 
    component: AdminLayoutComponent, 
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'pistas', loadComponent: () => import('./admin/pistas/admin-pistas').then(m => m.AdminPistasComponent) },
      { path: 'usuarios', loadComponent: () => import('./admin/usuarios/admin-usuarios').then(m => m.AdminUsuariosComponent) },
      { path: 'clases', loadComponent: () => import('./admin/clases/admin-clases').then(m => m.AdminClasesComponent) },
      { path: 'stats', loadComponent: () => import('./admin/stats/admin-stats').then(m => m.AdminStatsComponent) },
      { path: 'manual', loadComponent: () => import('./admin/manual/admin-manual').then(m => m.AdminManualComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'home', loadComponent: () => import('./home/home').then(m => m.HomeComponent), canActivate: [authGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard] },
  { path: 'pistas', component: PistasComponent, canActivate: [authGuard] },
  { path: 'reservas', loadComponent: () => import('./reservas/reservas').then(m => m.ReservasComponent), canActivate: [authGuard] },
  { path: 'clases', loadComponent: () => import('./clases/user-clases').then(m => m.UserClasesComponent), canActivate: [authGuard] },
  { path: 'perfil', loadComponent: () => import('./perfil/perfil').then(m => m.PerfilComponent), canActivate: [authGuard] },
  { path: '', canActivate: [rootGuard], children: [] },
  { path: '**', redirectTo: '' }
];
