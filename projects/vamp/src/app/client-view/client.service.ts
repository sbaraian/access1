import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { IClient, IClientContact, IProduct, IProductDetail } from "../models/client";
import { ITherapeuticCategory } from "../models/payor";
@Injectable({
    providedIn: "root",
})
export class ClientService {
    private http = inject(HttpClient);

    getClients = (isActive?: boolean, isProspect?: boolean): Observable<IClient[]> => {
        let url = "api/clients/getClients";
        let hasQueryString = false;
        if (isActive !== undefined) {
            hasQueryString = true;
            url = `${url}?isActive=${isActive}`;
        }
        if (isProspect !== undefined) {
            url = `${url}${hasQueryString ? "&" : "?"}isProspect=${isProspect}`;
        }
        return this.http.get<IClient[]>(url);
    };

    saveClient = (client: IClient): Observable<IClient> => {
        if (client.clientId) {
            return this.http.put<IClient>(`api/clients/putClient/${client.clientId}`, client);
        } else {
            return this.http.post<IClient>(`api/clients/postClient`, client);
        }
    };

    saveContact = (contact: IClientContact): Observable<IClientContact> => {
        if (contact.clientContactId) {
            return this.http.put<IClientContact>(`api/clientContacts/putClientContact/${contact.clientContactId}`, contact);
        } else {
            return this.http.post<IClientContact>(`api/clientContacts/postClientContact`, contact);
        }
    };

    saveProduct = (product: IProduct): Observable<IProduct> => {
        if (product.productId) {
            return this.http.put<IProduct>(`api/products/putProduct/${product.productId}`, product);
        } else {
            return this.http.post<IProduct>(`api/products/postProduct`, product);
        }
    };

    saveTherapeuticCategory = (therapeuticCategory: ITherapeuticCategory): Observable<ITherapeuticCategory> => {
        if (therapeuticCategory.therapeuticCategoryId) {
            return this.http.put<ITherapeuticCategory>(`api/therapeuticCategory/putTherapeuticCategory/${therapeuticCategory.therapeuticCategoryId}`, therapeuticCategory);
        } else {
            return this.http.post<ITherapeuticCategory>(`api/therapeuticCategory/postTherapeuticCategory`, therapeuticCategory);
        }
    };

    saveProductDetail = (productDetail: IProductDetail): Observable<IProductDetail> => {
        if (productDetail.productDetailId) {
            return this.http.put<IProductDetail>(`api/productDetails/putProductDetail/${productDetail.productDetailId}`, productDetail);
        } else {
            return this.http.post<IProductDetail>(`api/productDetails/postProductDetail`, productDetail);
        }
    };

    delete = (client: IClient): Observable<any> => {
        return this.http.delete<any>(`api/clients/deleteClient/${client.clientId}`);
    };

    deleteTherapeuticCategory = (therapeuticCategory: ITherapeuticCategory): Observable<any> => {
        return this.http.delete<any>(`api/therapeuticCategory/deleteTherapeuticCategory/${therapeuticCategory.therapeuticCategoryId}`);
    };

    deleteContact = (contact: IClientContact): Observable<any> => {
        return this.http.delete<any>(`api/clientContacts/deleteClientContact/${contact.clientContactId}`);
    };

    deleteProductDetail = (detail: IProductDetail): Observable<any> => {
        return this.http.delete<any>(`api/productDetails/deleteProductDetail/${detail.productDetailId}`);
    };

    getNotesTotalRows = (payorId: number, clientId: number, clientContactId: number, payorContactId: number, productId: number, accountManagerId: string, startDate: string, endDate: string): Observable<number> => {
        return this.http
            .get<{ total: number }>(`api/reports/getClientReportDataCount?accountManagerId=${accountManagerId}&clientContactId=${clientContactId}&clientId=${clientId}&endDate=${endDate}&payorContactId=${payorContactId}&payorId=${payorId}&productId=${productId}&startDate=${startDate}`)
            .pipe(map((data) => data.total));
    };

    deleteNote = (id: number): Observable<any> => {
        return this.http.delete<any>(`api/clientActivities/deleteClientActivity/${id}`);
    };
}
