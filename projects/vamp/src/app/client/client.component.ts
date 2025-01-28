import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from "primeng/dynamicdialog";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MultiSelectModule } from "primeng/multiselect";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { PanelModule } from "primeng/panel";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { EMPTY } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ClientContactComponent } from "../client-contact/client-contact.component";
import { ClientService } from "../client-view/client.service";
import { ConfirmDialogHeadless } from "../confirm-dialog-headless/confirm-dialog-headless.component";
import { IClient, IClientContact, IProduct } from "../models/client";
import { IColumn } from "../models/option";
import { ProductComponent } from "../product/product.component";
import { utils } from "../utils";

@Component({
    selector: "app-client",
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
        CalendarModule,
        InputMaskModule,
    ],
    templateUrl: "./client.component.html",
    styleUrl: "./client.component.scss",
    providers: [ConfirmationService, DialogService, MessageService],
})
export class ClientComponent implements OnInit {
    private config = inject(DynamicDialogConfig);
    private destroyRef = inject(DestroyRef);
    dialogService = inject(DialogService);
    private clientService = inject(ClientService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    _selectedColumnsContacts: IColumn[] = [];
    _selectedProductsColumns: IColumn[] = [];
    private clientRef = inject(DynamicDialogRef);

    ref: DynamicDialogRef | undefined;
    colsContacts: IColumn[] = [
        { field: "name", header: "Name" },
        { field: "isActive", header: "Active", type: "boolean" },
        { field: "vip", header: "Vip", type: "boolean" },
        { field: "title", header: "Title" },
        { field: "jobFunction", header: "Job Function" },
        { field: "officePhone", header: "Office Phone" },
        { field: "cellPhone", header: "Cell Phone" },
        { field: "email", header: "Email" },
    ];
    colsProducts: IColumn[] = [
        { field: "name", header: "Name" },
        { field: "isActive", header: "Active", type: "boolean" },
        { field: "therapeuticCategory.name", header: "Therapeutic Class" },
        { field: "description", header: "Description" },
    ];
    client!: IClient;
    selectedColumnsContactsCtrl = new FormControl();
    selectedProductsColumnsCtrl = new FormControl();
    acceptLabel = "Delete";
    rejectLabel = "Cancel";

    getValue = utils.getValue;
    delete = (contact: IClientContact) => {
        this.confirmationService.confirm({
            header: `Are you sure you want to delete ${contact.name}?`,
            message: "Please confirm to proceed.",
            accept: () => {
                this.clientService
                    .deleteContact(contact)
                    .pipe(
                        tap(() => {
                            this.messageService.add({ severity: "success", summary: "Success", detail: "Successful delete", life: 3000, key: "client" });
                        }),
                        catchError((err) => {
                            this.messageService.add({ severity: "error", summary: "Error", detail: err?.error?.message ?? err.statusText, life: 3000, key: "client" });
                            return EMPTY;
                        }),
                        takeUntilDestroyed(this.destroyRef),
                    )
                    .subscribe();
            },
        });
    };

    openContact = (contact: IClientContact | null): void => {
        if (!this.client.clientId) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please save the client first", life: 3000, key: "client" });
            return;
        }
        const header = contact === null ? "New Contact" : `${contact.name}`;
        this.ref = this.dialogService.open(ClientContactComponent, { width: "50vw", modal: true, header: header, data: { contact: { ...contact, clientId: this.client.clientId } } });
        this.ref.onClose.subscribe((result: IClientContact) => {
            if (result) {
                if (contact === null) {
                    this.client.clientContacts = [result, ...this.client.clientContacts];
                } else {
                    Object.assign(contact, result);
                }
            }
        });
    };

    openProduct = (product: IProduct | null): void => {
        if (!this.client.clientId) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please save the client first", life: 3000, key: "client" });
            return;
        }
        const header = product === null ? "New Product" : `${product.name}`;
        this.ref = this.dialogService.open(ProductComponent, { width: "50vw", modal: true, header: header, data: { product: { ...product, clientId: this.client.clientId } } });
        this.ref.onClose.subscribe((result: IProduct) => {
            if (result) {
                if (product === null) {
                    this.client.products = [result, ...this.client.products];
                } else {
                    Object.assign(product, result);
                }
            }
        });
    };

    ngOnInit() {
        this.client = this.config.data.client;

        this.selectedColumnsContactsCtrl.valueChanges
            .pipe(
                tap((val: IColumn[]) => (this.selectedColumnsContacts = val)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.selectedColumnsContactsCtrl.setValue([...this.colsContacts]);

        this.selectedProductsColumnsCtrl.valueChanges
            .pipe(
                tap((val: IColumn[]) => (this.selectedProductsColumns = val)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.selectedProductsColumnsCtrl.setValue([...this.colsProducts.slice(0, this.colsProducts.length - 1)]);
    }

    get selectedColumnsContacts(): IColumn[] {
        return this._selectedColumnsContacts;
    }

    set selectedColumnsContacts(val: IColumn[]) {
        this._selectedColumnsContacts = this.colsContacts.filter((col) => val.some((v) => v.field === col.field));
    }

    get selectedProductsColumns(): IColumn[] {
        return this._selectedProductsColumns;
    }

    set selectedProductsColumns(val: IColumn[]) {
        this._selectedProductsColumns = this.colsProducts.filter((col) => val.some((v) => v.field === col.field));
    }

    isValid = (): boolean => {
        if (!this.client.name?.length) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please enter a name", life: 3000, key: "client" });
            return false;
        }
        return true;
    };

    save = (): void => {
        if (this.isValid()) {
            this.clientService
                .saveClient(this.client)
                .pipe(
                    tap((_) => {
                        this.messageService.add({ severity: "success", summary: "Success", detail: `Client ${this.client.name} saved.`, life: 3000, key: "client" });
                        this.clientRef.close(this.client!);
                    }),
                    catchError((err) => {
                        this.messageService.add({ severity: "error", summary: "Error", detail: err?.error?.message ?? err.statusText, life: 3000, key: "client" });
                        return EMPTY;
                    }),
                    takeUntilDestroyed(this.destroyRef),
                )
                .subscribe();
        }
    };
}
