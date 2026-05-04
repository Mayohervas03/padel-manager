import { Component, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  readonly showMenu = signal(false);
  readonly currentYear = signal(new Date().getFullYear());

  readonly stats = [
    { value: '8', label: 'Pistas Premium' },
    { value: '2.4K+', label: 'Jugadores Activos' },
    { value: '15K+', label: 'Partidos al Año' },
    { value: '4.9', label: 'Valoración Media' }
  ];

  readonly features = [
    {
      icon: 'fa-calendar-check',
      title: 'Reserva Online',
      description: 'Reserva tu pista en segundos. Sistema de disponibilidad en tiempo real.',
      link: '/reservas',
      linkText: 'Reservar Ahora',
      accent: 'cyan'
    },
    {
      icon: 'fa-graduation-cap',
      title: 'Academia Élite',
      description: 'Monitores titulados. Clases para todos los niveles, desde iniciación hasta competición.',
      link: '/clases',
      linkText: 'Ver Clases',
      accent: 'lime'
    },
    {
      icon: 'fa-trophy',
      title: 'Torneos',
      description: 'Compite en nuestros torneos americanos y pozos. Premios y diversión garantizada.',
      link: '/torneos',
      linkText: 'Ver Torneos',
      accent: 'coral'
    }
  ];

  readonly testimonials = [
    {
      text: 'Las mejores instalaciones de la ciudad. Las pistas están impecables y el ambiente es increíble.',
      author: 'Carlos Martínez',
      role: 'Jugador Amateur'
    },
    {
      text: 'La academia me ha ayudado a mejorar mi técnica un montón. Los monitores son top.',
      author: 'Ana García',
      role: 'Nivel Intermedio'
    },
    {
      text: 'Venimos todos los fines de semana con los amigos. El torneo americano es lo más.',
      author: 'Miguel López',
      role: 'Jugador Élite'
    }
  ];

  ngOnInit() {
    // Inicializar animaciones de scroll si es necesario
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.showMenu.set(false);
  }
}
