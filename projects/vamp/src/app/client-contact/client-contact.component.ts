import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { ToastModule } from "primeng/toast";
import { EMPTY } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ClientService } from "../client-view/client.service";
import { IClientContact } from "../models/client";
@Component({
    selector: "app-client-contact",
    standalone: true,
    imports: [ButtonModule, ButtonGroupModule, CardModule, CheckboxModule, DialogModule, DividerModule, FormsModule, InputMaskModule, InputTextModule, ToastModule],
    templateUrl: "./client-contact.component.html",
    styleUrl: "./client-contact.component.scss",
})
export class ClientContactComponent {
    private config = inject(DynamicDialogConfig);
    private ref = inject(DynamicDialogRef);
    private destroyRef = inject(DestroyRef);
    private clientService = inject(ClientService);
    private messageService = inject(MessageService);

    contact: IClientContact;

    constructor() {
        this.contact = this.config.data.contact;
    }

    save = (): void => {
        this.clientService
            .saveContact(this.contact)
            .pipe(
                tap((_) => {
                    this.messageService.add({ severity: "success", summary: "Success", detail: `Contact ${this.contact.name} saved.`, life: 3000, key: "clientContact" });
                    this.ref.close(this.contact);
                }),
                catchError((err) => {
                    this.messageService.add({ severity: "error", summary: "Error", detail: err.statusText, life: 3000, key: "clientContact" });
                    return EMPTY;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    };
}
