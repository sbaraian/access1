export interface IPayorProduct {
    productId: number;
    payorId: number;
    name: string;
    medicareExpectedCoverage: string;
    medicareActionPlan: string;
    commercialExpectedCoverage: string;
    commercialActionPlan: string;
}
export interface IPayorTherapeuticCategoryPolicy {
    payorId?: number;
    therapeuticCategoryId?: number;
    commercial?: string | null;
    medicare?: string | null;
}
export interface ITherapeuticCategory {
    therapeuticCategoryId: number;
    name: string;
    hasPolicy: boolean | null;
}
export interface IFormulary {
    formularyId: number;
    name: string;
    productTierCategories: IProductTierCategory[];
}
export interface IProductTierCategory {
    productId: number;
    name: string;
    isCompetitor: boolean;
    tierCategories: ITierCategory[];
    [label: string]: any;
}
export interface ITierCategory {
    tierCategoryId: number;
    name: string;
    value: boolean;
}
export interface IPayorNote {
    clientId: number;
    clientActivityId: number;
    payorActivityId: number;
    startDate: string;
    endDate: string | null;
    client: string;
    product: string;
    payor: string;
    subject: string;
    channel: string;
    type: string;
    description: string;
    clientNotes: string;
    nextSteps: string;
    contacts: string;
    typeOfActivity: string;
    dates: string;
    modifiedDateAsDate: string;
    modifiedDate: string;
    accountManagers: string;
    secondAccountManagers: string;
    total: number;
    dataKey: string;
    noteType: string;
}
export interface IPayorAddress {
    payorId: number | null;
    payorAddressId: number | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    phone: string | null;
    isDefault: boolean;
}
export interface IPayorContractTracking {
    payorContractTrackingId: number;
    clientId: number;
    payorId: number;
    IsContractTerms: boolean | null;
    IsContractNegotiation: boolean | null;
    IsInProcessRedLining: boolean | null;
    IsInSignatureProcess: boolean | null;
    IsFullyExecuted: boolean | null;
    Comments: string | null;
}
export interface IPayorWebsite {
    payorWebsiteId: number | null;
    payorId: number | null;
    url: string | null;
    name: string | null;
}
export interface IPayorContact {
    payorContactId: number | null;
    firstName: string | null;
    lastName: string | null;
    jobFunction: string | null;
    title: string | null;
    email: string | null;
    officePhone: string | null;
    cellPhone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    payorId: number | null;
    vip: boolean;
    isActive: boolean;
    dateAdded: Date | null;
    name?: string;
}
export interface IPayor {
    payorId: number | null;
    name: string;
    isActive?: boolean;
    payorWebsiteId?: number | null;
    payorWebsite?: string | null;
    akaName?: string | null;
    type?: string | null;
    description?: string | null;
    pbm?: string | null;
    totalLives?: number | null;
    accountManager?: string | null;
    secondAccountManager?: string | null;
    hasContract?: boolean | null;
    commercialClosed?: string | null;
    commercialCopay1?: string | null;
    commercialCopay2?: string | null;
    commercialCopay3?: string | null;
    commercialMonths?: string | null;
    commercialOpen?: string | null;
    commercialPolicy?: string | null;
    commercialComment?: string | null;
    medicareClosed?: string | null;
    medicareCopay1?: string | null;
    medicareCopay2?: string | null;
    medicareCopay3?: string | null;
    medicareMonths?: string | null;
    medicareOpen?: string | null;
    medicarePolicy?: string | null;
    medicareComment?: string | null;
    isPbm?: boolean;
    isMco?: boolean;
    isMedD?: boolean;
    isMedFfs?: boolean;
    isMedManaged?: boolean;
    mmitPbm?: boolean;
    payorContacts: IPayorContact[];
    payorWebsites?: IPayorWebsite[];
    payorContractTracking?: IPayorContractTracking[] | null;
    payorAddresses: IPayorAddress[];
    payorAddress: IPayorAddress;
    payorActionPlans?: IPayorActionPlan[] | null;
}

export interface IPayorActionPlan {
    payorId: number;
    clientId: number;
    payorActionPlanId: number;
    name: string;
    payor: string;
    accountManager: string;
    secondAccountManager: string;
    goal1: string;
    action1: string;
    goal2: string;
    action2: string;
    month: string;
}
export interface IPayorContractTracking {
    payorId: number;
    clientId: number;
    payorContractTrackingId: number;
    name: string;
    payor: string;
    isContractNegotiation: string;
    isContractTerms: string;
    isFullyExecuted: string;
    isInProcessRedLining: string;
    isInSignatureProcess: string;
    comments: string;
}

export function createPayor(args?: any) {
    let target: IPayor = {
        payorId: null,
        name: "",
        payorAddresses: [],
        payorAddress: createPayorAddress({}),
        payorContacts: [],
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}
export function createPayorContact(args?: any) {
    let target: IPayorContact = {
        payorContactId: 0,
        payorId: null,
        firstName: null,
        lastName: null,
        jobFunction: null,
        title: null,
        email: null,
        officePhone: null,
        cellPhone: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        vip: false,
        isActive: true,
        dateAdded: null,
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}
export function createPayorWebsite(args?: any) {
    let target: IPayorWebsite = {
        payorWebsiteId: null,
        payorId: null,
        url: "",
        name: "",
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}
export function createPayorAddress(args?: any) {
    let target: IPayorAddress = {
        payorAddressId: null,
        payorId: null,
        isDefault: false,
        address1: null,
        address2: null,
        city: null,
        state: null,
        zip: null,
        phone: null,
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}
