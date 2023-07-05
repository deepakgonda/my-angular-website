import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PushNotificationPromptComponent } from './push-notification-prompt.component';

describe('PushNotificationPromptComponent', () => {
  let component: PushNotificationPromptComponent;
  let fixture: ComponentFixture<PushNotificationPromptComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PushNotificationPromptComponent]
    });
    fixture = TestBed.createComponent(PushNotificationPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
