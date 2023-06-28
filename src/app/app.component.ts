import { Component, OnInit } from '@angular/core';
import { ServiceWorkerService } from './modules/core/services/service-worker.service';
import { PushNotificationService } from './modules/core/services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private serviceWorkerService: ServiceWorkerService,  private pushNotificationService: PushNotificationService ) {}

  ngOnInit() {
    this.serviceWorkerService.initServiceWorkerServices();
  }


  initPushNotificationTest($ev : any) {
    console.log('initPushNotificationTest button clicked...');
    this.pushNotificationService.init();
  }

}
