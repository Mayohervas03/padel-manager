import { Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios/usuarios';
import { PistasComponent } from './pistas/pistas';
import { ReservasComponent } from './reservas/reservas';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { DashboardComponent } from './dashboard/dashboard';
import { authGuard } from './auth/auth.guard';
import { rootGuard } from './auth/root.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard] },
  { path: 'pistas', component: PistasComponent, canActivate: [authGuard] },
  { path: 'reservas', component: ReservasComponent, canActivate: [authGuard] },
  { path: '', canActivate: [rootGuard], children: [] },
  { path: '**', redirectTo: '' }
];
