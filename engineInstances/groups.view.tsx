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
 * @description- this interface is used to define the props of the groups view
 * @param loading - loading state of the engine instances
 * @param engineInstances - list of engine instances
 * @param search - search string
 * @param pageType - page type
 * @param groupedTenants - list of grouped tenants
 * @param edit - edit function
 */
interface GroupsViewProps {
  loading: boolean;
  engineInstances: any[] | undefined;
  search: string;
  pageType: string;
  groupedTenants: any;
  edit: Function;
  envOptions: Environment[];
  groupsDescription: any[];
}

/**
 * @description - this class is used to render the grouped tenants
 */
class GroupsView extends React.Component<GroupsViewProps> {
  // eslint-disable-next-line
  bpmnHandler: EngineInstanceBpmnHandler;
  dmnHandler: EngineInstanceDmnHandler;
  engineHandler: EngineInstanceHandler;
  routeDefHandler: EngineInstanceRouteDefHandler;
  constructor(props: GroupsViewProps) {
    super(props);
    this.bpmnHandler = new EngineInstanceBpmnHandler();
    this.dmnHandler = new EngineInstanceDmnHandler();
    this.engineHandler = new EngineInstanceHandler();
    this.routeDefHandler = new EngineInstanceRouteDefHandler();
  }

  /**
   * @description - this function generates the description of the grouped engine instances
   * @param groupId - group id of the grouped tenants
   * @param groupsDescription - list of groups description
   * @returns
   */
  generateDescription = (groupId: string, groupsDescription: any[]) => {
    let description = "loading...";
    const group = groupsDescription.filter((group) => group.ID === groupId);
    if (group.length > 0) {
      description = group[0].DESCRIPTION;
    }
    return description;
  };

  /**
   * @ description - this function generates the groups table data
   * @param groupedTenants - array of grouped tenants
   * @returns
   */
  generateGroupsTableData = (groupedTenants: any[]) =>
    groupedTenants.map((card) => ({
      ...card.props,
      name: card.props.nickName,
      description: this.generateDescription(card.props.id, this.props.groupsDescription),
      expandable: true,
      expanded: false,
      renderExpanded: () => (
        <EnginesSubView
          engineInstances={this.props.engineInstances || []}
          generateStandaloneTableData={this.generateStandaloneTableData}
          getSubViewStyles={getSubViewStyles}
          id={card.props.id}
          pageType={this.props.pageType}
          renderOrionTable={this.renderOrionTable}
        />
      ),
    }));

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
          pageType={"standalones"}
          renderOrionTable={this.renderOrionTable}
        />
      ),
    }));
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
   * @description -this function renders the groups view
   * @returns - table of grouped tenants
   */
  render() {
    const { loading, engineInstances, search, pageType, groupedTenants } = this.props;
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
      const groupItems: EngineInstance[] = [];
      let newData: any[] = [];
      let tenantData: any[] = [];
      // eslint-disable-next-line
      engineInstances.map((engine: EngineInstance) => {
        if (engine.groupId !== undefined) {
          return groupItems.push(engine);
        }
      });

      if (pageType === "groups") {
        newData = [...groupItems];
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
            const tenantId = groupedTenants.filter((tenant: any) => {
              if (tenant.props.nickName.toLowerCase().includes(search.toLowerCase())) {
                return tenant;
              }
            });
            if (engine.groupId === tenantId[0]?.props.id) {
              return engine;
            }
          }
        );
        // eslint-disable-next-line array-callback-return
        tenantData = groupedTenants.filter((tenant: any) => {
          if (tenant.props.nickName.toLowerCase().includes(search.toLowerCase())) {
            return tenant;
          }
        });
        searching = true;
      }

      let content: any;
      if (searching) {
        if (newData.length > 1) {
          let item: any = null;
          if (pageType === "groups") {
            item = this.props.groupedTenants.filter((instance: any) =>
              tenantData.some((data) => data.props.nickName === instance.props.nickName)
            );
            tableData = this.generateGroupsTableData(item);
          }
          content = this.renderOrionTable(columns, tableData);
        } else if (newData.length === 1) {
          let instanceCards: any[] = [];
          let item: any = [];

          if (pageType === "groups") {
            instanceCards = [...this.props.groupedTenants];
            const groupId = get(newData[0], "groupId");
            item = this.props.groupedTenants.filter((o: any) => get(o, "props.id", "") === groupId);
            tableData = this.generateGroupsTableData(item);
          }
          content = this.renderOrionTable(columns, tableData);
        }
      } else {
        if (pageType === "groups") {
          tableData = this.generateGroupsTableData(this.props.groupedTenants);
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

export default GroupsView;
