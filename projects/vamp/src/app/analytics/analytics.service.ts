import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { AnalyticSetupResponse, AnalyticSetups } from "./analytic-setup";
import { AnalyticsSerializer } from "./analytics-serializer";
@Injectable({
    providedIn: "root",
})
export class AnalyticsService {
    private serviceUrl = "api/analytics";
    constructor(
        private http: HttpClient,
        private analyticsSerializer: AnalyticsSerializer,
    ) {}

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

    getData = (brandNameId: number, genericNameId?: number, manufacturerId?: number): Observable<any> => {
        const url = `${this.serviceUrl}/getData?brandNameId=${brandNameId}&genericNameId=${genericNameId}&manufacturerId=${manufacturerId}`;
        return this.http.get<AnalyticSetupResponse[]>(url).pipe(
            map((data) => this.analyticsSerializer.fromJsonArray(data)),
            tap(console.log),
        );
    };
}
