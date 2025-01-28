import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { DateTime } from "luxon";
import { AccordionModule } from "primeng/accordion";
import { ConfirmationService, LazyLoadEvent, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { DialogService, DynamicDialogModule, DynamicDialogRef } from "primeng/dynamicdialog";
import { FieldsetModule } from "primeng/fieldset";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputMaskModule } from "primeng/inputmask";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { PanelModule } from "primeng/panel";
import { TableModule } from "primeng/table";
import { TabViewModule } from "primeng/tabview";
import { ToastModule } from "primeng/toast";
import { catchError, combineLatest, EMPTY, of } from "rxjs";
import { filter, switchMap, tap } from "rxjs/operators";

import { AppService } from "../app.service";
import { ClientService } from "../client-view/client.service";
import { ConfirmDialogHeadless } from "../confirm-dialog-headless/confirm-dialog-headless.component";
import { createClient, IClient } from "../models/client";
import { IColumn, IOption } from "../models/option";
import { createPayorContact, IFormulary, IPayor, IPayorActionPlan, IPayorContact, IPayorContractTracking, IPayorNote, IPayorProduct, IPayorTherapeuticCategoryPolicy, IPayorWebsite, IProductTierCategory, ITherapeuticCategory } from "../models/payor";
import { PayorContactComponent } from "../payor-contact/payor-contact.component";
import { urlValidator } from "../validators/url-validator";
import { PayorService } from "./payor.service";
@Component({
    selector: "app-payor-view",
    standalone: true,
    imports: [
        AccordionModule,
        ButtonGroupModule,
        ButtonModule,
        CalendarModule,
        CardModule,
        CheckboxModule,
        CommonModule,
        ConfirmDialogHeadless,
        DynamicDialogModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        FieldsetModule,
        FloatLabelModule,
        FormsModule,
        InputGroupAddonModule,
        InputGroupModule,
        InputMaskModule,
        InputNumberModule,
        InputTextareaModule,
        InputTextModule,
        PanelModule,
        ReactiveFormsModule,
        TableModule,
        TabViewModule,
        ToastModule,
    ],
    providers: [ConfirmationService],
    templateUrl: "./payor-view.component.html",
    styleUrl: "./payor-view.component.scss",
})
export class PayorViewComponent implements OnInit {
    private appService = inject(AppService);
    private destroyRef = inject(DestroyRef);
    private messageService = inject(MessageService);
    private payorService = inject(PayorService);
    private clientService = inject(ClientService);
    private dialogService = inject(DialogService);
    private confirmationService = inject(ConfirmationService);

    acceptLabel = "Delete";
    rejectLabel = "Cancel";

    payorCtrl = new FormControl();
    contactCtrl = new FormControl(0);
    clientCtrl = new FormControl();
    clientCtrl2 = new FormControl();
    accountManagerCtrl = new FormControl();
    therapeuticCtrl = new FormControl();
    payorProductCtrl = new FormControl();
    payorContactsWithAll: IPayorContact[] = [];
    payors: IPayor[] = [];
    payor: IPayor | null = null;
    clients: IClient[] = [];
    clientsWithAll: IClient[] = [];
    accountManagers: IOption[] = [];
    therapeutics: ITherapeuticCategory[] = [];
    currentAccountManager: IOption | null = null;
    corporateDetailsEnabled = false;
    isWebsiteVisible = false;
    payorActionPlans: IPayorActionPlan[] = [];
    payorContractTrackings: IPayorContractTracking[] = [];
    formularies: IFormulary[] = [];
    payorProducts: IPayorProduct[] = [];
    colsActionPlans: IColumn[] = [
        { field: "name", header: "Name" },
        { field: "goal1", header: "Current Goal" },
        { field: "action1", header: "Current Actions Steps/Timeline" },
        { field: "", header: "" },
        { field: "goal2", header: "Previous Goal" },
        { field: "action2", header: "Previous Actions Steps/Timeline" },
    ];
    colsContractTracking: IColumn[] = [
        { field: "name", header: "Name" },
        { field: "isContractTerms", header: "Contract Terms" },
        { field: "isContractNegotiation", header: "Contract Negotiation" },
        { field: "isInProcessRedLining", header: "In Process-redlining" },
        { field: "isInSignatureProcess", header: "In Signature Process" },
        { field: "isFullyExecuted", header: "Fully Executed" },
        { field: "comments", header: "Comments" },
    ];
    colsPayorContacts: IColumn[] = [
        { field: "firstName", header: "First Name" },
        { field: "lastName", header: "Last Name" },
        { field: "title", header: "Title" },
        { field: "officePhone", header: "Office Phone" },
        { field: "email", header: "Email" },
    ];
    colsActivities: IColumn[] = [
        { field: "noteType", header: "Note Type" },
        { field: "product", header: "Product" },
        { field: "client", header: "Client" },
        { field: "subject", header: "Subject" },
        { field: "type", header: "Type" },
        { field: "description", header: "Description" },
        { field: "dates", header: "Date(s)" },
        { field: "accountManagers", header: "Account Manager(s)" },
    ];
    colsFormulary: string[] = ["Not Covered", "Preferred", "Covered", "PA", "Step Edit"];
    websiteForm = new FormGroup({
        url: new FormControl("", [Validators.required, urlValidator()]),
        name: new FormControl("", [Validators.required]),
    });
    modifiedActionPlans: number[] = [];
    clonedActionPlans: { [s: string]: IPayorActionPlan } = {};
    modifiedContractTracking: number[] = [];
    clonedContractTracking: { [s: string]: IPayorContractTracking } = {};
    ref: DynamicDialogRef | undefined;
    startDate = new Date();
    endDate = new Date();
    activities: IPayorNote[] = [];
    totalRows = 0;
    firstNotes = 0;
    rowsNotes = 0;
    isGeneratePressed = false;
    payorTherapeuticCategoryPolicies: IPayorTherapeuticCategoryPolicy = {};
    ngOnInit() {
        combineLatest({ payor: this.payorCtrl.valueChanges, therapeuticCategory: this.therapeuticCtrl.valueChanges })
            .pipe(
                filter((data: { payor: IPayor; therapeuticCategory: ITherapeuticCategory }) => !!data.payor.payorId),
                switchMap((data) =>
                    this.payorService.getPayorTherapeuticCategoryPolicies(data.payor.payorId!, data.therapeuticCategory.therapeuticCategoryId).pipe(
                        tap((policy: IPayorTherapeuticCategoryPolicy) => {
                            this.payorTherapeuticCategoryPolicies = policy;
                        }),
                    ),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        combineLatest({
            payor: this.payorCtrl.valueChanges,
            clientId: this.clientCtrl2.valueChanges,
            therapeuticCategory: this.therapeuticCtrl.valueChanges,
        })
            .pipe(
                filter((data: { payor: IPayor; clientId: number; therapeuticCategory: ITherapeuticCategory }) => !!data.payor.payorId && data.clientId > 0 && data.therapeuticCategory.therapeuticCategoryId > 0),
                tap(() => {
                    this.formularies = [];
                }),
                switchMap((data) =>
                    combineLatest({
                        formularies: this.payorService.getFormulary(data.payor.payorId!, data.clientId, data.therapeuticCategory.therapeuticCategoryId),
                        payorProducts: !data.therapeuticCategory.hasPolicy ? of([]) : this.payorService.getPayorProducts(data.payor.payorId!, data.clientId, data.therapeuticCategory.therapeuticCategoryId),
                    }),
                ),
                tap((data) => {
                    this.formularies = data.formularies;
                    this.payorProducts = data.payorProducts;
                    this.payorProductCtrl.setValue(null);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        combineLatest({ accountManagers: this.appService.getAccountManagers(), currentAccountManager: this.appService.getCurrentAccountManager(), therapeutics: this.appService.getTherapeuticCategories() })
            .pipe(
                tap(({ accountManagers, currentAccountManager, therapeutics }) => {
                    accountManagers.unshift({ id: " ", name: "all" });
                    this.accountManagers = accountManagers;
                    this.therapeutics = therapeutics;
                    if (currentAccountManager) {
                        const accountManager = accountManagers.find((item) => item.id === currentAccountManager.accountManagerId);
                        if (accountManager) {
                            this.currentAccountManager = accountManager;
                            this.accountManagerCtrl.setValue(accountManager.id);
                        }
                    }
                    if (!this.currentAccountManager) {
                        this.currentAccountManager = this.accountManagers[0];
                        this.accountManagerCtrl.setValue(this.currentAccountManager.id);
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.clientService
            .getClients(true, false)
            .pipe(
                tap((data: IClient[]) => {
                    this.clients = data;
                    data = [createClient({ clientId: 0, name: "all", products: [{ productId: 0, name: "all" }] }), ...data];
                    this.clientsWithAll = data;
                    this.clientCtrl.setValue(0);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.payorCtrl.valueChanges
            .pipe(
                tap((value) => {
                    this.payor = JSON.parse(JSON.stringify(value));
                    this.refreshPayorContactsWithAll();
                    this.payorActionPlans = [];
                    this.modifiedActionPlans = [];
                }),
                switchMap((value) => combineLatest({ actionPlans: this.payorService.getActionPlans(value.payorId), contractTracking: this.payorService.getContractTracking(value.payorId) })),
                tap(({ actionPlans, contractTracking }) => {
                    this.payorActionPlans = actionPlans;
                    this.payorContractTrackings = contractTracking;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        combineLatest({
            payors: this.payorService.getPayors(),
        })
            .pipe(
                tap(({ payors }) => {
                    this.payors = payors;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
    edit = (): void => {
        this.corporateDetailsEnabled = true;
    };
    cancel = (): void => {
        if (!this.payor) return;
        const payor = this.payors.find((item) => item.payorId === this.payor!.payorId);
        if (!payor) return;
        this.payorCtrl.setValue(payor);
        this.corporateDetailsEnabled = false;
    };
    save = (): void => {
        if (!this.payor) {
            return;
        }
        this.payor.payorActionPlans = this.payorActionPlans.filter((item) => this.modifiedActionPlans.includes(item.clientId));
        this.payor.payorContractTracking = this.payorContractTrackings.filter((item) => this.modifiedContractTracking.includes(item.clientId));
        this.payorService
            .savePayor(this.payor as IPayor)
            .pipe(
                tap((payor) => {
                    const payorIndex = this.payors.findIndex((item) => item.payorId === payor.payorId);
                    if (payorIndex >= 0) {
                        this.payors[payorIndex] = payor;
                        this.payorCtrl.setValue(payor);
                        this.corporateDetailsEnabled = false;
                        this.messageService.add({ severity: "success", summary: "Success", detail: `Payor ${payor.name} saved.`, life: 3000 });
                    }
                }),
                catchError((err: any) => {
                    this.getError(err, "There has been an error saving the payor.");
                    return EMPTY;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    };
    saveWebsite = (): void => {
        const url = this.websiteForm.get("url");
        if (url?.errors && url?.errors["invalidUrl"]) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Invalid Url", life: 3000 });
            return;
        }
        if (!url?.value?.length) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please enter Url", life: 3000 });
            return;
        }
        const name = this.websiteForm.get("name");
        if (!name?.value?.length) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please enter Name", life: 3000 });
            return;
        }
        this.payorService
            .addWebsite(this.payor!.payorId!, name.value, url.value)
            .pipe(
                tap((payorWebsite: IPayorWebsite) => {
                    this.payor!.payorWebsiteId = payorWebsite.payorWebsiteId;
                    if (!this.payor!.payorWebsites) {
                        this.payor!.payorWebsites = [payorWebsite];
                    } else {
                        this.payor!.payorWebsites.push(payorWebsite);
                    }
                    this.isWebsiteVisible = false;
                    this.messageService.add({ severity: "success", summary: "Success", detail: `Website ${payorWebsite.name} saved.`, life: 3000 });
                }),
                catchError((err: any) => {
                    this.getError(err, "There has been an error saving the website.");
                    return EMPTY;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    };
    closeWebsite = (): void => {
        this.isWebsiteVisible = false;
    };
    onRowEditInitActionPlans = (actionPlan: IPayorActionPlan): void => {
        this.clonedActionPlans[actionPlan.clientId.toString()] = { ...actionPlan };
    };
    onRowEditSaveActionPlans = (actionPlan: IPayorActionPlan): void => {
        delete this.clonedActionPlans[actionPlan.clientId.toString()];
        if (!this.modifiedActionPlans.find((item) => item === actionPlan.clientId)) {
            this.modifiedActionPlans.push(actionPlan.clientId);
        }
    };
    onRowEditCancelActionPlans = (actionPlan: IPayorActionPlan, index: number): void => {
        this.payorActionPlans[index] = this.clonedActionPlans[actionPlan.clientId.toString()];
        delete this.clonedActionPlans[actionPlan.clientId.toString()];
    };
    onRowEditInitContractTracking = (contractTracking: IPayorContractTracking): void => {
        this.clonedContractTracking[contractTracking.clientId.toString()] = { ...contractTracking };
    };
    onRowEditSaveContractTracking = (contractTracking: IPayorContractTracking): void => {
        delete this.clonedContractTracking[contractTracking.clientId.toString()];
        if (!this.modifiedContractTracking.find((item) => item === contractTracking.clientId)) {
            this.modifiedContractTracking.push(contractTracking.clientId);
        }
    };
    onRowEditCancelContractTracking = (contractTracking: IPayorContractTracking, index: number): void => {
        this.payorContractTrackings[index] = this.clonedContractTracking[contractTracking.clientId.toString()];
        delete this.clonedContractTracking[contractTracking.clientId.toString()];
    };
    copyActionPlan = (index: number): void => {
        this.payorActionPlans[index] = { ...this.payorActionPlans[index], goal1: this.payorActionPlans[index].goal2, action1: this.payorActionPlans[index].action2 };

        if (!this.modifiedActionPlans.find((item) => item === this.payorActionPlans[index].clientId)) {
            this.modifiedActionPlans.push(this.payorActionPlans[index].clientId);
        }
    };
    openPayorContact = (contact: IPayorContact | null, index: number) => {
        this.ref = this.dialogService.open(PayorContactComponent, {
            width: "50vw",
            modal: true,
            header: contact ? `${contact?.firstName} ${contact?.lastName}` : "New Contact",
            data: {
                contact: JSON.parse(JSON.stringify(contact)),
            },
        });

        this.ref.onClose.subscribe((result: IPayorContact) => {
            if (result) {
                if (index >= 0) {
                    this.payor!.payorContacts[index] = result;
                    this.refreshPayorContactsWithAll();
                } else {
                    this.payor!.payorContacts = [result!, ...this.payor!.payorContacts];
                    this.refreshPayorContactsWithAll();
                }
            }
        });
    };

    refreshPayorContactsWithAll = (): void => {
        this.payorContactsWithAll = [createPayorContact({ payorContactId: 0, name: "all" }), ...this.payor!.payorContacts.sort((a, b) => a.name!.localeCompare(b.name!))];
    };

    deletePayorContact = (contact: IPayorContact, index: number): void => {
        this.confirmationService.confirm({
            header: "Are you sure?",
            message: "Please confirm to proceed.",
            accept: () => {
                this.payorService
                    .deleteContact(contact)
                    .pipe(
                        tap(() => {
                            this.payor!.payorContacts.splice(index, 1);
                            this.refreshPayorContactsWithAll();
                            this.messageService.add({ severity: "success", summary: "Success", detail: "Successful delete", life: 3000 });
                        }),
                        catchError((err) => {
                            this.messageService.add({ severity: "error", summary: "Error", detail: err?.error?.message ?? err.statusText, life: 3000 });
                            return EMPTY;
                        }),
                        takeUntilDestroyed(this.destroyRef),
                    )
                    .subscribe();
            },
        });
    };
    deletePayorNote = (note: IPayorNote, index: number): void => {
        this.confirmationService.confirm({
            header: "Are you sure?",
            message: "Please confirm to proceed.",
            accept: () => {
                var obs = note.payorActivityId > 0 ? this.payorService.deleteNote(note.payorActivityId) : this.clientService.deleteNote(note.clientActivityId);
                obs.pipe(
                    tap(() => {
                        this.activities.splice(index, 1);
                        this.totalRows--;
                        this.messageService.add({ severity: "success", summary: "Success", detail: "Successful delete", life: 3000 });
                    }),
                    catchError((err) => {
                        this.messageService.add({ severity: "error", summary: "Error", detail: err?.error?.message ?? err.statusText, life: 3000 });
                        return EMPTY;
                    }),
                    takeUntilDestroyed(this.destroyRef),
                ).subscribe();
            },
        });
    };
    createPayorContact = (): void => this.openPayorContact(createPayorContact({ payorId: this.payor!.payorId }), -1);
    generate = (): void => {
        if (!this.payor) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please select a payor", life: 3000 });
            return;
        }
        combineLatest({
            payorNotesTotalRows: this.payorService.getNotesTotalRows(this.payor!.payorId!, this.clientCtrl.value, 0, 0, 0, this.accountManagerCtrl.value, DateTime.fromJSDate(this.startDate).toISODate()!, DateTime.fromJSDate(this.endDate).toISODate()!),
            clientNotesTotalRows: this.clientService.getNotesTotalRows(this.payor!.payorId!, this.clientCtrl.value, 0, 0, 0, this.accountManagerCtrl.value, DateTime.fromJSDate(this.startDate).toISODate()!, DateTime.fromJSDate(this.endDate).toISODate()!),
        })
            .pipe(
                tap(({ payorNotesTotalRows, clientNotesTotalRows }) => {
                    this.totalRows = payorNotesTotalRows + clientNotesTotalRows;
                    this.isGeneratePressed = true;
                    this.loadNotesLazy();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    };

    loadNotesLazy(event?: LazyLoadEvent) {
        if (event) {
            this.firstNotes = event.rows! ? Math.floor(event.first! / event.rows!) + 1 : 1;
            this.rowsNotes = event.rows!;
        }
        if (!this.payor || !this.isGeneratePressed) {
            return;
        }

        this.payorService
            .getNotes(this.firstNotes, this.rowsNotes, this.payor!.payorId!, this.clientCtrl.value, 0, 0, 0, this.accountManagerCtrl.value, DateTime.fromJSDate(this.startDate).toISODate()!, DateTime.fromJSDate(this.endDate).toISODate()!)
            .pipe(
                tap((data: IPayorNote[]) => {
                    this.activities = data;
                    if (event) {
                        event!.forceUpdate!();
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
    saveFormulary = (): void => {
        let formularies: IFormulary[] = [];
        this.formularies.forEach((formulary, index) => {
            let newFormulary: IFormulary | null = null;
            formulary.productTierCategories.forEach((productTierCategory) => {
                let newProductTierCategory: IProductTierCategory | null = null;
                productTierCategory.tierCategories.forEach((tierCategory) => {
                    if (productTierCategory[tierCategory.name]) {
                        if (newProductTierCategory === null) {
                            newProductTierCategory = { ...productTierCategory, tierCategories: [{ ...tierCategory, value: productTierCategory[tierCategory.name] }] };
                        } else {
                            newProductTierCategory.tierCategories.push({ ...tierCategory, value: productTierCategory[tierCategory.name] });
                        }
                    }
                });
                if (newProductTierCategory !== null) {
                    if (newFormulary === null) {
                        newFormulary = { ...formulary, productTierCategories: [newProductTierCategory] };
                    } else {
                        newFormulary.productTierCategories.push(newProductTierCategory);
                    }
                }
            });
            if (newFormulary != null) {
                formularies.push(newFormulary);
            }
        });
        const subs = [];
        if (formularies.length > 0) {
            subs.push(
                this.payorService.saveFormulary(this.clientCtrl2.value, this.payorCtrl.value.payorId, this.therapeuticCtrl.value.therapeuticCategoryId, formularies).pipe(
                    tap(() => {
                        this.messageService.add({ severity: "success", summary: "Success", detail: "Formularies saved.", life: 3000 });
                    }),
                    catchError((err: any) => {
                        this.getError(err, "There has been an error saving the formularies.");
                        return EMPTY;
                    }),
                ),
            );
        }
        if (this.therapeuticCtrl.value.hasPolicy) {
            subs.push(
                this.payorService
                    .savePayorTherapeuticCategoryPolicies(<IPayorTherapeuticCategoryPolicy>{
                        payorId: this.payorCtrl.value.payorId,
                        therapeuticCategoryId: this.therapeuticCtrl.value.therapeuticCategoryId,
                        commercial: this.payorTherapeuticCategoryPolicies.commercial,
                        medicare: this.payorTherapeuticCategoryPolicies.medicare,
                    })
                    .pipe(
                        tap(() => {
                            this.messageService.add({ severity: "success", summary: "Success", detail: "Therapeutic policies saved.", life: 3000 });
                        }),
                        catchError((err: any) => {
                            this.getError(err, "There has been an error saving the Therapeutic policies.");
                            return EMPTY;
                        }),
                    ),
            );
            if (this.payorProductCtrl.value?.productId > 0) {
                subs.push(
                    this.payorService.savePayorProduct(this.payorProductCtrl.value).pipe(
                        tap(() => {
                            this.messageService.add({ severity: "success", summary: "Success", detail: "Product policies saved.", life: 3000 });
                        }),
                        catchError((err: any) => {
                            this.getError(err, "There has been an error saving the Product policies.");
                            return EMPTY;
                        }),
                    ),
                );
            }
        }
        if (subs.length) {
            combineLatest(subs).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
        }
    };
    private getError = (err: any, message: string): void => {
        const messages = new Map<string, string>();
        if (err.error?.modelState) {
            Object.keys(err.error.modelState).forEach((key) => messages.set(key, err.error.modelState[key]));
        }
        if (!messages.size) {
            messages.set("Error", message);
        }
        for (const [key, value] of messages) {
            this.messageService.add({ severity: "error", summary: key, detail: value, life: 3000 });
        }
    };
}
