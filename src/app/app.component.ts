import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ServiceWorkerService } from './modules/core/services/service-worker.service';
import { PushNotificationService } from './modules/core/services/push-notification.service';
import { FingerprintService } from './modules/core/services/fingerprint.service';
import { BrowserAgentService } from './modules/core/services/browser-agent.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private serviceWorkerService: ServiceWorkerService,
    private pushNotificationService: PushNotificationService,
    private fingerprintService: FingerprintService,
    private browserAgentService: BrowserAgentService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {

    if (this.isBrowser) {
      this.initCoreServices();
    } else {
      console.log('Not Initializing Core services, b/c platform is server');
    }

  }


  initCoreServices() {
    this.serviceWorkerService.initServiceWorkerServices();
    this.fingerprintService.init();
    this.browserAgentService.init();
  }


  initPushNotificationTest($ev: any) {
    console.log('initPushNotificationTest button clicked...');
    this.pushNotificationService.init();
  }

}
