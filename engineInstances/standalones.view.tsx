import styles from "./EngineInstanceEntities.module.scss";
import {
  generateEnv,
  getSubViewStyles,
  getTagNames,
  renderError,
  renderLoadingCard,
  renderNoResults,
} from "./EngineInstancesCommons.view";
import EnginesSubView from "./EnginesInstancesSub.view";
import OrionTable, { OrionTableColumn } from "@/components/resuable-table/OrionTable.component";
import { TableSortType, ColumnFilterType } from "@/components/resuable-table/OrionTable.types";
import { EngineInstance, Tag } from "@/services/entity/controllers/EngineInstance/models/EngineInstance";
import { Environment } from "@/services/entity/controllers/Environment/models/Environment";
import { EngineInstanceHandler } from "@/services/entity/handlers/EngineInstance.handler";
import { EngineInstanceBpmnHandler } from "@/services/entity/handlers/EngineInstanceBpmn.handler";
import { EngineInstanceDmnHandler } from "@/services/entity/handlers/EngineInstanceDmn.handler";
import { EngineInstanceRouteDefHandler } from "@/services/entity/handlers/EngineInstanceRouteDef.handler";
import { get, isUndefined } from "lodash";
import React from "react";
import { Container, Button } from "react-bootstrap";
import { BiEdit } from "react-icons/bi";
import { BsEmojiFrown } from "react-icons/bs";

/**
 * @description- this interface is used to define the props of the standalones engine instances view
 * @param loading - loading state of the engine instances
 * @param engineInstances - list of engine instances
 * @param search - search string
 * @param pageType - page type
 * @param groupedTenants - list of grouped tenants
 * @param edit - edit function
 */
interface StandalonesViewProps {
  loading: boolean;
  engineInstances: any[] | undefined;
  search: string;
  pageType: string;
  noneGroupTenants: any;
  edit: Function;
  envOptions: Environment[];
}
/**
 * @description - this class is used to render the non grouped tenants
 */
class StandalonesView extends React.Component<StandalonesViewProps> {
  // eslint-disable-next-line
  bpmnHandler: EngineInstanceBpmnHandler;
  dmnHandler: EngineInstanceDmnHandler;
  engineHandler: EngineInstanceHandler;
  routeDefHandler: EngineInstanceRouteDefHandler;
  constructor(props: StandalonesViewProps) {
    super(props);
    this.bpmnHandler = new EngineInstanceBpmnHandler();
    this.dmnHandler = new EngineInstanceDmnHandler();
    this.engineHandler = new EngineInstanceHandler();
    this.routeDefHandler = new EngineInstanceRouteDefHandler();
  }

  /**
   * @description - this function renders the orion table using resuable orion table component
   * @param columns - columns to be displayed in the table
   * @param tableData - data to be displayed in the table
   * @param showPagination - show pagination or not . by default it is true
   * @param showFooter - show footer or not . by default it is true
   * @returns
   */
  renderOrionTable = (
    columns: OrionTableColumn[],
    tableData: any[],
    showPagination: boolean = true,
    showFooter: boolean = true
  ) => (
    <OrionTable
      columns={columns}
      data={tableData}
      footer={showFooter}
      handleClick={async (row: any, event: any) => {
        if (typeof row.editFunction === "function") {
          row.editFunction(row.id);
        } else {
          console.error("editFunction is not a function");
        }
      }}
      paginationVisible={showPagination}
      rowCount={20}
      startIndex={1}
    />
  );

  /**
   *@description - this function generates the standalone table data
   * @param noneGroupTenants -list of none grouped tenants
   * @param subViewStyles - subview styles
   * @returns -table data
   */
  generateStandaloneTableData = (noneGroupTenants: any[], subViewStyles?: React.CSSProperties) =>
    noneGroupTenants.map((engine) => ({
      ...engine,
      nickName: engine.name,
      editFunction: this.props.edit,
      description: engine.description ? engine.description : "Description length is 0 or undefined",
      environment: generateEnv(engine.envId, this.props.envOptions),
      tags: getTagNames(engine.tags),
      engineType: engine.engineType,
      subViewStyles,
      actions: (
        <ul className={"releases-actions-list"} data-permission-id={"UOR0502"}>
          <Button
            className={styles["edit-engine-btn"]}
            data-list-id={"true"}
            data-permission-id={"UOR0502"}
            onClick={async (event: any) => {
              event.stopPropagation();
              if (typeof this.props.edit === "function") {
                this.props.edit(engine.id);
              } else {
                console.error("editFunction is not a function");
              }
            }}
          >
            <BiEdit className={styles["engine-edit-icon"]} size={20} />
          </Button>
        </ul>
      ),
      expandable: true,
      expanded: false,
      renderExpanded: () => (
        <EnginesSubView
          engineInstances={this.props.engineInstances || []}
          generateStandaloneTableData={this.generateStandaloneTableData}
          getSubViewStyles={getSubViewStyles}
          id={engine.id}
          pageType={this.props.pageType}
          renderOrionTable={this.renderOrionTable}
        />
      ),
    }));

  /**
   * @description -this function renders the standalone view
   * @returns - table of nonegrouped tenants
   */
  render() {
    const { loading, engineInstances, search, pageType } = this.props;

    const columns = [
      {
        header: "Name",
        name: "nickName",
        currentSort: TableSortType.NON,
        sort: true,
        filter: ColumnFilterType.STRING,
      } as OrionTableColumn,
      {
        header: "Description",
        name: "description",
        currentSort: TableSortType.NON,
        sort: true,
        filter: ColumnFilterType.STRING,
      } as OrionTableColumn,
      {
        header: "Environment",
        name: "environment",
        currentSort: TableSortType.NON,
        sort: true,
        filter: ColumnFilterType.STRING,
      } as OrionTableColumn,
      {
        header: "EngineType",
        name: "engineType",
        currentSort: TableSortType.NON,
        sort: true,
        filter: ColumnFilterType.STRING,
      } as OrionTableColumn,
      {
        header: "Tags",
        name: "tags",
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
        customStyles: { width: "4%" },
      } as OrionTableColumn,
    ];

    let tableData = [];
    if (loading) {
      return <>{renderLoadingCard()}</>;
    } else if (
      engineInstances === undefined ||
      engineInstances?.length === 0 ||
      (engineInstances &&
        engineInstances.filter((x: EngineInstance) => x.groupId !== null).length === 0 &&
        pageType === "groups")
    ) {
      return (
        <Container className="no-environments">
          <p className={"noResults text_motion"}>
            <BsEmojiFrown size={30} /> <br /> <br />
            No Engine Instances found.
          </p>
        </Container>
      );
    }

    if (engineInstances !== undefined) {
      const standaloneItems: EngineInstance[] = [];
      let newData: any[] = [];
      const tenantData: any[] = [];
      // eslint-disable-next-line
      engineInstances.map((engine: EngineInstance) => {
        if (engine.groupId === undefined) {
          return standaloneItems.push(engine);
        }
      });

      if (pageType === "standalones") {
        newData = [...standaloneItems];
      }

      let searching: boolean = false;

      if (search.length > 2 && newData.length > 0) {
        newData = newData.filter(
          // eslint-disable-next-line
          (engine: EngineInstance) => {
            if (engine.description && engine.description!.toLowerCase().includes(search.toLowerCase())) {
              return engine;
            }
            if (engine.name.toLowerCase().includes(search.toLowerCase())) {
              return engine;
            }
            if (
              engine.tags.length > 0 &&
              engine.tags.filter((y: Tag) => y.name.toLowerCase().includes(search.toLowerCase())).length > 0
            ) {
              return engine;
            }
            // eslint-disable-next-line array-callback-return
          }
        );
        // eslint-disable-next-line array-callback-return
        searching = true;
      }
      let content: any;
      if (searching) {
        if (newData.length > 1) {
          let item: any = null;
          if (pageType === "standalones") {
            item = this.props.noneGroupTenants.filter((instance: EngineInstance) =>
              newData.some((data: EngineInstance) => data.name === instance.name)
            );
            tableData = this.generateStandaloneTableData(item);
          }
          content = this.renderOrionTable(columns, tableData);
        } else if (newData.length === 1) {
          // let instanceCards: any[] = [];
          let item: any = [];

          if (pageType === "standalones") {
            const standId = get(newData[0], "id");
            item = this.props.noneGroupTenants.filter((instance: any) => instance.id === standId);
            tableData = this.generateStandaloneTableData(item);
          }
          content = this.renderOrionTable(columns, tableData);
        }
      } else {
        if (pageType === "standalones") {
          tableData = this.generateStandaloneTableData(this.props.noneGroupTenants);
        }

        content = this.renderOrionTable(columns, tableData);
      }
      if ((isUndefined(content) || content.length === 0) && search.length > 1) {
        return <>{renderNoResults(search)}</>;
      }
      return <Container>{content}</Container>;
    }
    return <> {renderError()}</>;
  }
}

export default StandalonesView;
