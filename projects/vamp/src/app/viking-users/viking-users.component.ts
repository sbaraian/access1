import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CheckboxModule } from "primeng/checkbox";
import { DialogService, DynamicDialogModule, DynamicDialogRef } from "primeng/dynamicdialog";
import { MultiSelectModule } from "primeng/multiselect";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { BehaviorSubject, combineLatest, EMPTY } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";

import { AppService } from "../app.service";
import { ClientService } from "../client-view/client.service";
import { ConfirmDialogHeadless } from "../confirm-dialog-headless/confirm-dialog-headless.component";
import { IClient } from "../models/client";
import { IColumn, IOption } from "../models/option";
import { createUser, IUser } from "../models/user";
import { utils } from "../utils";
import { UserService } from "./user.service";
import { VikingUserComponent } from "./viking-user.component";
@Component({
    selector: "app-users",
    standalone: true,
    imports: [ButtonGroupModule, ButtonModule, CheckboxModule, CommonModule, ConfirmDialogHeadless, DynamicDialogModule, FormsModule, MultiSelectModule, OverlayPanelModule, TableModule, ToastModule, ReactiveFormsModule],
    templateUrl: "./viking-users.component.html",
    styleUrl: "./viking-users.component.scss",
    providers: [ConfirmationService, DialogService, MessageService],
})
export class VikingUsersComponent implements OnInit {
    private appService = inject(AppService);
    private destroyRef = inject(DestroyRef);
    dialogService = inject(DialogService);
    private userService = inject(UserService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private route = inject(ActivatedRoute);
    private clientService = inject(ClientService);
    ref: DynamicDialogRef | undefined;
    selectedColumnsCtrl = new FormControl();
    acceptLabel = "Delete";
    rejectLabel = "Cancel";
    _selectedColumns: IColumn[] = [];
    cols: IColumn[] = [
        { field: "name", header: "Name" },
        { field: "userName", header: "User Name" },
        { field: "email", header: "Email" },
        { field: "roles", header: "Roles", type: "array" },
        { field: "manager.name", header: "Manager", type: "hierarchy" },
        { field: "isActive", header: "Active", type: "boolean" },
        { field: "hasMultipleAccountManagers", header: "Multiple Account Manager", type: "boolean" },
    ];
    users: IUser[] = [];
    refresh$ = new BehaviorSubject(true);
    roles: string[] = [];
    accountManagers: IOption[] = [];
    clients: IClient[] = [];
    getValue = utils.getValue;
    isClientUser = false;

    delete = (user: IUser) => {
        this.confirmationService.confirm({
            header: `Are you sure you want to delete ${user.name}?`,
            message: "Please confirm to proceed.",
            accept: () => {
                this.userService
                    .deleteUser(user)
                    .pipe(
                        tap(() => {
                            this.messageService.add({ severity: "success", summary: "Success", detail: "Successful delete", life: 3000, key: "users" });
                        }),
                        catchError((err) => {
                            this.messageService.add({ severity: "error", summary: "Error", detail: err?.error?.message ?? err.statusText, life: 3000, key: "users" });
                            return EMPTY;
                        }),
                        takeUntilDestroyed(this.destroyRef),
                    )
                    .subscribe();
            },
        });
    };

    open = (vikingUser: IUser | null): void => {
        const header = vikingUser === null ? "New Viking User" : vikingUser.name;
        if (vikingUser === null) {
            vikingUser = createUser({});
        }
        this.ref = this.dialogService.open(VikingUserComponent, {
            // width: "50vw",
            // height: "100vh",
            modal: true,
            header: header,
            data: {
                user: vikingUser,
                roles: this.roles,
                accountManagers: this.accountManagers,
                clients: this.clients,
                isClientUser: this.isClientUser,
            },
        });
        this.ref.onClose.subscribe((result: IUser) => {
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
        this.isClientUser = this.route.snapshot.data["isClientUser"];
        if (this.isClientUser) {
            this.cols.unshift({ field: "client.name", header: "Client", type: "hierarchy" });
        }
        combineLatest({ accountManagers: this.appService.getAccountManagers(), roles: this.userService.getAllRoles(), clients: this.clientService.getClients() })
            .pipe(
                tap((data: { accountManagers: IOption[]; roles: string[]; clients: IClient[] }) => {
                    this.clients = data.clients;
                    this.roles = data.roles;
                    this.accountManagers = data.accountManagers;
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

        this.refresh$
            .pipe(
                switchMap((_) =>
                    this.userService.getUsers(this.isClientUser).pipe(
                        tap((data) => {
                            this.users = data;
                        }),
                    ),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
}
