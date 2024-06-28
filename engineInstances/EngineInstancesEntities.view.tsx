import { CheckUserEntityPermission } from "@/components/auth/middleware/CheckUserEntityPermission.middleware";
import PreviewPopupModal from "../bpmns/bpmn-version-panel/preview-popup-modal/PreviewPopupModal";
import styles from "./EngineInstanceEntities.module.scss";
import OrionTable, { OrionTableColumn } from "@/components/resuable-table/OrionTable.component";
import { ColumnFilterType, TableSortType } from "@/components/resuable-table/OrionTable.types";
import { Bpmn } from "@/entities/Bpmn";
import { Dmn } from "@/entities/Dmn";
import { RouteDefVersion, RouteDefVersionDefinition } from "@/entities/RouteDef";
import { BpmnDefinitionModel } from "@/models/BpmnDefinitionModel";
import { DmnDefinitionModel } from "@/models/DmnDefinitionModel";
import RouteConfigPreviewModal from "@/pages/releases/new-release/new-release-pages/RouteConfigPreviewModal";
import { AccessLevelId } from "@/services/auth/controllers/AccessLevel/models/AccessLevel";
import { EngineInstanceBpmnHandler } from "@/services/entity/handlers/EngineInstanceBpmn.handler";
import { EngineInstanceDmnHandler } from "@/services/entity/handlers/EngineInstanceDmn.handler";
import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BiImport, BiNetworkChart, BiSolidShow } from "react-icons/bi";
import { BsDiagram3Fill, BsTable } from "react-icons/bs";
import ToastNotify, { ToastNote } from "@/components/toast-notify/ToastNotify.component";

/**
 * @interface EnginesSubViewProps - interface for props
 * @param standalone - engine instance from groups or standalone
 * @param pullEntities - function to get the data of latest bpmn,dmn,routeDef deployed on current engine instance  in Orion, camunda,Nemesis
 */
 interface EnginesSubViewProps {
  standalone: any;
  pullEntities: (standalone: any) => Promise<any>;
}
interface State {
  res: any;
  camundaBpmnDmn: any[];
  nemesisRouteDef: any[];
  orionBpmnDmn: any[];
  orionRouteDef: any[];
  engineType: string;
  showAlert: boolean;
  tenantId: any;
  showPreviewModal: boolean;
  selectedDiagram?: Bpmn | Dmn;
  diagramDefinition?: BpmnDefinitionModel | DmnDefinitionModel;
  readOnlyStatus: boolean;
  selectedRouteConfigVersion?: RouteDefVersion;
  selectedRouteDefDefinition: RouteDefVersionDefinition | undefined;
  loading: boolean;
  isDisabled: string[];

}
/**
 * EngineInstanceEntities component is used to display the bpmn,dmn,routeDef from camunda,nemesis and deployed on particular engine instance when expanded
 * @author Jayanth Karupothula
 */
class EngineInstanceEntities extends React.Component<EnginesSubViewProps, State> {
  // eslint-disable-next-line
  bpmnHandler: EngineInstanceBpmnHandler;
  dmnHandler: EngineInstanceDmnHandler;
  routeConfigPreviewModalRef: any;
  selectedContentpageRef: any;
  constructor(props: EnginesSubViewProps) {
    super(props);
    this.bpmnHandler = new EngineInstanceBpmnHandler();
    this.dmnHandler = new EngineInstanceDmnHandler();
    this.routeConfigPreviewModalRef = React.createRef();
    this.selectedContentpageRef = React.createRef();
    this.setLoading = this.setLoading.bind(this);
  }
  state: State = {
    res: null,
    camundaBpmnDmn: [],
    nemesisRouteDef: [],
    orionBpmnDmn: [],
    orionRouteDef: [],
    engineType: "",
    showAlert: true,
    tenantId: "",
    showPreviewModal: false,
    selectedDiagram: undefined,
    diagramDefinition: undefined,
    readOnlyStatus: false,
    selectedRouteDefDefinition: undefined,
    selectedRouteConfigVersion: undefined,
    loading: false,
    isDisabled: [],
  };
  timeoutId: NodeJS.Timeout | undefined;

  componentDidMount() {
    const { standalone, pullEntities } = this.props;
    this.timeoutId = setTimeout(() => {
      alert("Loading data is taking longer than expected.");
    }, 90000);
    pullEntities([standalone]).then((res: any) => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.setState({
        camundaBpmnDmn: res.camundaBpmnDmn,
        nemesisRouteDef: res.nemesisRouteDef,
        orionBpmnDmn: res.orionBpmnDmn,
        orionRouteDef: res.orionRouteDef,
        engineType: res.engineType,
        tenantId: res.tenantId,
      });
    });
  }

  componentWillUnmount(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
  setShowPreviewModal = (input: boolean) => this.setState({ showPreviewModal: input });
  setSelectedDiagram = (input: Bpmn | Dmn) => this.setState({ selectedDiagram: input });
  setDiagramDefinition = (input: BpmnDefinitionModel | DmnDefinitionModel) =>
    this.setState({ diagramDefinition: input });

/**
 * @summary - function for handling setting definition of bpmn on click of preview button
 * @param item - bpmn  deployed in Camunda and Orion
 */
  @CheckUserEntityPermission(AccessLevelId.USER, undefined, { name: "handleError", props: false })
  handleBpmnPreviewOnClick(item: any) {
    const createdBpmnFromCamunda = new Bpmn({});

    createdBpmnFromCamunda.name = item.BPMN;
    createdBpmnFromCamunda.currentVersion = item.workingversion || item.workingVersion;
    createdBpmnFromCamunda.id = item.id;

    this.setShowPreviewModal(true);
    this.setSelectedDiagram(createdBpmnFromCamunda);

    this.setDiagramDefinition(new BpmnDefinitionModel({ DEFINITION: item.definition }));
  };

  /**
   * @summary - function for handling setting definition of dmn on click of preview button
   * @param item Dmn deployed in Camunda and Orion
   */
  @CheckUserEntityPermission(AccessLevelId.USER, undefined, { name: "handleError", props: false })
  handleDmnPreviewOnClick(item:any) {
      const createdDmnFromCamunda = new Dmn({});

    createdDmnFromCamunda.name = item.DMN;
    createdDmnFromCamunda.currentVersion = item.workingVersion || item.workingversion;
    createdDmnFromCamunda.id = item.id;

    this.setShowPreviewModal(true);
    this.setSelectedDiagram(createdDmnFromCamunda);
    this.setDiagramDefinition(new DmnDefinitionModel({ DEFINITION: item.definition }));
  };

  /**
   * @summary - function for handling setting definition of routes on click of preview button
   * @param item - routeDef deployed in Nemesis and Orion
   */
  @CheckUserEntityPermission(AccessLevelId.USER, undefined, { name: "handleError", props: false })
  handleRouteDefPreviewOnClick(item: any) {
    const createdRouteDefFromNemesis = new RouteDefVersion({});
    createdRouteDefFromNemesis.name = item.ROUTEDEF;
    createdRouteDefFromNemesis.version = Number(item.workingversion) || item.workingVersion;
    createdRouteDefFromNemesis.id = item.id;
    this.setState({
      selectedRouteConfigVersion: createdRouteDefFromNemesis,
      selectedRouteDefDefinition: new RouteDefVersionDefinition(item),
      readOnlyStatus: true,
    });

    this.routeConfigPreviewModalRef.current.setShowModal(true);
  };

  /**
   * Set diagramDefinition to undefined
   */
  clearDefinitionOnModal = () => this.setState({ diagramDefinition: undefined });
  setLoading = (input: boolean) => this.setState({ loading: input });
/**
 *
 * @returns - returns the viewModal Component for Bpmn and Dmn
 */
  renderBpmnViewer = () => {
    const { diagramDefinition, selectedDiagram, showPreviewModal } = this.state;

    return (
      <div>
        <PreviewPopupModal
          clearDefinitionOnModalState={this.clearDefinitionOnModal}
          handleDiagramViewerLoad={() => {}}
          latestVersionDefinition={diagramDefinition}
          selectedDiagram={selectedDiagram}
          selectedVersion={undefined}
          selectedVersionDefinition={diagramDefinition}
          setLoadingInPartentState={this.setLoading}
          setShowPreviewModal={this.setShowPreviewModal}
          showPreviewModal={showPreviewModal}
          successLoadCallback={() => {}}
        />
      </div>
    );
  };

  /**
   * @summary - function for rendering route def view modal
   */
  renderRouteViewer = () => (
      <RouteConfigPreviewModal
        isReadOnly={this.state.readOnlyStatus}
        ref={this.routeConfigPreviewModalRef}
        selectedRouteConfigVersion={this.state.selectedRouteConfigVersion}
        selectedRouteDefDefinition={this.state.selectedRouteDefDefinition}
      />
    );

  /**
   * function for hiding alert message
   */
  hideAlert = () => {
    this.setState({ showAlert: false });
  };
  /**
   * @returns - returns the styles for subview table
   */
  getSubViewStyles = () => ({
      borderRadius: "0px",
      width: "86.5%",
      paddingLeft: "5px",
    });

 addToast = (toast: ToastNote) => {};

  /**
   * @summary - function for handling error
   * @param error - error message
   * @param id - id of the entity
   */
  handleError(error: any, id: any) {
    const message = error;
    this.addToast({
      delay: 38000,
      ToastProps: {},
      id: `bpmns-note-${Math.floor(Math.random() * 90000000).toString()}`,
      title: `403 HTTP Error`,
      summary: message,
      addedTime: new Date(),
      variant: "Danger",
      show: true,
    });

    this.setState({ isDisabled: [...this.state.isDisabled, id] });
  };

  /**
   *function for generating table data of routeDef deployed in Nemesis
   * @param nemesisRouteDef - routeDef deployed in Nemesis
   * @param subViewStyles - styles for subview
   * @returns - returns the table data of routeDef deployed in Nemesis
   */
  generateRouteDefTableData = (nemesisRouteDef: any, subViewStyles?: React.CSSProperties) => {
    let nemesisRouteDefTableData: any = [];
    if (nemesisRouteDef.length > 0) {
      nemesisRouteDefTableData = nemesisRouteDef.map((item: any, index: number) => ({
          id: `${item.ROUTEDEF}_${index}`,
          entity: this.renderIcon("routeDef"),
          name: item.ROUTEDEF,
          workingversion: item.workingversion,
          status: "Not Deployed in Orion",
          subViewStyles,
          actions: (
            <ul className={"releases-actions-list"}>
              <OverlayTrigger overlay={this.futureEnhancementsTooltip} placement={"right"}>

              <div>
              <Button className={styles["edit-engine-btn"]} disabled>
                <BiImport className={styles["engine-edit-icon"]} size={20} />
              </Button>
              </div>
             </OverlayTrigger>

              <Button
                className={styles["edit-engine-btn"]}
                onClick={() => {
                  this.handleRouteDefPreviewOnClick(item);
                }}
              >
                <BiSolidShow className={styles["engine-edit-icon"]} size={20} />
              </Button>

            </ul>
          ),
        }));
    }
    return nemesisRouteDefTableData;
  };
/**
 * @summary - function for pulling bpmn definition
 * @param tenantId
 * @param bpmnId
 * @returns
 */
  async pullBpmnDefinition(tenantId: string, bpmnId: string) {
    return await this.bpmnHandler.getCamundaBpmnDefinition(tenantId, bpmnId).then((res: any) => {
      if (res) {
        return res.data.bpmn20Xml;
    }
    });
};

/**
 * @summary - function for pulling dmn definition
 * @param tenantId
 * @param dmnId
 * @returns
 */
 async pullDmnDefinition(tenantId: string, dmnId: string) {
    return this.dmnHandler.getCamundaDmnDefinition(tenantId, dmnId).then((res: any) => {
      if (res) {
        return res.data.dmnXml;
      }
    });
  };

   futureEnhancementsTooltip = (
    <Tooltip id="future-enhancements-tooltip" style={{ position: "relative", left: "20px" }}>
      Future Enhancements
    </Tooltip>
  );

  noPermissionsTooltip = (
    <Tooltip id="no-permissions-tooltip" style={{ position: "relative", left: "20px" }}>
      No Permissions
    </Tooltip>
  );
  /**
   *function for generating table data of bpmn and dmn deployed in Camunda
   * @param camundaBpmnDmn - bpmn and dmn deployed in Camunda
   * @param subViewStyles - styles for subview
   * @returns - returns the table data of bpmn and dmn deployed in Camunda
   */
  generateCamundaBpmnDmnTableData = (camundaBpmnDmn: any, subViewStyles?: React.CSSProperties) => {
    let camundaBpmnDmnTableData: any = [];
    if (camundaBpmnDmn.length > 0) {
      camundaBpmnDmnTableData = camundaBpmnDmn.map((item: any, index: number) => ({
          id: `${item.BPMN || item.DMN}_${index}`,
          entity: item.BPMN ? this.renderIcon("bpmn") : this.renderIcon("dmn"),
          name: item.BPMN || item.DMN,
          workingversion: item.workingversion,
          status: "Not Deployed in Orion",
          subViewStyles,
          actions: (
            <ul className={"releases-actions-list"} >
              <OverlayTrigger overlay={this.futureEnhancementsTooltip} placement={"right"}>
                <div>
              <Button className={`${styles["edit-engine-btn"]} `} disabled>
                <BiImport className={styles["engine-edit-icon"]} size={20} />
              </Button>
              </div>
              </OverlayTrigger>

             <Button
               className={styles["edit-engine-btn"]}
               onClick={async () => {
                  if (item.BPMN) {
                    item.definition = await this.pullBpmnDefinition(this.state.tenantId, item.id);
                    this.handleBpmnPreviewOnClick(item);
                  } else {
                     item.definition = await this.pullDmnDefinition(this.state.tenantId, item.id);
                    this.handleDmnPreviewOnClick(item);
                  }
                }
                }
             >
                <BiSolidShow className={styles["engine-edit-icon"]} size={20} />
              </Button>

            </ul>
          ),
        }));
    }
    return camundaBpmnDmnTableData;
  };
  /**
   * function for generating columns for Camunda and Nemesis table
   * @param value - this parameter is used to decide the header value for Name and DefinitionKey
   * @returns - returns the columns for Camunda and Nemesis table
   */
  generateRouteBpmnDmnTableColumns = (value: string) => {
    let headerValue = "";
    if (value === "name") {
      headerValue = "Name";
    } else if (value === "definition") {
      headerValue = "Definition Key";
    }
    const camundaBpmnDmnTableColumns = [
      {
        header: "",
        name: "entity",
        currentSort: TableSortType.NON,
        sort: true,
        customStyles: { width: "9%" },
      } as OrionTableColumn,
      {
        header: headerValue,
        name: "name",
        currentSort: TableSortType.NON,
        sort: true,
        filter: ColumnFilterType.STRING,
      } as OrionTableColumn,
      {
        header: "Version",
        name: "workingversion",
        currentSort: TableSortType.NON,
        sort: true,
        filter: ColumnFilterType.NUMBER,
        customStyles: { width: "10%" },
      } as OrionTableColumn,
      {
        header: "Status",
        name: "status",
        currentSort: TableSortType.NON,
        sort: true,
        filter: ColumnFilterType.STRING,
      } as OrionTableColumn,
      {
        header: "",
        name: "actions",
        currentSort: TableSortType.NON,
        sort: false,
        actions: true,
        filter: ColumnFilterType.STRING,
        customStyles: { width: "10%" },
      } as OrionTableColumn,
    ];
    return camundaBpmnDmnTableColumns;
  };
  /**
   *function for displaying how many entities are there in the table as footer message
   * @param tableData - data for table
   * @returns- returns the footer message for table
   */
  getFooterMessage = (tableData: any[]) => {
    if (tableData.length > 0) {
      return `Showing ${tableData.length} entities.`;
    }
      return "No data found.";

  };
  /**
   * function for rendering table
   * @param columns - columns for table
   * @param tableData - data for table
   * @param showPagination -  pagination visibility default is true
   * @param showFooter- footer visibility default is true
   * @returns- returns the table
   */
  renderOrionTable = (columns: OrionTableColumn[], tableData: any[], showPagination: boolean = true, showFooter: boolean = true) => (
      <div className={styles["custom-footer-parent"]}>
        <OrionTable
          columns={columns}
          data={tableData}
          filterCustomStyles={styles["custom-filter"]}
          filterExpandedStyles={styles["custom-filter-expanded"]}
          footer={showFooter}
          footerClassName={styles["custom-footer"]}
          footerMsg={this.getFooterMessage(tableData)}
          paginationFooter={styles["custom-pagination-footer"]}
          paginationVisible={showPagination}
          preventRowClick
          rowCount={20}
          startIndex={1}
        />
      </div>
    );
  /**
   * function for getting routeDef deployed in Orion but not in Nemesis
   * @param nemesisRouteDef - routeDef deployed in Nemesis
   * @param orionRouteDef - routeDef deployed in Orion
   * @returns- returns the routeDef deployed in Nemesis but not in Orion
   */
  getUnmatchedRouteDef = (nemesisRouteDef: any, orionRouteDef: any) => {
    const unmatchedRouteDef: any[] = [];
    for (const item of orionRouteDef) {
      if (item.ROUTEDEF) {
        if (!nemesisRouteDef.some((nemesisItem: any) => item.ROUTEDEF === nemesisItem.ROUTEDEF)) {
          unmatchedRouteDef.push(item);
        } else if (
          nemesisRouteDef.some(
            (nemesisItem: any) =>
              item.ROUTEDEF === nemesisItem.ROUTEDEF && item.workingversion !== nemesisItem.workingVersion
          )
        ) {
          unmatchedRouteDef.push(item);
        }
      }
    }
    return unmatchedRouteDef;
  };

  /**
   * function for getting  bpmn and dmn deployed in Orion but not in Camunda
   * @param camundaBpmnDmn - bpmn and dmn deployed in Camunda
   * @param orionBpmnDmn - bpmn and dmn deployed in Orion
   * @returns- returns the bpmn and dmn deployed in Orion but not in Camunda
   */
  getUnmatchedBpmnDmnItems = (camundaBpmnDmn: any, orionBpmnDmn: any) => {
    const unmatchedBpmnDmn: any[] = [];
    for (const item of orionBpmnDmn) {
      if (item.BPMN) {
        if (!camundaBpmnDmn.some((camundaItem: any) => item.BPMN === camundaItem.BPMN)) {
          unmatchedBpmnDmn.push(item);
        } else if (
          camundaBpmnDmn.some(
            (camundaItem: any) => item.BPMN === camundaItem.BPMN && item.workingVersion !== camundaItem.workingversion
          )
        ) {
          unmatchedBpmnDmn.push(item);
        }
      } else if (item.DMN) {
        if (!camundaBpmnDmn.some((camundaItem: any) => item.DMN === camundaItem.DMN)) {
          unmatchedBpmnDmn.push(item);
        } else if (
          camundaBpmnDmn.some(
            (camundaItem: any) => item.DMN === camundaItem.DMN && item.workingVersion !== camundaItem.workingversion
          )
        ) {
          unmatchedBpmnDmn.push(item);
        }
      }
    }
    return unmatchedBpmnDmn;
  };

  /**
   *function for generating table data of routeDef deployed in Orion
   * @param orionRouteDef - routeDef deployed in Orion
   * @param subViewStyles - styles for subview
   * @returns- returns the table data of routeDef deployed in Orion
   */
  generateOrionRouteDefTableData = (orionRouteDef: any, subViewStyles?: React.CSSProperties) => {
    const mappedOrionRouteDef = orionRouteDef.map((item: any, index: number) => ({
        id: `${item.ROUTEDEF}_${index}`,
        entity: this.renderIcon("routeDef"),
        name: item.ROUTEDEF,
        workingversion: item.workingVersion,
        status: "Deployed in Orion",
        subViewStyles,
        actions: (
          <ul className={"releases-actions-list"}>
            <OverlayTrigger overlay={this.futureEnhancementsTooltip} placement={"right"}>
              <div>
              <Button className={styles["edit-engine-btn"]} disabled>
                <BiImport className={styles["engine-edit-icon"]} size={20} />
              </Button>
              </div>
            </OverlayTrigger>

            <OverlayTrigger overlay={this.state.isDisabled.includes(item.id) ? this.noPermissionsTooltip : <div />} placement={"right"}>
              <div>
                <Button
                  className={styles["edit-engine-btn"]}
                  disabled={this.state.isDisabled.includes(item.id)}
                  onClick={async () => {
                      this.handleRouteDefPreviewOnClick(item);
                    }}
                >
                    <BiSolidShow className={styles["engine-edit-icon"]} size={20} />
                  </Button>
              </div>
            </OverlayTrigger>

          </ul>
        ),
      }));
    return mappedOrionRouteDef;
  };
  /**
   * @description - function for rendering icon for bpmn,dmn and routeDef
   * @param entity - entity name bpmn,dmn or routeDef
   * @returns
   */
  renderIcon = (entity: string) => {
    if (entity === "bpmn") {
      return (
        <React.Fragment>
          <BsDiagram3Fill />
          <span style={{ marginLeft: "5px" }}>BPMN</span>
        </React.Fragment>
      );
    } else if (entity === "dmn") {
      return (
        <React.Fragment>
          <BsTable />
          <span style={{ marginLeft: "5px" }}>DMN</span>
        </React.Fragment>
      );
    } else if (entity === "routeDef") {
      return (
        <React.Fragment>
          <BiNetworkChart />
          <span style={{ marginLeft: "5px" }}>ROUTE</span>
        </React.Fragment>
      );
    }
  };
  /**
   *
   * @param orionBpmnDmn- bpmn and dmn deployed in Orion
   * @param subViewStyles- styles for subview
   * @returns- returns the table data of bpmn and dmn deployed in Orion
   */
  generateOrionBpmnDmnTableData = (orionBpmnDmn: any, subViewStyles?: React.CSSProperties) => {

    const mappedOrionBpmnDmn = orionBpmnDmn.map((item: any, index: number) => ({
        id: `${item.BPMN || item.DMN}_${index}`,
        entity: item.BPMN ? this.renderIcon("bpmn") : this.renderIcon("dmn"),
        name: item.BPMN || item.DMN,
        workingversion: item.workingVersion,
        status: "Deployed in Orion",
        subViewStyles,
        actions: (
          <ul className={"releases-actions-list"} >
            <OverlayTrigger overlay={this.futureEnhancementsTooltip} placement={"right"}>
            <div>
            <Button className={styles["edit-engine-btn"]} disabled>
              <BiImport className={styles["engine-edit-icon"]} size={20} />
            </Button>
            </div>
           </OverlayTrigger>
            <OverlayTrigger overlay={this.state.isDisabled.includes(item.id) ? this.noPermissionsTooltip : <div />} placement={"right"}>
            <div>
            <Button
              className={styles["edit-engine-btn"]}
              disabled={this.state.isDisabled.includes(item.id)}
              onClick={() => {
                item.BPMN
                  ? this.handleBpmnPreviewOnClick(item)
                  : this.handleDmnPreviewOnClick(item);
              }}
            >
              <BiSolidShow
                className={styles["engine-edit-icon"]}
                size={20}
              />
            </Button>
            </div>
            </OverlayTrigger>

          </ul>
        ),
      }));
    return mappedOrionBpmnDmn;
  };

  /**
   * @summary - function for rendering alert message
   * @param message
   * @param customStyles
   * @returns
   */
  renderAlert(message: string, customStyles?: any) {
    return (
        <div className={styles.alertParent}>
            {this.state.showAlert && (
                <div className={styles.alert} style={customStyles}>
                    <span className={styles.closebtn} onClick={this.hideAlert}>
                        &times;
                    </span>
                    {message}
                </div>
            )}
        </div>
    );
}

  /**
   * function for rendering bpmn,dmn  deployed in Camunda and Orion
   * @param camundaBpmnDmn -bpmn and dmn deployed in Camunda
   * @param orionBpmnDmn  - bpmn and dmn deployed in Orion
   * @returns - returns the table of bpmn and dmn deployed in Camunda and Orion
   */
  renderCamundaData = (camundaBpmnDmn: any, orionBpmnDmn: any) => {
    let deployed = 0;
    const nonDeployed = camundaBpmnDmn.length;
    if (camundaBpmnDmn.length > 0 &&
      camundaBpmnDmn[0] !== "error in fetching data from camunda" &&
      camundaBpmnDmn[0] !== "No data found." &&
      camundaBpmnDmn[0] !== "error") {

      const camundaBpmnDmnTableData = this.generateCamundaBpmnDmnTableData(camundaBpmnDmn, this.getSubViewStyles());
      const camundaBpmnDmnTableColumns = this.generateRouteBpmnDmnTableColumns("definition");

      const customStyles = { backgroundColor: 'green'};
      if (orionBpmnDmn.length > 0) {
        const orionBpmnDmnTableData = this.generateOrionBpmnDmnTableData(
          orionBpmnDmn,
          this.getSubViewStyles()
        );
        deployed = orionBpmnDmn.length;
        camundaBpmnDmnTableData.push(...orionBpmnDmnTableData);
      }
      const message = `Successfully showing ${nonDeployed} non-deployed and ${deployed} deployed BPMN, DMN.`;

      return (
        <>
       {this.renderAlert(message, customStyles)}
        {this.renderOrionTable(camundaBpmnDmnTableColumns, camundaBpmnDmnTableData)}
        </>
        );
    } else if ((camundaBpmnDmn[0] === "error in fetching data from camunda" ||
                 camundaBpmnDmn[0] === "error" ||
                 camundaBpmnDmn[0] === "No data found.") &&
                 orionBpmnDmn.length > 0 &&
                 orionBpmnDmn[0] !== "error in fetching data from orion") {
      const orionBpmnDmnTableData = this.generateOrionBpmnDmnTableData(orionBpmnDmn, this.getSubViewStyles());
      const orionBpmnDmnTableColumns = this.generateRouteBpmnDmnTableColumns("definition");
      deployed = orionBpmnDmn.length;
      const message = `Error in fetching data from camunda. Showing ${deployed} deployed bpmn,dmn in current instance.`;
      const customStyles = { backgroundColor: 'green'};
      return (

        <React.Fragment>
        {this.renderAlert(message)}
        {this.renderOrionTable(orionBpmnDmnTableColumns, orionBpmnDmnTableData)}
        </React.Fragment>
      );
    }
      const message = "Error in fetching,no data deployed or no permissions to view the data.";
      return this.renderAlert(message);

  };

  /**
   * @param nemesisRouteDef - routeDef deployed in Nemesis
   * @param orionRouteDef - routeDef deployed in Orion
   * @returns - returns the table of routeDef deployed in Nemesis and Orion
   */
  renderNemesisData = (nemesisRouteDef: any, orionRouteDef: any) => {
    const nonDeployed = nemesisRouteDef.length;
    let deployed = 0;
    if (
      nemesisRouteDef.length > 0 &&
      nemesisRouteDef[0] !== "error" &&
      nemesisRouteDef[0] !== "No data found." &&
      nemesisRouteDef[0] !== "error in fetching data from nemesis" &&
      orionRouteDef[0] !== "error" &&
      orionRouteDef[0] !== "No data found."
    ) {
      const nemesisRouteDefTableData = this.generateRouteDefTableData(nemesisRouteDef, this.getSubViewStyles());
      const nemesisRouteDefTableColumns = this.generateRouteBpmnDmnTableColumns("name");

      const customStyles = { backgroundColor: 'green'};
      if (orionRouteDef.length > 0) {
        const orionRouteDefTableData = this.generateOrionRouteDefTableData(
          orionRouteDef,
          this.getSubViewStyles()
        );
        deployed = orionRouteDef.length;
        nemesisRouteDefTableData.push(...orionRouteDefTableData);

      }
      const message = `Successfully showing ${nonDeployed} non-deployed and  ${deployed} deployed Route Definitions.`;
      return (
        <>
        {this.renderAlert(message, customStyles)}
          {this.renderOrionTable(nemesisRouteDefTableColumns, nemesisRouteDefTableData)}
        </>

      );
    } else if ((nemesisRouteDef[0] === "error in fetching data from nemesis" || nemesisRouteDef[0] === "error" || nemesisRouteDef[0] === "No data found.") &&
     orionRouteDef.length > 0 &&
      orionRouteDef[0] !== "error" &&
      orionRouteDef[0] !== "No data found."
    ) {
      const orionRouteDefTableData = this.generateOrionRouteDefTableData(orionRouteDef, this.getSubViewStyles());
      const orionRouteDefTableColumns = this.generateRouteBpmnDmnTableColumns("name");
      deployed = orionRouteDef.length;
      const message = `Error in fetching data from Nemesis. Showing ${deployed} deployed  routes in current instance.`;
      return (
        <React.Fragment>
          {this.renderAlert(message)}
          {this.renderOrionTable(orionRouteDefTableColumns, orionRouteDefTableData)}
        </React.Fragment>
      );
    }
      const message = "Error in fetching,no data deployed or no permissions to view the data.";
      return this.renderAlert(message);

  };

  removeToast = (toast: ToastNote) => {}

  /**
   * @summary - function for removing matching bpmn and dmn records
   * @param camundaBpmnDmn
   * @param orionBpmnDmn
   * @returns
   */

  removeMatchingRecords = (camundaBpmnDmn: any[], orionBpmnDmn: any[]) => {
    // eslint-disable-next-line
    camundaBpmnDmn = camundaBpmnDmn.filter(item => {
      if (item?.BPMN) {
        return !orionBpmnDmn.some(orionItem =>
          orionItem?.BPMN && item.BPMN === orionItem.BPMN && item.workingversion === orionItem.workingVersion
        );
      } else if (item?.DMN) {
        return !orionBpmnDmn.some(orionItem =>
          orionItem?.DMN && item.DMN === orionItem.DMN && item.workingversion === orionItem.workingVersion
        );
      }
      return true;
    });
    return camundaBpmnDmn;
};
/**
 * @summary - function for removing matching routeDef records
 * @param nemesisRouteDef
 * @param orionRouteDef
 * @returns
 */

removeMatchingRouteRecords = (nemesisRouteDef: any[], orionRouteDef: any[]) => {
// eslint-disable-next-line
  nemesisRouteDef = nemesisRouteDef.filter(item => !orionRouteDef.some(orionItem => item.ROUTEDEF === orionItem.ROUTEDEF && item.workingversion === String(orionItem.workingVersion)));
  return nemesisRouteDef;
};
  /**
   *
   * @returns - returns the table  of bpmn and dmn deployed in Camunda and Orion or routeDef deployed in Nemesis and Orion
   */
  render() {
    const camundaBpmnDmn = this.state?.camundaBpmnDmn;
    let orionBpmnDmn = this.state?.orionBpmnDmn;
   const newBpmnDmnArray = this.removeMatchingRecords(camundaBpmnDmn, orionBpmnDmn);
    orionBpmnDmn = orionBpmnDmn.filter((item) => item !== "error" && item !== "No data found.");
    const nemesisRouteDef = this.state?.nemesisRouteDef;
    const orionRouteDef = this.state?.orionRouteDef;
    const newRouteArray = this.removeMatchingRouteRecords(nemesisRouteDef, orionRouteDef);

    return (
      <div>
        {
        // eslint-disable-next-line
        this.state?.camundaBpmnDmn && this.state.engineType === "CAMUNDA" ? (
          this.renderCamundaData(newBpmnDmnArray, orionBpmnDmn)
        ) : this.state?.nemesisRouteDef && this.state.engineType === "NEMESIS" ? (
          this.renderNemesisData(newRouteArray, orionRouteDef)
        ) : (
          <>
            {" "}
            <span className={styles.spinner}>
              <span />
              <span />
            </span>
            <span className="loading">loading</span>{" "}
          </>
        )}
        <ToastNotify
          pushToast={(click: (toast: ToastNote) => void) => (this.addToast = click)}
          removeToast={(click: (toast: ToastNote) => void) => (this.removeToast = click)}
          toastPosition={"top-center"}
        />
        {this.renderBpmnViewer()}
        {this.renderRouteViewer()}
      </div>
    );
  }
}
export default EngineInstanceEntities;
