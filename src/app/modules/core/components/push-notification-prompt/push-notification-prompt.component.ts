import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAgentService } from '../../services/browser-agent.service';

@Component({
  selector: 'app-push-notification-prompt',
  templateUrl: './push-notification-prompt.component.html',
  styleUrls: ['./push-notification-prompt.component.scss']
})
export class PushNotificationPromptComponent {
  browser = 'Unknown';
  platform = 'Unknown';
  isPwaMode = false;

  constructor(
    public dialogRef: MatDialogRef<PushNotificationPromptComponent>,
    public browserAgentService: BrowserAgentService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log('Dialog Data:', data);
  }

  ngOnInit() {
    console.log("Push Notification Prompt Dialog:", this.data);
    (async () => {
      const userAgent = await this.browserAgentService.getBrowserUserAgent();
      const detectedSystemData = this.detectBrowserAndPlatform(userAgent);
      this.browser = detectedSystemData.browser;
      this.platform = detectedSystemData.platform;
      console.log("Browser:", this.browser);
      console.log("platform:", this.platform);

      // this.platform = 'ios';
      // this.platform = 'mac';
    })();
  }


  getPWADisplayMode() {
    let navigator: any = window.navigator as any;
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    this.isPwaMode = mediaQueryList.matches || navigator?.standalone;
  }


  detectBrowserAndPlatform(userAgent: string) {
    const regex = {
      chrome: /Chrome|CriOS\/(\d+)/,
      edge: /Edg\/(\d+)/,
      firefox: /Firefox\/(\d+)/,
      opera: /OPR\/(\d+)/,
      safari: /Version\/(\d+)/,
      windows: /Windows NT (\d+)/,
      mac: /Macintosh; Intel Mac OS X (\d+[_.]\d+[_.]\d+)/,
      linux: /Linux/,
      ios: /(iPhone|iPad|iPod)/,
    };

    const browser = {
      chrome: userAgent.match(regex.chrome),
      edge: userAgent.match(regex.edge),
      firefox: userAgent.match(regex.firefox),
      opera: userAgent.match(regex.opera),
      safari: userAgent.match(regex.safari),
    };

    const platform = {
      windows: userAgent.match(regex.windows),
      mac: userAgent.match(regex.mac),
      linux: userAgent.match(regex.linux),
      ios: userAgent.match(regex.ios),
    };

    let detectedBrowser = '';
    let detectedPlatform = '';

    for (const [key, value] of Object.entries(browser)) {
      if (value !== null) {
        detectedBrowser = key;
        break;
      }
    }

    for (const [key, value] of Object.entries(platform)) {
      if (value !== null) {
        detectedPlatform = key;
        break;
      }
    }

    return {
      browser: detectedBrowser,
      platform: detectedPlatform,
    };
  }

  confirmClick() {
    this.data.isConfirmed = true;
    this.dialogRef.close(this.data);
  }
}
