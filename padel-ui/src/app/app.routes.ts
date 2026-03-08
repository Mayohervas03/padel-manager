import { Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios/usuarios';
import { PistasComponent } from './pistas/pistas';

export const routes: Routes = [
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'pistas', component: PistasComponent },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
];
