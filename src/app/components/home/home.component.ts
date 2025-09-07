import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PushNotificationService } from 'src/app/modules/core/services/push-notification.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements AfterViewInit, OnDestroy {
    isMobileMenuOpen = false;
    activeSection: string | null = null;
    currentYear = new Date().getFullYear();

    private observer?: IntersectionObserver;
    private isBrowser: boolean;
    private tiltRaf = 0;
    private prefersReducedMotion = false;

    // Hero photo tilt styles
    photoTransform = '';
    photoTransition = 'transform 300ms ease';

    constructor(@Inject(PLATFORM_ID) platformId: Object, private push: PushNotificationService) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngAfterViewInit(): void {
        if (!this.isBrowser || typeof window === 'undefined' || !("IntersectionObserver" in window)) {
            // still set reduced motion if possible
            try {
                // @ts-ignore
                this.prefersReducedMotion = !!window?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
            } catch { }
            return;
        }

        try {
            this.prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        } catch {
            this.prefersReducedMotion = false;
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

    onPhotoMouseMove(event: MouseEvent): void {
        if (!this.isBrowser || this.prefersReducedMotion) return;
        const target = event.currentTarget as HTMLElement | null;
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        const maxDeg = 8;
        const rotateY = ((x - midX) / midX) * maxDeg; // left(-) to right(+)
        const rotateX = -((y - midY) / midY) * maxDeg; // top(+) to bottom(-)

        if (this.tiltRaf) cancelAnimationFrame(this.tiltRaf);
        this.tiltRaf = requestAnimationFrame(() => {
            this.photoTransition = 'transform 60ms linear';
            this.photoTransform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.02)`;
        });
    }

    resetPhotoTilt(): void {
        if (!this.isBrowser) return;
        if (this.tiltRaf) cancelAnimationFrame(this.tiltRaf);
        this.photoTransition = 'transform 300ms ease';
        this.photoTransform = '';
    }
}
