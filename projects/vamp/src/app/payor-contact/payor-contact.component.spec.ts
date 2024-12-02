import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayorContactComponent } from './payor-contact.component';

describe('PayorContactComponent', () => {
  let component: PayorContactComponent;
  let fixture: ComponentFixture<PayorContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayorContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayorContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
