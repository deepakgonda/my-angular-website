import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionPopupComponent } from './version-popup.component';

describe('VersionPopupComponent', () => {
  let component: VersionPopupComponent;
  let fixture: ComponentFixture<VersionPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VersionPopupComponent]
    });
    fixture = TestBed.createComponent(VersionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
