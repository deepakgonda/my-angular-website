import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PushNotificationService } from 'src/app/modules/core/services/push-notification.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  isMobileMenuOpen = false;
  activeSection: string | null = null;
  currentYear = new Date().getFullYear();

  private observer?: IntersectionObserver;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private push: PushNotificationService) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || typeof window === 'undefined' || !("IntersectionObserver" in window)) {
      return;
    }

    const sectionIds = ['hero', 'about', 'skills', 'experience', 'projects', 'personal-projects', 'certifications', 'contact'];
    this.observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting);
      if (visible.length) {
        visible.sort((a, b) => (b.intersectionRatio - a.intersectionRatio));
        const top = visible[0];
        this.activeSection = top.target.id || null;
      }
    }, {
      // Trigger roughly when section center enters viewport
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: [0.25, 0.5, 0.75]
    });

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        this.observer!.observe(el);
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  scrollToSection(sectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (!this.isBrowser) {
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const headerOffset = 80; // account for fixed nav height
      const rect = element.getBoundingClientRect();
      const top = window.pageYOffset + rect.top - headerOffset;
      window.scrollTo({
        top,
        behavior: prefersReduced ? 'auto' : 'smooth'
      });
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  enableNotifications(): void {
    if (!this.isBrowser) return;
    try {
      this.push.init();
    } catch (e) {
      // noop
    }
  }
}
