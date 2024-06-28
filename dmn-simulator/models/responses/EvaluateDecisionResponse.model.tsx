/**
 * Model class for Decision
 */
export class Decision {
    resultTableName: string;
    results: string[];
}

/**
 * Model class for Evaluate Decision Response
 * @constructor EvaluateDecisionResponseModel- takes response data from controller as input
 */
export class EvaluateDecisionResponseModel {
    outputs: Decision[];

    constructor(data: any) {
        this.outputs = [];
        for (let tableName in data) {
            try {
                let results = JSON.parse(data[tableName].results);
                let key = Object.keys(results[0])[0];
                this.outputs.push({
                    resultTableName: key,
                    results: results.map((result: any) => result[key]),
                });
            } catch (error) {
                console.error(`Error parsing results for table ${tableName}:`, error);
            }
        }
    }
}
