/* eslint-disable react/jsx-sort-props */
// eslint-disable-next-line
import { CreateEngineInstanceGroupDto } from "../../services/entity/controllers/EngineInstance/models/CreateEngineInstanceGroup.dto";
import Footer from "@/components/footer/Footer.component";
import PageTransition, { IPageTransitionProps } from "@/components/page-transition/PageTransition.component";
import ToastNotify, { ToastNote } from "@/components/toast-notify/ToastNotify.component";
import { CreateEngineInstanceDto } from "@/services/entity/controllers/EngineInstance/models/CreateEngineInstance.dto";
import { EngineInstance, EngineType } from "@/services/entity/controllers/EngineInstance/models/EngineInstance";
import { EngineInstanceGroup } from "@/services/entity/controllers/EngineInstance/models/EngineInstanceGroup";
import { UpdateEngineInstanceDto } from "@/services/entity/controllers/EngineInstance/models/UpdateEngineInstance.dto";
import { Environment } from "@/services/entity/controllers/Environment/models/Environment";
import { EngineInstanceHandler } from "@/services/entity/handlers/EngineInstance.handler";
import { EnvironmentHandler } from "@/services/entity/handlers/Environment.handler";
import GroupsView from "@/views/engineInstances/groups.view";
import StandalonesView from "@/views/engineInstances/standalones.view";
import { AxiosError } from "axios";
import ComposedAuth, { IAuthPermissionProps } from "components/auth/Auth.component";
import InstanceCard from "components/instance-card/InstanceCard.component";
import TabRadioSelector from "components/tab-radio-selector/TabRadioSelector.component";
import { ITemplateProps, TemplateRender, TemplateType } from "components/template/Template";
import { EngineInstanceTour } from "components/tour/steps/EngineInstances.tour";
import { IWizardPageProps } from "components/wizard-page/WizardPage.component";
import Wizard from "components/wizard/Wizard.component";
import NewInstancePage1 from "components/wizard/new-instance/NewInstancePage1/NewInstancePage1.wizard";
import NewInstancePage2 from "components/wizard/new-instance/NewInstancePage2.wizard";
import NewInstancePage3 from "components/wizard/new-instance/NewInstancePage3.wizard";
import PageComponent from "pages/page-component/PageComponents";
import React from "react";
import { Alert, Button, FormControl, InputGroup } from "react-bootstrap";
import { AiOutlineClose, AiOutlineNodeIndex } from "react-icons/ai";
import { BiRename, BiSearch } from "react-icons/bi";
import { FaExclamationTriangle } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { ImMakeGroup } from "react-icons/im";
import { SiKubernetes } from "react-icons/si";
import { TbCirclesFilled, TbPlayerRecordFilled } from "react-icons/tb";
import { connect } from "react-redux";
import { OrionConfig } from "store/features/config/ConfigHelper";
import { IConfigDispatch, selectConfig } from "store/features/config/ConfigSlice";
// eslint-disable-next-line
// eslint-disable-next-line import/no-deprecated
import { InstanceCardColor, StepBarItemStatus, instancePageBreadCrumbs } from "utils/Constants";

/**
 *
 *
 * @export
 * @interface IEngineInstancesProps
 * @extends {RouteComponentProps}
 * @summary Props for EngineInstances Page.
 * @author Gavin Monroe
 */
export interface IEngineInstancesProps extends IConfigDispatch, IAuthPermissionProps, IPageTransitionProps {
  template: ITemplateProps;
  config: OrionConfig;
}

/**
 *
 *
 * @interface IEngineInstancesState
 * @author Gavin Monroe
 * @summary State For EngineInstances Page.
 */
interface IEngineInstancesState {
  engineInstances?: EngineInstance[];
  show: boolean;
  loading: boolean;
  search: string;
  cont: boolean;
  pages: IWizardPageProps[];
  engineInstance: EngineInstance;
  editingGroupId: string;
  editEngineInstance?: EngineInstance;
  editEnvironmentGroupMemberCount?: number;
  envOptions: any;
  filterGroupOptions: any;
  filterStandaloneOptions: any;
  groupOptions: any;
  createGroup: any | undefined;
  groupedTenants: any;
  noneGroupTenants: any;
  tags: any[];
  selectedFilter: any;
  enableFilter: boolean;
  pageType: "groups" | "standalones";
  loadingPage: boolean;
  toggleView: boolean;
  deleting: boolean;
  viewGroup: boolean;
  inputEnvironmentUrl: string;
  chosenEngineType: string;
  removeGroup: boolean;
  errorGrabbingRequiredData: boolean;
  groupsDescription: any[];
}
/**
 *
 *
 * @class EngineInstances
 * @extends {PageComponent<IEngineInstancesProps, IEngineInstancesState>}
 * @summary EngineInstances Page.
 */
class EngineInstances extends PageComponent<IEngineInstancesProps, IEngineInstancesState> {
  // eslint-disable-next-line react/sort-comp
  previousGroupId: string;
  newInstancePage3Ref: React.RefObject<any>;
  wizardRef: React.RefObject<any>;
  constructor(props: IEngineInstancesProps | Readonly<IEngineInstancesProps>) {
    super(props, "EngineInstances", ["AOR0101"]);
    this.previousGroupId = " ";
    this.handler = new EngineInstanceHandler(this.handleError);
    this.environmentHandler = new EnvironmentHandler(this.handleError);
    this.newInstancePage3Ref = React.createRef();
    this.wizardRef = React.createRef();
    this.setViewGroup = this.setViewGroup.bind(this);
    this.setRemoveGroup = this.setRemoveGroup.bind(this);
    this.setEditingGroupId = this.setEditingGroupId.bind(this);
    this.setPreviousGroupId = this.setPreviousGroupId.bind(this);
    this.setUserChosenEngineType = this.setUserChosenEngineType.bind(this);
  }
  async componentDidMount() {
    this.props.getPermissions && (await this.props.getPermissions());
    await this.pullEnvs(true);
    await this.handler.getGroupsDescription().then((result) => this.setState({ groupsDescription: [...result.data] }));
    if (this.state.envOptions === undefined) {
      return;
    }
    // eslint-disable-next-line
    this.state.envOptions.map((type: Environment) => {
      if (type.priority > 0) {
        this.setState({
          filterGroupOptions: [...this.state.filterGroupOptions, { name: type.name, id: type.id }],
        });
        this.setState({
          filterStandaloneOptions: [...this.state.filterStandaloneOptions, { name: type.name, id: type.id }],
        });
      }
    });
  }
  handler: EngineInstanceHandler;
  environmentHandler: EnvironmentHandler;
  disableElement: Function = this.props.disableElement ? this.props.disableElement : () => false;
  setPreviousGroupId = (input: string) => (this.previousGroupId = input);

  // eslint-disable-next-line
  state: IEngineInstancesState = {
    pageType: "groups",
    deleting: false,
    show: false,
    loading: true,
    search: "",
    cont: false,
    filterGroupOptions: [],
    filterStandaloneOptions: [],
    enableFilter: false,
    editingGroupId: "",
    pages: [
      {
        buttons: {
          primaryButtonFunction: () => {
            this.updateContinue(false);
          },
          primaryButtonClassName: "",
          primaryButtonText: "Next",
          secondaryButtonClassName: "",
          secondaryButtonFunction: () => {
            this.showThat(false);
          },
          secondaryButtonText: "Cancel",

          optionalButton: true,
          optionalButtonOverlay: true,
          optionalButtonOverlayText: "Are you sure?",
          optionalButtonTooltipText: "Yes",
          optionalButtonText: "Delete",
          optionalButtonVariant: "danger",
          optionalButtonClassName: "delete-env",
        },
        stepItem: {
          icon: <AiOutlineNodeIndex className={"wizard-icon"} />,
          stepNumber: 1,
          status: StepBarItemStatus.INCOMPLETE,
        },
        content: <> </>,
        contCallBack: () => {
          this.updateContinue(true);
        },
        edit: () => {
          if (this.state.editEngineInstance) {
            return this.state.editEngineInstance;
          }
          return undefined;
        },
      },
      {
        buttons: {
          primaryButtonFunction: () => {
            this.updateContinue(false);
          },
          primaryButtonClassName: "",
          primaryButtonText: "Next",
          secondaryButtonClassName: "",
          secondaryButtonFunction: () => {
            setTimeout(() => this.fillThat(this.state.engineInstance), 50);
            this.updateContinue(true);
          },
          secondaryButtonText: "Back",

          optionalButton: true,
          optionalButtonOverlay: true,
          optionalButtonOverlayText: "Are you sure?",
          optionalButtonTooltipText: "Yes",
          optionalButtonText: "Delete",
          optionalButtonVariant: "danger",
          optionalButtonClassName: "delete-env",
        },
        stepItem: {
          icon: <BiRename className={"wizard-icon"} />,
          stepNumber: 2,
          status: StepBarItemStatus.INCOMPLETE,
        },
        content: <> </>,
        edit: () => {
          if (this.state.editEngineInstance) {
            return this.state.editEngineInstance;
          }
          return undefined;
        },
      },
      {
        buttons: {
          primaryButtonFunction: async () => {
            this.updateContinue(false);
            const userUrl = this.state.engineInstance;
            let result: any;
            if (this.state.engineInstance.url.includes("http:")) {
              userUrl.url = this.state.engineInstance.url.replace("http://", "https://");
            }
            if (this.state.editEngineInstance) {
              result = await this.createNewGroup();
              const payload = new UpdateEngineInstanceDto(
                this.state.engineInstance.id,
                userUrl.name,
                userUrl.description ? userUrl.description : "No summary provided.",
                userUrl.url,
                userUrl.color ? userUrl.color : InstanceCardColor.NAVY,
                userUrl.tags,
                userUrl.engineType,
                userUrl.envId,
                "system",
                userUrl.groupId
              );
              result = await this.handler.updateEngineInstance(payload).then((value: any) => value);
              if (
                this.state.editEnvironmentGroupMemberCount === 1 &&
                this.state.pageType === "groups" &&
                this.state.removeGroup
              ) {
                await this.handler.deleteEngineInstanceGroup(this.state.editingGroupId);
              }
              this.changePageType();
            } else {
              result = await this.createNewGroup();
              const payload = new CreateEngineInstanceDto(
                userUrl.name,
                userUrl.description ? userUrl.description : "No summary provided.",
                userUrl.url,
                userUrl.color ? userUrl.color : InstanceCardColor.NAVY,
                userUrl.tags,
                userUrl.engineType,
                userUrl.envId,
                "system",
                userUrl.groupId
              );
              result = await this.handler.createEngineInstance(payload).then((value: any) => value);
            }

            if (result.success) {
              this.showThat(false);
              await this.pullEnvs();
            }
            /* change view after Save is clicked */
            this.changePageType();
          },
          primaryButtonClassName: "",
          primaryButtonText: "Save",
          secondaryButtonClassName: "",
          secondaryButtonFunction: () => {
            setTimeout(() => this.fillThat(this.state.engineInstance), 50);
          },
          secondaryButtonText: "Back",

          optionalButton: true,
          optionalButtonOverlay: true,
          optionalButtonOverlayText: "Are you sure?",
          optionalButtonTooltipText: "Yes",
          optionalButtonText: "Delete",
          optionalButtonVariant: "danger",
          optionalButtonClassName: "delete-env",
        },
        stepItem: {
          icon: <ImMakeGroup className={"wizard-icon"} />,
          stepNumber: 3,
          status: StepBarItemStatus.INCOMPLETE,
        },
        content: <> </>,
        contCallBack: () => {
          this.updateContinue(true);
        },
        edit: () => {
          if (this.state.editEngineInstance) {
            return this.state.editEngineInstance;
          }
          return undefined;
        },
      },
    ],
    tags: [],
    engineInstance: new EngineInstance({}),
    groupOptions: {},
    createGroup: undefined,
    groupedTenants: {},
    noneGroupTenants: {},
    envOptions: undefined,
    selectedFilter: [],
    loadingPage: true,
    toggleView: false,
    viewGroup: false,
    inputEnvironmentUrl: "",
    chosenEngineType: "",
    removeGroup: false,
    errorGrabbingRequiredData: false,
    groupsDescription: [],
  };

  setEditingGroupId = (input: string) => this.setState({ editingGroupId: input });
  setRemoveGroup = (input: boolean) => this.setState({ removeGroup: input });

  changePageType = () => {
    if (this.state.viewGroup) {
      this.setState({ pageType: "groups" });
    } else {
      this.setState({ pageType: "standalones" });
    }
  };

  createNewGroup = async () => {
    if (this.state.createGroup !== undefined) {
      const result = await this.handler
        .createEngineInstanceGroup(
          new CreateEngineInstanceGroupDto(this.state.createGroup!.name, this.state.createGroup!.id)
        )
        .then((value: any) => value);
      return result;
    }
    return " ";
  };

  pullEnvs = async (updateOptions = false) => {
    let envOptions = this.state.envOptions;
    const groupOptions = await this.handler.getEngineInstanceGroups().catch((error) => {
      this.setState({ errorGrabbingRequiredData: true });
    });
    if (updateOptions) {
      envOptions = await this.environmentHandler.getEnvironments().catch((error) => {
        this.setState({ errorGrabbingRequiredData: true });
      });
    }
    await this.handler.getEngineInstances().then((value: EngineInstance[]) => {
      if (value instanceof AxiosError || this.state.errorGrabbingRequiredData) {
        return;
      }
      // eslint-disable-next-line array-callback-return
      value.map((x: EngineInstance) => {
        const envPriority = envOptions.find((env: Environment) => env.id === x.envId);
        if (envPriority) {
          x.priority = envPriority.priority;
        }
      });

      const noneGroupItems = value.filter(
        (engine: EngineInstance) => engine.groupId === undefined || engine.groupId === ""
      );

      let tempTenants = [...value];
      tempTenants = tempTenants.filter((x: EngineInstance) => !noneGroupItems.includes(x));

      const groupedItems: InstanceCard[] = [];
      groupOptions.forEach((group: EngineInstanceGroup) => {
        const groupedTenants = tempTenants.filter((tenant: EngineInstance) => tenant.groupId === group.id);

        if (groupedTenants.length > 0) {
          groupedItems.push(
            new InstanceCard({
              group: true,
              groupItems: groupedTenants,
              nickName: group.name,
              id: group.id,
              description: "Grouped Tenants",
              color: InstanceCardColor.NAVY,
              editFunction: this.editThat,
              popover: this.editThat,
              engineType: EngineType.NEMESIS,
              // eslint-disable-next-line object-shorthand
            })
          );
        }
      });

      this.setState({
        engineInstances: value,
        loading: false,
        // eslint-disable-next-line
        envOptions: envOptions,
        groupOptions,
        groupedTenants: groupedItems,
        noneGroupTenants: noneGroupItems,
        deleting: false,
      });
    });
  };

  clickedThat = (movement: number) => {};
  showThat = (show: boolean) => {};
  fillThat = (env: EngineInstance) => {};
  setThat = (num: number) => {};
  updateContinue = (cont: boolean) => {
    this.setState({ cont });
  };
  setViewGroup = (input: boolean) => {
    this.setState({ viewGroup: input });
  };
  setUserInputEnvUrl = (input: string) => {
    this.setState({ inputEnvironmentUrl: input });
  };
  setUserChosenEngineType = (input: string) => {
    this.setState({ chosenEngineType: input });
  };

  grabEnv = () => {
    if (this.state.editEngineInstance) {
      return this.state.editEngineInstance;
    }
    return this.state.engineInstance;
  };

  updateEnv = (env: EngineInstance) => {
    this.setState({
      engineInstance: env,
    });
  };

  editThat = (id: string, groupMembers?: EngineInstance[]) => {
    const membersCount = groupMembers ? groupMembers.length : 0;
    const groupId = groupMembers ? groupMembers[0].groupId : " ";
    const env = this.state.engineInstances!.find((x: EngineInstance) => x.id === id);
    if (env) {
      this.setState({ editEngineInstance: env });
      groupMembers && this.setState({ editEnvironmentGroupMemberCount: membersCount, editingGroupId: groupId });
      this.showThat(true);
    }
  };

  disableReload = (e: any) => {
    e.preventDefault();
  };

  deleteEnv = async (id: string) => {
    let result: any = await this.handler.deleteEngineInstance(id).then((value: any) => value);
    if (result.success) {
      this.setState({ deleting: true });
      this.showThat(false);
      const groupId: any = this.state.editEngineInstance?.groupId;
      const envGroups = await this.handler.getEngineInstanceGroups();
      const affectedGroup = envGroups.filter((group: EngineInstanceGroup) => group.id === groupId);
      const environments = this.state.engineInstances?.filter((env) => env.groupId === groupId);
      if (affectedGroup.length === 1 && environments?.length === 1) {
        result = await this.handler.deleteEngineInstanceGroup(groupId).then((value: any) => value);
      }
      await this.pullEnvs();
    }
  };

  updateCreateGroup = (data: any) => {
    this.setState({ createGroup: data });
  };

  onToggle = (toggleState: any) => {};

  switchPages = async (page: string) => {
    if (this.state.pageType !== page) {
      if (page === "groups") {
        this.setState({
          toggleView: false,
          pageType: "groups",
        });
      } else {
        this.setState({
          toggleView: false,
          pageType: "standalones",
        });
      }
    }
  };

  renderModal = () => (
    <Wizard
      closeFunction={() => {
        if (this.state.editEngineInstance && !this.state.deleting) {
          this.pullEnvs();
        }
      }}
      disableElement={this.disableElement}
      getPermissions={this.props.getPermissions}
      pagesProps={[{ ...this.state.pages[0] }, { ...this.state.pages[1] }, { ...this.state.pages[2] }]}
      setPageNum={(click: (num: number) => void) => (this.setThat = click)}
      show={(click: (show: boolean) => void) => (this.showThat = click)}
      title={this.state.editEngineInstance ? "Edit Engine Instance" : "Add New Engine Instance"}
      continue={this.state.cont}
      optionalButtonCallback={
        this.state.editEngineInstance! !== undefined
          ? () => this.deleteEnv(this.state.editEngineInstance!.id)
          : () => {}
      }
      optionalDataPermissionId={this.state.pageType === "groups" ? "UOR0104" : "UOR0105"}
      primaryDataPermissionId={this.state.pageType === "groups" ? "UOR0107" : "UOR0106"}
      optionalButtonFocus={this.state.editEngineInstance ? this.state.editEngineInstance : undefined}
      pages={[
        <NewInstancePage1
          fill={(click: (env: EngineInstance) => void) => (this.fillThat = click)}
          {...this.state.pages[0]}
          config={this.props.config}
          contCallBack={this.updateContinue}
          grabEnv={this.grabEnv}
          key={"NewInstancePage1"}
          updateEnv={this.updateEnv}
          setInputUrlOnParent={this.setUserInputEnvUrl}
          setChosenEngineTypeOnParent={this.setUserChosenEngineType}
        />,
        <NewInstancePage2
          fill={(click: (env: EngineInstance) => void) => (this.fillThat = click)}
          {...this.state.pages[1]}
          contCallBack={this.updateContinue}
          grabEnv={this.grabEnv}
          key={"NewInstancePage2"}
          updateEnv={this.updateEnv}
        />,
        <NewInstancePage3
          {...this.state.pages[2]}
          contCallBack={this.updateContinue}
          editing={this.state.editEngineInstance}
          environments={this.state.envOptions}
          grabEnv={this.grabEnv}
          groups={this.state.groupOptions}
          key={"NewInstancePage3"}
          ref={this.newInstancePage3Ref}
          setRemoveGroup={this.setRemoveGroup}
          tenants={this.state.engineInstances!}
          updateEnv={this.updateEnv}
          updateGroup={this.updateCreateGroup}
          userUrlFromParent={this.state.inputEnvironmentUrl}
          userEngineTypeFromParent={this.state.chosenEngineType}
          viewGroupSetter={this.setViewGroup}
          pageType={this.state.pageType}
        />,
      ]}
      ref={this.wizardRef}
    />
  );

  /**
   * @summary - this function is used to render groupedTenants and noneGroupTenants groups and standalone engine instances based on the pageType
   * performs search
   * @returns - table or placeholder of no results found or loading to the render function
   */
  renderItems = () => {
    const {
      loading,
      engineInstances,
      search,
      pageType,
      groupedTenants,
      noneGroupTenants,
      envOptions,
      groupsDescription,
    } = this.state;
    if (pageType === "groups") {
      return (
        <GroupsView
          loading={loading}
          engineInstances={engineInstances}
          search={search}
          pageType={pageType}
          groupedTenants={groupedTenants}
          edit={this.editThat}
          envOptions={envOptions}
          groupsDescription={groupsDescription}
        />
      );
    } else if (pageType === "standalones") {
      return (
        <StandalonesView
          loading={loading}
          engineInstances={engineInstances}
          search={search}
          pageType={pageType}
          noneGroupTenants={noneGroupTenants}
          edit={this.editThat}
          envOptions={envOptions}
        />
      );
    }
  };

  addToast = (toast: ToastNote) => {};
  removeToast = (toast: ToastNote) => {};

  handleError = (error: any) => {
    const generalServerError: string = "Server Error occurred, page may not function appropriately.";
    const generalDeleteError: string = "Failed to delete Engine Instance.";
    const dataConstraintError: string = "Can't delete due to data constraint for a given deployment.";

    const wizardRef = this.wizardRef.current;
    const isToolTipOpen = wizardRef.state.tooltip;
    const isResponseDataUndefined = (error.response === undefined || error.response.data === undefined);

    let message: string = "";
    if (isResponseDataUndefined) {
      message = generalServerError;
    }

    if (wizardRef && isToolTipOpen && !isResponseDataUndefined) {
      const localizedMessage: string = (error.response.data as any).cause.cause.localizedMessage || "";
      message = generalDeleteError;

      if (localizedMessage.includes("ORION_DEV.FK_TENANTENVIRONMENT_DR_PAIR_ID")) {
        message = dataConstraintError;
      }
    } else {
      message = generalServerError;
    }

    this.addToast({
      delay: 38000,
      ToastProps: {},
      id: `engineInstance-note-${Math.floor(Math.random() * 90000000).toString()}`,
      title: `${isResponseDataUndefined ? '500' : error.response.status} HTTP Error`,
      summary: message,
      addedTime: new Date(),
      variant: "Danger",
      show: true,
    });
  };

  /**
   * @summary - this function is used to render the engine instances page
   * @returns
   */

  render() {
    const { errorGrabbingRequiredData } = this.state;
    const { getPermissions, disableElement, permissionsRetrieved, disabledElements } = this.props;
    return (
      <>
        {this.renderModal()}
        <ToastNotify
          pushToast={(click: (toast: ToastNote) => void) => (this.addToast = click)}
          removeToast={(click: (toast: ToastNote) => void) => (this.removeToast = click)}
          toastPosition={"top-center"}
        />
        {TemplateRender(
          EngineInstancesTemplate,
          {},
          undefined,
          getPermissions,
          disabledElements,
          disableElement,
          permissionsRetrieved
        )}
        <PageTransition ref={this.props.transitionRef}>
          <div className="instances--content" style={{ marginBottom: "40px" }}>
            <div className="instances--inner-content">
              <div className={"instances--action"}>
                <Button
                  className={`orion-success-button buttonShadow ${
                    this.state.groupedTenants.length === 0 || this.state.noneGroupTenants.length === 0 ? "blink" : ""
                  }`}
                  id="create-new-engine-instance"
                  data-permission-id={this.state.pageType === "groups" ? "UOR0103" : "UOR0102"}
                  disabled={this.disableElement([`${this.state.pageType === "groups" ? "UOR0103" : "UOR0102"}`])}
                  onClick={() => {
                    this.setState(
                      {
                        editEngineInstance: undefined,
                        cont: false,
                        engineInstance: new EngineInstance({}),
                      },
                      () => this.showThat(true)
                    );
                  }}
                  variant="success"
                >
                  + Create New Engine
                </Button>
                <div className={"instances--action-search searchShadow"}>
                  <InputGroup>
                    <div className={"search-icon"}>
                      <BiSearch size={15} />
                    </div>
                    <FormControl
                      className={"search-bar"}
                      onChange={(e: any) => {
                        this.setState({ search: e.target.value });
                        if (e.target.value.length > 1) {
                          this.setState({ enableFilter: true });
                        } else {
                          this.setState({ enableFilter: false });
                        }
                      }}
                      placeholder="Search..."
                      type="text"
                    />
                    <div className={"search-clear"}>
                      {this.state.search.length > 0 && (
                        <AiOutlineClose
                          size={18}
                          onClick={(e: any) => {
                            const input: HTMLInputElement | null = document.querySelector(
                              ".search-bar"
                            ) as HTMLInputElement;
                            if (input) {
                              input.value = "";
                              this.setState({ search: "" });
                            }
                          }}
                        />
                      )}
                    </div>
                  </InputGroup>
                </div>
              </div>
              <div />
              <TabRadioSelector
                thin
                tabs={[
                  {
                    text: "Groups",
                    onClick: () => this.switchPages("groups"),
                    selected: this.state.pageType === "groups",
                    icon: <TbCirclesFilled />,
                  },
                  {
                    text: "Standalones",
                    onClick: () => this.switchPages("standalones"),
                    selected: this.state.pageType === "standalones",
                    icon: <TbPlayerRecordFilled />,
                  },
                ]}
              />
              {errorGrabbingRequiredData ? (
                <Alert
                  variant="danger"
                  style={{
                    display: "grid",
                    justifyContent: "center",
                    maxWidth: "450px",
                    margin: "auto",
                    width: "auto",
                  }}
                >
                  <FaExclamationTriangle
                    color={"var(--error-color)"}
                    style={{ height: "84px", padding: "10px", margin: "auto", width: "84px" }}
                  />
                  <p style={{ textAlign: "center" }}>
                    Failed when fetching required page data. <br /> Please try again later...
                  </p>
                  <Button
                    variant="danger"
                    style={{ maxWidth: "220px", minWidth: "160px", margin: "auto" }}
                    onClick={() => {
                      this.setState({ errorGrabbingRequiredData: false });
                      this.pullEnvs(true);
                    }}
                  >
                    {" "}
                    <FiRefreshCcw /> Try Again?
                  </Button>
                </Alert>
              ) : (
                <div className={"instances--resultDiv"}>{this.renderItems()}</div>
              )}
            </div>
          </div>
        </PageTransition>
        <Footer />
      </>
    );
  }
}
export default connect(
  (state: any) => ({
    config: selectConfig(state).config!,
  }),
  { selectConfig }
)(ComposedAuth(EngineInstances));

export const EngineInstancesTemplate: ITemplateProps = {
  templateType: TemplateType.MAIN,
  isAuthRequired: false,
  breadcrumbs: instancePageBreadCrumbs,
  titleProps: {
    title: "Engine Instances",
    breadCrumbs: instancePageBreadCrumbs,
    banner: true,
    className: "engine-instances-header",
    icon: <SiKubernetes />,
  },
  tours: [EngineInstanceTour()],
  disabledTours: [1],
};
