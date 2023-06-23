import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CheckForUpdateService } from './check-for-update.service';
import { LogUpdateService } from './log-update.service';
import { VersionUpdatesPromptService } from './version-update-prompt.service';
import { environment } from 'src/environments/environment';
import { PushNotificationService } from './push-notification.service';

@Injectable()
export class ServiceWorkerService {

    constructor(
        private checkForUpdateService: CheckForUpdateService,
        private logUpdateService: LogUpdateService,
        private promptUpdateService: VersionUpdatesPromptService,
        private pushNotificationService: PushNotificationService
    ) { }


    // Init All ServiceWorker Related Services
    public initServiceWorkerServices() {
        if (environment.production) {
            console.log('Starting Service Worker Services');
            this.checkForUpdateService.init();
            this.logUpdateService.init();
            this.promptUpdateService.init();
            this.pushNotificationService.init();
        } else {
            console.log('Skipping Service Worker Services, as running in Local Environment')
        }

    }

}
