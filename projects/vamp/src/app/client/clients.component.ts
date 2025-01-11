import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CheckboxModule } from "primeng/checkbox";
import { DialogService, DynamicDialogModule, DynamicDialogRef } from "primeng/dynamicdialog";
import { MultiSelectModule } from "primeng/multiselect";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { BehaviorSubject, EMPTY } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";

import { ClientService } from "../client-view/client.service";
import { ConfirmDialogHeadless } from "../confirm-dialog-headless/confirm-dialog-headless.component";
import { createClient, IClient } from "../models/client";
import { IColumn } from "../models/option";
import { ClientComponent } from "./client.component";
@Component({
    selector: "app-clients",
    standalone: true,
    imports: [ButtonGroupModule, ButtonModule, CheckboxModule, CommonModule, ConfirmDialogHeadless, DynamicDialogModule, FormsModule, MultiSelectModule, OverlayPanelModule, TableModule, ToastModule, ReactiveFormsModule],
    templateUrl: "./clients.component.html",
    styleUrl: "./clients.component.scss",
    providers: [ConfirmationService, DialogService, MessageService],
})
export class ClientsComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    dialogService = inject(DialogService);
    private clientService = inject(ClientService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    ref: DynamicDialogRef | undefined;
    selectedColumnsCtrl = new FormControl();
    acceptLabel = "Delete";
    rejectLabel = "Cancel";
    _selectedColumns: IColumn[] = [];
    cols: IColumn[] = [
        { field: "name", header: "Name" },
        { field: "isActive", header: "Active", type: "boolean" },
        { field: "contractDate", header: "Contract Date", type: "date" },
        { field: "address1", header: "Address 1" },
        { field: "address2", header: "Address 2" },
        { field: "city", header: "City" },
        { field: "state", header: "State" },
        { field: "zip", header: "Zip" },
        { field: "phone", header: "Phone" },
    ];
    clients: IClient[] = [];
    refresh$ = new BehaviorSubject(true);

    delete = (client: IClient) => {
        this.confirmationService.confirm({
            header: `Are you sure you want to delete ${client.name}?`,
            message: "Please confirm to proceed.",
            accept: () => {
                this.clientService
                    .delete(client)
                    .pipe(
                        tap(() => {
                            this.messageService.add({ severity: "success", summary: "Success", detail: "Successful delete", life: 3000, key: "clients" });
                        }),
                        catchError((err) => {
                            this.messageService.add({ severity: "error", summary: "Error", detail: err.statusText, life: 3000, key: "clients" });
                            return EMPTY;
                        }),
                        takeUntilDestroyed(this.destroyRef),
                    )
                    .subscribe();
            },
        });
    };

    open = (client: IClient | null): void => {
        const header = client === null ? "New Client" : client.name;
        if (client === null) {
            client = createClient({});
        }
        this.ref = this.dialogService.open(ClientComponent, {
            width: "95vw",
            height: "100vh",
            modal: true,
            header: header,
            data: {
                client: client,
            },
        });
        this.ref.onClose.subscribe((result: IClient) => {
            if (result) {
                this.refresh$.next(true);
            }
        });
    };

    get selectedColumns(): IColumn[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: IColumn[]) {
        //restore original order
        this._selectedColumns = this.cols.filter((col) => val.some((v) => v.field === col.field));
    }
    ngOnInit() {
        this.selectedColumnsCtrl.valueChanges
            .pipe(
                tap((val: IColumn[]) => (this.selectedColumns = val)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.selectedColumnsCtrl.setValue([...this.cols]);

        this.refresh$
            .pipe(
                switchMap((_) =>
                    this.clientService.getClients().pipe(
                        tap((data) => {
                            this.clients = data;
                        }),
                    ),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
}
