import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AnalyticProduct, AnalyticSetupResponse, AnalyticSetups } from "./analytic-setup";
import { AnalyticsSerializer } from "./analytics-serializer";
@Injectable({
    providedIn: "root",
})
export class AnalyticsService {
    private serviceUrl = "api/analytics";
    private http = inject(HttpClient);
    private analyticsSerializer = inject(AnalyticsSerializer);

    getSetupNames = (): Observable<AnalyticSetups> => {
        const url = `${this.serviceUrl}/getSetupNames`;
        return this.http.get<AnalyticSetupResponse[]>(url).pipe(
            map((data: AnalyticSetupResponse[]) => {
                return data.reduce(
                    (accumulator, currentValue) => {
                        accumulator[currentValue.typeName] = currentValue.analyticSetups.sort((a, b) => (a?.name ?? "").localeCompare(b?.name ?? ""));
                        return accumulator;
                    },
                    <AnalyticSetups>{},
                );
            }),
        );
    };

    deleteAnalytic = (id: number): Observable<any> => {
        const url = `${this.serviceUrl}/delete/${id}`;
        return this.http.delete<any[]>(url);
    };

    getData = (brandNameId: number, genericNameId?: number, manufacturerId?: number): Observable<AnalyticProduct[]> => {
        const url = `${this.serviceUrl}/getData?brandNameId=${brandNameId}&genericNameId=${genericNameId}&manufacturerId=${manufacturerId}`;
        return this.http.get<AnalyticSetupResponse[]>(url).pipe(map((data) => this.analyticsSerializer.fromJsonArray(data)));
    };

    save = (analytic: AnalyticProduct): Observable<AnalyticProduct | null> => {
        if (!analytic.analyticId) {
            const url = `${this.serviceUrl}/save`;
            return this.http.post<AnalyticProduct>(url, analytic);
        }
        const url = `${this.serviceUrl}/update/${analytic.analyticId}`;
        return this.http.put<AnalyticProduct>(url, analytic);
    };
}
