import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { from } from 'rxjs';


@Injectable()
export class LogUpdateService {

    constructor(private updates: SwUpdate) { }

    public init() {

        this.updates.versionUpdates.subscribe(event => {
            console.log('[NEW SW UPDATE]: versionUpdates:', event);
        });

        from(this.updates.activateUpdate()).subscribe(event => {
            console.log('[NEW SW UPDATE]: activatedUpdate:', event);
        });

        console.log('Subscribed To Log Update Service.');

    }
}
