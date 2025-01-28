import { Injectable } from "@angular/core";
import { DateTime } from "luxon";
import { IContract, IContractNote, IPpa, IProductChannel } from "./contract";

@Injectable({
    providedIn: "root",
})
export class ContractsSerializer {
    fromJsonArray = (jsonArray: any): IContract[] => {
        if (Array.isArray(jsonArray) && jsonArray.length) {
            return jsonArray.map((json) => this.fromJson(json));
        }
        return [];
    };
    fromJson = (json: any): IContract => ({
        ...json,
        contractNotes: json.contractNotes ? json.contractNotes.map((item: IContractNote) => ({ ...item, reviewDate: DateTime.fromFormat(item.reviewDate as string, "MM/dd/yyyy").toJSDate() })) : [],
        productChannels: json.productChannels.map((item: IProductChannel) => ({
            ...item,
            gpoEnterpriseFee: item.isGpoEnterpriseFeeSlidingScale ? "sliding scale" : item.gpoEnterpriseFee,
            ppas: item.ppas
                ? item.ppas.map((ppa: IPpa) => ({
                      ...ppa,
                      ppCap: ppa.threeYearAverageMedicalCpi && !ppa.ppCap ? "CPI" : ppa.ppCap,
                  }))
                : [],
        })),
    });
}
