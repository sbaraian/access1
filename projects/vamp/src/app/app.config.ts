import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { provideRouter, withComponentInputBinding, withHashLocation } from "@angular/router";
import { pendingRequestsInterceptor$ } from "ng-http-loader";
import { MessageService } from "primeng/api";
import { routes } from "./app.routes";
export const appConfig: ApplicationConfig = {
    providers: [importProvidersFrom(BrowserAnimationsModule), provideHttpClient(withInterceptors([pendingRequestsInterceptor$])), provideZoneChangeDetection({ eventCoalescing: true }), MessageService, provideRouter(routes, withHashLocation(), withComponentInputBinding())],
};
