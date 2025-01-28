import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { BehaviorSubject, EMPTY } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";

import { AppService } from "../app.service";
import { ClientService } from "../client-view/client.service";
import { ConfirmDialogHeadless } from "../confirm-dialog-headless/confirm-dialog-headless.component";
import { createProductDetail, createTherapeuticCategory, IProduct, IProductDetail } from "../models/client";
import { IColumn } from "../models/option";
import { ITherapeuticCategory } from "../models/payor";
@Component({
    selector: "app-product",
    standalone: true,
    imports: [
        ButtonModule,
        ButtonGroupModule,
        CardModule,
        CheckboxModule,
        DialogModule,
        DividerModule,
        FormsModule,
        ReactiveFormsModule,
        SplitButtonModule,
        InputMaskModule,
        InputTextModule,
        OverlayPanelModule,
        ToastModule,
        DropdownModule,
        ConfirmDialogHeadless,
        TableModule,
        MultiSelectModule,
        CommonModule,
    ],
    providers: [ConfirmationService],
    templateUrl: "./product.component.html",
    styleUrl: "./product.component.scss",
})
export class ProductComponent implements OnInit {
    private config = inject(DynamicDialogConfig);
    private ref = inject(DynamicDialogRef);
    private destroyRef = inject(DestroyRef);
    private appService = inject(AppService);
    private clientService = inject(ClientService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    acceptLabel = "Delete";
    rejectLabel = "Cancel";
    therapeuticCategories: ITherapeuticCategory[] = [];
    therapeuticCategory: ITherapeuticCategory = createTherapeuticCategory({});
    productDetail: IProductDetail = createProductDetail({});
    refresh$ = new BehaviorSubject(true);

    product: IProduct;
    items = [
        {
            label: "Edit",
            command: () => {
                this.openTherapeuticCategory(false);
            },
        },
        {
            label: "Add",
            command: () => {
                this.openTherapeuticCategory(true);
            },
        },
        {
            label: "Delete",
            command: () => {
                this.deleteTherapeuticCategory();
            },
        },
    ];
    visibleTherapeuticCategory: boolean = false;
    visibleProductDetail: boolean = false;
    cols: IColumn[] = [
        { field: "ndc", header: "NDC" },
        { field: "package1", header: "Package 1" },
        { field: "package2", header: "Package 2" },
        { field: "package3", header: "Package 3" },
    ];
    selectedColumnsCtrl = new FormControl();
    _selectedColumns: IColumn[] = [];

    deleteProductDetail = (detail: IProductDetail, idx: number) => {
        this.confirmationService.confirm({
            header: `Are you sure you want to delete ${detail.ndc}?`,
            message: "Please confirm to proceed.",
            accept: () => {
                this.clientService
                    .deleteProductDetail(detail)
                    .pipe(
                        tap(() => {
                            this.messageService.add({ severity: "success", summary: "Success", detail: "Successful delete", life: 3000, key: "product" });
                            this.product.productDetails.splice(idx, 1);
                            this.product.productDetails = [...this.product.productDetails];
                        }),
                        catchError((err) => {
                            this.messageService.add({ severity: "error", summary: "Error", detail: err?.error?.message ?? err.statusText, life: 3000, key: "product" });
                            return EMPTY;
                        }),
                        takeUntilDestroyed(this.destroyRef),
                    )
                    .subscribe();
            },
        });
    };

    deleteTherapeuticCategory = () => {
        const therapeuticCategory = this.therapeuticCategories.find((item) => item.therapeuticCategoryId === this.product.therapeuticCategoryId)!;
        this.confirmationService.confirm({
            header: `Are you sure you want to delete ${therapeuticCategory.name}?`,
            message: "Please confirm to proceed.",
            accept: () => {
                this.clientService
                    .deleteTherapeuticCategory(therapeuticCategory)
                    .pipe(
                        tap(() => {
                            this.messageService.add({ severity: "success", summary: "Success", detail: "Successful delete", life: 3000, key: "product" });
                            this.product.therapeuticCategoryId = 0;
                        }),
                        catchError((err) => {
                            this.messageService.add({ severity: "error", summary: "Error", detail: err?.error?.message ?? err.statusText, life: 3000, key: "product" });
                            return EMPTY;
                        }),
                        takeUntilDestroyed(this.destroyRef),
                    )
                    .subscribe();
            },
        });
    };

    showDialogTherapeuticCategory() {
        this.visibleTherapeuticCategory = true;
    }

    saveTherapeuticCategory() {
        if (!this.therapeuticCategory.name.length) {
            this.messageService.add({ severity: "error", summary: "Error", detail: `Please enter a name`, life: 3000, key: "product" });
            return;
        }
        this.clientService
            .saveTherapeuticCategory(this.therapeuticCategory)
            .pipe(
                tap((therapeuticCategory) => {
                    this.messageService.add({ severity: "success", summary: "Success", detail: `Therapeutic Category ${this.therapeuticCategory.name} saved.`, life: 3000, key: "product" });
                    if (!this.therapeuticCategory.therapeuticCategoryId) {
                        Object.assign(this.product.therapeuticCategory, therapeuticCategory);
                        this.product.therapeuticCategoryId = therapeuticCategory.therapeuticCategoryId;
                    } else {
                        Object.assign(this.product.therapeuticCategory, this.therapeuticCategory);
                    }
                    this.refresh$.next(true);
                    this.visibleTherapeuticCategory = false;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    saveProductDetail() {
        if (!this.productDetail.ndc.length) {
            this.messageService.add({ severity: "error", summary: "Error", detail: `Please enter NDC`, life: 3000, key: "product" });
            return;
        }
        this.clientService
            .saveProductDetail(this.productDetail)
            .pipe(
                tap((productDetail) => {
                    this.messageService.add({ severity: "success", summary: "Success", detail: `Product Detail ${this.productDetail.ndc} saved.`, life: 3000, key: "product" });
                    if (!this.productDetail.productDetailId) {
                        this.product.productDetails.unshift({ ...productDetail });
                    } else {
                        const idx = this.product.productDetails.findIndex((item) => item.productDetailId === this.productDetail.productDetailId);
                        Object.assign(this.product.productDetails[idx], this.productDetail);
                    }
                    this.product.productDetails = [...this.product.productDetails];
                    this.visibleProductDetail = false;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    openTherapeuticCategory = (isNew: boolean): void => {
        if (isNew) {
            this.therapeuticCategory = createTherapeuticCategory({});
        } else {
            if (this.product.therapeuticCategoryId === this.product.therapeuticCategory.therapeuticCategoryId) {
                this.therapeuticCategory = { ...this.product.therapeuticCategory };
            } else {
                this.therapeuticCategory = { ...this.therapeuticCategories.find((item) => item.therapeuticCategoryId === this.product.therapeuticCategoryId)! };
            }
        }
        this.visibleTherapeuticCategory = true;
    };

    openProductDetail = (productDetail: IProductDetail | null): void => {
        if (!this.product.productId) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please save the product first", life: 3000, key: "product" });
            return;
        }
        this.productDetail = productDetail ? productDetail : createProductDetail({ productId: this.product.productId });
        this.visibleProductDetail = true;
    };

    constructor() {
        this.product = this.config.data.product;
    }
    ngOnInit() {
        this.refresh$
            .pipe(
                switchMap((_) => this.appService.getTherapeuticCategories()),
                tap((data) => {
                    this.therapeuticCategories = data;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.selectedColumnsCtrl.valueChanges
            .pipe(
                tap((val: IColumn[]) => (this.selectedColumns = val)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.selectedColumnsCtrl.setValue([...this.cols]);
    }
    get selectedColumns(): IColumn[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: IColumn[]) {
        this._selectedColumns = this.cols.filter((col) => val.some((v) => v.field === col.field));
    }
    save = (): void => {
        const therapeuticCategory = this.therapeuticCategories.find((item) => item.therapeuticCategoryId === this.product.therapeuticCategoryId);
        this.product = { ...this.product, therapeuticCategory: { ...therapeuticCategory! } };
        if (!this.product.name.length) {
            this.messageService.add({ severity: "error", summary: "Error", detail: `Please enter a name`, life: 3000, key: "product" });
            return;
        }
        if (!therapeuticCategory) {
            this.messageService.add({ severity: "error", summary: "Error", detail: `Please select a therapeutic category`, life: 3000, key: "product" });
            return;
        }

        this.clientService
            .saveProduct(this.product)
            .pipe(
                tap((product) => {
                    this.messageService.add({ severity: "success", summary: "Success", detail: `Product ${this.product.name} saved.`, life: 3000, key: "product" });
                    if (!this.product.productId) {
                        this.product = product;
                    }
                    this.ref.close(this.product);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    };
}
