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
    { value: '8', label: 'Premium Courts' },
    { value: '2.4K+', label: 'Active Players' },
    { value: '15K+', label: 'Matches per Year' },
    { value: '4.9', label: 'Average Rating' }
  ];

  readonly features = [
    {
      image: 'img/features/reserva.jpg',
      icon: 'fa-calendar-check',
      title: 'Online Booking',
      description: 'Book your court in seconds. Real-time availability system.',
      link: '/reservas',
      linkText: 'Book Now',
      accent: 'cyan'
    },
    {
      image: 'img/features/academia.jpg',
      icon: 'fa-graduation-cap',
      title: 'Élite Academy',
      description: 'Certified coaches. Classes for all levels, from beginner to competition.',
      link: '/clases',
      linkText: 'View Classes',
      accent: 'lime'
    },
    {
      image: 'img/features/torneos.jpg',
      icon: 'fa-trophy',
      title: 'Tournaments',
      description: 'Compete in our american and pool tournaments. Prizes and fun guaranteed.',
      link: '/torneos',
      linkText: 'View Tournaments',
      accent: 'coral'
    }
  ];

  readonly testimonials = [
    {
      text: 'The best facilities in the city. The courts are impeccable and the atmosphere is incredible.',
      author: 'Carlos Martínez',
      role: 'Amateur Player'
    },
    {
      text: 'The academy has helped me improve my technique a lot. The coaches are top.',
      author: 'Ana García',
      role: 'Intermediate Level'
    },
    {
      text: 'We come every weekend with friends. The american tournament is the best.',
      author: 'Miguel López',
      role: 'Élite Player'
    }
  ];

  ngOnInit() {
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.showMenu.set(false);
  }
}
