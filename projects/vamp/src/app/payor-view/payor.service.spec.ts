import { TestBed } from "@angular/core/testing";

import { PayorService } from "./payor.service";

describe("PayorService", () => {
    let service: PayorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PayorService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
