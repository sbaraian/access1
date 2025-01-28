import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VikingUserComponent } from "./payor.component";

describe("VikingUserComponent", () => {
    let component: VikingUserComponent;
    let fixture: ComponentFixture<VikingUserComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VikingUserComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VikingUserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
