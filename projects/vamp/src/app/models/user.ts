import { IClient } from "./client";

export class User {
    name: string = "";
    email: string = "";
    isReadWrite: boolean = false;
}
export interface IUser {
    id: string;
    userName: string;
    email: string;
    password: string | null;
    confirmPassword: string | null;
    isActive: boolean;
    hasMultipleAccountManagers: boolean;
    resetPassword: boolean;
    name: string;
    accountManagerId: string | null;
    clientId: number | null;
    client: IClient | null;
    manager: { accountManagerId: string; name: string } | null;
    roles: string[];
}

export function createUser(args: any) {
    let target: IUser = {
        id: "",
        userName: "",
        email: "",
        password: null,
        confirmPassword: null,
        isActive: true,
        hasMultipleAccountManagers: false,
        name: "",
        accountManagerId: null,
        clientId: null,
        client: null,
        manager: null,
        roles: [],
        resetPassword: false,
    };
    if (args) {
        Object.assign(target, args);
    }

    return target;
}
