export interface IOption {
    id: number | string;
    name: string;
    products?: IOption[];
}
export interface IColumn {
    field: string;
    header: string;
}
