import { ApplicationRef, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';


@Injectable()
export class PushNotificationService {

  notificationPermission!: "default" | "denied" | "granted";

  subscriptionStorageName = 'push-subscription-23-06-2023';

  operationStatus = false;

  timeout = (duration: number): Promise<void> => new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(`Time out! Promise couldn't be fulfilled in ${duration} milliseconds.`);
    }, duration);
  });

  constructor(
    private http: HttpClient,
    private swPush: SwPush,
    private appRef: ApplicationRef,
    private snackBar: MatSnackBar
  ) { }

  async init() {

    await new Promise(resolve => setTimeout(resolve, 5 * 1000)); // Waiting for additional 5 secs to let everything stabilize...

    if (this.swPush.isEnabled) {
      console.log('[NGSW] SW Push is enabled.');

      let checkIfNewRegistration = localStorage.getItem(this.subscriptionStorageName);
      if (checkIfNewRegistration) {
        console.log('[NGSW] New Registration for Push Subscription...., Ignoring rest of the steps...');
        return;
      }

      try {
        await Promise.race([this.unsubscribeOldSubscription(), this.timeout(10 * 1000)]);
        console.log('[NGSW] Unsubscribed Old Subscription Successfully.');
      } catch (err) {
        console.error('[NGSW][SwPush][unSubscription] Unsubscribe old subscription failed. Error:', err);
      }

      try {
        let subscription = (await Promise.race([this.requestNewSubscription(), this.timeout(20 * 1000)])) as PushSubscription;
        console.log('[NGSW] Push Subscription payload to Request:', subscription);
        this.operationStatus = true;
        this.sendPushSubscription(subscription).subscribe(r => {
          console.log('[NGSW] Send Push Subscription to Backend Success: Response', r);
          localStorage.setItem(this.subscriptionStorageName, JSON.stringify(subscription));
        });
      } catch (err) {
        console.error('[NGSW] Requesting New Subscription Failed. Error:', err);
      }

      this.registerForListeningMessages();

      if (!this.operationStatus) {
        try {
          if (!("Notification" in window)) {
            console.log("[NGSW] This browser does not support push notification.");
          } else {
            this.notificationPermission = Notification.permission;
            console.log('[NGSW] Notification.permission:', this.notificationPermission);   // "default" | "denied" | "granted"
          }
        } catch (err) {
          console.error("[NGSW] Notification Permission Err:", err)
        }

        if (!this.notificationPermission || this.notificationPermission == 'denied') {
          this.showRelaventPopup('You have denied push notification permissions to our App. If you wish to receive important updates from us via push notification, please reset the permission in your browser.', 'Warning', 10000);
        } else {
          console.log("[NGSW] Some other problem in notification. User may need to reset the permissions...");
          let ref = this.showRelaventPopup('We have detected some problem in Push Notifications settings, Please reset all permissions and clear cookies for our website in your your browser settings.', 'Warning');
          ref.onAction().subscribe(act => {
            console.log("[NGSW] Warning notification clicked:", act);
            ref.dismiss();
          });
        }
      }

    } else {
      console.log('[NGSW] SW Push is not enabled. ');
    }

    console.log('[NGSW] Init Method Completed...');
  }


  private unsubscribeOldSubscription() {
    console.log('[NGSW] unsubscribeOldSubscription.........');
    return this.swPush.unsubscribe();
  }


  private requestNewSubscription() {
    console.log('[NGSW] requestNewSubscription.........');
    return this.swPush.requestSubscription({ serverPublicKey: environment.vapidKey });
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


  private sendPushSubscription(subscription: PushSubscription): Observable<any> {
    return this.http.post('/push-notification/subscribe', subscription);
  }


  private showRelaventPopup(message: any, typeText = 'done', duration = 3000) {
    return this.snackBar.open(message, typeText, {
      duration: duration,
    });
  }

}
