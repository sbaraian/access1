import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { IContract } from "./contract";
import { ContractsSerializer } from "./contracts.serializer";

@Injectable({
    providedIn: "root",
})
export class ContractsService {
    private http = inject(HttpClient);
    private contractsSerializer = inject(ContractsSerializer);
    public static contractId: number = 0;

    getData = (clientId: number, productId: number, payorId: number, channelId: number, therapeuticCategoryId: number, accountDirectorId: string, contractStatusId: number, renewal: number, activeStatusId: number, year: number): Observable<IContract[]> => {
        const url = `api/contracts/getData?clientId=${clientId}&productId=${productId}&payorId=${channelId}&channelId=${clientId}&therapeuticCategoryId=${therapeuticCategoryId}&accountDirectorId=${accountDirectorId}&contractStatusId=${contractStatusId}&renewal=${renewal}&activeStatusId=${activeStatusId}&year=${year}`;
        return this.http.get<IContract[]>(url);
    };

    get = (contractId: number): Observable<IContract> => {
        const url = `api/contracts/getContract?id=${contractId}`;
        return this.http.get<IContract>(url).pipe(map((data: IContract) => this.contractsSerializer.fromJson(data)));
    };

    delete = (contractId: number): Observable<any> => {
        const url = `api/contracts/delete/${contractId}`;
        return this.http.delete(url);
    };

    save = (contract: IContract): Observable<number> => {
        const url = contract.contractId ? `api/contracts/update/${contract.contractId}` : "api/contracts/save";
        return contract.contractId ? this.http.put<IContract>(url, contract).pipe(map((_) => contract.contractId)) : this.http.post<IContract>(url, contract).pipe(map((data) => data.contractId));
    };
}
