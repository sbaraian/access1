import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnDestroy, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { DateTime } from "luxon";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CalendarModule } from "primeng/calendar";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MultiSelectModule } from "primeng/multiselect";
import { PaginatorModule, PaginatorState } from "primeng/paginator";
import { PanelModule } from "primeng/panel";
import { RippleModule } from "primeng/ripple";
import { TableModule } from "primeng/table";
import { TabViewModule } from "primeng/tabview";
import { TriStateCheckboxModule } from "primeng/tristatecheckbox";

import { BehaviorSubject } from "rxjs";
import { tap } from "rxjs/operators";

import { AnalyticIndication, AnalyticIndicationCompetition, AnalyticProduct, AnalyticSetups } from "./analytic-setup";
import { AnalyticsService } from "./analytics.service";

@Component({
    selector: "app-analytics",
    standalone: true,
    imports: [
        CommonModule,
        FloatLabelModule,
        PanelModule,
        DropdownModule,
        ReactiveFormsModule,
        ButtonModule,
        ButtonGroupModule,
        RippleModule,
        PaginatorModule,
        CalendarModule,
        TriStateCheckboxModule,
        MultiSelectModule,
        TabViewModule,
        CheckboxModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputTextModule,
        InputTextareaModule,
        TableModule,
        InputNumberModule,
    ],
    templateUrl: "./analytics.component.html",
    styleUrl: "./analytics.component.scss",
})
export class AnalyticsComponent implements OnInit, OnDestroy {
    analyticSetups!: AnalyticSetups;
    today = DateTime.now();
    analyticIndex$ = new BehaviorSubject<number>(-1);
    indicationIndex$ = new BehaviorSubject<number>(-1);
    analyticIndex = -1;
    indicationIndex = -1;
    analytics: AnalyticProduct[] = [];
    fg = new FormGroup({
        brandNameCtrl: new FormControl<number>(0, Validators.required),
        genericNameCtrl: new FormControl<number>(0, Validators.required),
        manufacturerCtrl: new FormControl<number>(0, Validators.required),
    });
    dosingItems = [
        { field: "isDosingPo", title: "PO", noteField: "dosingPo" },
        { field: "isDosingSqSelf", title: "SQ Self Admin", noteField: "dosingSqSelf" },
        { field: "isDosingSqHp", title: "SQ HP Admin", noteField: "dosingSqHp" },
        { field: "isDosingImSelf", title: "IM Self Admin", noteField: "dosingImSelf" },
        { field: "isDosingImHp", title: "IM HP Admin", noteField: "dosingImHp" },
        { field: "isDosingIv", title: "IV", noteField: "dosingIv" },
    ];
    private destroyRef = inject(DestroyRef);
    paginatorFirstProduct = 0;
    paginatorFirstIndication = 0;

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
                        data[`${keys[i]}WithAll`] = [{ name: "all", analyticSetupId: 0 }, ...data[keys[i]]];
                    }
                    this.analyticSetups = data;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.analyticIndex$
            .pipe(
                tap((analyticIndex) => {
                    this.analyticIndex = analyticIndex;
                    this.indicationIndex$.next(-1);
                    if (analyticIndex >= 0 && analyticIndex < this.analytics.length) {
                        if (this.analytics[analyticIndex].analyticIndications?.length > 0) {
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
                    if (indicationIndex >= 0 && indicationIndex < this.analytics[this.analyticIndex].analyticIndications.length) {
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
    addAnalytic = (): void => {
        this.analytics.push({ analyticIndications: [], additionalManufacturerProductsInSameTas: [], brandName: {}, genericName: {}, manufacturer: {} });
        this.analyticIndex$.next(this.analytics.length - 1);
        this.paginatorFirstProduct = this.analytics.length - 1;
    };
    addAnalyticIndication = (): void => {
        if (this.analyticIndex >= 0) {
            this.analytics[this.analyticIndex].analyticIndications.push({ analyticIndicationCompetitions: [], analyticIndicationDetails: [], details: {} });
            this.indicationIndex$.next(this.analytics[this.analyticIndex].analyticIndications.length - 1);
            this.paginatorFirstIndication = this.analytics[this.analyticIndex].analyticIndications.length - 1;
        }
    };
    deleteAnalytic = (): void => {
        if (this.analyticIndex >= 0 && this.analyticIndex < this.analytics.length) {
            this.analytics.splice(this.analyticIndex, 1);
            if (this.analyticIndex > 0) {
                this.analyticIndex--;
            }
            this.paginatorFirstProduct = this.analyticIndex;
        }
    };
    deleteAnalyticIndication = (): void => {
        if (this.indicationIndex >= 0 && this.indicationIndex < this.analytics[this.analyticIndex].analyticIndications.length) {
            this.analytics[this.analyticIndex].analyticIndications.splice(this.indicationIndex, 1);
            if (this.indicationIndex > 0) {
                this.indicationIndex--;
            }
            this.paginatorFirstIndication = this.indicationIndex;
        }
    };
    ngOnDestroy() {}
    isValid = (): boolean => {
        if (this.analyticIndex < 0) {
            this.logError("Please select a product.");
            return false;
        }
        if (!this.analytics[this.analyticIndex].analyticId) {
            if (!this.analytics[this.analyticIndex].brandName.analyticSetupId) {
                this.logError("Please enter a Brand Name.");
                return false;
            }
            if (!this.analytics[this.analyticIndex].genericName.analyticSetupId) {
                this.logError("Please enter a Generic Name.");
                return false;
            }
            if (!this.analytics[this.analyticIndex].manufacturer.analyticSetupId) {
                this.logError("Please enter a Manufacturer.");
                return false;
            }
        }
        if (this.analytics[this.analyticIndex].isAdditionalManufacturerProductsInSameTa && !this.analytics[this.analyticIndex].additionalManufacturerProductsInSameTas?.length) {
            this.logError("Please enter Additional Manufacturer Products in Same TA.");
            return false;
        }
        if (!this.analytics[this.analyticIndex].complexityOfTherapyId) {
            this.logError("Please enter a Complexity Of Therapy.");
            return false;
        }
        if (this.analytics[this.analyticIndex].analyticIndications.length > 0) {
            if (
                this.analytics[this.analyticIndex].analyticIndications.some((element: AnalyticIndication, idx) => {
                    if (!element.details["Age"]?.length) {
                        this.logError(`Please enter Age for Indication ${idx + 1}.`);
                        return true;
                    }
                    if (!element.usageId) {
                        this.logError(`Please enter Usage for Indication ${idx + 1}.`);
                        return true;
                    }
                    if (!element.patientPopulationSizeId) {
                        this.logError(`Please enter Patient Population Size for Indication ${idx + 1}.`);
                        return true;
                    }
                    if (!element.lineOfTherapyId) {
                        this.logError(`Please enter Line of Therapy for Indication ${idx + 1}.`);
                        return true;
                    }
                    if (!element.treatmentTypeId) {
                        this.logError(`Please enter Line of Treatment Type for Indication ${idx + 1}.`);
                        return true;
                    }
                    if (element.analyticIndicationCompetitions.length > 0) {
                        if (
                            element.analyticIndicationCompetitions.some((el: AnalyticIndicationCompetition, idx2: number) => {
                                if (!el.competitorProduct || el.competitorProduct.analyticSetupId === -1) {
                                    this.logError(`Please enter Product for Indication ${idx + 1}, Competition ${idx2 + 1}.`);
                                    return true;
                                }
                                if (!el.competitorManufacturer || el.competitorManufacturer.analyticSetupId === -1) {
                                    this.logError(`Please enter Manufacturer for Indication ${idx + 1}, Competition ${idx2 + 1}.`);
                                    return true;
                                }
                                return false;
                            })
                        ) {
                            return true;
                        }
                    }
                    return false;
                })
            ) {
                return false;
            }
        }
        return true;
    };
    logError = (message: string): void => {
        this.messageService.add({ severity: "error", detail: message });
    };
    save = () => {
        if (this.isValid()) {
        }
    };
    generate = (): void => {
        this.analyticIndex$.next(-1);
        this.indicationIndex$.next(-1);
        this.analyticsService
            .getData(this.fg.get("brandNameCtrl")!.value!, this.fg.get("genericNameCtrl")!.value!, this.fg.get("manufacturerCtrl")!.value!)
            .pipe(
                tap((data) => {
                    this.analytics = data;
                    this.analyticIndex$.next(this.analytics.length > 0 ? 0 : -1);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    };

    excel = (): void => {
        console.log(222);
    };
    onProductPageChange = (event: PaginatorState) => {
        this.analyticIndex$.next(event.first!);
    };
    onIndicationPageChange = (event: PaginatorState) => {
        this.indicationIndex$.next(event.first!);
    };
}
