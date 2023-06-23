import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';


@Injectable()
export class CheckForUpdateService {

    constructor(private appRef: ApplicationRef, private updates: SwUpdate) { }

    public init() {
        // Allow the app to stabilize first, before starting polling for updates with `interval()`.
        const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
        const every3Mins$ = interval(3 * 60 * 1000);
        const every3MinsOnceAppIsStable$ = concat(appIsStable$, every3Mins$);

        every3MinsOnceAppIsStable$.subscribe(() => {
            this.updates.checkForUpdate();
            console.log('Checked For Version Update. (NGSW)');
        });
        console.log('Subscribed To Check For Updates Service.(NGSW)');
    }
}
