import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VikingUsersComponent } from "./viking-users.component";

describe("VikingUsersComponent", () => {
    let component: VikingUsersComponent;
    let fixture: ComponentFixture<VikingUsersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VikingUsersComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VikingUsersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
