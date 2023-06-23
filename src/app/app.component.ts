import { Component, OnInit } from '@angular/core';
import { ServiceWorkerService } from './modules/core/services/service-worker.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private serviceWorkerService: ServiceWorkerService) {}

  ngOnInit() {
    this.serviceWorkerService.initServiceWorkerServices();
  }

}
