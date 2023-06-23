import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionPopupComponent } from './components/version-popup/version-popup.component';
import { ServiceWorkerService } from './services/service-worker.service';
import { CheckForUpdateService } from './services/check-for-update.service';
import { LogUpdateService } from './services/log-update.service';
import { VersionUpdatesPromptService } from './services/version-update-prompt.service';
import { httpInterceptorProviders } from './interceptors';
import { HttpClientModule } from '@angular/common/http';


const components = [
  VersionPopupComponent
];


@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    ...components
  ],
  providers: [
    ServiceWorkerService, CheckForUpdateService, LogUpdateService, VersionUpdatesPromptService,
    httpInterceptorProviders,
  ]
})
export class CoreModule {
  /* make sure CoreModule is imported only by one NgModule the AppModule */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}
