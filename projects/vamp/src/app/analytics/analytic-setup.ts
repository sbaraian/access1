import { DateTime } from "luxon";

export interface AnalyticSetupResponse {
    typeName: string;
    analyticSetups: AnalyticSetup[];
}
export interface AnalyticSetup {
    analyticSetupId?: number;
    analyticSetupNameId?: number;
    typeName?: string;
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
}
export interface AnalyticSetups {
    [name: string]: AnalyticSetup[];
}
export interface AnalyticProduct {
    analyticId?: number;
    brandName: AnalyticSetup;
    genericName: AnalyticSetup;
    manufacturer: AnalyticSetup;
    dateOfEntryIntoMarket?: DateTime;
    fdaApproval?: DateTime;
    mechanismOfAction?: string;
    approvalStatusId?: number;
    isFirstInClass?: boolean | null;
    complexityOfTherapyId?: number;
    isBiosimilar?: boolean | null;
    is505B2?: boolean | null;
    isBlackBoxWarning?: boolean | null;
    isAdditionalManufacturerProductsInSameTa?: boolean | null;
    additionalInformation?: string;
    additionalManufacturerProductsInSameTas?: AnalyticSetup[];
    analyticIndications: AnalyticIndication[];
}
export interface AnalyticIndication {
    analyticIndicationId?: number;
    indication?: string;
    lineOfTherapyId?: number;
    treatmentTypeId?: number;
    usageId?: number;
    patientPopulationSizeId?: number;
    mostCommonUse?: number;
    isOrphanDrugStatus?: boolean | null;
    isOncology?: boolean | null;
    currentCancerType?: null;
    otherAreasOfStudy?: null;
    nccnGuidelines?: null;
    isOffLabelUse?: boolean | null;
    cancerType?: null;
    offLabelNccnGuidelines?: null;
    lineOfTherapyString?: string;
    dosingPo?: string;
    dosingSqSelf?: string;
    dosingSqHp?: string;
    dosingImSelf?: string;
    dosingImHp?: string;
    dosingIv?: string;
    isDosingPo?: boolean | null;
    isDosingSqSelf?: boolean | null;
    isDosingSqHp?: boolean | null;
    isDosingImSelf?: boolean | null;
    isDosingImHp?: boolean | null;
    isDosingIv?: boolean | null;
    wacPerUnit?: number;
    isPriceIncreasedBy5?: boolean | null;
    unitPerPackage?: string;
    benefitId?: number;
    isRebateContracting?: boolean | null;
    payerTypeId?: number;
    isPatentExpiration?: boolean | null;
    patentExpirationDate?: DateTime;
    isGenericCompetition?: boolean | null;
    whenIsGenericCompetitionAnticipated?: null;
    isBiosimilarCompetition?: null;
    isBrandCompetition?: boolean | null;
    is505B2Competition?: boolean | null;
    isAuthorizedGenericCompetition?: boolean | null;
    isIcerReview?: boolean | null;
    icerReviewDate?: DateTime;
    icerReviewDetails?: string;
    isClinicalEfficacyDifferentiation?: boolean | null;
    clinicalEfficacyDifferentiation?: string;
    isClinicalSafetyDifferentiation?: boolean | null;
    clinicalSafetyDifferentiation?: string;
    analyticIndicationDetails: AnalyticSetup[];
    levelOfRebateContractingId?: number | null;
    analyticIndicationCompetitions: AnalyticIndicationCompetition[];
    details: { [typeName: string]: number[] };
}
export interface AnalyticIndicationCompetition {
    analyticIndicationCompetitionId: number;
    analyticIndicationId: number;
    sortOrder: number;
    competitorManufacturer: AnalyticSetup | null;
    competitorProduct: AnalyticSetup | null;
    clinicalBenefitOverCompetitorId: number | null;
    safetyId: number | null;
    competitorPrice: number | null;
    competitorProductId: number | undefined;
}
