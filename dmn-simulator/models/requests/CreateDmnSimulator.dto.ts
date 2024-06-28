import { IsNotEmpty, IsString } from "class-validator";
/**
 * DTO class for creating a validated DMN simulation request
 * @constructor CreateDmnSimulationRequest- takes xml as input
 */
class CreateDmnSimulationRequest {
    @IsNotEmpty()
    @IsString()
    xml: string;

    constructor(data: string) {
        this.xml = data;
    }

    public toJson() {
        return {
            xml: this.xml
        };
    }
}

export { CreateDmnSimulationRequest }
