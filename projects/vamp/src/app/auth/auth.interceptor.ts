import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { AuthService } from "./auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error?.url?.toLowerCase().includes("/account/login")) {
                authService.setAuthenticated(false);
            }
            return throwError(error);
        }),
    );
};
//
