import { IClient } from "../models/client";
import { IPayor } from "../models/payor";
export interface IContract {
    contractId: number;
    accountDirector: {
        id: string;
        name?: string;
    } | null;
    client: IClient | null;
    payor: IPayor | null;
    title: string | null;
    notes: string | null;
    parentId: number | null;
    contractExecuted: string | Date | null;
    contractNegotiationInitiated: string | Date | null;
    manufacturer: string | Date | null;
    loi: string | Date | null;
    payer: string | Date | null;
    viking: string | Date | null;
    status: string | null;
    productChannels: IProductChannel[];
    contractNotes: IContractNote[];
}
export interface IContractNote {
    contractNoteId: number | null;
    reviewDate: Date | string | null;
    inReviewEntity: string | null;
    note: number | null;
}
export interface IRebate {
    contractProductChannelPrefBrandRebateId: number;
    contractProductChannelPrefBrandId: number;
    rebate: string;
    rebatePercentage: number;
    description: number;
}
export interface IPrefBrands {
    [label: string]: {
        isChecked: boolean;
        exclusionNonExclusionNotes: string | null;
        isCompleted: boolean;
        [exclusion: string]: any;
    };
}
export interface IPpa {
    effectiveDate: string | Date | null;
    endDate: string | Date | null;
    isPpCapCpi: boolean;
    ppCap: number | null;
    shareBellowCap: number | null;
    shareAboveCap: number | null;
    threeYearAverageMedicalCpi: number | null;
    ppCapDescription: number | null;
}

export interface IProductChannel {
    isComplete: boolean | null;
    options: {
        name: string;
        value: { productId: number; channelId: number; name: string };
    }[];
    value?: { productId: number; channelId: number; name: string } | null;
    productId: number | null;
    channelId: number | null;
    effectiveDate: string | Date | null;
    endDate: string | Date | null;
    renewDate: string | Date | null;
    autoRenew: boolean;
    description: string | null;
    isMedical: boolean;
    isPharmacy: boolean;
    prefBrands: IPrefBrands;
    adminFee: number | string | null;
    otherFee: number | string | null;
    gpoEnterpriseFee: number | string | null;
    wacEffectiveDate: string | Date | null;
    otherFeeDescription: string | null;
    dataPortalFee: number | string | null;
    ppas: IPpa[];
    isGpoEnterpriseFeeSlidingScale: boolean | null;
    gpoEnterpriseFeeSlidingScale: number | null;
}
export function createContract(args?: any) {
    let target: IContract = {
        contractId: 0,
        accountDirector: null,
        client: null,
        payor: null,
        title: null,
        notes: null,
        parentId: null,
        contractExecuted: null,
        contractNegotiationInitiated: null,
        manufacturer: null,
        loi: null,
        payer: null,
        viking: null,
        status: null,
        productChannels: [],
        contractNotes: [],
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}
export function createProductChannel(args?: any) {
    let target: IProductChannel = {
        isComplete: false,
        options: [],
        value: null,
        productId: null,
        channelId: null,
        effectiveDate: null,
        endDate: null,
        renewDate: null,
        autoRenew: false,
        description: null,
        isMedical: false,
        isPharmacy: false,
        prefBrands: {
            prefBrandUnrestricted: createProductChannelPrefBrand(),
            prefBrandRestrict: createProductChannelPrefBrand(),
            nonPrefBrandUnRestricted: createProductChannelPrefBrand(),
            nonPrefBrandRestrict: createProductChannelPrefBrand(),
        },
        adminFee: null,
        otherFee: null,
        gpoEnterpriseFee: null,
        wacEffectiveDate: null,
        otherFeeDescription: null,
        dataPortalFee: null,
        ppas: [],
        isGpoEnterpriseFeeSlidingScale: false,
        gpoEnterpriseFeeSlidingScale: null,
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}
export function createPpa(args?: any) {
    let target: IPpa = {
        effectiveDate: null,
        endDate: null,
        isPpCapCpi: false,
        ppCap: null,
        shareBellowCap: null,
        shareAboveCap: null,
        threeYearAverageMedicalCpi: null,
        ppCapDescription: null,
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}
export function createProductChannelPrefBrand(args?: any) {
    let target: any = { isChecked: false, exclusionNonExclusionNotes: null, isCompleted: false };
    if (args) {
        Object.assign(target, args);
    }
    if (!target.exclusion?.rebates?.length) {
        target.exclusion = { isChecked: false, rebates: [] };
    }
    if (!target.nonExclusion?.rebates?.length) {
        target.nonExclusion = { isChecked: false, rebates: [] };
    }
    return target;
}
