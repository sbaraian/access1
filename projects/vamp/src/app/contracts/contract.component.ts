import { CommonModule } from "@angular/common";
import { Component, DestroyRef, ElementRef, Input, OnInit, ViewChild, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { DateTime } from "luxon";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { DialogService } from "primeng/dynamicdialog";
import { EditorModule } from "primeng/editor";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { PanelModule } from "primeng/panel";
import { TableModule } from "primeng/table";
import { TabViewModule } from "primeng/tabview";
import { ToastModule } from "primeng/toast";
import { TriStateCheckboxModule } from "primeng/tristatecheckbox";
import { BehaviorSubject, EMPTY, catchError, combineLatest, of } from "rxjs";
import { distinctUntilChanged, switchMap, tap } from "rxjs/operators";

import { AppService } from "../app.service";
import { ClientService } from "../client-view/client.service";
import { ConfirmDialogHeadless } from "../confirm-dialog-headless/confirm-dialog-headless.component";
import { IChannel, IClient, IProduct } from "../models/client";
import { IOption } from "../models/option";
import { IPayor } from "../models/payor";
import { PayorService } from "../payor-view/payor.service";
import { IContract, IContractNote, IPrefBrands, IProductChannel, createContract, createPpa, createProductChannel, createProductChannelPrefBrand } from "./contract";
import { ContractLengthPipe } from "./contract-length.pipe";
import { ContractsService } from "./contracts.service";

export interface IProductChannelOption {
    name: string;
    value: { productId: number; channelId: number; name: string };
}
@Component({
    selector: "app-contract",
    standalone: true,
    imports: [
        ButtonGroupModule,
        ButtonModule,
        CalendarModule,
        CardModule,
        CheckboxModule,
        CommonModule,
        ConfirmDialogHeadless,
        ContractLengthPipe,
        DialogModule,
        DropdownModule,
        FloatLabelModule,
        FormsModule,
        InputGroupAddonModule,
        InputGroupModule,
        InputTextareaModule,
        InputTextModule,
        PanelModule,
        ReactiveFormsModule,
        TableModule,
        TabViewModule,
        ToastModule,
        TriStateCheckboxModule,
        EditorModule,
    ],
    templateUrl: "./contract.component.html",
    styleUrl: "./contract.component.scss",
    providers: [MessageService, ConfirmationService, DialogService],
})
export class ContractComponent implements OnInit {
    private appService = inject(AppService);
    private clientService = inject(ClientService);
    private payorService = inject(PayorService);
    private contractsService = inject(ContractsService);
    private destroyRef = inject(DestroyRef);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private dialogService = inject(DialogService);
    private route = inject(ActivatedRoute);
    contractId$ = new BehaviorSubject<number>(0);

    @Input()
    set id(contractId: string) {
        this.contract.contractId = parseInt(contractId);
        this.contractId$.next(parseInt(contractId));
    }
    isInvalid = false;
    isModal = false;
    clientCtrl = new FormControl();
    payorCtrl = new FormControl();
    accountManagerCtrl = new FormControl();
    acceptLabel = "Delete";
    rejectLabel = "Cancel";
    fg = new FormGroup({
        clientCtrl: this.clientCtrl,
        payorCtrl: this.payorCtrl,
        accountManagerCtrl: this.accountManagerCtrl,
    });

    accountManagers: IOption[] = [];
    prefBrandIndex = 0;
    exclusionIndex = 0;
    productChannelIndex = 0;
    isNotesVisible = false;

    clients: IClient[] = [];

    payors: IPayor[] = [];
    contract: IContract = createContract();
    channels: IChannel[] = [
        { id: 1, name: "Commercial" },
        { id: 7, name: "Commercial Government" },
        { id: 8, name: "Medicare" },
        { id: 9, name: "Medicaid (Managed)" },
        { id: 10, name: "Medicaid (State Supplemental)" },
        { id: 11, name: "Health Exchange" },
    ];
    productChannels: IProductChannelOption[] = [];
    exclusions = [
        {
            field: "exclusion",
            title: "Exclusion",
        },
        {
            field: "nonExclusion",
            title: "Non-Exclusion",
        },
    ];
    prefBrands = [
        {
            field: "prefBrandUnrestricted",
            title: "Pref Brand Unrestricted",
            preferredType: 0,
        },
        {
            field: "prefBrandRestrict",
            title: "Pref Brand Restrict",
            preferredType: 1,
        },
        {
            field: "nonPrefBrandUnRestricted",
            title: "Non-Pref Brand Unrestricted",
            preferredType: 2,
        },
        {
            field: "nonPrefBrandRestrict",
            title: "Non-Pref Brand Restrict",
            preferredType: 3,
        },
    ];
    inReviewEntities = ["Viking", "Manufacturer", "Payer"];
    isAmendment = false;
    notes: IContractNote[] = [];
    @ViewChild("contentToPrint", { static: false }) contentToPrint: ElementRef | null = null;
    isPrinting = false;

    print = (): void => {
        const contractId = this.contractId$.getValue();
        if (contractId) {
            window.open(`/#/contracts/${contractId}?isPrinting=true`, "_blank");
        }
    };

    generatePDF1() {
        this.isPrinting = true;
        setTimeout(() => {
            html2canvas(this.contentToPrint!.nativeElement).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const doc = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();

                doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

                doc.save("1.pdf");
                this.isPrinting = false;
            });
        }, 100);
    }

    generatePDF2() {
        this.isPrinting = true;
        setTimeout(() => {
            html2canvas(this.contentToPrint!.nativeElement).then((canvas) => {
                var doc = new jsPDF("p", "px", "a4");

                var imgData = canvas.toDataURL("image/png");
                var pageHeight = doc.internal.pageSize.getHeight();
                var pageWidth = doc.internal.pageSize.getWidth();

                var imgHeight = canvas.height; //px to mm
                var imgWidth = canvas.width; //px to mm
                var pageCount = Math.ceil((imgHeight * pageWidth) / (pageHeight * imgWidth));

                /* add initial page */
                doc.addImage(imgData, "PNG", 2, 0, pageWidth - 4, 0);

                /* add extra pages if the div size is larger than a a4 size */
                if (pageCount > 0) {
                    var j = 1;
                    while (j != pageCount) {
                        doc.addPage();
                        doc.addImage(imgData, "PNG", 2, -(j * pageHeight), pageWidth - 4, 0);
                        j++;
                    }
                }
                doc.save("2.pdf");
                this.isPrinting = false;
            });
        }, 100);
    }
    addNote = (): void => {
        this.notes.unshift({ contractNoteId: 0, reviewDate: null, inReviewEntity: null, note: null });
    };
    applyNotes = (): void => {
        this.contract.viking = this.contract.payer = this.contract.manufacturer = null;
        for (var i = this.notes.length - 1; i >= 0; i--) {
            if (this.notes[i].reviewDate) {
                switch (this.notes[i].inReviewEntity) {
                    case "Viking":
                        this.contract.viking = this.notes[i].reviewDate;
                        break;
                    case "Manufacturer":
                        this.contract.manufacturer = this.notes[i].reviewDate;
                        break;
                    case "Payer":
                        this.contract.payer = this.notes[i].reviewDate;
                        break;
                }
            }
        }
        this.isNotesVisible = false;
    };

    deleteNote = (idx: number): void => {
        if (idx < this.notes.length) {
            this.notes.splice(idx, 1);
        }
    };
    save = () => {
        if (this.isValid()) {
            const contract = JSON.parse(JSON.stringify(this.contract));
            contract.productChannels.forEach((productChannel: IProductChannel) => (productChannel.options = []));
            if (contract.loi) {
                contract.loi = DateTime.fromISO(contract.loi).toFormat("MM/dd/yyyy");
            }
            if (contract.contractNegotiationInitiated) {
                contract.contractNegotiationInitiated = DateTime.fromISO(contract.contractNegotiationInitiated).toFormat("MM/dd/yyyy");
            }
            if (contract.viking) {
                contract.viking = DateTime.fromISO(contract.viking).toFormat("MM/dd/yyyy");
            }
            if (contract.manufacturer) {
                contract.manufacturer = DateTime.fromISO(contract.manufacturer).toFormat("MM/dd/yyyy");
            }
            if (contract.payer) {
                contract.payer = DateTime.fromISO(contract.payer).toFormat("MM/dd/yyyy");
            }
            if (contract.contractExecuted) {
                contract.contractExecuted = DateTime.fromISO(contract.contractExecuted).toFormat("MM/dd/yyyy");
            }
            contract.contractNotes = this.notes.map((note) => ({ ...note, reviewDate: DateTime.fromJSDate(note.reviewDate as Date).toFormat("MM/dd/yyyy") }));
            contract.productChannels.forEach((productChannel: any) => {
                productChannel.productId = productChannel.value.productId;
                productChannel.channelId = productChannel.value.channelId;
                if (productChannel.effectiveDate) {
                    productChannel.effectiveDate = DateTime.fromISO(productChannel.effectiveDate).toFormat("MM/dd/yyyy");
                }
                if (productChannel.endDate) {
                    productChannel.endDate = DateTime.fromISO(productChannel.endDate).toFormat("MM/dd/yyyy");
                }
                if ((productChannel.gpoEnterpriseFee + "").toLowerCase() === "sliding scale") {
                    productChannel.gpoEnterpriseFee = null;
                    productChannel.isGpoEnterpriseFeeSlidingScale = true;
                }
                /*
                contract.productChannels[i].gpoEnterpriseFee + "").toLowerCase() !== "sliding scale"*/

                productChannel.ppas.forEach((ppa: any) => {
                    if (ppa.effectiveDate) {
                        ppa.effectiveDate = DateTime.fromISO(ppa.effectiveDate).toFormat("MM/dd/yyyy");
                    }
                    if (ppa.endDate) {
                        ppa.endDate = DateTime.fromISO(ppa.endDate).toFormat("MM/dd/yyyy");
                    }
                    ppa["isPpCapCpi"] = (ppa.ppCap + "").toLowerCase() === "cpi";
                    if (!ppa["isPpCapCpi"]) {
                        delete ppa["threeYearAverage"];
                    } else {
                        ppa.ppCap = null;
                    }
                });

                this.prefBrands.forEach((prefBrand) => {
                    if (!productChannel.prefBrands[prefBrand.field].isChecked) {
                        delete productChannel.prefBrands[prefBrand.field];
                    }
                });
            });
            contract.accountDirector.userName = contract.accountDirector.email = "n/a";
            contract.accountDirectorId = contract.accountDirector.id;
            (contract.clientId = contract.client.clientId), (contract.payorId = contract.payor.payorId);
            this.contractsService
                .save(contract)
                .pipe(
                    tap((contractId) => {
                        this.contract.contractId = contractId;
                        this.contract.contractNotes = [...this.notes, ...this.contract.contractNotes];
                        this.notes = [];
                        this.messageService.add({ severity: "success", summary: "Success", detail: `Contract ${contractId} saved.`, life: 3000 });
                    }),
                    catchError((err: any) => {
                        const messages = new Map<string, string>();
                        if (err.error?.modelState) {
                            Object.keys(err.error.modelState).forEach((key) => messages.set(key, err.error.modelState[key]));
                        }
                        if (!messages.size) {
                            messages.set("Error", "There has been an error saving the contract.");
                        }
                        for (const [key, value] of messages) {
                            this.messageService.add({ severity: "error", summary: key, detail: value, life: 3000 });
                        }
                        return EMPTY;
                    }),
                    takeUntilDestroyed(this.destroyRef),
                )
                .subscribe();
        }
    };
    delete = () => {
        if (!!this.contract.contractId) {
            this.confirmationService.confirm({
                header: "Are you sure?",
                message: "Please confirm to proceed.",
                accept: () => {
                    this.contractsService
                        .delete(this.contract.contractId)
                        .pipe(
                            tap(() => {
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
        }
    };

    selectPrefBrand = (index: number): void => {
        this.prefBrandIndex = index;
        if (this.exclusionIndex < this.prefBrandIndex * 4 || this.exclusionIndex > this.prefBrandIndex * 4 + 1) {
            this.exclusionIndex = this.prefBrandIndex * 4;
        }
    };

    populateProductChannels = (): void => {
        this.productChannels = [];
        if (!this.contract.client?.products?.length) return;
        this.channels.forEach((channel: IChannel) => {
            this.contract
                .client!.products.sort((a, b) => a.name.localeCompare(b.name))
                .forEach((product: IProduct) => {
                    this.productChannels.push({ name: `${channel.name},${product.name}`, value: { productId: product.productId, channelId: channel.id, name: `${channel.name},${product.name}` } });
                });
        });
    };
    removeProductChannel = (index: number): void => {
        if (index < this.contract.productChannels.length) {
            this.contract.productChannels.splice(index, 1);
            this.changeProductChannel(-1);
        }
    };
    addRebate = (exclusion: any): void => {
        exclusion.rebates.push({});
    };

    deleteRebate = (exclusion: any, index: number): void => {
        exclusion.rebates.splice(index, 1);
    };

    duplicate = (prefBrand: IPrefBrands, index: number): void => {
        if (index === 0) {
            prefBrand["nonExclusion"] = JSON.parse(JSON.stringify(prefBrand["exclusion"]));
        } else {
            prefBrand["exclusion"] = JSON.parse(JSON.stringify(prefBrand["nonExclusion"]));
        }
    };

    addProductChannel = (): void => {
        let args: any = { isComplete: false, options: this.productChannels.filter((item) => !this.contract.productChannels.some((elem) => elem.value?.productId === item.value.productId && elem.value?.channelId === item.value.channelId)) };
        if (this.contract.productChannels.length > 0) {
            const productChannel = this.contract.productChannels[this.contract.productChannels.length - 1];
            args.effectiveDate = productChannel.effectiveDate;
            args.endDate = productChannel.endDate;
            args.autoRenew = productChannel.autoRenew;
            args.description = productChannel.description;
            args.adminFee = productChannel.adminFee;
            args.dataPortalFee = productChannel.dataPortalFee;
            args.gpoEnterpriseFee = productChannel.gpoEnterpriseFee;
            args.otherFee = productChannel.otherFee;
            args.otherFeeDescription = productChannel.otherFeeDescription;
            args.gpoEnterpriseFeeSlidingScale = productChannel.gpoEnterpriseFeeSlidingScale;
        }
        this.contract.productChannels.push(createProductChannel(args));

        this.changeProductChannel(this.contract.productChannels.length - 1);
    };

    addPpa = (productChannel: IProductChannel): void => {
        productChannel.ppas.push(createPpa());
    };

    deletePpa = (productChannel: IProductChannel, index: number): void => {
        productChannel.ppas.splice(index, 1);
    };

    changeProductChannel = (index: number) => {
        if (!this.contract.productChannels?.length) return;
        this.contract.productChannels.forEach((productChannel, idx1: number) => {
            if (idx1 !== index) {
                productChannel.options = this.productChannels.filter((item) => !this.contract.productChannels.filter((_, idx2: number) => idx2 != idx1).some((elem) => elem.value?.productId === item.value.productId && elem.value?.channelId === item.value.channelId));
            }
        });
    };

    isValid = (): boolean => {
        if (this.isAmendment && this.contract!.title?.replace(/\s/g, "").length === 0) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please enter a title.", life: 3000 });
            return false;
        }
        if (!this.contract!.client?.clientId) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please select a client.", life: 3000 });
            return false;
        }
        if (!this.contract!.payor?.payorId) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please select a payor.", life: 3000 });
            return false;
        }
        if (!this.contract!.accountDirector?.id) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please select an account director.", life: 3000 });
            return false;
        }
        if (this.contract!.productChannels.length == 0) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please select a Product and Channel.", life: 3000 });
            return false;
        }
        let hasErrors = false;
        this.notes.forEach((note: IContractNote, idx: number) => {
            if (!note.reviewDate) {
                this.messageService.add({ severity: "error", summary: "Error", detail: `Review Note ${idx + 1} has no date .`, life: 3000 });
                hasErrors = true;
            }
            if (!note.inReviewEntity) {
                this.messageService.add({ severity: "error", summary: "Error", detail: `Review Note ${idx + 1} has no review entity .`, life: 3000 });
                hasErrors = true;
            }
        });
        if (hasErrors) {
            return false;
        }
        for (var i = 0; i < this.contract.productChannels.length; i++) {
            if (!this.contract.productChannels[i].value?.productId) {
                this.messageService.add({ severity: "error", summary: "Error", detail: `Please select a Product and Channel on selection ${i + 1}.`, life: 3000 });
                return false;
            }
            if (!this.contract.productChannels[i].effectiveDate) {
                this.messageService.add({ severity: "error", summary: "Error", detail: `Please select an effective date for ${this.contract.productChannels[i].value!.name}.`, life: 3000 });
                return false;
            }
            if (!this.contract.productChannels[i].endDate) {
                this.messageService.add({ severity: "error", summary: "Error", detail: `Please select an end date for ${this.contract.productChannels[i].value!.name}.`, life: 3000 });
                return false;
            }
            var adminFee = Number.parseFloat(this.contract.productChannels[i].adminFee as string);
            var dataPortalFee = Number.parseFloat(this.contract.productChannels[i].dataPortalFee as string);
            var gpoEnterpriseFee = Number.parseFloat(this.contract.productChannels[i].gpoEnterpriseFee as string);
            var otherFee = Number.parseFloat(this.contract.productChannels[i].otherFee as string);
            if (isNaN(adminFee) || adminFee < 0 || adminFee > 100) {
                this.messageService.add({ severity: "error", summary: "Error", detail: `Please select a valid Admin Fee for ${this.contract.productChannels[i].value!.name}.`, life: 3000 });
                return false;
            }
            if (isNaN(dataPortalFee) || dataPortalFee < 0 || dataPortalFee > 100) {
                this.messageService.add({ severity: "error", summary: "Error", detail: `Please select a valid Data Portal Fee for ${this.contract.productChannels[i].value!.name}.`, life: 3000 });
                return false;
            }
            if ((this.contract.productChannels[i].gpoEnterpriseFee + "").toLowerCase() !== "sliding scale" && (isNaN(gpoEnterpriseFee) || gpoEnterpriseFee < 0 || gpoEnterpriseFee > 100)) {
                this.messageService.add({ severity: "error", summary: "Error", detail: `Please select a valid GPO/Enterprise Fee for ${this.contract.productChannels[i].value!.name}.`, life: 3000 });
                return false;
            }
            if (isNaN(otherFee) || otherFee < 0 || otherFee > 100) {
                this.messageService.add({ severity: "error", summary: "Error", detail: `Please select a valid Other Fee for ${this.contract.productChannels[i].value!.name}.`, life: 3000 });
                return false;
            }

            var exclusions = ["exclusion", "nonExclusion"];
            var exclusionNames = ["Exclusion", "Non-Exclusion"];
            for (var j = 0; j < this.prefBrands.length; j++) {
                if (this.contract.productChannels[i].prefBrands[this.prefBrands[j].field]?.isChecked) {
                    for (var l = 0; l < exclusions.length; l++) {
                        for (var k = 0; k < this.contract.productChannels[i].prefBrands[this.prefBrands[j].field][exclusions[l]].rebates.length; k++) {
                            if (!this.contract.productChannels[i].prefBrands[this.prefBrands[j].field][exclusions[l]].rebates[k].rebate) {
                                this.messageService.add({ severity: "error", summary: "Error", detail: `Please select a Rebate for ${this.contract.productChannels[i].value!.name} ${exclusionNames[l]} rebate row ${k + 1}.`, life: 3000 });
                                return false;
                            }
                            var rebatePercentage = Number.parseFloat(this.contract.productChannels[i].prefBrands[this.prefBrands[j].field][exclusions[l]].rebates[k].rebatePercentage);
                            if (isNaN(rebatePercentage) || rebatePercentage < 0 || rebatePercentage > 100) {
                                this.messageService.add({ severity: "error", summary: "Error", detail: `Please select a valid Rebate Percentage for ${this.contract.productChannels[i].value!.name} ${exclusionNames[l]} rebate row ${k + 1}.`, life: 3000 });
                                return false;
                            }
                        }
                    }
                }
            }
        }

        return true;
    };

    amend = (): void => {
        this.contract.parentId = this.contract.contractId;
        this.contract.contractId = 0;
        this.contract.title = "";
        this.isAmendment = true;
        this.contract.loi = this.contract.contractNegotiationInitiated = this.contract.viking = this.contract.manufacturer = this.contract.payer = this.contract.contractExecuted = null;
    };
    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.isPrinting = params["isPrinting"];
        });
        if (ContractsService.contractId) {
            this.contract.contractId = ContractsService.contractId;
            ContractsService.contractId = 0;
            this.contractId$.next(this.contract.contractId);
            this.isModal = true;
        }
        this.clientCtrl.valueChanges
            .pipe(
                tap((value) => {
                    this.contract.client = value;

                    this.populateProductChannels();
                    this.changeProductChannel(-1);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.payorCtrl.valueChanges
            .pipe(
                tap((value) => {
                    this.contract.payor = value;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.accountManagerCtrl.valueChanges
            .pipe(
                tap((value) => {
                    this.contract.accountDirector = value;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        combineLatest({
            contract: this.contractId$.pipe(
                distinctUntilChanged(),
                switchMap((contractId: number) => {
                    return contractId > 0 ? this.contractsService.get(contractId) : of(this.contract);
                }),
                catchError((err: any) => {
                    this.messageService.add({ severity: "error", summary: "Error", detail: "There was an error retrieving the contract", life: 3000 });
                    this.contract.contractId = 0;
                    this.isInvalid = true;
                    return EMPTY;
                }),
            ),
            clients: this.clientService.getClients(true, false),
            payors: this.payorService.getPayors(),
            accountManagers: this.appService.getAccountManagers(),
            currentAccountManager: this.appService.getCurrentAccountManager(),
        })
            .pipe(
                tap(({ contract, clients, payors, accountManagers, currentAccountManager }) => {
                    this.clients = clients;
                    this.payors = payors;
                    if (contract.loi) {
                        contract.loi = DateTime.fromFormat(contract.loi as string, "MM/dd/yyyy").toJSDate();
                    }
                    if (contract.contractNegotiationInitiated) {
                        contract.contractNegotiationInitiated = DateTime.fromFormat(contract.contractNegotiationInitiated as string, "MM/dd/yyyy").toJSDate();
                    }
                    if (contract.viking) {
                        contract.viking = DateTime.fromFormat(contract.viking as string, "MM/dd/yyyy").toJSDate();
                    }
                    if (contract.manufacturer) {
                        contract.manufacturer = DateTime.fromFormat(contract.manufacturer as string, "MM/dd/yyyy").toJSDate();
                    }
                    if (contract.payer) {
                        contract.payer = DateTime.fromFormat(contract.payer as string, "MM/dd/yyyy").toJSDate();
                    }
                    if (contract.contractExecuted) {
                        contract.contractExecuted = DateTime.fromFormat(contract.contractExecuted as string, "MM/dd/yyyy").toJSDate();
                    }
                    this.contract = contract;
                    if (contract.client) {
                        const client = clients.find((item) => item.clientId === contract.client!.clientId);
                        if (client) {
                            this.clientCtrl.setValue(client);
                        }
                    }
                    if (contract.payor) {
                        const payor = payors.find((item) => item.payorId === contract.payor!.payorId);
                        if (payor) {
                            this.payorCtrl.setValue(payor);
                        }
                    }
                    this.accountManagers = accountManagers;
                    if (currentAccountManager) {
                        const accountManager = accountManagers.find((item) => item.id === currentAccountManager.accountManagerId);
                        if (accountManager) {
                            this.accountManagerCtrl.setValue(accountManager);
                        }
                    }

                    if (contract?.productChannels?.length) {
                        this.prefBrands.forEach((prefBrand) => {
                            contract.productChannels.forEach((productChannel) => {
                                const isChecked = !!productChannel.prefBrands[prefBrand.field];
                                productChannel.prefBrands[prefBrand.field] = createProductChannelPrefBrand(productChannel.prefBrands[prefBrand.field]);
                                productChannel.prefBrands[prefBrand.field].isChecked = isChecked;
                            });
                        });
                    }
                    if (!!this.contract.client?.clientId) {
                        if (this.contract.productChannels.length) {
                            this.contract.productChannels.forEach((item) => {
                                const pc = this.productChannels.find((elem) => elem.value.productId === item.productId && elem.value.channelId === item.channelId);
                                item.value = pc?.value;
                            });
                        }
                    }
                }),
                tap((_) => {
                    if (this.contract.contractId && this.isPrinting) {
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 1000);
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        combineLatest({ accountManagers: this.appService.getAccountManagers(), currentAccountManager: this.appService.getCurrentAccountManager() })
            .pipe(
                tap((data: { accountManagers: IOption[]; currentAccountManager: { accountManagerId: string; name: string } }) => {}),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
}
