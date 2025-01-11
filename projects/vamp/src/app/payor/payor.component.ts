import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from "primeng/dynamicdialog";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MultiSelectModule } from "primeng/multiselect";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { PanelModule } from "primeng/panel";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { EMPTY } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ConfirmDialogHeadless } from "../confirm-dialog-headless/confirm-dialog-headless.component";
import { IColumn } from "../models/option";
import { IPayor, IPayorAddress, IPayorContact } from "../models/payor";
import { PayorContactComponent } from "../payor-contact/payor-contact.component";
import { PayorService } from "../payor-view/payor.service";
import { PayorAddressComponent } from "./payor-address.component";

@Component({
    selector: "app-payor",
    standalone: true,
    imports: [
        ButtonGroupModule,
        ButtonModule,
        CardModule,
        CheckboxModule,
        CommonModule,
        ConfirmDialogHeadless,
        DividerModule,
        DropdownModule,
        DynamicDialogModule,
        FloatLabelModule,
        FormsModule,
        InputTextareaModule,
        InputTextModule,
        MultiSelectModule,
        OverlayPanelModule,
        PanelModule,
        TableModule,
        ToastModule,
        ReactiveFormsModule,
    ],
    templateUrl: "./payor.component.html",
    styleUrl: "./payor.component.scss",
    providers: [ConfirmationService, DialogService, MessageService],
})
export class PayorComponent implements OnInit {
    private config = inject(DynamicDialogConfig);
    private destroyRef = inject(DestroyRef);
    dialogService = inject(DialogService);
    private payorService = inject(PayorService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    _selectedColumns: IColumn[] = [];
    _selectedAddressColumns: IColumn[] = [];
    private payorRef = inject(DynamicDialogRef);

    ref: DynamicDialogRef | undefined;
    cols: IColumn[] = [
        { field: "firstName", header: "First Name" },
        { field: "lastName", header: "Last Name" },
        { field: "isActive", header: "Active", type: "boolean" },
        { field: "vip", header: "Vip", type: "boolean" },
        { field: "title", header: "Title" },
        { field: "jobFunction", header: "Job Function" },
        { field: "officePhone", header: "Office Phone" },
        { field: "cellPhone", header: "Cell Phone" },
        { field: "email", header: "Email" },
    ];
    colsAddress: IColumn[] = [
        { field: "address1", header: "Address 1" },
        { field: "address2", header: "Address 2" },
        { field: "city", header: "City" },
        { field: "state", header: "State" },
        { field: "zip", header: "Zip" },
        { field: "phone", header: "Phone" },
    ];
    payor!: IPayor;
    selectedColumnsCtrl = new FormControl();
    selectedAddressColumnsCtrl = new FormControl();
    acceptLabel = "Delete";
    rejectLabel = "Cancel";
    delete = (contact: IPayorContact) => {
        this.confirmationService.confirm({
            header: `Are you sure you want to delete ${contact.name}?`,
            message: "Please confirm to proceed.",
            accept: () => {
                this.payorService
                    .deleteContact(contact)
                    .pipe(
                        tap(() => {
                            this.messageService.add({ severity: "success", summary: "Success", detail: "Successful delete", life: 3000, key: "payor" });
                        }),
                        catchError((err) => {
                            this.messageService.add({ severity: "error", summary: "Error", detail: err.statusText, life: 3000, key: "payor" });
                            return EMPTY;
                        }),
                        takeUntilDestroyed(this.destroyRef),
                    )
                    .subscribe();
            },
        });
    };

    openContact = (contact: IPayorContact | null): void => {
        const header = contact === null ? "New Contact" : `${contact.firstName} ${contact.lastName}`;
        if (!this.payor.payorId) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please save the payor first", life: 3000, key: "payor" });
            return;
        }
        this.ref = this.dialogService.open(PayorContactComponent, { width: "50vw", modal: true, header: header, data: { contact: { ...contact, payorId: this.payor.payorId } } });
        this.ref.onClose.subscribe((result: IPayorContact) => {
            if (result) {
                if (contact === null) {
                    this.payor.payorContacts = [result, ...this.payor.payorContacts];
                } else {
                    Object.assign(contact, result);
                }
            }
        });
    };

    openAddress = (address: IPayorAddress | null): void => {
        const header = address === null ? `New Address for ${this.payor.name}` : `Address for ${this.payor.name}`;
        if (!this.payor.payorId) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please save the payor first", life: 3000, key: "payor" });
            return;
        }
        this.ref = this.dialogService.open(PayorAddressComponent, { width: "50vw", modal: true, header: header, data: { address: { ...address } } });
        this.ref.onClose.subscribe((result: IPayorAddress) => {
            if (result) {
                if (address === null) {
                    this.payor.payorAddresses = [result, ...this.payor.payorAddresses];
                } else {
                    Object.assign(address, result);
                }
            }
        });
    };

    ngOnInit() {
        this.payor = this.config.data.payor;

        this.selectedColumnsCtrl.valueChanges
            .pipe(
                tap((val: IColumn[]) => (this.selectedColumns = val)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.selectedColumnsCtrl.setValue([...this.cols]);

        this.selectedAddressColumnsCtrl.valueChanges
            .pipe(
                tap((val: IColumn[]) => (this.selectedAddressColumns = val)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.selectedAddressColumnsCtrl.setValue([...this.colsAddress]);
    }

    get selectedColumns(): IColumn[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: IColumn[]) {
        this._selectedColumns = this.cols.filter((col) => val.some((v) => v.field === col.field));
    }

    get selectedAddressColumns(): IColumn[] {
        return this._selectedAddressColumns;
    }

    set selectedAddressColumns(val: IColumn[]) {
        this._selectedAddressColumns = this.colsAddress.filter((col) => val.some((v) => v.field === col.field));
    }

    save = (): void => {
        this.payorService
            .savePayor(this.payor)
            .pipe()
            .pipe(
                tap((_) => {
                    this.messageService.add({ severity: "success", summary: "Success", detail: `Payor ${this.payor.name} saved.`, life: 3000, key: "payor" });
                    this.payorRef.close(this.payor!);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    };
}
