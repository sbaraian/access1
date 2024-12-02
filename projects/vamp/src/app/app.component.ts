import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router, RouterOutlet } from "@angular/router";
import { NgHttpLoaderModule } from "ng-http-loader";
import { MenuItem } from "primeng/api";
import { AvatarModule } from "primeng/avatar";
import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { MenubarModule } from "primeng/menubar";
import { RippleModule } from "primeng/ripple";
import { ToastModule } from "primeng/toast";

import { filter, switchMap, tap } from "rxjs/operators";
import { AuthService } from "./auth/auth.service";
import { LoginComponent } from "./auth/login.component";
import { BodyStyleService } from "./body-style.service";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [RouterOutlet, MenubarModule, BadgeModule, AvatarModule, RippleModule, CommonModule, ButtonModule, ToastModule, NgHttpLoaderModule],
    providers: [AuthService, DialogService],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
    title = "vamp";
    items: MenuItem[] | undefined;
    private router = inject(Router);
    public authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);
    private bodyStyleService = inject(BodyStyleService);
    public dialogService = inject(DialogService);
    ref: DynamicDialogRef | undefined;
    isAuthenticated = false;

    public currentUser$ = this.authService.currentUser$
        .pipe(
            tap((currentUser) => {
                if (!currentUser) {
                    this.isAuthenticated = false;
                    this.bodyStyleService.removeClass("authorized");
                    this.bodyStyleService.addClass("not-authorized");
                } else {
                    this.isAuthenticated = true;
                    this.bodyStyleService.removeClass("not-authorized");
                    this.bodyStyleService.addClass("authorized");
                }
            }),
            takeUntilDestroyed(),
        )
        .subscribe();

    logout = () => {
        this.authService.logout().subscribe({
            error: () => {
                this.router.navigate(["/login"]);
            },
            complete: () => {
                this.router.navigate(["/login"]);
            },
        });
    };

    ngOnInit() {
        this.authService
            .isLogged()
            .pipe(
                filter((item) => !item),
                switchMap(() => {
                    return this.authService.logout();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        AuthService.showLogin
            .pipe(
                tap((showDialog) => {
                    if (showDialog) {
                        if (!this.ref) {
                            this.ref = this.dialogService.open(LoginComponent, { header: "Login", width: "20vw", modal: true, closeOnEscape: false, closable: false });
                        }
                    } else {
                        if (this.ref) {
                            this.ref.close();
                            this.ref = undefined;
                        }
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.items = [
            /*{
                label: "Client Activity",
                items: [
                    {
                        icon: "pi pi-file-plus",
                        label: "New",
                        route: "/clientActivity/0",
                    },+
                    {
                        icon: "pi pi-search",
                        label: "Search",
                        route: "/clientActivity/clientActivities",
                    },
                ],
            },
            {
                label: "Payer Activity",
                items: [
                    {
                        icon: "pi pi-file-plus",
                        label: "New",
                        route: "/payerActivity/0",
                    },
                    {
                        icon: "pi pi-search",
                        label: "Search",
                        route: "/payerActivity/payerActivities",
                    },
                ],
            },
            {
                label: "MMIT Contacts",
                items: [],
            },
            {
                label: "Reports",
                items: [],
            },*/
            {
                icon: "pi pi-book",
                label: "Payor View",
                route: "/payorView",
            },
            {
                label: "Contracting",
                items: [
                    {
                        icon: "pi pi-file-plus",
                        label: "Initiate New Contracts",
                        route: "/contracts/0",
                    },
                    {
                        icon: "pi pi-list",
                        label: "Contract Management",
                        route: "/contracts",
                    },
                ],
            },
            {
                label: "Analytics",
                items: [
                    {
                        icon: "pi pi-th-large",
                        label: "Product Analog Statistics",
                        route: "/analytics",
                    },
                ],
            } /*
            {
                label: "Administration",
            },*/,
        ];
    }
}
