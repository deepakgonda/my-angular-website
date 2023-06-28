import { Injectable } from '@angular/core';
import FingerprintJS, { Agent } from '@fingerprintjs/fingerprintjs';

@Injectable()
export class FingerprintService {

  private fingerprint!: Agent;

  private visitorId!: string;

  constructor() {
  }

  async init() {
    console.log('Fingerprint Service Initializing....');
    this.fingerprint = await FingerprintJS.load({
      monitoring: false
    });
    const result = await this.fingerprint.get();
    console.log('Fingerprint:',result);
    this.visitorId = result.visitorId;
  }

  async getVisitorId(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.visitorId) {
        resolve(this.visitorId);  // Straightaway reply
      } else {
        await new Promise(resolve => setTimeout(resolve, 5 * 1000));
        if (this.visitorId) {
          resolve(this.visitorId);  // Reply after waiting 5 seconds
        } else {
          await new Promise(resolve => setTimeout(resolve, 5 * 1000));
          if (this.visitorId) {
            resolve(this.visitorId);   // Reply after waiting 10 seconds
          } else {
            reject('Could not get visitorId from Fingerprint Library');  // Finally rejected, could not load
          }
        }
      }
    })
  }
}
