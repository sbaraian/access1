import { ITherapeuticCategory } from "../models/payor";
export interface IClientContact {
    clientContactId: number;
    name: string;
    title: string;
    email: string;
    officePhone: string;
    cellPhone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    clientId: number;
    vip: boolean;
    isActive: boolean;
}
export interface IClient {
    clientId: number | null;
    name: string;
    products: IProduct[];
    address1: string;
    address2: string;
    city: string;
    clientContacts: IClientContact[];
    contractDate: string;
    isActive: boolean;
    isProspect: boolean;
    phone: string;
    state: string;
    subDomain: string;
    urlBackground: string;
    urlLogo: string;
    urlLogoSmall: string;
    urlSplash: string;
    vips: string;
    zip: string;
}

export interface IProductDetail {
    productDetailId: number;
    productId: number;
    ndc: string;
    package1: string;
    package2: string;
    package3: string;
}
export interface IProduct {
    productId: number;
    name: string;
    clientId: number;
    description: string;
    therapeuticCategoryId: number;
    isActive: boolean;
    therapeuticCategory: ITherapeuticCategory;
    productDetails: IProductDetail[];
    showNotes: boolean;
}
export interface IChannel {
    id: number;
    name: string;
}

export function createClient(args: any) {
    let target: IClient = {
        clientId: 0,
        name: "",
        products: [],
        address1: "",
        address2: "",
        city: "",
        clientContacts: [],
        contractDate: "",
        isActive: true,
        isProspect: false,
        phone: "",
        state: "",
        subDomain: "",
        urlBackground: "",
        urlLogo: "",
        urlLogoSmall: "",
        urlSplash: "",
        vips: "",
        zip: "",
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}

export function createProduct(args: any) {
    let target: IProduct = {
        productId: 0,
        name: "",
        clientId: 0,
        description: "",
        therapeuticCategoryId: 0,
        isActive: true,
        therapeuticCategory: createTherapeuticCategory({}),
        productDetails: [],
        showNotes: false,
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}

export function createTherapeuticCategory(args: any) {
    let target: ITherapeuticCategory = {
        therapeuticCategoryId: 0,
        name: "",
        hasPolicy: false,
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}

export function createProductDetail(args: any) {
    let target: IProductDetail = {
        productDetailId: 0,
        productId: 0,
        ndc: "",
        package1: "",
        package2: "",
        package3: "",
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}
