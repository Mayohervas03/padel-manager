import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { rootGuard } from './auth/root.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./register/register').then(m => m.RegisterComponent) },
  { 
    path: 'admin', 
    loadComponent: () => import('./admin/layout/admin-layout').then(m => m.AdminLayoutComponent), 
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'pistas', loadComponent: () => import('./admin/pistas/admin-pistas').then(m => m.AdminPistasComponent) },
      { path: 'usuarios', loadComponent: () => import('./admin/usuarios/admin-usuarios').then(m => m.AdminUsuariosComponent) },
      { path: 'clases', loadComponent: () => import('./admin/clases/admin-clases').then(m => m.AdminClasesComponent) },
      { path: 'torneos', loadComponent: () => import('./admin/admin-torneos/admin-torneos').then(m => m.AdminTorneosComponent) },
      { path: 'torneos/:id', loadComponent: () => import('./admin/admin-torneos/admin-torneo-detalle/admin-torneo-detalle').then(m => m.AdminTorneoDetalleComponent) },
      { path: 'productos', loadComponent: () => import('./admin/productos/admin-productos').then(m => m.AdminProductosComponent) },
      { path: 'pedidos', loadComponent: () => import('./admin/admin-pedidos/admin-pedidos').then(m => m.AdminPedidosComponent) },
      { path: 'stats', loadComponent: () => import('./admin/stats/admin-stats').then(m => m.AdminStatsComponent) },
      { path: 'manual', loadComponent: () => import('./admin/manual/admin-manual').then(m => m.AdminManualComponent) },
      { path: 'logs', loadComponent: () => import('./admin/logs/admin-logs').then(m => m.AdminLogsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'home', loadComponent: () => import('./home/home').then(m => m.HomeComponent), canActivate: [authGuard] },
  { path: 'usuarios', loadComponent: () => import('./usuarios/usuarios').then(m => m.UsuariosComponent), canActivate: [authGuard] },
  { path: 'pistas', loadComponent: () => import('./pistas/pistas').then(m => m.PistasComponent), canActivate: [authGuard] },
  { path: 'reservas', loadComponent: () => import('./reservas/reservas').then(m => m.ReservasComponent), canActivate: [authGuard] },
  { path: 'clases', loadComponent: () => import('./clases/user-clases').then(m => m.UserClasesComponent), canActivate: [authGuard] },
  { path: 'torneos', loadComponent: () => import('./torneos/user-torneos/user-torneos').then(m => m.UserTorneosComponent), canActivate: [authGuard] },
  { path: 'tienda', loadComponent: () => import('./shop/tienda').then(m => m.TiendaComponent), canActivate: [authGuard] },
  { path: 'mis-compras', loadComponent: () => import('./mis-compras/mis-compras').then(m => m.MisComprasComponent), canActivate: [authGuard] },
  { path: 'perfil', loadComponent: () => import('./perfil/perfil').then(m => m.PerfilComponent), canActivate: [authGuard] },
  { path: '', canActivate: [rootGuard], children: [] },
  { path: '**', redirectTo: '' }
];
