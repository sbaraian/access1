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

import { ConfirmDialogHeadless } from "../confirm-dialog-headless/confirm-dialog-headless.component";
import { IColumn } from "../models/option";
import { createPayor, IPayor } from "../models/payor";
import { PayorService } from "../payor-view/payor.service";
import { PayorComponent } from "./payor.component";
@Component({
    selector: "app-payors",
    standalone: true,
    imports: [ButtonGroupModule, ButtonModule, CheckboxModule, CommonModule, ConfirmDialogHeadless, DynamicDialogModule, FormsModule, MultiSelectModule, OverlayPanelModule, TableModule, ToastModule, ReactiveFormsModule],
    templateUrl: "./payors.component.html",
    styleUrl: "./payors.component.scss",
    providers: [ConfirmationService, DialogService, MessageService],
})
export class PayorsComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    dialogService = inject(DialogService);
    private payorService = inject(PayorService);
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
        { field: "isPbm", header: "PBM", type: "boolean" },
        { field: "isMco", header: "MCO", type: "boolean" },
        { field: "isMedD", header: "Med D", type: "boolean" },
        { field: "isMedFfs", header: "Medicaid FFS", type: "boolean" },
        { field: "isMedManaged", header: "Medicaid Managed", type: "boolean" },
        { field: "mmitPbm", header: "Mmit PBM", type: "boolean" },
        { field: "accountManager", header: "Account Manager" },
        { field: "secondAccountManager", header: "Second Account Manager" },
        { field: "totalLives", header: "Total Lives", type: "number" },
        { field: "description", header: "Description" },
        { field: "type", header: "Type" },
    ];
    payors: IPayor[] = [];
    refresh$ = new BehaviorSubject(true);

    delete = (payor: IPayor) => {
        this.confirmationService.confirm({
            header: `Are you sure you want to delete ${payor.name}?`,
            message: "Please confirm to proceed.",
            accept: () => {
                this.payorService
                    .delete(payor)
                    .pipe(
                        tap(() => {
                            this.messageService.add({ severity: "success", summary: "Success", detail: "Successful delete", life: 3000, key: "payors" });
                        }),
                        catchError((err) => {
                            this.messageService.add({ severity: "error", summary: "Error", detail: err?.error?.message ?? err.statusText, life: 3000, key: "payors" });
                            return EMPTY;
                        }),
                        takeUntilDestroyed(this.destroyRef),
                    )
                    .subscribe();
            },
        });
    };

    open = (payor: IPayor | null): void => {
        const header = payor === null ? "New Payor" : payor.name;
        if (payor === null) {
            payor = createPayor({});
        }
        this.ref = this.dialogService.open(PayorComponent, {
            width: "95vw",
            height: "100vh",
            modal: true,
            header: header,
            data: {
                payor: payor,
            },
        });
        this.ref.onClose.subscribe((result: IPayor) => {
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
        this.selectedColumnsCtrl.setValue([...this.cols.slice(0, 7)]);

        this.refresh$
            .pipe(
                switchMap((_) =>
                    this.payorService.getPayors().pipe(
                        tap((data) => {
                            this.payors = data;
                        }),
                    ),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
}
