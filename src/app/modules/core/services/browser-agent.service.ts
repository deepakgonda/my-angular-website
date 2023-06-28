import { Injectable } from '@angular/core';

@Injectable()
export class BrowserAgentService {

  private userAgent!: string;

  constructor() { }

  init() {

    this.userAgent = navigator.userAgent;
    console.log('Browser userAgent:', this.userAgent);
    
  }

  async getBrowserUserAgent() : Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.userAgent) {
        resolve(this.userAgent);
      } else {
        await new Promise(resolve => setTimeout(resolve, 2 * 1000));
        if (this.userAgent) {
          resolve(this.userAgent);
        } else {
          reject('Could not get browser\'s user agent');
        }
      }
    })
  }

}
