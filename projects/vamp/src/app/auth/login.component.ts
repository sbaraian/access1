import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";

import { first } from "rxjs/operators";
import { AuthService } from "./auth.service";
@Component({
    selector: "app-login",
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, IconFieldModule, InputIconModule, InputTextModule, PasswordModule, ButtonModule],
    templateUrl: "./login.component.html",
    styleUrl: "./login.component.scss",
})
export class LoginComponent implements OnInit {
    returnUrl: string = "";

    userCtrl = new FormControl("", Validators.required);
    passwordCtrl = new FormControl("", Validators.required);
    fg = new FormGroup({
        userCtrl: this.userCtrl,
        passwordCtrl: this.passwordCtrl,
    });

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthService,
    ) {
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(["empty"]);
        }
    }

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
    }

    onSubmit() {
        // stop here if form is invalid
        if (this.fg.invalid) {
            return;
        }

        this.fg.disable();
        this.authenticationService
            .login(this.userCtrl.value!, this.passwordCtrl.value!)
            .pipe(first())
            .subscribe(
                () => {
                    this.fg.enable();
                    this.router.navigate(["empty"]);
                },
                (error: any) => {
                    this.fg.enable();
                },
            );
    }
}
