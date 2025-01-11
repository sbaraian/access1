import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";

import { IPayorAddress } from "../models/payor";
@Component({
    selector: "app-payor-address",
    standalone: true,
    imports: [ButtonModule, ButtonGroupModule, CardModule, CheckboxModule, DialogModule, DividerModule, FormsModule, InputMaskModule, InputTextModule],
    templateUrl: "./payor-address.component.html",
    styleUrl: "./payor-address.component.scss",
})
export class PayorAddressComponent {
    private config = inject(DynamicDialogConfig);
    private ref = inject(DynamicDialogRef);

    address: IPayorAddress;

    constructor() {
        this.address = this.config.data.address;
    }

    add = (): void => {
        this.ref.close(this.address);
    };
}
