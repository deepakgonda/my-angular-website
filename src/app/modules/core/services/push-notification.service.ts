import { Injectable } from '@angular/core';
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

  notificationSubsFailedError = 'Unable to subscribe for push notifications. Please check notification permission in your browser settings.';

  timeout = (duration: number): Promise<void> => new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(`Time out! Promise couldn't be fulfilled in ${duration} milliseconds.`);
    }, duration);
  });

  constructor(
    private http: HttpClient,
    private swPush: SwPush,
    private snackBar: MatSnackBar
  ) { }

  async init() {

    console.log('[NGSW] Init Method Begin...');

    await new Promise(resolve => setTimeout(resolve, 5 * 1000)); // Waiting for additional 5 secs to let everything stabilize...

    try {
      if (!("Notification" in window)) {
        this.notificationSubsFailedError = 'This browser does not support push notification. It can not be enabled. For best experience try other browsers.';
        console.log(`[NGSW] ${this.notificationSubsFailedError}`);
      } else {
        this.notificationPermission = Notification.permission;
        console.log('[NGSW] Notification.permission:', this.notificationPermission);   // "default" | "denied" | "granted"

        if (this.notificationPermission == 'granted' || this.notificationPermission == 'default') {
          console.log('[NGSW] SW Push is enabled and notification permission is granted');


          // Check if user have already subscribed or not....
          let oldSubscription;
          try {
            oldSubscription = await Promise.race([this.checkSubscription(), this.timeout(15 * 1000)]);
            console.log('[NGSW] oldSubscription: ', oldSubscription);
          } catch (err) {
            console.log('[NGSW] Error in getting oldSubscription: ', err);
          }



          // Add Logic to remove old subscription here....
          if (oldSubscription) {

          }




          // Add Logic to get new subscription here....
          let subscription!: PushSubscription;
          if (!oldSubscription) {
            subscription = (await Promise.race([this.requestNewSubscription(), this.timeout(20 * 1000)])) as PushSubscription;
            console.log('[NGSW] Push Subscription payload to Request:', subscription);
          }

          this.sendPushSubscription(subscription).subscribe(r => {
            console.log('[NGSW] Send Push Subscription to Backend Success: Response', r);
          }, err => {
            console.log('[NGSW] Send Push Subscription to Backend Error: ', err);
          });


          if(oldSubscription || subscription) {
            this.operationStatus = true;  // Need not to show error...

            this.registerForListeningMessages();
          }

        } else {
          this.notificationSubsFailedError = 'Notification permission is denied. Please reset your notification permission for our Web App in your browser settings.';
          console.log(`[NGSW] ${this.notificationSubsFailedError}`);
        }
      }
    } catch (err) {
      console.error("[NGSW]  Err:", err);
      if (!this.operationStatus) {
        let ref = this.showRelaventPopup(this.notificationSubsFailedError, 'Warning');
        ref.onAction().subscribe(act => {
          console.log("[NGSW] Warning notification clicked:", act);
          ref.dismiss();
        });
      }
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


  private unsubscribeOldSubscription() {
    console.log('[NGSW] unsubscribeOldSubscription.........');
    return this.swPush.unsubscribe();
  }


  private requestNewSubscription() {
    console.log('[NGSW] requestNewSubscription......... with vapidKey:', environment.vapidKey);
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
