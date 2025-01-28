import { Routes } from "@angular/router";
import { AnalyticsComponent } from "./analytics/analytics.component";
import { AuthGuard } from "./auth/auth.guard";
import { EmptyComponent } from "./auth/empty.component";
import { ClientComponent } from "./client/client.component";
import { ClientsComponent } from "./client/clients.component";
import { ContractComponent } from "./contracts/contract.component";
import { ContractsComponent } from "./contracts/contracts.component";
import { PayorViewComponent } from "./payor-view/payor-view.component";
import { PayorComponent } from "./payor/payor.component";
import { PayorsComponent } from "./payor/payors.component";
import { VikingUsersComponent } from "./viking-users/viking-users.component";

export const routes: Routes = [
    { path: "analytics", component: AnalyticsComponent, canActivate: [AuthGuard] },
    { path: "contracts/:id", component: ContractComponent, canActivate: [AuthGuard] },
    { path: "contracts", component: ContractsComponent, canActivate: [AuthGuard] },
    { path: "payorView", component: PayorViewComponent, canActivate: [AuthGuard] },
    { path: "payors/:id", component: PayorComponent, canActivate: [AuthGuard] },
    { path: "payors", component: PayorsComponent, canActivate: [AuthGuard] },
    { path: "clients/:id", component: ClientComponent, canActivate: [AuthGuard] },
    { path: "clients", component: ClientsComponent, canActivate: [AuthGuard] },
    { path: "viking-users", component: VikingUsersComponent, canActivate: [AuthGuard], data: { isClientUser: false } },
    { path: "client-users", component: VikingUsersComponent, canActivate: [AuthGuard], data: { isClientUser: true } },
    { path: "**", component: EmptyComponent },
];
