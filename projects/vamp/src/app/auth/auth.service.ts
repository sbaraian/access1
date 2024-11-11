import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { User } from "../models/user";
import { utils } from "../utils";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private currentUserSubject$: BehaviorSubject<User | null>;
    public currentUser$: Observable<any>;
    private readWriteUsers = ["sbaraian@hotmail.com", "bragan@access1.biz", "ajacques@vshealthgroup.com", "sdash@vshealthgroup.com", "cszelong@vshealthgroup.com", "adabrosca@vshealthgroup.com"];

    private http = inject(HttpClient);

    constructor() {
        this.currentUserSubject$ = new BehaviorSubject<User | null>(utils.tryParseJSON(localStorage.getItem("currentUser")));
        this.currentUser$ = this.currentUserSubject$.asObservable();
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject$?.value;
    }

    public isAuthenticated(): Observable<boolean> {
        const user: User | null = utils.tryParseJSON(localStorage.getItem("currentUser"));
        if (!!user) {
            return of(true);
        }
        return this.isLogged();
    }

    login(username: string, password: string) {
        return this.http
            .post<{ name: string; email: string }>(`api/users/login`, {
                username,
                password,
            })
            .pipe(
                tap((data) => {
                    const user = { name: data.name, email: data.email, isReadWrite: this.readWriteUsers.includes(data.email.toLowerCase()) };
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    this.currentUserSubject$.next(user);
                }),
            );
    }

    isLogged = (): Observable<boolean> => {
        return this.http.get<{ name: string; email: string }>(`api/users/isLogged`).pipe(
            map((data) => {
                const user = { name: data.name, email: data.email, isReadWrite: this.readWriteUsers.includes(data.email.toLowerCase()) };
                localStorage.setItem("currentUser", JSON.stringify(user));
                this.currentUserSubject$.next(user);
                return true;
            }),
            catchError(() => of(false)),
        );
    };

    logout() {
        return this.http.post(`/account/logoff`, {}).pipe(
            finalize(() => {
                localStorage.removeItem("currentUser");
                this.currentUserSubject$.next(null);
            }),
        );
    }
}
