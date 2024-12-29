import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayorAddressComponent } from './payor-address.component';

describe('PayorAddressComponent', () => {
  let component: PayorAddressComponent;
  let fixture: ComponentFixture<PayorAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayorAddressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayorAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
