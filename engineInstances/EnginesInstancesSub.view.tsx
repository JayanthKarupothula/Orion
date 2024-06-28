import EngineInstanceEntities from "./EngineInstancesEntities.view";
import { OrionTableColumn } from "@/components/resuable-table/OrionTable.component";
import { TableSortType } from "@/components/resuable-table/OrionTable.types";
import { EngineInstance, EngineType } from "@/services/entity/controllers/EngineInstance/models/EngineInstance";
import { EngineInstanceHandler } from "@/services/entity/handlers/EngineInstance.handler";
import { EngineInstanceBpmnHandler } from "@/services/entity/handlers/EngineInstanceBpmn.handler";
import { EngineInstanceDmnHandler } from "@/services/entity/handlers/EngineInstanceDmn.handler";
import { EngineInstanceRouteDefHandler } from "@/services/entity/handlers/EngineInstanceRouteDef.handler";
import React from "react";

/**
 * @description - this is interface for the props of the EnginesSubView component
 * @param id - id of the engine instance
 * @param pageType - type of the page groups or standalone
 * @param engineInstances - engine instances from groups or standalone
 * @param generateStandaloneTableData - function to generate the table data for standalone engine instances
 * @param getSubViewStyles - function to get the styles for the subview
 * @param renderOrionTable - function to render the orion table

 */
interface EnginesSubViewProps {
  id: string;
  pageType: string;
  engineInstances: EngineInstance[] | undefined;
  generateStandaloneTableData: Function;
  getSubViewStyles: Function;
  renderOrionTable: Function;
}

/**
 * @description - this is the class for the EnginesSubView component
 */
class EnginesSubView extends React.Component<EnginesSubViewProps> {
  // eslint-disable-next-line
  bpmnHandler: EngineInstanceBpmnHandler;
  dmnHandler: EngineInstanceDmnHandler;
  engineHandler: EngineInstanceHandler;
  routeDefHandler: EngineInstanceRouteDefHandler;
  constructor(props: EnginesSubViewProps) {
    super(props);
    this.bpmnHandler = new EngineInstanceBpmnHandler();
    this.dmnHandler = new EngineInstanceDmnHandler();
    this.engineHandler = new EngineInstanceHandler();
    this.routeDefHandler = new EngineInstanceRouteDefHandler();
  }
  /**
   * @summary - this function is used to pull bpmn,dmn,routedef deployed on the engine instances, camunda and nemesis
   * @param engines - engine instances from groups or standalone
   * @returns - returns the entities deployed on the engine instances
   */
  pullEntitiesOnEngineInstances = async (engines: any) => {
    let camundaBpmnDmn: any = [];
    let nemesisRouteDef: any = [];
    let orionBpmnDmn: any = [];
    let orionRouteDef: any = [];
    let engineType: string = "";
    let tenantId: any = "";
    if (engines.length > 0) {
      // eslint-disable-next-line
      return Promise.all(
        engines.map(async (engine: EngineInstance) => {
          if (engine.engineType === EngineType.CAMUNDA) {
            engineType = "CAMUNDA";
            tenantId = engine.id;
            try {
              const orionBpmnResponse = await this.bpmnHandler.getBpmnDeploymentHistory(engine.id);
              const orionDmnResponse = await this.dmnHandler.getDmnDeploymentHistory(engine.id);
              orionBpmnDmn = orionBpmnDmn.concat(this.processResponse(orionBpmnResponse, "BPMN"));
              orionBpmnDmn = orionBpmnDmn.concat(this.processResponse(orionDmnResponse, "DMN"));
            } catch (error) {
              orionBpmnDmn = ["error in fetching data from orion"];
            }
            try {
              const camundaBpmnResponse = await this.bpmnHandler.getAllBpmnsCamunda(engine.id);
              const camundaDmnResponse = await this.dmnHandler.getAllDmnsCamunda(engine.id);
              camundaBpmnDmn = camundaBpmnDmn.concat(
                this.processCamundaNemesisResponse(camundaBpmnResponse, "BPMN", engineType)
              );
              camundaBpmnDmn = camundaBpmnDmn.concat(
                this.processCamundaNemesisResponse(camundaDmnResponse, "DMN", engineType)
              );
            } catch (error) {
              camundaBpmnDmn = ["error in fetching data from camunda"];
            }
          } else if (engine.engineType === EngineType.NEMESIS) {
            engineType = "NEMESIS";
            try {
              const orionRouteDefResponse = await this.routeDefHandler.getRouteDefDeploymentHistory(engine.id);
              orionRouteDef = orionRouteDef.concat(this.processResponse(orionRouteDefResponse, "ROUTEDEF"));
            } catch (error) {
              orionRouteDef = ["error in fetching data from orion"];
            }

            try {
              const nemesisRouteDefResponse = await this.routeDefHandler.getAllRouteDefs(engine.id);
              nemesisRouteDef = nemesisRouteDef.concat(
                this.processCamundaNemesisResponse(nemesisRouteDefResponse, "ROUTEDEF", engineType)
              );
            } catch (error) {
              nemesisRouteDef = ["error in fetching data from nemesis"];
            }
          }
        })
      ).then(() => ({ camundaBpmnDmn, nemesisRouteDef, orionBpmnDmn, orionRouteDef, engineType, tenantId }));
    }
  };
  /**
   * @summary - this function is used to process response recieved from the backend
   * for bpmn,dmn and route def deployed on the engine instances in from deployment history table
   * @param response - response from the backend
   * @param type - type of entity BPMN,DMN or ROUTEDEF
   * @returns return bpmn,dmn in orion or rooute def in orion
   */
  processResponse = (response: any, type: any) => {
    let entitiesOnEngine: any = [];
    if (response && response.data) {
      if (response.data.length === 0) {
        return ["No data found."];
      } else if (response.data.error) {
        return ["error"];
      }
      const entities = response.data.map((item: any) => ({
        [type]: item.CAMUNDADEFINITIONKEY || item.NAME,
        workingVersion: item.CAMUNDAVERSION || item.VERSION,
        definition: item.DEFINITION,
        id: item.BPMN_ID || item.DMN_ID || item.ROUTE_ID,
      }));

      entitiesOnEngine = entitiesOnEngine.concat(entities);
    }
    return entitiesOnEngine;
  };

  /**
   * @summary - this function is used to process response recieved from the backend
   * for bpmn,dmn and route def deployed on camunda and nemesis
   * @param response - response from the backend
   * @param nameKey - name of the entity BPMN,DMN or ROUTEDEF
   * @param engineType - type of engine camunda or nemesis
   * @returns return bpmn,dmn deployed in  camunda  or route def in  nemesis
   */

  processCamundaNemesisResponse = (response: any, nameKey: any, engineType: string) => {
    let allEntities: any = [];
    const data = response?.data.message || response?.data;

    if (data) {
      if (data.length === 0) {
        return ["No data found."];
      } else if (data.error) {
        return ["error"];
      }
      const entities = data.map((item: any) => ({
        [nameKey]: item.key || item.name,
        workingversion: item.version,
        id: item.id || item._id,
        definition: item,
      }));

      allEntities = allEntities.concat(entities);
    }

    return allEntities;
  };

  /**
   * @summary - this function is used to render the subview of the engine instances
   * it calles the EngineInstanceEntities component to render the entities deployed on the engine instances
   * @returns - returns the subview of the engine instances
   */
  render() {
    const { id, pageType, engineInstances, generateStandaloneTableData, getSubViewStyles, renderOrionTable } =
      this.props;
    let subViewData = [];
    let subViewColumns = [];
    if (!engineInstances) {
      return <p> No Engine Instances found</p>;
    }
    if (pageType === "groups") {
      const otherEngines = engineInstances.filter((x: EngineInstance) => x.groupId === id);
      subViewData = generateStandaloneTableData(otherEngines, getSubViewStyles());
      subViewColumns = [
        { header: "Name", name: "nickName", currentSort: TableSortType.NON, sort: true } as OrionTableColumn,
        { header: "Description", name: "description", currentSort: TableSortType.NON, sort: true } as OrionTableColumn,
        { header: "Environment", name: "environment", currentSort: TableSortType.NON, sort: true } as OrionTableColumn,
        { header: "EngineType", name: "engineType", currentSort: TableSortType.NON, sort: true } as OrionTableColumn,
        { header: "Tags", name: "tags", currentSort: TableSortType.NON, sort: true } as OrionTableColumn,
        {
          header: "",
          name: "actions",
          currentSort: TableSortType.NON,
          sort: false,
          actions: true,
          customStyles: { width: "4%" },
        } as OrionTableColumn,
      ];
      if (subViewData.length > 0) {
        return renderOrionTable(subViewColumns, subViewData, false, false);
      }
      const otherEngine = engineInstances.find((engine: EngineInstance) => engine.id === id);

      return <EngineInstanceEntities pullEntities={this.pullEntitiesOnEngineInstances} standalone={otherEngine} />;
    }
    const standaloneItem = engineInstances.find((engine: EngineInstance) => engine.id === id);
    if (!standaloneItem) {
      return;
    }
    return <EngineInstanceEntities pullEntities={this.pullEntitiesOnEngineInstances} standalone={standaloneItem} />;
  }
}

export default EnginesSubView;
