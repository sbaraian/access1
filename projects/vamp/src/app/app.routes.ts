import { Routes } from "@angular/router";
import { AnalyticsComponent } from "./analytics/analytics.component";
import { AuthGuard } from "./auth/auth.guard";
import { EmptyComponent } from "./auth/empty.component";
import { ContractComponent } from "./contracts/contract.component";
import { ContractsComponent } from "./contracts/contracts.component";
import { PayorViewComponent } from "./payor-view/payor-view.component";

export const routes: Routes = [
    { path: "analytics", component: AnalyticsComponent, canActivate: [AuthGuard] },
    { path: "contracts/:id", component: ContractComponent, canActivate: [AuthGuard] },
    { path: "contracts", component: ContractsComponent, canActivate: [AuthGuard] },
    { path: "payorView", component: PayorViewComponent, canActivate: [AuthGuard] },
    { path: "**", component: EmptyComponent },
];
