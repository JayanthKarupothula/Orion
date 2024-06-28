import DmnSimulatorRouteController from "./controllers/DmnSimulator.controller";
import { NextApiRequest, NextApiResponse } from "next/types";

export default async function DmnSimulatorService(req: NextApiRequest, res: NextApiResponse) {
    let apiResult: any = undefined;
    apiResult = await DmnSimulatorRouteController(req, res);
    return apiResult;
}
