import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { PushNotificationService } from 'src/app/modules/core/services/push-notification.service';
import { Meta, Title } from '@angular/platform-browser';


@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit, OnDestroy {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private pushNotificationService: PushNotificationService,
    private renderer: Renderer2,
    private metaService: Meta,
    private titleService: Title
  ) {

  }

  ngOnInit() {

    this.titleService.setTitle("Deepak Pandey - Full Stack Developer");

    this.metaService.addTags([
      { name: 'description', content: 'Coding Maestro | Full Stack Virtuoso | Architecting Elegance | AWS Certified Dev' },
      { name: 'author', content: 'Deepak Pandey' },
      { name: 'keywords', content: 'Deepak Pandey, Full Stack Developer, Angular, NodeJS, AWS, Portfolio, Software Engineer' },

      // Open Graph tags for social sharing
      { property: 'og:title', content: 'Deepak Pandey - Full Stack Developer' },
      { property: 'og:description', content: 'Coding Maestro | Full Stack Virtuoso | Architecting Elegance | AWS Certified Dev' },
      { property: 'og:image', content: 'https://deepakpandey.in/assets/images/logos/website_logo.webp' },
      { property: 'og:url', content: 'https://deepakpandey.in' },
      { property: 'og:type', content: 'website' },

      // Twitter card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Deepak Pandey - Full Stack Developer' },
      { name: 'twitter:description', content: 'Coding Maestro | Full Stack Virtuoso | Architecting Elegance | AWS Certified Dev' },
      { name: 'twitter:image', content: 'https://deepakpandey.in/assets/images/logos/website_logo.webp' }
    ]);

    // Create a <script> element
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';

    // Define your Schema markup here
    const schemaData = {
      "@context": "http://schema.org",
      "@type": "Person",
      "name": "Deepak Pandey",
      "url": "https://deepakpandey.in",
      "image": "https://deepakpandey.in/assets/images/logos/website_logo.webp",
      "jobTitle": "Software Developer (Full Stack)",
      "description": "Coding Maestro | Full Stack Virtuoso | Architecting Elegance | AWS Certified Dev",
      "email": "mailto:mail@deepakpandey.in",
      "telephone": "+91 9928 640 281",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Lucknow",
        "addressRegion": "Uttar Pradesh",
        "addressCountry": "India"
      },
      "sameAs": [
        "https://github.com/deepakgonda",
        "https://www.linkedin.com/in/deepakgonda/"
      ]
    };

    // Set the content of the <script> element to your Schema markup
    const scriptContent = this.renderer.createText(JSON.stringify(schemaData));
    this.renderer.appendChild(script, scriptContent);

    // Append the <script> element to the <head>
    this.renderer.appendChild(this.document.head, script);
  }

  ngOnDestroy() {
    const metaNames = [
      'description', 'author', 'keywords',
      'og:title', 'og:description', 'og:image', 'og:url', 'og:type',
      'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'
    ];

    metaNames.forEach(name => {
      this.metaService.removeTag(`name='${name}'`);
      this.metaService.removeTag(`property='${name}'`);
    });

    const existingScripts = this.document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => {
      this.renderer.removeChild(this.document.head, script);
    });
  }


  initPushNotificationTest($ev: any) {
    console.log('initPushNotificationTest button clicked...');
    this.pushNotificationService.init();
  }

}
