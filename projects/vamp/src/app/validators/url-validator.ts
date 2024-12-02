import { AbstractControl, ValidatorFn } from "@angular/forms";

export function urlValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const urlRegex = /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
        if (control.value && !urlRegex.test(control.value)) {
            return { invalidUrl: true };
        }
        return null;
    };
}
