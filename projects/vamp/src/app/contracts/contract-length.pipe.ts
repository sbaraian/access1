import { Pipe, PipeTransform } from "@angular/core";
import { DateTime } from "luxon";

@Pipe({
    name: "contractLength",
    standalone: true,
})
export class ContractLengthPipe implements PipeTransform {
    transform(start: string | Date | null, end?: string | Date | null): number | null {
        if (!start || !end) return null;
        const sd = start instanceof Date ? DateTime.fromJSDate(start) : DateTime.fromFormat(start, "MM/dd/yyyy");
        const ed = end instanceof Date ? DateTime.fromJSDate(end) : DateTime.fromFormat(end, "MM/dd/yyyy");
        return ed.diff(sd, "days").days;
    }
}
