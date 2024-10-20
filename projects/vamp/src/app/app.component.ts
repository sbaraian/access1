import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { MenuItem } from "primeng/api";
import { AvatarModule } from "primeng/avatar";
import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";
import { MenubarModule } from "primeng/menubar";
import { RippleModule } from "primeng/ripple";
import { ToastModule } from "primeng/toast";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [RouterOutlet, MenubarModule, BadgeModule, AvatarModule, RippleModule, CommonModule, ButtonModule, ToastModule],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
    title = "vamp";
    items: MenuItem[] | undefined;

    constructor(private router: Router) {}
    ngOnInit() {
        this.items = [
            {
                label: "Client Activity",
                items: [
                    {
                        icon: "pi pi-file-plus",
                        label: "New",
                        route: "/clientActivity/0",
                    },
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
            },
            {
                label: "Contracting",
                items: [],
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
            },
            {
                label: "Administration",
            },
        ];
    }
}
