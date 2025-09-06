import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private renderer: Renderer2;

  constructor(
    private title: Title,
    private meta: Meta,
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  applyDefaultSeo() {
    const siteName = 'Deepak Pandey';
    const pageTitle = `${siteName} — Full-Stack Developer | Cloud Architect | GenAI Engineer`;
    const description = 'I build scalable cloud-native apps, integrate GenAI into production systems, and deliver elegant, performant software.';
    const canonicalUrl = this.getCanonicalUrl() || 'https://deepakpandey.in';
    const imageUrl = this.toAbsoluteUrl('/assets/images/logos/website_logo.webp', canonicalUrl);

    // Title & basic meta
    this.title.setTitle(pageTitle);
    this.updateMetaTag('description', description);
    this.updateMetaTag('keywords', 'Deepak Pandey, Full-Stack, Cloud Architect, GenAI, Angular, Node.js, AWS');

    // Open Graph
    this.updateOgTag('og:title', pageTitle);
    this.updateOgTag('og:description', description);
    this.updateOgTag('og:type', 'website');
    this.updateOgTag('og:url', canonicalUrl);
    this.updateOgTag('og:image', imageUrl);
    this.updateOgTag('og:site_name', siteName);

    // Twitter
    this.updateMetaTag('twitter:card', 'summary_large_image');
    this.updateMetaTag('twitter:title', pageTitle);
    this.updateMetaTag('twitter:description', description);
    this.updateMetaTag('twitter:image', imageUrl);

    // JSON-LD (Person)
    this.injectPersonJsonLd({
      name: siteName,
      url: canonicalUrl,
      image: this.toAbsoluteUrl('/assets/images/logos/website_logo.webp', canonicalUrl),
      jobTitle: 'Software Developer (Full Stack)',
      description: 'Coding Maestro | Full Stack Virtuoso | Architecting Elegance | AWS Certified Dev',
      email: 'mailto:mail@deepakpandey.in',
      telephone: '+91 9928 640 281',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lucknow',
        addressRegion: 'Uttar Pradesh',
        addressCountry: 'India',
      },
      sameAs: [
        'https://github.com/deepakgonda',
        'https://www.linkedin.com/in/deepakgonda/'
      ]
    });
  }

  private getCanonicalUrl(): string | null {
    const link = this.document.querySelector('link[rel=canonical]') as HTMLLinkElement | null;
    return link?.href || null;
  }

  private toAbsoluteUrl(path: string, base: string): string {
    try {
      if (/^https?:\/\//i.test(path)) return path;
      const url = new URL(base);
      return new URL(path, url.origin).toString();
    } catch {
      return path;
    }
  }

  private updateMetaTag(name: string, content: string) {
    this.meta.updateTag({ name, content });
  }

  private updateOgTag(property: string, content: string) {
    this.meta.updateTag({ property, content });
  }

  private injectPersonJsonLd(data: any) {
    // Replace existing script with same id to avoid duplicates
    const existing = this.document.getElementById('jsonld-person');
    if (existing) {
      this.renderer.removeChild(this.document.head, existing);
    }

    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.setAttribute(script, 'id', 'jsonld-person');
    const json = {
      '@context': 'http://schema.org',
      '@type': 'Person',
      ...data
    };
    const content = this.renderer.createText(JSON.stringify(json));
    this.renderer.appendChild(script, content);
    this.renderer.appendChild(this.document.head, script);
  }
}
