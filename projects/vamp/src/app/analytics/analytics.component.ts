import { CommonModule } from "@angular/common";
import { Component, DestroyRef, OnDestroy, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { DateTime } from "luxon";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { FloatLabelModule } from "primeng/floatlabel";
import { MultiSelectModule } from "primeng/multiselect";
import { PaginatorModule, PaginatorState } from "primeng/paginator";
import { PanelModule } from "primeng/panel";
import { RippleModule } from "primeng/ripple";
import { TabViewModule } from "primeng/tabview";
import { TriStateCheckboxModule } from "primeng/tristatecheckbox";

import { BehaviorSubject } from "rxjs";
import { tap } from "rxjs/operators";

import { AnalyticProduct, AnalyticSetup, AnalyticSetups } from "./analytic-setup";
import { AnalyticsService } from "./analytics.service";

@Component({
    selector: "app-analytics",
    standalone: true,
    imports: [CommonModule, FloatLabelModule, PanelModule, DropdownModule, ReactiveFormsModule, ButtonModule, ButtonGroupModule, RippleModule, PaginatorModule, CalendarModule, TriStateCheckboxModule, MultiSelectModule, TabViewModule],
    templateUrl: "./analytics.component.html",
    styleUrl: "./analytics.component.scss",
})
export class AnalyticsComponent implements OnInit, OnDestroy {
    analyticSetups!: AnalyticSetups;
    today = DateTime.now();
    productIndex$ = new BehaviorSubject<number>(-1);
    indicationIndex$ = new BehaviorSubject<number>(-1);
    productIndex = -1;
    indicationIndex = -1;
    data: AnalyticProduct[] = [];
    fg = new FormGroup({
        brandNameCtrl: new FormControl<number>(0, Validators.required),
        genericNameCtrl: new FormControl<number>(0, Validators.required),
        manufacturerCtrl: new FormControl<number>(0, Validators.required),
        pBrandNameCtrl: new FormControl<number>(0, Validators.required),
        pGenericNameCtrl: new FormControl<number>(0, Validators.required),
        pManufacturerCtrl: new FormControl<number>(0, Validators.required),
        pDateOfEntryIntoMarketCtrl: new FormControl<DateTime>(this.today, Validators.required),
        pFdaApprovalCtrl: new FormControl<DateTime>(this.today, Validators.required),
        pMechanismOfActionCtrl: new FormControl<string | null>(null),
        pApprovalStatusCtrl: new FormControl<number | null>(null),
        pComplexityOfTherapyCtrl: new FormControl<number | null>(null),
        p505b2FlagCtrl: new FormControl<boolean | null>(null),
        pBiosimilarFlagCtrl: new FormControl<boolean | null>(null),
        pBlackBoxWarningFlagCtrl: new FormControl<boolean | null>(null),
        pAdditionalManufacturerFlagCtrl: new FormControl<boolean | null>(null),
        pAdditionalManufacturerCtrl: new FormControl<number[] | null>(null),
        pFirstInClassFlagCtrl: new FormControl<boolean | null>(null),
    });
    private destroyRef = inject(DestroyRef);

    constructor(
        private analyticsService: AnalyticsService,
        private messageService: MessageService,
    ) {}

    ngOnInit() {
        this.analyticsService
            .getSetupNames()
            .pipe(
                tap((data: any) => {
                    const keys = ["BrandNameId", "GenericNameId", "ManufacturerId"];
                    for (var i = 0; i < keys.length; i++) {
                        data[keys[i]].splice(0, 1, { name: "all", analyticSetupId: 0 });
                    }
                    this.analyticSetups = data;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.productIndex$
            .pipe(
                tap((productIndex) => {
                    this.productIndex = productIndex;
                    this.indicationIndex$.next(-1);
                    if (productIndex >= 0 && productIndex < this.data.length) {
                        this.fg.get("pBrandNameCtrl")?.setValue(this.data[productIndex].brandName.analyticSetupId);
                        this.fg.get("pGenericNameCtrl")?.setValue(this.data[productIndex].genericName.analyticSetupId);
                        this.fg.get("pManufacturerCtrl")?.setValue(this.data[productIndex].manufacturer.analyticSetupId);
                        this.fg.get("pApprovalStatusCtrl")?.setValue(this.data[productIndex].approvalStatusId);
                        this.fg.get("pMechanismOfActionCtrl")?.setValue(this.data[productIndex].mechanismOfAction);
                        this.fg.get("pComplexityOfTherapyCtrl")?.setValue(this.data[productIndex].complexityOfTherapyId);
                        this.fg.get("p505b2FlagCtrl")?.setValue(this.data[productIndex].is505B2);
                        this.fg.get("pBiosimilarFlagCtrl")?.setValue(this.data[productIndex].isBiosimilar);
                        this.fg.get("pBlackBoxWarningFlagCtrl")?.setValue(this.data[productIndex].isBlackBoxWarning);
                        this.fg.get("pAdditionalManufacturerFlagCtrl")?.setValue(this.data[productIndex].isAdditionalManufacturerProductsInSameTa);
                        this.fg.get("pFirstInClassFlagCtrl")?.setValue(this.data[productIndex].isFirstInClass);
                        this.fg.get("pAdditionalManufacturerCtrl")?.setValue(this.data[productIndex].additionalManufacturerProductsInSameTas?.map((item: AnalyticSetup) => item.analyticSetupId));
                        if (this.data[productIndex].analyticIndications?.length > 0) {
                            this.indicationIndex$.next(0);
                        }
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.indicationIndex$
            .pipe(
                tap((indicationIndex) => {
                    this.indicationIndex = indicationIndex;
                    if (indicationIndex >= 0 && indicationIndex < this.data[this.productIndex].analyticIndications.length) {
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
    ngOnDestroy() {}
    generate = (): void => {
        this.productIndex$.next(-1);
        this.indicationIndex$.next(-1);
        this.analyticsService
            .getData(this.fg.get("brandNameCtrl")!.value!, this.fg.get("genericNameCtrl")!.value!, this.fg.get("manufacturerCtrl")!.value!)
            .pipe(
                tap((data) => {
                    this.data = data;
                    this.productIndex$.next(this.data.length > 0 ? 0 : -1);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    };

    excel = (): void => {
        console.log(222);
    };
    onProductPageChange = (event: PaginatorState) => {
        this.productIndex$.next(event.first!);
    };
    onIndicationPageChange = (event: PaginatorState) => {
        this.indicationIndex$.next(event.first!);
    };
}
