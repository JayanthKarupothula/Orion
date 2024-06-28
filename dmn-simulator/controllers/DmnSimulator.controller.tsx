import RestServiceController, { DmnSimulatorApi } from "@/services/shared/RestService.helper";
import { AxiosError, AxiosInstance } from "axios";
import { Body, Post, Res, ValidationPipe, createHandler } from "next-api-decorators";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next/types";
import { CreateDmnSimulationRequest } from "../models/requests/CreateDmnSimulator.dto";
import { CreateEvaluateDecisionRequest } from "../models/requests/CreateEvaluateDecision.dto";
import { EvaluateDecisionResponseModel } from "../models/responses/EvaluateDecisionResponse.model";
import { SimulationDetailsResponseModel } from "../models/responses/SimulationDetailsResponse.model";

/**
 * @class DmnSimulatorApiController to handle the API calls for DmnSimulator
 * It calls the Dmn Simulator Java API controller methods to get the data
 */
export class DmnSimulatorController extends RestServiceController {

    public constructor(apiService: AxiosInstance = DmnSimulatorApi) {
    super(apiService, "");
    }

    /**
     * @description evaluateDecision method to evaluate the decision
     * @param reqBody 
     * @param res 
     * @returns EvaluateDecisionResponseModel 
     */
    @Post("/evaluate-decision")
    public async evaluateDecision(@Body(ValidationPipe) reqBody: CreateEvaluateDecisionRequest, @Res() res: NextApiResponse): Promise<EvaluateDecisionResponseModel | AxiosError | any> {
        try {
        const result = await this.post("/dmnSimulator/evaluateDecision", reqBody);
        const responseModel = new EvaluateDecisionResponseModel(result.data);
        res.status(200).json(responseModel);
        } catch (error: any) {
            res.status(500).json({
                message: "Error in DmnSimulatorApi evaluate-decision endpoint"
            });
        }
    }

    /**
     * @description dmnSimulationDetails method to get the details of the dmn simulation i.e input, output and decision names
     * @param reqBody 
     * @param res 
     * @returns SimulationDetailsResponseModel
     */
    @Post("/dmnSimulationDetails")
    public async dmnSimulationDetails(@Body(ValidationPipe) reqBody: CreateDmnSimulationRequest, @Res() res: NextApiResponse): Promise<SimulationDetailsResponseModel | AxiosError |any> {
        try {
        const result = await this.post("/dmnSimulator/allDetails", reqBody);
        const responseModel = new SimulationDetailsResponseModel(result.data);
        res.status(200).json(responseModel);
        } catch (error: any) {
            res.status(500).json({
                message: "Error in DmnSimulatorApi dmnSimulationDetails endpoint"
            });
        }
    }


    //TODO: Adding Dto classes and response models for the below methods

    /**
     * @description inputNames method to get the input names
     * @param reqBody 
     * @param res 
     */
    @Post("/inputNames")
    public async inputNames(@Body() reqBody: any, @Res() res: NextApiResponse): Promise<any>{
        try {
        const result = await this.post("/dmnSimulator/inputNames", reqBody);
        res.status(200).json(result.data);
        } catch (error: any) {
            res.status(500).json({
                message: "Error in DmnSimulatorApi inputNames endpoint",
            });
        }
    }

    /**
     * @description outputNames method to get the output names
     * @param reqBody 
     * @param res 
     */
    @Post("/outputNames")
    public async outputNames(@Body() reqBody: any, @Res() res: NextApiResponse): Promise<any>{
        try {
        const result = await this.post("/dmnSimulator/outputNames", reqBody);
        res.status(200).json(result.data);
        } catch (error: any) {
            const result = res.status(500).json({
                message: "Error in DmnSimulatorApi outputNames endpoint",
            });
        }
    }

    /**
     * @description decisionNames method to get the decision names
     * @param reqBody 
     * @param res 
     */
    @Post("/decisionNames")
    public async decisionNames(@Body() reqBody: any, @Res() res: NextApiResponse): Promise<any>{
        try {
        const result = await this.post("/dmnSimulator/decisionNames", reqBody);
        res.status(200).json(result.data);
        } catch (error) {
            const result = res.status(500).json({
                message: "Error in DmnSimulatorApi decisionNames endpoint",
            });
        }
    }

}

export default async function DmnSimulatorRouteController(req: NextApiRequest, res: NextApiResponse, routed = false) {
    const { params } = req.query;

    if (params && params[0].startsWith('') && !routed) {
        const handler = createHandler(DmnSimulatorController) as NextApiHandler;
        await handler(req, res);
        return true;
    }
    return undefined;
}
