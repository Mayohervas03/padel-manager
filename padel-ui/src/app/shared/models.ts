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
}

export interface LoginRequest {
  email: string;
  password: string;
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
  usuario: Usuario;
  pista: Pista;
}

export interface ReservaManualRequest {
  usuarioId: number;
  pistaId: number;
  fecha: string;
  hora: string;
}

export interface AgendaItem {
  readonly id: number;
  readonly tipo: 'CLASE' | 'RESERVA';
  readonly usuario: { nombre: string; email: string };
  readonly pista: { nombre: string };
  readonly hora: string;
}

export interface Torneo {
  readonly id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  precioPareja: number;
  maxParejas: number;
  imagenUrl?: string;
}

export interface InscripcionTorneo {
  readonly id: number;
  readonly torneoId: number;
  readonly usuarioNombre: string;
  readonly usuarioEmail: string;
  nombreCompanero: string;
  categoria: string;
  pagado: boolean;
  readonly fechaInscripcion: string;
}

export interface InscripcionTorneoRequest {
  nombreCompanero: string;
  categoria: string;
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
  pista: Pista;
  alumnos?: Usuario[];
}

export interface DashboardStats {
  readonly totalUsuarios: number;
  readonly totalPistas: number;
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
