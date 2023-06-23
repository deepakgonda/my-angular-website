import { Injectable } from '@angular/core';
import { SwUpdate, VersionDetectedEvent, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, map } from 'rxjs/operators';
import { VersionPopupComponent } from '../components/version-popup/version-popup.component';


@Injectable({
    providedIn: 'root'
})
export class VersionUpdatesPromptService {

    constructor(private updates: SwUpdate, private snackBar: MatSnackBar) { }

    public init() {

        this.updates.versionUpdates.pipe(
            filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        ).subscribe(evt => {
            console.log('[NGSW Update], New Updated is available. Evt:', evt)

            this.snackBar.openFromComponent(VersionPopupComponent, {
                verticalPosition: 'top',
                horizontalPosition: 'right',
                duration: 0,
            })
        });
        console.log('Subscribed To Prompt Update Service.');
    }


}
