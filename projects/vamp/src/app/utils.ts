export const utils = {
    tryParseJSON<T>(jsonString: string | null): T | null {
        if (!jsonString) return null;
        try {
            const parsedData: T = JSON.parse(jsonString!);
            return parsedData;
        } catch (error) {
            // Handle parsing error here (e.g., log the error)
            console.error("Error parsing JSON:", error);
            return null;
        }
    },
    getValue(row: any, field: string): any {
        const fields = field.split(".");
        let val = row;
        for (var i = 0; val && i < fields.length; i++) {
            val = val[fields[i]];
        }
        return val;
    },
};
