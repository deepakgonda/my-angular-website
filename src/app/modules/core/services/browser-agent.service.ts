import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable()
export class BrowserAgentService {

  isBrowser: boolean;
  private userAgent!: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  init() {

    if (this.isBrowser) {
      this.userAgent = navigator.userAgent;
      console.log('Browser userAgent:', this.userAgent);
    }
    
  }

  async getBrowserUserAgent() : Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.userAgent) {
        resolve(this.userAgent);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1 * 1000));
        if (this.userAgent) {
          resolve(this.userAgent);
        } else {
          reject('Could not get browser\'s user agent');
        }
      }
    })
  }

}
