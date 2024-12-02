import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { IClient } from "./models/client";
import { IOption } from "./models/option";
import { ITherapeuticCategory } from "./models/payor";
import { OptionsSerializer } from "./options-serializer";

@Injectable({
    providedIn: "root",
})
export class AppService {
    private http = inject(HttpClient);
    private optionsSerializer = inject(OptionsSerializer);

    private getOptions = (field: string, url: string): Observable<IOption[]> => {
        return this.http.get<[]>(url).pipe(
            map((data) => {
                return this.optionsSerializer.fromJsonArray(field, data);
            }),
        );
    };
    getTherapeuticCategories = (): Observable<ITherapeuticCategory[]> => this.http.get<ITherapeuticCategory[]>("api/therapeuticCategory/getTherapeuticCategories");
    getClients = (): Observable<IClient[]> => {
        return this.http.get<IClient[]>("api/clients/getClients?isActive=true&isProspect=false");
    };
    getAccountManagers = () => this.getOptions("accountManagerId", "api/accountManagers/getAccountManagers");
    getCurrentAccountManager = (): Observable<{ accountManagerId: string; name: string }> => {
        return this.http.get<{ accountManagerId: string; name: string }>("api/accountManagers/getCurrentAccountManager");
    };
}
