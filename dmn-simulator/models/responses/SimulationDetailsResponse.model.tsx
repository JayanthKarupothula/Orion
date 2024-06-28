/**
 * Model class for Input Detail
 * The response data has inputName and inputType
 */
export class InputDetail {
    inputName: string;
    inputType: string;
}

/**
 * Model class for Output
 * The response data has outputName and resultTableName
 */
export class Output {
    outputName: string;
    resultTableName: string;
}

/**
 * Model class for Variable Detail
 * The response data has inputName and inputVariableName
 */
export class VariableDetail {
    inputName: string;
    inputVariableName: string;
}

/**
 * Model class for Expression Detail
 * The response data has inputName and inputExpressionName
 */
export class ExpressionDetail {
    inputName: string;
    inputExpressionName: string;
}

/**
 * Model class for Input Decision Detail
 * The response data has inputdecisionName and inputDetails
 */
export class InputDecisionDetail {
    inputdecisionName: string;
    inputDetails: InputDetail[];
}

/**
 * Model class for Variable Decision Detail
 * The response data has inputdecisionName and variableDetails
 */
export class VariableDecisionDetail {
    inputdecisionName: string;
    variableDetails: VariableDetail[];
}

/**
 * Model class for Expression Decision Detail
 * The response data has inputdecisionName and expressionDetails
 */
export class ExpressionDecisionDetail {
    inputdecisionName: string;
    expressionDetails: ExpressionDetail[];
}
/**
 * Model class for Decision
 * The response data has inputs, outputs, inputVariables and inputExpressions
 */
export class Decision {
    decisionName: string;
    inputs: InputDecisionDetail[];
    outputs: Output[];
    inputVariables: VariableDecisionDetail[];
    inputExpressions: ExpressionDecisionDetail[];
}
/**
 * Model class for Simulation Details Response
 * @constructor SimulationDetailsResponseModel- takes response data from controller as input
 */
export class SimulationDetailsResponseModel {
    allDetails: Decision[];

    constructor(data: any) {
        this.allDetails = [];
        for (let decisionName in data) {
            let decisionData = data[decisionName];
            let decision = new Decision();
            decision.decisionName = decisionName;
            decision.inputs = [];
            decision.outputs = [];
            decision.inputVariables = [];
            decision.inputExpressions = [];

            for (let inputdecisionName in decisionData.inputs) {
                let inputDetails = [];
                for (let inputName in decisionData.inputs[inputdecisionName]) {
                    inputDetails.push({
                        inputName: inputName,
                        inputType: decisionData.inputs[inputdecisionName][inputName],
                    });
                }
                decision.inputs.push({
                    inputdecisionName: inputdecisionName,
                    inputDetails: inputDetails,
                });
            }

            for (let outputName in decisionData.outputs) {
                decision.outputs.push({
                    outputName: outputName,
                    resultTableName: decisionData.outputs[outputName],
                });
            }

            for (let inputdecisionName in decisionData.inputVariables) {
                let variableDetails = [];
                for (let inputName in decisionData.inputVariables[inputdecisionName]) {
                    variableDetails.push({
                        inputName: inputName,
                        inputVariableName: decisionData.inputVariables[inputdecisionName][inputName],
                    });
                }
                decision.inputVariables.push({
                    inputdecisionName: inputdecisionName,
                    variableDetails: variableDetails,
                });
            }

            for (let inputdecisionName in decisionData.inputExpressions) {
                let expressionDetails = [];
                for (let inputName in decisionData.inputExpressions[inputdecisionName]) {
                    expressionDetails.push({
                        inputName: inputName,
                        inputExpressionName: decisionData.inputExpressions[inputdecisionName][inputName],
                    });
                }
                decision.inputExpressions.push({
                    inputdecisionName: inputdecisionName,
                    expressionDetails: expressionDetails,
                });
            }

            this.allDetails.push(decision);
        }
    }
}
