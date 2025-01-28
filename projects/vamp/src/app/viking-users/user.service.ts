import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { IUser } from "../models/user";
@Injectable({
    providedIn: "root",
})
export class UserService {
    private http = inject(HttpClient);

    getAllRoles = (): Observable<string[]> => {
        return this.http.get<string[]>("api/users/getAllRoles");
    };

    getUsers = (hasClientId: boolean): Observable<IUser[]> => {
        return this.http.get<IUser[]>(`api/users/getUsers${hasClientId ? "?hasClientId=true" : ""}`);
    };

    deleteUser = (user: IUser): Observable<any> => {
        return this.http.delete<any>(`api/users/deleteUser/${user.id}`);
    };

    saveVikingUser = (user: IUser): Observable<IUser> => {
        if (user.clientId) {
            return this.http.put<IUser>(`api/users/putUser/${user.id}`, user);
        } else {
            return this.http.post<IUser>(`api/users/postUser`, user);
        }
    };

    saveClientUser = (user: IUser): Observable<IUser> => {
        if (user.clientId) {
            return this.http.put<IUser>(`api/users/putUser/${user.id}`, user);
        } else {
            return this.http.post<IUser>(`api/users/postUser`, user);
        }
    };
}
