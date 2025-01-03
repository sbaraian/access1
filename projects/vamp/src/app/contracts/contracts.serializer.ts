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
            wacEffectiveDate: item.wacEffectiveDate ? DateTime.fromFormat(item.wacEffectiveDate as string, "MM/dd/yyyy").toJSDate() : item.wacEffectiveDate,
            effectiveDate: item.effectiveDate ? DateTime.fromFormat(item.effectiveDate as string, "MM/dd/yyyy").toJSDate() : item.effectiveDate,
            endDate: item.endDate ? DateTime.fromFormat(item.endDate as string, "MM/dd/yyyy").toJSDate() : item.endDate,
            gpoEnterpriseFee: item.isGpoEnterpriseFeeSlidingScale ? "sliding scale" : item.gpoEnterpriseFee,
            ppas: item.ppas
                ? item.ppas.map((ppa: IPpa) => ({
                      ...ppa,
                      effectiveDate: ppa.effectiveDate ? DateTime.fromFormat(ppa.effectiveDate as string, "MM/dd/yyyy").toJSDate() : null,
                      endDate: ppa.endDate ? DateTime.fromFormat(ppa.endDate as string, "MM/dd/yyyy").toJSDate() : null,
                      ppCap: ppa.threeYearAverageMedicalCpi && !ppa.ppCap ? "CPI" : ppa.ppCap,
                  }))
                : [],
        })),
    });
}
