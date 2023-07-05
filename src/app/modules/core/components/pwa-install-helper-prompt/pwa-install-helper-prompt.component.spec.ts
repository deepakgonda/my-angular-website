import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwaInstallHelperPromptComponent } from './pwa-install-helper-prompt.component';

describe('PwaInstallHelperPromptComponent', () => {
  let component: PwaInstallHelperPromptComponent;
  let fixture: ComponentFixture<PwaInstallHelperPromptComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PwaInstallHelperPromptComponent]
    });
    fixture = TestBed.createComponent(PwaInstallHelperPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
