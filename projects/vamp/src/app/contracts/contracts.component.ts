import { CommonModule } from "@angular/common";
import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { DateTime } from "luxon";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { DialogService, DynamicDialogModule, DynamicDialogRef } from "primeng/dynamicdialog";
import { FloatLabelModule } from "primeng/floatlabel";
import { MultiSelectModule } from "primeng/multiselect";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { PanelModule } from "primeng/panel";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { combineLatest } from "rxjs";
import { tap } from "rxjs/operators";

import { AppService } from "../app.service";
import { ClientService } from "../client-view/client.service";
import { IClient, createClient, createProduct } from "../models/client";
import { IColumn, IOption } from "../models/option";
import { IPayor, createPayor } from "../models/payor";
import { PayorService } from "../payor-view/payor.service";
import { utils } from "../utils";
import { IContract, createContract } from "./contract";
import { ContractComponent, LocalStorageKeyContract } from "./contract.component";
import { ContractsService } from "./contracts.service";

@Component({
    selector: "app-contracts",
    standalone: true,
    imports: [ButtonModule, ButtonGroupModule, CalendarModule, FloatLabelModule, DropdownModule, PanelModule, ToastModule, ReactiveFormsModule, CommonModule, TableModule, MultiSelectModule, OverlayPanelModule, DynamicDialogModule],
    templateUrl: "./contracts.component.html",
    styleUrl: "./contracts.component.scss",
    providers: [DialogService],
})
export class ContractsComponent implements OnInit {
    private appService = inject(AppService);
    private clientService = inject(ClientService);
    private payorService = inject(PayorService);
    private contractsService = inject(ContractsService);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    dialogService = inject(DialogService);

    ref: DynamicDialogRef | undefined;

    _selectedColumns: IColumn[] = [];
    cols: IColumn[] = [];

    clientCtrl = new FormControl();
    productCtrl = new FormControl();
    contractStatusCtrl = new FormControl();
    daysUntilRenewalCtrl = new FormControl();
    payorsCtrl = new FormControl(0);
    channelCtrl = new FormControl(0);
    activeCtrl = new FormControl(0);
    yearsCtrl = new FormControl();
    therapeuticAreasCtrl = new FormControl(0);
    accountManagerCtrl = new FormControl();
    selectedColumnsCtrl = new FormControl();

    fg = new FormGroup({
        clientCtrl: this.clientCtrl,
        productCtrl: this.productCtrl,
        contractStatusCtrl: this.contractStatusCtrl,
        daysUntilRenewalCtrl: this.daysUntilRenewalCtrl,
        payorsCtrl: this.payorsCtrl,
        channelCtrl: this.channelCtrl,
        activeCtrl: this.activeCtrl,
        yearsCtrl: this.yearsCtrl,
        therapeuticAreasCtrl: this.therapeuticAreasCtrl,
        accountManagerCtrl: this.accountManagerCtrl,
        selectedColumnsCtrl: this.selectedColumnsCtrl,
    });
    data: IContract[] = [];
    clients: IClient[] = [];
    payors: IPayor[] = [];
    therapeuticAreas: IOption[] = [];

    products = [];
    contractStatuses = [
        { id: 0, name: "All" },
        { id: 1, name: "Draft" },
        { id: 2, name: "LOI/Bid" },
        { id: 3, name: "Contract Negotiation Initiated" },
        { id: 4, name: "Viking" },
        { id: 5, name: "Manufacturer" },
        { id: 6, name: "Payer" },
        { id: 7, name: "Contract Executed" },
    ];
    daysUntilRenewals = [
        { days: 0, name: "All Records" },
        { days: 30, name: "30 days" },
        { days: 60, name: "60 days" },
        { days: 90, name: "90 days" },
    ];

    channels = [
        { id: 0, name: "All Channels" },
        { id: 1, name: "Commercial" },
        { id: 7, name: "Commercial Government" },
        { id: 8, name: "Medicare" },
        { id: 9, name: "Medicaid (Managed)" },
        { id: 10, name: "Medicaid (State Supplemental)" },
        { id: 11, name: "Health Exchange" },
    ];
    activeStatuses = [
        { id: 0, name: "All" },
        { id: 1, name: "Active" },
        { id: 2, name: "Inactive " },
    ];
    years: string[] = ["All"];
    accountManagers: IOption[] = [];
    currentAccountManager: IOption | null = null;
    getValue = utils.getValue;

    open = (row: IContract) => {
        ContractsService.contractId = row.contractId;
        const _this = this;
        this.ref = this.dialogService.open(ContractComponent, {
            width: "95vw",
            height: "100vh",
            modal: true,
            header: `${row.client?.name} | ${row.payor?.name} | ${row.accountDirector?.name}`,
        });
        this.ref.onClose.subscribe((data: any) => {
            localStorage.removeItem(LocalStorageKeyContract);
            this.inProgress = "";
            this.generate();
        });
    };

    reset = () => {
        if (this.clients.length) this.clientCtrl.setValue(this.clients[0]);
        if (this.payors.length) this.payorsCtrl.setValue(this.payors[0].payorId);
        if (this.channels.length) this.channelCtrl.setValue(this.channels[0].id);
        if (this.therapeuticAreas.length) this.therapeuticAreasCtrl.setValue(this.therapeuticAreas[0].id as number);
        if (this.contractStatuses.length) this.contractStatusCtrl.setValue(this.contractStatuses[0]);
        if (this.activeStatuses.length) this.activeCtrl.setValue(this.activeStatuses[0].id);
        if (this.daysUntilRenewals.length) this.daysUntilRenewalCtrl.setValue(this.daysUntilRenewals[0]);
        this.yearsCtrl.setValue(DateTime.now().year);
        if (this.accountManagers.length) {
            this.accountManagerCtrl.setValue(this.currentAccountManager ? this.currentAccountManager : this.accountManagers[0]);
        }
    };
    inProgress = "";
    inProgressContract: IContract = createContract({});
    checkLocalStorageKey = (): void => {
        const contractsString = localStorage.getItem(LocalStorageKeyContract);
        if (!!contractsString) {
            const contracts: IContract[] | null = utils.tryParseJSON(contractsString);
            if (contracts && contracts.length > 0) {
                this.inProgressContract = { ...contracts![0], contractId: -1 };
                if (contracts![0].contractId > 0) {
                    this.inProgress = `Contract ${contracts![0].contractId} in progress`;
                } else {
                    this.inProgress = `New Contract in progress`;
                }
            }
        }
    };
    openPending = (): void => {
        this.open(this.inProgressContract);
    };
    ngOnInit() {
        this.checkLocalStorageKey();
        this.appService
            .getTherapeuticCategories()
            .pipe(
                tap((data) => {
                    this.therapeuticAreas = [{ id: 0, name: "All" }, ...data.map((item) => ({ id: item.therapeuticCategoryId, name: item.name }))];
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.payorService
            .getPayors()
            .pipe(
                tap((data) => {
                    data.unshift(createPayor({ payorId: 0, name: "All" }));
                    this.payors = data;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.clientService
            .getClients(true, false)
            .pipe(
                tap((data: IClient[]) => {
                    data = [
                        createClient({ clientId: 0, name: "All", products: [{ productId: 0, name: "All" }] }),
                        ...data.map((client) => {
                            if (client.products) {
                                client.products.unshift(createProduct({ productId: 0, name: "All" }));
                            } else {
                                client.products = [createProduct({ productId: 0, name: "All" })];
                            }
                            return client;
                        }),
                    ];
                    this.clients = data;
                    this.clientCtrl.setValue(data[0]);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.cols = [
            { field: "contractId", header: "Id" },
            { field: "status", header: "Contract Status" },
            { field: "client.name", header: "Client" },
            { field: "payor.name", header: "Payor" },
            { field: "accountDirector.name", header: "Account Director" },
            { field: "hasAmendments", header: "Has Amendments" },
        ];
        this.selectedColumnsCtrl.valueChanges
            .pipe(
                tap((val) => (this.selectedColumns = val)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.selectedColumnsCtrl.setValue([...this.cols]);
        combineLatest({ accountManagers: this.appService.getAccountManagers(), currentAccountManager: this.appService.getCurrentAccountManager() })
            .pipe(
                tap((data: { accountManagers: IOption[]; currentAccountManager: { accountManagerId: string; name: string } }) => {
                    data.accountManagers.unshift({ id: "", name: "All" });
                    this.accountManagers = data.accountManagers;
                    if (data.currentAccountManager) {
                        const accountManager = data.accountManagers.find((item) => item.id === data.currentAccountManager.accountManagerId);
                        if (accountManager) {
                            this.currentAccountManager = accountManager;
                            this.accountManagerCtrl.setValue(accountManager);
                        }
                    }
                    if (!this.currentAccountManager) {
                        this.currentAccountManager = this.accountManagers[0];
                        this.accountManagerCtrl.setValue(this.currentAccountManager);
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        for (var year = DateTime.now().year + 1; year >= 2019; year--) {
            this.years.push(year.toString());
        }
        this.yearsCtrl.setValue(this.years[0]);
        this.contractStatusCtrl.setValue(this.contractStatuses[0]);
        this.daysUntilRenewalCtrl.setValue(this.daysUntilRenewals[0]);
        this.clientCtrl.valueChanges
            .pipe(
                tap((client) => {
                    this.products = client.products;
                    this.productCtrl.setValue(this.products[0]);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
    generate = (): void => {
        this.contractsService
            .getData(
                this.clientCtrl.value.clientId,
                this.productCtrl.value.productId,
                this.payorsCtrl.value!,
                this.channelCtrl.value!,
                this.therapeuticAreasCtrl.value!,
                this.accountManagerCtrl.value.id,
                this.contractStatusCtrl.value.id,
                this.daysUntilRenewalCtrl.value.days,
                this.activeCtrl.value!,
                this.yearsCtrl.value === "All" ? null : this.yearsCtrl.value,
            )
            .pipe(
                tap((data) => {
                    this.data = data.map((item) => ({ ...item, hasAmendments: item.hasAmendments ? "Yes" : "No" }));
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    };
    get selectedColumns(): IColumn[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: IColumn[]) {
        //restore original order
        this._selectedColumns = this.cols.filter((col) => val.some((v) => v.field === col.field));
    }
}
