import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { IFormulary, IPayor, IPayorActionPlan, IPayorContact, IPayorContractTracking, IPayorNote, IPayorProduct, IPayorTherapeuticCategoryPolicy, IPayorWebsite, IProductTierCategory, createPayorAddress } from "../models/payor";
@Injectable({
    providedIn: "root",
})
export class PayorService {
    private http = inject(HttpClient);

    getPayors = (): Observable<IPayor[]> => {
        return this.http.get<IPayor[]>("api/payors/getPayors?isActive=true").pipe(map((payors: IPayor[]) => payors.map((payor: IPayor) => this.addNameToPayorContact(this.addPayorAddress(payor)))));
    };

    getActionPlans = (payorId: number): Observable<IPayorActionPlan[]> => {
        return this.http.get<IPayorActionPlan[]>(`api/payors/GetActionPlans?payorId=${payorId}`);
    };

    getContractTracking = (payorId: number): Observable<IPayorContractTracking[]> => {
        return this.http.get<IPayorContractTracking[]>(`api/payors/GetContractTracking?payorId=${payorId}`);
    };

    addWebsite = (payorId: number, name: string, url: string): Observable<IPayorWebsite> => {
        return this.http.post<IPayorWebsite>("api/payorWebsites/postPayorWebsite", { payorId, name: name, url: url });
    };

    savePayor = (payor: IPayor): Observable<IPayor> => {
        return this.http.put<IPayor>(`api/payors/putPayor/${payor.payorId}`, payor).pipe(map((payor) => this.addPayorAddress(payor)));
    };

    saveContact = (contact: IPayorContact): Observable<IPayorContact> => {
        if (contact.payorContactId) {
            return this.http.put<IPayorContact>(`api/payorContacts/putPayorContact/${contact.payorContactId}`, contact);
        } else {
            return this.http.post<IPayorContact>(`api/payorContacts/postPayorContact`, contact);
        }
    };

    delete = (payor: IPayor): Observable<any> => {
        return this.http.delete<any>(`api/payors/deletePayor/${payor.payorId}`);
    };

    deleteContact = (contact: IPayorContact): Observable<any> => {
        return this.http.delete<any>(`api/payorContacts/deletePayorContact/${contact.payorContactId}`);
    };

    deleteNote = (id: number): Observable<any> => {
        return this.http.delete<any>(`api/payorActivities/deletePayorActivity/${id}`);
    };

    getNotesTotalRows = (payorId: number, clientId: number, clientContactId: number, payorContactId: number, productId: number, accountManagerId: string, startDate: string, endDate: string): Observable<number> => {
        return this.http
            .get<{ total: number }>(`api/reports/getPayorReportDataCount?accountManagerId=${accountManagerId}&clientContactId=${clientContactId}&clientId=${clientId}&endDate=${endDate}&payorContactId=${payorContactId}&payorId=${payorId}&productId=${productId}&startDate=${startDate}`)
            .pipe(map((data) => data.total));
    };

    getNotes = (currentPage: number, pageSize: number, payorId: number, clientId: number, clientContactId: number, payorContactId: number, productId: number, accountManagerId: string, startDate: string, endDate: string): Observable<IPayorNote[]> => {
        return this.http
            .get<
                IPayorNote[]
            >(`api/reports/getPayorReportData?currentPage=${currentPage}&pageSize=${pageSize}&accountManagerId=${accountManagerId}&clientContactId=${clientContactId}&clientId=${clientId}&endDate=${endDate}&payorContactId=${payorContactId}&payorId=${payorId}&productId=${productId}&startDate=${startDate}`)
            .pipe(map((data) => data.map((item) => ({ ...item, key: `${item.payorActivityId}-${item.clientActivityId}`, noteType: item.payorActivityId ? "Payor Note" : "Client Note" }))));
    };
    getPayorTherapeuticCategoryPolicies = (payorId: number, therapeuticCategoryId: number): Observable<IPayorTherapeuticCategoryPolicy> => {
        return this.http.get<IPayorTherapeuticCategoryPolicy>(`api/therapeuticCategory/getPayorTherapeuticCategoryPolicy?payorId=${payorId}&therapeuticCategoryId=${therapeuticCategoryId}`);
    };
    savePayorTherapeuticCategoryPolicies = (policy: IPayorTherapeuticCategoryPolicy): Observable<any> => {
        return this.http.post("api/therapeuticCategory/postPayorTherapeuticCategoryPolicy", policy);
    };
    savePayorProduct = (product: IPayorProduct): Observable<any> => {
        return this.http.post("api/products/postPayorProductPolicy", product);
    };
    getPayorProducts = (payorId: number, clientId: number, therapeuticCategoryId: number): Observable<IPayorProduct[]> => {
        return this.http.get<IPayorProduct[]>(`api/products/getPayorProducts?payorId=${payorId}&clientId=${clientId}&therapeuticCategoryId=${therapeuticCategoryId}`);
    };
    getFormulary = (payorId: number, clientId: number, therapeuticCategoryId: number): Observable<IFormulary[]> => {
        return this.http.get<IFormulary[]>(`api/products/getFormularies?clientId=${clientId}&payorId=${payorId}&therapeuticCategoryId=${therapeuticCategoryId}`).pipe(
            map((data) => {
                return [
                    ...data.map((formulary) => ({
                        ...formulary,
                        productTierCategories: formulary.productTierCategories.map((productTierCategory: IProductTierCategory) => ({
                            ...productTierCategory,
                            ...productTierCategory.tierCategories.reduce((acc: any, cur: { name: string; value: boolean }) => {
                                acc[cur.name] = cur.value;
                                return acc;
                            }, {}),
                        })),
                    })),
                ];
            }),
        );
    };

    saveFormulary = (clientId: number, payorId: number, therapeuticCategoryId: number, formularies: IFormulary[]): Observable<any> => {
        const payload = { payorId: payorId, clientId: clientId, therapeuticCategoryId: therapeuticCategoryId, data: formularies };
        return this.http.post("api/Products/postFormularies", payload);
    };

    private addPayorAddress = (payor: IPayor): IPayor => {
        if (payor.payorAddresses?.length) {
            let payorAddress = payor.payorAddresses.find((item) => item.isDefault);
            payor.payorAddress = !payorAddress ? payor.payorAddresses[0] : payorAddress;
        } else {
            payor.payorAddress = createPayorAddress({});
        }
        return payor;
    };

    private addNameToPayorContact = (payor: IPayor): IPayor => {
        if (payor.payorContacts?.length) {
            payor.payorContacts.forEach((item) => {
                item.name = item.firstName?.length ? `${item.firstName}` : "";
                if (item.lastName?.length) {
                    item.name = item.name.length ? ` ${item.lastName}` : item.lastName;
                }
            });
        } else {
            payor.payorAddress = createPayorAddress({});
        }
        return payor;
    };
}
