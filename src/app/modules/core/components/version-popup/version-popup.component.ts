import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { Observable, map, shareReplay } from 'rxjs';

@Component({
  selector: 'app-version-popup',
  templateUrl: './version-popup.component.html',
  styleUrls: ['./version-popup.component.scss']
})
export class VersionPopupComponent implements OnInit {

  isMobile = false
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );


  constructor(
    private breakpointObserver: BreakpointObserver,
    private _snackRef: MatSnackBarRef<VersionPopupComponent>,
  ) { }

  ngOnInit(): void {
    this.isHandset$.subscribe((r) => {
      this.isMobile = r;
    });
  }

  refreshVersion() {
    window.location.reload();
  }

  closeSnackBar() {
    this._snackRef.dismiss();
  }

}
