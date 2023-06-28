import { Component, OnInit } from '@angular/core';
import { ServiceWorkerService } from './modules/core/services/service-worker.service';
import { PushNotificationService } from './modules/core/services/push-notification.service';
import { FingerprintService } from './modules/core/services/fingerprint.service';
import { BrowserAgentService } from './modules/core/services/browser-agent.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private serviceWorkerService: ServiceWorkerService,
    private pushNotificationService: PushNotificationService,
    private fingerprintService: FingerprintService,
    private browserAgentService: BrowserAgentService
  ) { }

  ngOnInit() {
    this.initCoreServices();
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
