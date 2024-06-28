import { EvaluateDecisionResponseModel } from "../models/responses/EvaluateDecisionResponse.model";
import { SimulationDetailsResponseModel } from "../models/responses/SimulationDetailsResponse.model";
import RestServiceHandler, { DmnSimulatorEdgeService } from "@/services/shared/RestService.handler";
import { AxiosError, AxiosInstance, AxiosResponse } from "axios";

/**
 * DmnSimulatorApiHandler
 * @class DmnSimulatorApiHandler  for handling the API calls for DmnSimulator
 * calls the Dmn Simulator API controller methods to get the data
 */
export class DmnSimulatorHandler extends RestServiceHandler {
    constructor(apiService: AxiosInstance = DmnSimulatorEdgeService) {
        super(apiService, "");
    }
    /**
     * @description evaluateDecision method to evaluate the decision
     * @param body
     * @returns EvaluateDecisionResponseModel
     */
    public async evaluateDecision(body: any): Promise<EvaluateDecisionResponseModel | AxiosError | any> {
        const requestBody = body;
        const response = await this.post("/evaluate-decision", requestBody)
            .then((response: AxiosResponse) => {
                if (response instanceof AxiosError) {
                    return {
                        error: true,
                        status: response.response!.status,
                        errorMessage: response.response!.data.errorMessage,
                    };
                }
                return response.data;
            })
            .catch((error: AxiosError) => error);
        return response;
    }

    /**
     * @description dmnSimulationDetails method to get the details of the dmn simulation i.e input, output and decision names
     * @param body
     * @returns SimulationDetailsResponseModel
     */
    public async dmnSimulationDetails(body: any): Promise<SimulationDetailsResponseModel | AxiosError | any> {
        const requestBody = body;
        const response = await this.post("/dmnSimulationDetails", requestBody)
            .then((response: AxiosResponse) => {
                if (response instanceof AxiosError) {
                    return {
                        error: true,
                        status: response.response!.status,
                        errorMessage: response.response!.data.errorMessage,
                    };
                }
                return response.data;
            })
            .catch((error: AxiosError) => error);
        return response;
    }

    /**
     * @description inputNames method to get the input names
     * @param body
     * @returns
     */
    public async inputNames(body: any): Promise<any> {
        const requestBody = body;
        const response = await this.post("/inputNames", requestBody)
            .then((response: AxiosResponse) => {
                if (response instanceof AxiosError) {
                    return {
                        error: true,
                        status: response.response!.status,
                        errorMessage: response.response!.data.errorMessage,
                    };
                }
                return response.data;
            })
            .catch((error: AxiosError) => error);
        return response;
    }

    /**
     * @description outputNames method to get the output names
     * @param body
     * @returns
     */
    public async outputNames(body: any): Promise<any> {
        const requestBody = body;
        const response = await this.post("/outputNames", requestBody)
            .then((response: AxiosResponse) => {
                if (response instanceof AxiosError) {
                    return {
                        error: true,
                        status: response.response!.status,
                        errorMessage: response.response!.data.errorMessage,
                    };
                }
                return response.data;
            })
            .catch((error: AxiosError) => error);
        return response;
    }

    /**
     * @description decisionNames method to get the decision names
     * @param body
     * @returns
     */
    public async decisionNames(body: any): Promise<any> {
        const requestBody = body;
        const response = await this.post("/decisionNames", requestBody)
            .then((response: AxiosResponse) => {
                if (response instanceof AxiosError) {
                    return {
                        error: true,
                        status: response.response!.status,
                        errorMessage: response.response!.data.errorMessage,
                    };
                }
                return response.data;
            })
            .catch((error: AxiosError) => error);
        return response;
    }
}
