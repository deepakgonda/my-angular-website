import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FingerprintService } from './fingerprint.service';
import { BrowserAgentService } from './browser-agent.service';
import { MatDialog } from '@angular/material/dialog';
import { PushNotificationPromptComponent } from '../components/push-notification-prompt/push-notification-prompt.component';
import * as storageHelper from './../helpers/storage-helper';
import { environment } from 'src/environments/environment';


@Injectable()
export class PushNotificationService {

  notificationPermission!: "default" | "denied" | "granted";

  notificationSubsFailedError = 'Unable to subscribe for push notifications. Please check notification permission in your browser settings.';

  isConfirmPromptOpen = false;

  timeout = (duration: number): Promise<void> => new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(`Time out! Promise couldn't be fulfilled in ${duration} milliseconds.`);
    }, duration);
  });

  constructor(
    private http: HttpClient,
    private swPush: SwPush,
    private snackBar: MatSnackBar,
    private fingerprint: FingerprintService,
    private browserAgentService: BrowserAgentService,
    private dialog: MatDialog,
  ) {

  }

  async init() {

    if (environment.production) {

      // await new Promise(resolve => setTimeout(resolve, 5 * 1000)); // Waiting for additional 5 secs to let everything stabilize...
      console.log('[NGSW] Init Method Begin...');

      if (!("Notification" in window)) {
        this.notificationSubsFailedError = 'This browser does not support push notification. It can not be enabled. For best experience try other browsers.';
        console.log(`[NGSW] ${this.notificationSubsFailedError}`);

        this.showRelaventPopup(this.notificationSubsFailedError, 'Warning', -1);
        return;
      }


      this.notificationPermission = Notification.permission;
      console.log('[NGSW] Notification.permission:', this.notificationPermission);   // "default" | "denied" | "granted"

      if (this.notificationPermission == "denied") {
        this.notificationSubsFailedError = 'Notification permission is denied. Please reset your notification permission for our Web App in your browser settings.';
        console.log(`[NGSW] ${this.notificationSubsFailedError}`);

        this.showRelaventPopup(this.notificationSubsFailedError, 'Warning', -1);
        return;
      }


      if (this.notificationPermission == 'default') {
        console.log('[NGSW] SW Push is enabled and notification permission is default');
        this.promptForNotificationSubscription();
      }

      if (this.notificationPermission == 'granted') {
        console.log('[NGSW] SW Push is enabled and notification permission is granted');

        try {
          let oldSubscription: PushSubscription | null = (await Promise.race([this.checkSubscription(), this.timeout(15 * 1000)])) as PushSubscription;
          console.log('[NGSW] oldSubscription: ', oldSubscription);
          if(!oldSubscription) {
            throw new Error('oldSubscription is null');
          }
          this.registerOnServer(oldSubscription);  // Do send old subscription on server, so that it can checked when last updated...
          this.registerForListeningMessages();

        } catch (err) {
          console.log('[NGSW] Error in getting oldSubscription: ', err);
          console.log('[NGSW] Will ask user permission again...');
          this.promptForNotificationSubscription();
        }

      }

    } else {
      this.promptForNotificationSubscription();
      console.log('Skipping Push Notification Service Test, as running in Local Environment')
    }

    console.log('[NGSW] Init Method Completed...');
  }


  private checkSubscription() {
    return new Promise((resolve, reject) => {
      this.swPush.subscription.subscribe((subscription) => {
        console.log('[NGSW] checkSubscription : subscription:', subscription);
        resolve(subscription);
      }, err => {
        console.log('[NGSW] checkSubscription : err:', err);
        reject(err);
      });
    });
  }


  private async promptForNotificationSubscription() {

    if (!this.isConfirmPromptOpen) {
      this.isConfirmPromptOpen = true;
      let subscription!: PushSubscription;
      const dialogRef = this.dialog.open(PushNotificationPromptComponent, {
        data: {
          isConfirmed: false,
        },
        panelClass: ['max-w-md'],
        maxWidth: '448px',
        // width: '50vw',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        this.isConfirmPromptOpen = false;

        console.log('[NGSW] Push Notification Prompt Dialog closed with result: ', result);
        storageHelper.setToLocalStorageWithExpiry('auto_notification_call_initiated', 'true', 604800);  // Save it for 7 days...

        if (result.isConfirmed) {
          subscription = (await Promise.race([this.requestNewSubscription(), this.timeout(30 * 1000)])) as PushSubscription;
          console.log('[NGSW] Push Subscription object from Browser:', subscription);

          await this.registerOnServer(subscription);
          this.registerForListeningMessages();
        }
      });
    }
  }

  private requestNewSubscription() {
    console.log('[NGSW] requestNewSubscription......... with vapidKey:', environment.vapidKey);
    return this.swPush.requestSubscription({ serverPublicKey: environment.vapidKey });
  }

  private async registerOnServer(subscription: PushSubscription) {
    const browserUniqueId = await this.fingerprint.getVisitorId();
    const browserUserAgent = await this.browserAgentService.getBrowserUserAgent();
    let payload = {
      browserUniqueId: browserUniqueId,
      browserUserAgent: browserUserAgent,
      pushSubscription: subscription,
    };
    console.log('[NGSW] Send Push SubscriptionPayload:', payload);
    this.sendPushSubscription(payload).subscribe(r => {
      console.log('[NGSW] Send Push Subscription to Backend Success: Response', r);
    }, err => {
      console.log('[NGSW] Send Push Subscription to Backend Error: ', err);
    });
  }


  private sendPushSubscription(payload: any): Observable<any> {
    return this.http.post('/push-notification/subscribe', payload);
  }


  private registerForListeningMessages() {
    console.log('[NGSW] registerForListeningMessages.........');
    this.swPush.messages.subscribe(r => {
      console.log('[NGSW] Push Notification Received:', r);
    });

    // Subscribe for User Action Clicks
    this.swPush.notificationClicks.subscribe(r => {
      console.log('[NGSW] Push Notification Clicked:', r);
      console.log('[NGSW] Push Notification Clicked:', JSON.stringify(r));
      if (r.action && r.action === 'explore' && r.notification.data.url) {
        window.focus();
        window.open(r.notification.data.url, '_self');
      }
    });
  }


  private showRelaventPopup(message: any, typeText = 'done', duration = 3000) {
    let ref = this.snackBar.open(message, typeText, {
      duration: duration,
    });

    ref.onAction().subscribe(act => {
      console.log("[NGSW] Warning notification clicked:", act);
      ref.dismiss();
    });

  }

  private unsubscribeOldSubscription() {
    console.log('[NGSW] unsubscribeOldSubscription.........');
    return this.swPush.unsubscribe();
  }

}
