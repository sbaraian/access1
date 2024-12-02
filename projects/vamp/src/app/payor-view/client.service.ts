import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class ClientService {
    private http = inject(HttpClient);

    getNotesTotalRows = (payorId: number, clientId: number, clientContactId: number, payorContactId: number, productId: number, accountManagerId: string, startDate: string, endDate: string): Observable<number> => {
        return this.http
            .get<{ total: number }>(`api/reports/getClientReportDataCount?accountManagerId=${accountManagerId}&clientContactId=${clientContactId}&clientId=${clientId}&endDate=${endDate}&payorContactId=${payorContactId}&payorId=${payorId}&productId=${productId}&startDate=${startDate}`)
            .pipe(map((data) => data.total));
    };

    deleteNote = (id: number): Observable<any> => {
        return this.http.delete<any>(`api/clientActivities/deleteClientActivity/${id}`);
    };
}
