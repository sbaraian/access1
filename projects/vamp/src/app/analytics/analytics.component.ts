import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DateTime } from "luxon";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CalendarModule } from "primeng/calendar";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
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
import { ToastModule } from "primeng/toast";
import { TriStateCheckboxModule } from "primeng/tristatecheckbox";
import { BehaviorSubject, EMPTY } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { AuthService } from "../auth/auth.service";
import { ConfirmDialogHeadless } from "../confirm-dialog-headless/confirm-dialog-headless.component";
import { AnalyticIndication, AnalyticIndicationCompetition, AnalyticProduct, AnalyticSetup, AnalyticSetups } from "./analytic-setup";
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
        ToastModule,
        DialogModule,
        ConfirmDialogHeadless,
    ],
    providers: [MessageService, ConfirmationService, AuthService],
    templateUrl: "./analytics.component.html",
    styleUrl: "./analytics.component.scss",
})
export class AnalyticsComponent implements OnInit {
    analyticSetups!: AnalyticSetups;
    today = DateTime.now();
    analyticIndex$ = new BehaviorSubject<number>(-1);
    indicationIndex$ = new BehaviorSubject<number>(-1);
    analyticIndex = -1;
    indicationIndex = -1;
    competitionIndex = -1;
    analytics: AnalyticProduct[] = [];
    newItemCtrl = new FormControl<string>("");
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
    private confirmationService = inject(ConfirmationService);
    private analyticsService = inject(AnalyticsService);
    private messageService = inject(MessageService);
    public authService = inject(AuthService);

    paginatorFirstProduct = 0;
    paginatorFirstIndication = 0;
    acceptLabel = "Delete";
    rejectLabel = "Cancel";
    isNewVisible = false;
    headerNew = "";
    newItemType = 0;
    isReadWrite = false;
    isPdf = true;
    showPdf = false;
    getSetupNames = () => {
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
    };
    ngOnInit() {
        this.getSetupNames();

        this.isReadWrite = !!this.authService.currentUserValue?.isReadWrite;
        this.analyticIndex$
            .pipe(
                tap((analyticIndex) => {
                    this.analyticIndex = analyticIndex;
                    this.paginatorFirstProduct = analyticIndex;
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
                    this.paginatorFirstIndication = indicationIndex;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    showDialog = (newItemType: number, idx?: number) => {
        this.newItemType = newItemType;
        let item: AnalyticSetup | null = null;
        let itemLabel = "";
        this.competitionIndex = idx ?? -1;
        switch (newItemType) {
            case 1:
            case 4:
                this.headerNew = "New Brand Name";
                itemLabel = "BrandNameId";
                break;
            case 2:
                this.headerNew = "New Generic Name";
                itemLabel = "GenericNameId";
                break;
            case 3:
            case 5:
                this.headerNew = "New Manufacturer";
                itemLabel = "ManufacturerId";
                break;
            case 6:
                this.headerNew = "New Additional Manufacturer products in same TA";
                itemLabel = "AdditionalManufacturersInSameTA";
                break;
        }

        this.newItemCtrl.setValue("");
        this.isNewVisible = true;
    };

    saveNew = () => {
        if (this.newItemCtrl.value?.trim().length === 0) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please enter a value", life: 3000 });
            return;
        }
        let itemLabel = "";
        let ctrl: AnalyticSetup;
        switch (this.newItemType) {
            case 1:
                itemLabel = "BrandNameId";
                this.analytics[this.analyticIndex].brandName.analyticSetupId = 0;
                break;
            case 2:
                itemLabel = "GenericNameId";
                this.analytics[this.analyticIndex].genericName.analyticSetupId = 0;
                break;
            case 3:
                itemLabel = "ManufacturerId";
                this.analytics[this.analyticIndex].manufacturer.analyticSetupId = 0;
                break;
            case 4:
                itemLabel = "BrandNameId";
                this.analytics[this.analyticIndex]!.analyticIndications[this.indicationIndex].analyticIndicationCompetitions[this.competitionIndex].competitorProduct!.analyticSetupId = 0;
                break;
            case 5:
                itemLabel = "ManufacturerId";
                this.analytics[this.analyticIndex].analyticIndications[this.indicationIndex].analyticIndicationCompetitions[this.competitionIndex].competitorManufacturer!.analyticSetupId = 0;
                break;
            case 6:
                itemLabel = "AdditionalManufacturersInSameTA";
                break;
        }
        let minAnalyticSetupId = Math.min(...this.analyticSetups[itemLabel].map((item) => item.analyticSetupId!));
        if (minAnalyticSetupId > 0) {
            minAnalyticSetupId = -1;
        } else {
            minAnalyticSetupId--;
        }

        const item = <AnalyticSetup>{ analyticSetupId: minAnalyticSetupId, name: this.newItemCtrl.value };
        this.analyticSetups[itemLabel].push({ ...item });
        setTimeout(() => {
            switch (this.newItemType) {
                case 1:
                    this.analytics[this.analyticIndex].brandName = item;
                    break;
                case 2:
                    this.analytics[this.analyticIndex].genericName = item;
                    break;
                case 3:
                    this.analytics[this.analyticIndex].manufacturer = item;
                    break;
                case 4:
                    this.analytics[this.analyticIndex].analyticIndications[this.indicationIndex].analyticIndicationCompetitions[this.competitionIndex].competitorProduct = item;
                    break;
                case 5:
                    this.analytics[this.analyticIndex].analyticIndications[this.indicationIndex].analyticIndicationCompetitions[this.competitionIndex].competitorManufacturer = item;
                    break;
                case 6:
                    this.analytics[this.analyticIndex].additionalManufacturerProductsInSameTas = [...this.analytics[this.analyticIndex].additionalManufacturerProductsInSameTas!, item];
                    break;
            }
        }, 10);
        this.isNewVisible = false;
    };

    addAnalytic = (): void => {
        this.analytics.push({ analyticId: 0, analyticIndications: [], additionalManufacturerProductsInSameTas: [], brandName: {}, genericName: {}, manufacturer: {} });
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
            const deleteItemFromArray = () => {
                this.analytics.splice(this.analyticIndex, 1);
                if (this.analyticIndex > 0) {
                    this.analyticIndex--;
                }
                this.paginatorFirstProduct = this.analyticIndex;
            };

            if (!!this.analytics[this.analyticIndex].analyticId) {
                this.confirmationService.confirm({
                    header: "Are you sure?",
                    message: "Please confirm to proceed.",
                    accept: () => {
                        this.analyticsService
                            .deleteAnalytic(this.analytics[this.analyticIndex].analyticId!)
                            .pipe(
                                tap(() => {
                                    deleteItemFromArray();
                                    this.messageService.add({ severity: "success", summary: "Success", detail: "Successful delete", life: 3000 });
                                }),
                                catchError((err) => {
                                    this.messageService.add({ severity: "error", summary: "Error", detail: err.statusText, life: 3000 });
                                    return EMPTY;
                                }),
                                takeUntilDestroyed(this.destroyRef),
                            )
                            .subscribe();
                    },
                });
            } else {
                deleteItemFromArray();
            }
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

    deleteCompetition = (idx: number): void => {
        if (idx >= 0 && idx < this.analytics[this.analyticIndex].analyticIndications[this.indicationIndex].analyticIndicationCompetitions.length) {
            this.analytics[this.analyticIndex].analyticIndications[this.indicationIndex].analyticIndicationCompetitions.splice(idx, 1);
        }
    };

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
                                if (!el.competitorProduct || !el.competitorProduct.analyticSetupId) {
                                    this.logError(`Please enter Product for Indication ${idx + 1}, Competition ${idx2 + 1}.`);
                                    return true;
                                }
                                if (!el.competitorManufacturer || !el.competitorManufacturer.analyticSetupId) {
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
    getPayload = (data: AnalyticProduct): AnalyticProduct => ({
        ...data,
    });
    save = () => {
        if (this.isValid()) {
            this.analyticsService
                .save(this.getPayload(this.analytics[this.analyticIndex]))
                .pipe(
                    tap((data) => {
                        if (!!data) {
                            this.getSetupNames();
                            this.analytics[this.analyticIndex] = data;
                        }
                        this.messageService.add({ severity: "success", detail: "Product saved." });
                    }),
                    takeUntilDestroyed(this.destroyRef),
                )
                .subscribe();
        }
    };
    generate = (): void => {
        this.analyticIndex$.next(-1);
        this.indicationIndex$.next(-1);
        this.analytics = [];
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
    generatePdf = (): void => {
        this.isPdf = false;
        setTimeout(() => {
            const data = document.getElementById("pdf-content");
            if (data) {
                html2canvas(data).then((canvas) => {
                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF({
                        orientation: "portrait",
                        unit: "in",
                        format: [40, 25],
                    });
                    const imgProps = pdf.getImageProperties(imgData);

                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const pdfWidth = (imgProps.width * pdfHeight) / imgProps.height;
                    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                    pdf.save("download.pdf");
                    this.isPdf = true;
                });
            }
        }, 1000);
    };

    print = (): void => {
        window.print();
    };

    onProductPageChange = (event: PaginatorState) => {
        this.analyticIndex$.next(event.first!);
    };
    onIndicationPageChange = (event: PaginatorState) => {
        this.indicationIndex$.next(event.first!);
    };
}
