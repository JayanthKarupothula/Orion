import { Type, plainToClass } from "class-transformer";
import { IsNotEmpty, IsObject, IsString, Validate, ValidateNested, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, validate } from "class-validator";

/**
 * `VariablesConstraint` is a custom validator for the `variables` object.
 * It checks that each key is a non-empty string and each value is a valid `Variable` instance.
 */
@ValidatorConstraint({ async: true })
class VariablesConstraint implements ValidatorConstraintInterface {
    async validate(variables: any, args: ValidationArguments) {
        for (let key in variables) {

            if (typeof key !== 'string' || key.trim() === '') {
                return false;
            }
            const variable = plainToClass(Variable, variables[key]);
            const errors = await validate(variable);
            if (errors.length > 0) {
                return false;
            }
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Each variable must have a non-empty value and a string type';
    }
}
/**
 * DTO class for creating a validated DMN evaluate request
 * @constructor CreateEvaluateDecisionRequest- takes variables, decision and xml as inputs
 */
class CreateEvaluateDecisionRequest {
    @IsObject()
    @Validate(VariablesConstraint)
    variables: Record<string, Variable>;

    @IsString()
    decision: string;

    @IsString()
    xml: string;

    constructor(variables: Record<string, Variable>, decision: string, xml: string) {
        this.variables = variables;
        this.decision = decision;
        this.xml = xml;
    }

    public toJson() {
        return {
            variables: this.variables,
            decision: this.decision,
            xml: this.xml
        };
    }
}

/**
 * DTO class for creating a validated variable
 */
class Variable {
    @IsNotEmpty()
    value: string | boolean | number | Date;

    @IsString()
    type: string; 
}

export { CreateEvaluateDecisionRequest }