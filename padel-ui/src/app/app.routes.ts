import { Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios/usuarios';
import { PistasComponent } from './pistas/pistas';
import { ReservasComponent } from './reservas/reservas';

export const routes: Routes = [
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'pistas', component: PistasComponent },
  { path: 'reservas', component: ReservasComponent },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
];
