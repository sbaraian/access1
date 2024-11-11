import { Routes } from "@angular/router";
import { AnalyticsComponent } from "./analytics/analytics.component";
import { AuthGuard } from "./auth/auth.guard";
import { EmptyComponent } from "./auth/empty.component";
import { LoginComponent } from "./auth/login.component";
import { ContractComponent } from "./contracts/contract.component";
import { ContractsComponent } from "./contracts/contracts.component";

export const routes: Routes = [
    { path: "analytics", component: AnalyticsComponent, canActivate: [AuthGuard] },
    { path: "contracts/:id", component: ContractComponent, canActivate: [AuthGuard] },
    { path: "contracts", component: ContractsComponent, canActivate: [AuthGuard] },
    { path: "login", component: LoginComponent },
    { path: "**", component: EmptyComponent, canActivate: [AuthGuard] },
];
