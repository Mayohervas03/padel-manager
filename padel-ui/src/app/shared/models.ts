export interface Usuario {
  readonly id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'USER';
  password?: string;
}

export interface PerfilDTO {
  readonly nombre: string;
  readonly email: string;
  readonly rol: string;
  readonly proximaReserva: string;
  readonly partidosMes: number;
}

export interface AuthResponse {
  readonly token: string;
  readonly email: string;
  readonly rol: string;
  readonly nombre: string;
  readonly userId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface Pista {
  readonly id: number;
  nombre: string;
  tipo: string;
  ubicacion: string;
  precio: number;
  activo: boolean;
}

export interface Reserva {
  readonly id: number;
  fecha: string;
  hora: string;
  estado?: string;
  precioPagado?: number;
  usuario: Usuario;
  pista: Pista;
}

export interface ReservaManualRequest {
  usuarioId: number;
  pistaId: number;
  fecha: string;
  hora: string;
}

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

export interface AgendaItem {
  readonly id: number;
  readonly tipo: 'CLASE' | 'RESERVA';
  readonly usuario: { nombre: string; email: string };
  readonly pista: { nombre: string };
  readonly hora: string;
  readonly estado?: EstadoReserva;
}

export type EstadoTorneo = 'ABIERTO' | 'CERRADO' | 'CANCELADO';

export interface CategoriaTorneo {
  readonly id: number;
  nombre: string;
  maxParejas: number;
  inscripcionesCount?: number;
}

export interface Torneo {
  readonly id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  precioPareja: number;
  imagenUrl?: string;
  estado: EstadoTorneo;
  fechaCierreInscripcion?: string;
  categorias: CategoriaTorneo[];
  inscripcionesCount?: number;
  yaInscrito?: boolean;
}

export interface InscripcionTorneo {
  readonly id: number;
  readonly torneoId: number;
  readonly usuarioNombre: string;
  readonly usuarioEmail: string;
  nombreCompanero: string;
  categoria: CategoriaTorneo;
  pagado: boolean;
  readonly fechaInscripcion: string;
}

export interface InscripcionTorneoPerfil {
  readonly id: number;
  readonly torneoId: number;
  readonly torneoTitulo: string;
  readonly torneoDescripcion: string;
  readonly torneoFechaInicio: string;
  readonly torneoFechaFin: string;
  readonly torneoPrecioPareja: number;
  readonly torneoImagenUrl?: string;
  readonly nombreCompanero: string;
  readonly categoria: CategoriaTorneo;
  readonly pagado: boolean;
  readonly fechaInscripcion: string;
}

export interface InscripcionTorneoRequest {
  nombreCompanero: string;
  categoriaId: number;
}

export type NivelClase = 'INICIACION' | 'INTERMEDIO' | 'AVANZADO';

export interface Clase {
  readonly id: number;
  titulo: string;
  monitor: string;
  nivel: NivelClase;
  precio: number;
  maxAlumnos: number;
  fecha: string;
  hora: string;
  estado?: string;
  pista: Pista;
  alumnos?: Usuario[];
}

export interface DashboardStats {
  readonly totalUsuarios: number;
  readonly totalPistas: number;
  readonly pistasActivas: number;
  readonly reservasTotales: number;
  readonly reservasHoy: number;
}

export interface OcupacionStats {
  readonly [pistaNombre: string]: number;
}

export interface IngresoStats {
  readonly fecha: string;
  readonly total: number;
}

export interface HorasStats {
  readonly [hora: string]: number;
}

// =====================================================
// TIENDA / SHOP MODELS
// =====================================================

export type CategoriaProducto = 'PALAS' | 'ROPA' | 'ACCESORIOS';

export interface Producto {
  readonly id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: CategoriaProducto;
  imagenUrl?: string;
  activo: boolean;
}

export interface CarritoItem {
  readonly id: number;
  producto: Producto;
  cantidad: number;
}

export interface PedidoItem {
  readonly id: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  readonly id: number;
  fecha: string;
  estado: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';
  total: number;
  usuarioNombre: string;
  usuarioEmail: string;
  items: PedidoItem[];
}
