import { Injectable } from "@angular/core";
import { AnalyticIndication, AnalyticIndicationCompetition, AnalyticProduct, AnalyticSetup } from "./analytic-setup";
@Injectable({
    providedIn: "root",
})
export class AnalyticsSerializer {
    fromJsonArray = (jsonArray: any): AnalyticProduct[] => {
        if (Array.isArray(jsonArray) && jsonArray.length) {
            return jsonArray.map((json) => this.fromJson(json));
        }
        return [];
    };
    fromJson = (json: any): AnalyticProduct => ({
        analyticId: json.analyticId,
        brandName: json.brandName,
        genericName: json.genericName,
        manufacturer: json.manufacturer,
        dateOfEntryIntoMarket: json.dateOfEntryIntoMarket,
        fdaApproval: json.fdaApproval,
        mechanismOfAction: json.mechanismOfAction,
        approvalStatusId: json.approvalStatusId,
        isFirstInClass: json.isFirstInClass,
        complexityOfTherapyId: json.complexityOfTherapyId,
        isBiosimilar: json.isBiosimilar,
        is505B2: json.is505B2,
        isBlackBoxWarning: json.isBlackBoxWarning,
        isAdditionalManufacturerProductsInSameTa: json.isAdditionalManufacturerProductsInSameTa,
        additionalInformation: json.additionalInformation,
        additionalManufacturerProductsInSameTas: json.additionalManufacturerProductsInSameTas.map((item: AnalyticSetup) => item.analyticSetupId),
        analyticIndications: [
            ...json.analyticIndications.map((item: AnalyticIndication) => ({
                ...item,
                analyticIndicationCompetitions: item.analyticIndicationCompetitions
                    .map((elem) => ({ ...elem, competitorProductId: elem.competitorProduct?.analyticSetupId, competitorManufacturerId: elem.competitorManufacturer?.analyticSetupId }))
                    .sort((a: AnalyticIndicationCompetition, b: AnalyticIndicationCompetition) => a.sortOrder - b.sortOrder),
                details: item.analyticIndicationDetails.reduce(
                    (accumulator, currentValue) => {
                        if (!accumulator[currentValue.typeName!]) {
                            accumulator[currentValue.typeName!] = [];
                        }
                        accumulator[currentValue.typeName!].push(currentValue.analyticSetupId!);
                        return accumulator;
                    },
                    <{ [typeName: string]: number[] }>{},
                ),
            })),
        ],
    });
}
