import { Injectable } from "@angular/core";
import { IOption } from "./models/option";
@Injectable({
    providedIn: "root",
})
export class OptionsSerializer {
    fromJsonArray = (field: string, jsonArray: any): IOption[] => {
        if (Array.isArray(jsonArray) && jsonArray.length) {
            return jsonArray.map((json) => this.fromJson(field, json));
        }
        return [];
    };
    fromJson = (field: string, json: any): IOption => ({
        id: json[field],
        name: json.name,
        products: json.products,
    });
}
