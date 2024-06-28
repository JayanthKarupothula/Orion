import DmnSimulatorService from "@/services/dmn-simulator/app";
import { NextApiRequest, NextApiResponse } from "next";

export const serverErrorResponse = (message: string, errorCode: number) => ({ message, errorCode });
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { params } = req.query;
  if (params === undefined || params[0] === undefined) {
    return res.status(404).json(serverErrorResponse("Dmn Service Endpoint not found.", 404));
  }
  const apiResult = await DmnSimulatorService(req, res);
  if (apiResult === undefined) {
    return res.status(404).json(serverErrorResponse("Dmn Service Endpoint not found.", 404));
  }
}
