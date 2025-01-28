import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ButtonGroupModule } from "primeng/buttongroup";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from "primeng/dynamicdialog";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MultiSelectModule } from "primeng/multiselect";
import { PasswordModule } from "primeng/password";

import { OverlayPanelModule } from "primeng/overlaypanel";
import { PanelModule } from "primeng/panel";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { EMPTY } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { createClient, IClient } from "../models/client";
import { IColumn, IOption } from "../models/option";
import { IUser } from "../models/user";
import { UserService } from "./user.service";

@Component({
    selector: "app-viking-user",
    standalone: true,
    imports: [
        ButtonGroupModule,
        ButtonModule,
        CardModule,
        CheckboxModule,
        CommonModule,
        DividerModule,
        DropdownModule,
        DynamicDialogModule,
        FloatLabelModule,
        FormsModule,
        InputTextareaModule,
        InputTextModule,
        MultiSelectModule,
        OverlayPanelModule,
        PanelModule,
        TableModule,
        ToastModule,
        ReactiveFormsModule,
        CalendarModule,
        InputMaskModule,
        PasswordModule,
    ],
    templateUrl: "./viking-user.component.html",
    styleUrl: "./viking-user.component.scss",
    providers: [DialogService],
})
export class VikingUserComponent implements OnInit {
    private config = inject(DynamicDialogConfig);
    private destroyRef = inject(DestroyRef);
    dialogService = inject(DialogService);
    private userService = inject(UserService);
    private messageService = inject(MessageService);
    _selectedColumnsContacts: IColumn[] = [];
    _selectedProductsColumns: IColumn[] = [];
    private userRef = inject(DynamicDialogRef);

    ref: DynamicDialogRef | undefined;
    user!: IUser;
    roles: { name: string; checked: boolean }[] = [];
    accountManagers: IOption[] = [];
    clients: IClient[] = [];
    isClientUser = false;

    ngOnInit() {
        this.user = this.config.data.user;
        this.isClientUser = this.config.data.isClientUser;
        this.user.accountManagerId = this.user.accountManagerId ?? "0";
        this.user.clientId = this.user.clientId ?? 0;
        this.accountManagers = [{ id: "0", name: "none" }, ...this.config.data.accountManagers];
        this.clients = [{ clientId: 0, name: "none" }, ...this.config.data.clients];
        this.roles = this.config.data.roles.map((item: string) => ({ name: item, checked: this.user.roles.includes(item) }));
    }

    isValid = (): boolean => {
        if (!this.user.name?.length) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please enter a name", life: 3000, key: "users" });
            return false;
        }
        if (!this.user.userName?.length) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please enter a user name", life: 3000, key: "users" });
            return false;
        }
        if (!this.user.email?.length) {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Please enter an email", life: 3000, key: "users" });
            return false;
        }
        if (this.user.resetPassword) {
            if (!this.user.password?.length) {
                this.messageService.add({ severity: "error", summary: "Error", detail: "Please enter a password", life: 3000, key: "users" });
                return false;
            }
            if (!this.user.confirmPassword?.length) {
                this.messageService.add({ severity: "error", summary: "Error", detail: "Please enter a confirm password", life: 3000, key: "users" });
                return false;
            }
            if (this.user.password !== this.user.confirmPassword) {
                this.messageService.add({ severity: "error", summary: "Error", detail: "Password and confirm password are different", life: 3000, key: "users" });
                return false;
            }
        }
        return true;
    };

    save = (): void => {
        if (this.isValid()) {
            this.user.roles = this.roles.filter((item) => item.checked).map((item) => item.name);
            if (this.user.accountManagerId === "0") {
                this.user.accountManagerId = null;
            }
            if (this.user.accountManagerId) {
                const accountManager = this.accountManagers.find((item) => item.id === this.user.accountManagerId);
                if (accountManager) {
                    this.user.manager = { accountManagerId: this.user.accountManagerId, name: accountManager.name };
                } else {
                    this.user.manager = null;
                }
            } else {
                this.user.manager = null;
            }

            if (this.user.clientId) {
                const client = this.clients.find((item) => item.clientId === this.user.clientId);
                if (client) {
                    this.user.client = createClient({ clientId: this.user.clientId, name: client.name });
                } else {
                    this.user.client = null;
                }
            } else {
                this.user.client = null;
            }
            this.userService
                .saveVikingUser(this.user)
                .pipe(
                    tap((_) => {
                        this.messageService.add({ severity: "success", summary: "Success", detail: `Viking User ${this.user.name} saved.`, life: 3000, key: "users" });
                        this.userRef.close(this.user!);
                    }),
                    catchError((err) => {
                        this.messageService.add({ severity: "error", summary: "Error", detail: err?.error?.message ?? err.statusText, life: 3000, key: "users" });
                        return EMPTY;
                    }),
                    takeUntilDestroyed(this.destroyRef),
                )
                .subscribe();
        }
    };
}
