import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { FingerprintService } from './fingerprint.service';
import { BrowserAgentService } from './browser-agent.service';


@Injectable()
export class PushNotificationService {

  notificationPermission!: "default" | "denied" | "granted";

  notificationSubsFailedError = 'Unable to subscribe for push notifications. Please check notification permission in your browser settings.';

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
    private browserAgentService: BrowserAgentService
  ) { }

  async init() {


    if (environment.production) {

      await new Promise(resolve => setTimeout(resolve, 5 * 1000)); // Waiting for additional 5 secs to let everything stabilize...
      console.log('[NGSW] Init Method Begin...');

      try {

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


        let subscription!: PushSubscription;
        let oldSubscription!: PushSubscription | null;


        if (this.notificationPermission == 'default') {

          subscription = (await Promise.race([this.requestNewSubscription(), this.timeout(20 * 1000)])) as PushSubscription;
          console.log('[NGSW] Push Subscription object from Browser:', subscription);

        }

        if (this.notificationPermission == 'granted') {
          console.log('[NGSW] SW Push is enabled and notification permission is granted');

          try {
            oldSubscription = (await Promise.race([this.checkSubscription(), this.timeout(15 * 1000)])) as PushSubscription;
            console.log('[NGSW] oldSubscription: ', oldSubscription);
          } catch (err) {
            console.log('[NGSW] Error in getting oldSubscription: ', err);
          }

          // Check if there is old subscription, and is still valid...
          if (oldSubscription) {

            const keyBuffer: ArrayBuffer | null = oldSubscription.getKey('p256dh');
            let areKeysEqual = true;
            if (keyBuffer) {
              const oldVapidPublicKey = new Uint8Array(keyBuffer);
              areKeysEqual = new TextEncoder().encode(environment.vapidKey).every((value, index) => value === oldVapidPublicKey[index]);
              console.log('[NGSW] areKeysEqual: ', areKeysEqual);
            }

            if (!keyBuffer || !areKeysEqual) {
              console.log('[NGSW] Unsubscribing old subscription.... ');
              this.unsubscribeOldSubscription();
              oldSubscription = null;
            } else {
              console.log('[NGSW] Not Unsubscribing old subscription, b/c old and new vapid keys are equal...');
            }

          }

          // Add Logic to get new subscription here....
          if (!oldSubscription) {
            subscription = (await Promise.race([this.requestNewSubscription(), this.timeout(20 * 1000)])) as PushSubscription;
            console.log('[NGSW] Push Subscription object from Browser:', subscription);
          }

        }
        
        if (subscription || oldSubscription) {

          const visitorId = await this.fingerprint.getVisitorId();
          const browserUserAgent = await this.browserAgentService.getBrowserUserAgent();
          let payload = {
            visitorId: visitorId,
            browserUserAgent: browserUserAgent,
            pushSubscription: subscription ? subscription : oldSubscription,
          };
          console.log('[NGSW] Send Push SubscriptionPayload:', payload);
          this.sendPushSubscription(payload).subscribe(r => {
            console.log('[NGSW] Send Push Subscription to Backend Success: Response', r);
          }, err => {
            console.log('[NGSW] Send Push Subscription to Backend Error: ', err);
          });

          this.registerForListeningMessages();

        }


      } catch (err) {
        console.error("[NGSW]  Err:", err);
        this.showRelaventPopup(this.notificationSubsFailedError, 'Warning', -1);
      }

    } else {
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


  private sendPushSubscription(payload: any): Observable<any> {
    return this.http.post('/push-notification/subscribe', payload);
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

}
