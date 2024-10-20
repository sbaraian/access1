import { provideHttpClient } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { MessageService } from "primeng/api";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
    providers: [importProvidersFrom(BrowserAnimationsModule), provideHttpClient(), provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), MessageService],
};
