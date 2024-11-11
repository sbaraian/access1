export interface IClient {
    clientId: number;
    name: string;
    products: IProduct[];
}
export interface IProduct {
    productId: number;
    name: string;
}
export interface IChannel {
    id: number;
    name: string;
}
