import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { ToastModule } from "primeng/toast";
import { tap } from "rxjs/operators";

import { IPayorContact } from "../models/payor";
import { PayorService } from "../payor-view/payor.service";
@Component({
    selector: "app-payor-contact",
    standalone: true,
    imports: [ButtonModule, ButtonGroupModule, CardModule, DialogModule, DividerModule, FormsModule, InputMaskModule, InputTextModule, ToastModule],
    templateUrl: "./payor-contact.component.html",
    styleUrl: "./payor-contact.component.scss",
})
export class PayorContactComponent {
    private config = inject(DynamicDialogConfig);
    private ref = inject(DynamicDialogRef);
    private destroyRef = inject(DestroyRef);
    private payorService = inject(PayorService);
    private messageService = inject(MessageService);

    contact: IPayorContact;

    constructor() {
        this.contact = this.config.data.contact;
    }

    save = (): void => {
        this.payorService
            .saveContact(this.contact)
            .pipe(
                tap((_) => {
                    this.messageService.add({ severity: "success", summary: "Success", detail: `Contact ${this.contact.firstName} ${this.contact.lastName} saved.`, life: 3000, key: "payorContact" });
                    this.ref.close(this.contact);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    };
}
