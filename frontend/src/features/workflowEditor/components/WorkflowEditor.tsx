import { Settings as SettingsSuggestIcon } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import IosShareIcon from "@mui/icons-material/IosShare";
import SaveIcon from "@mui/icons-material/Save";
import { Button, Grid, Paper, styled } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { AxiosError } from "axios";
import Loading from "components/Loading";
import { Modal, type ModalRef } from "components/Modal";
import {
  type WorkflowPanelRef,
  WorkflowPanel,
  type DefaultNode,
} from "components/WorkflowPanel";
import { useWorkspaces } from "context/workspaces";
import { useWorkflowsEditor } from "features/workflowEditor/context";
import React, { type DragEvent, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import { type Edge, type Node, type XYPosition } from "reactflow";
import localForage from "services/config/localForage.config";
import { yupResolver, useInterval, exportToJson } from "utils";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import { type IWorkflowPieceData, storageAccessModes } from "../context/types";
import { type DominoWorkflowForage } from "../context/workflowsEditor";
import { containerResourcesSchema } from "../schemas/containerResourcesSchemas";
import { extractDefaultInputValues, extractDefaultValues } from "../utils";

import { PermanentDrawerRightWorkflows } from "./DrawerMenu";
import SidebarPieceForm from "./SidebarForm";
import { ContainerResourceFormSchema } from "./SidebarForm/ContainerResourceForm";
import { createInputsSchemaValidation } from "./SidebarForm/PieceForm/validation";
import { storageFormSchema } from "./SidebarForm/StorageForm";
import {
  SidebarSettingsForm,
  WorkflowSettingsFormSchema,
  type SidebarSettingsFormRef,
} from "./SidebarSettingsForm";

/**
 * Create workflow tab
 // TODO refactor/simplify inner files
 // TODO handle runtime errors
 // TODO make it look good
 */
const getId = (module_name: string) => {
  return `${module_name}_${uuidv4()}`;
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export const WorkflowsEditorComponent: React.FC = () => {
  const workflowPanelRef = useRef<WorkflowPanelRef>(null);
  const sidebarSettingsRef = useRef<SidebarSettingsFormRef>(null);
  const [sidebarSettingsDrawer, setSidebarSettingsDrawer] = useState(false);
  const [sidebarPieceDrawer, setSidebarPieceDrawer] = useState(false);
  const [formId, setFormId] = useState<string>("");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formSchema, setFormSchema] = useState<any>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setBackdropIsOpen] = useState(false);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "horizontal",
  );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const importMenuOpen = Boolean(anchorEl);

  const incompatiblePiecesModalRef = useRef<ModalRef>(null);
  const [incompatiblesPieces, setIncompatiblesPieces] = useState<string[]>([]);

  const { workspace } = useWorkspaces();

  const saveDataToLocalForage = useCallback(async () => {
    if (workflowPanelRef?.current) {
      await Promise.allSettled([
        setWorkflowEdges(workflowPanelRef.current.edges ?? []),
        setWorkflowNodes(workflowPanelRef.current.nodes ?? []),
      ]);
    }
  }, [workflowPanelRef.current]);

  useInterval(saveDataToLocalForage, 3000);

  const {
    clearForageData,
    generateWorkflowsEditorBodyParams,
    fetchWorkflowForage,
    handleCreateWorkflow,
    fetchForagePieceById,
    fetchForageWorkflowNodes,
    fetchForageWorkflowEdges,
    setForageWorkflowPieces,
    getForageWorkflowPieces,
    removeForageWorkflowPiecesById,
    removeForageWorkflowPieceDataById,
    fetchWorkflowPieceById,
    setForageWorkflowPiecesDataById,
    importWorkflowToForage,
    clearDownstreamDataById,
    setWorkflowEdges,
    setWorkflowNodes,
  } = useWorkflowsEditor();

  const validateWorkflowSettings = useCallback(async (payload: any) => {
    const resolver = yupResolver(WorkflowSettingsFormSchema);
    const validatedData = await resolver(payload.workflowSettingsData);
    if (!Object.keys(validatedData.errors).length) {
      // do something
    } else {
      throw new Error("Please review your workflow settings.");
    }
  }, []);

  const validateWorkflowPiecesData = useCallback(
    async (payload: any) => {
      const validationSchema = yup.object().shape(
        Object.entries(payload.workflowPieces).reduce((acc, [key, value]) => {
          return {
            [key]: yup.object({
              storage: storageFormSchema,
              containerResources: ContainerResourceFormSchema,
              inputs: createInputsSchemaValidation((value as any).input_schema),
            }),
            ...acc,
          };
        }, {}),
      ) as any;

      const resolver = yupResolver(validationSchema);

      const validatedData = await resolver(payload.workflowPiecesData);

      if (!Object.keys(validatedData.errors).length) {
        workflowPanelRef?.current?.setNodes((nodes) =>
          nodes.map((n) => {
            n = { ...n, data: { ...n.data, validationError: false } };
            return n;
          }),
        );
      } else {
        const nodeIds = Object.keys(validatedData.errors);
        workflowPanelRef?.current?.setNodes((nodes) => [
          ...nodes.map((n) => {
            if (nodeIds.includes(n.id)) {
              n = { ...n, data: { ...n.data, validationError: true } };
            }

            return n;
          }),
        ]);

        throw new Error("Please review the errors on your workflow.");
      }
    },
    [workflowPanelRef],
  );

  const handleSaveWorkflow = useCallback(async () => {
    try {
      await saveDataToLocalForage();
      setBackdropIsOpen(true);
      if (!workspace?.id) {
        throw new Error("No selected Workspace");
      }
      const payload = await fetchWorkflowForage();

      await validateWorkflowPiecesData(payload);
      await validateWorkflowSettings(payload);

      const data = await generateWorkflowsEditorBodyParams(payload);

      await handleCreateWorkflow({ workspace_id: workspace?.id, ...data });

      toast.success("Workflow created successfully.");
      setBackdropIsOpen(false);
    } catch (err) {
      setBackdropIsOpen(false);
      if (err instanceof AxiosError) {
        console.log(err);
      } else if (err instanceof Error) {
        console.log(err);
        toast.error(
          "Error while creating workflow, check your workflow settings and tasks.",
        );
      }
    }
  }, [
    fetchWorkflowForage,
    handleCreateWorkflow,
    validateWorkflowPiecesData,
    validateWorkflowSettings,
    generateWorkflowsEditorBodyParams,
    workspace?.id,
  ]);

  const handleClear = useCallback(async () => {
    await clearForageData();
    workflowPanelRef.current?.setEdges([]);
    workflowPanelRef.current?.setNodes([]);
    await sidebarSettingsRef.current?.loadData();
  }, [clearForageData]);

  const handleExport = useCallback(async () => {
    await saveDataToLocalForage();
    const payload = await fetchWorkflowForage();
    if (Object.keys(payload.workflowPieces).length === 0) {
      toast.error("Workflow must have at least one piece to be exported.");
      return;
    }
    exportToJson(payload, payload.workflowSettingsData?.config?.name);
  }, []);

  const validateJsonImported = useCallback(
    async (json: DominoWorkflowForage) => {
      const getRepositories = function (
        workflowPieces: DominoWorkflowForage["workflowPieces"],
      ) {
        return [
          ...new Set(
            Object.values(workflowPieces)
              .reduce<Array<string | null>>((acc, next) => {
                acc.push(next.source_image);
                return acc;
              }, [])
              .filter((su) => !!su) as string[],
          ),
        ];
      };

      const currentRepositories = [
        ...new Set(
          Object.values((await localForage.getItem("pieces")) as any)?.map(
            (p: any) => p?.source_image,
          ),
        ),
      ];
      const incomeRepositories = getRepositories(json.workflowPieces);

      const differences = incomeRepositories.filter(
        (x) => !currentRepositories.includes(x),
      );

      return differences.length ? differences : null;
    },
    [fetchWorkflowForage],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(
              e.target?.result as string,
            ) as DominoWorkflowForage;

            validateJsonImported(jsonData)
              .then((diferences) => {
                if (diferences) {
                  toast.error(
                    "Some repositories are missing or incompatible version",
                  );
                  setIncompatiblesPieces(diferences);
                  incompatiblePiecesModalRef.current?.open();
                  return;
                }

                workflowPanelRef?.current?.setNodes(jsonData.workflowNodes);
                workflowPanelRef?.current?.setEdges(jsonData.workflowEdges);
                void importWorkflowToForage(jsonData);
              })
              .catch((e) => {
                console.log(e);
              });

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } catch (error) {
            console.error("Error parsing JSON file:", error);
          }
        };

        reader.readAsText(file);
      }
    },
    [
      validateJsonImported,
      workflowPanelRef,
      importWorkflowToForage,
      setIncompatiblesPieces,
      incompatiblePiecesModalRef,
      fileInputRef,
    ],
  );

  const onNodesDelete = useCallback(
    async (nodes: any) => {
      for (const node of nodes) {
        await removeForageWorkflowPiecesById(node.id);
        await removeForageWorkflowPieceDataById(node.id);
      }
    },
    [removeForageWorkflowPieceDataById, removeForageWorkflowPiecesById],
  );

  const onEdgesDelete = useCallback(
    async (edges: Edge[]) => {
      for (const edge of edges) {
        await clearDownstreamDataById(edge.source);
      }
    },
    [clearDownstreamDataById],
  );

  // Node double click open drawer with forms
  const onNodeDoubleClick = useCallback(
    async (_e: any, node: Node) => {
      const pieceNode = await fetchWorkflowPieceById(node.id);
      setFormSchema(pieceNode?.input_schema);
      setFormId(node.id);
      setFormTitle(() => {
        return pieceNode?.name ? pieceNode.name : "";
      });
      setSidebarPieceDrawer(true);
    },
    [fetchWorkflowPieceById],
  );

  const onLoad = useCallback(async () => {
    // // Fetch old state from forage to avoid loosing flowchart when refreshing/leaving page
    const workflowNodes = await fetchForageWorkflowNodes();
    const workflowEdges = await fetchForageWorkflowEdges();

    return { nodes: workflowNodes, edges: workflowEdges };
  }, [fetchForageWorkflowNodes, fetchForageWorkflowEdges]);

  const onDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>, position: XYPosition) => {
      event.preventDefault();
      const nodeData = event.dataTransfer.getData("application/reactflow");
      const { ...data } = JSON.parse(nodeData);

      const newNodeData: DefaultNode["data"] = {
        name: data.name,
        style: data.style,
        validationError: false,
        orientation,
      };

      const newNode = {
        id: getId(data.id),
        type: "CustomNode",
        position,
        data: newNodeData,
      };

      const piece = await fetchForagePieceById(data.id);
      const defaultInputs = extractDefaultInputValues(
        piece as unknown as Piece,
      );
      const defaultContainerResources = extractDefaultValues(
        containerResourcesSchema as any,
      );

      const currentWorkflowPieces = await getForageWorkflowPieces();
      const newWorkflowPieces = {
        ...currentWorkflowPieces,
        [newNode.id]: piece,
      };
      await setForageWorkflowPieces(newWorkflowPieces);

      const defaultWorkflowPieceData: IWorkflowPieceData = {
        storage: { storageAccessMode: storageAccessModes.ReadWrite },
        containerResources: defaultContainerResources,
        inputs: defaultInputs,
      };

      await setForageWorkflowPiecesDataById(
        newNode.id,
        defaultWorkflowPieceData,
      );
      return newNode;
    },
    [
      orientation,
      fetchForagePieceById,
      setForageWorkflowPieces,
      getForageWorkflowPieces,
      setForageWorkflowPiecesDataById,
    ],
  );

  // Left drawers controls
  const toggleSidebarPieceDrawer = (open: boolean) => (event: any) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setSidebarPieceDrawer(open);
  };

  const toggleSidebarSettingsDrawer = (open: boolean) => (event: any) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setSidebarSettingsDrawer(open);
  };

  const handleClickImportMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleImportFromFile = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setAnchorEl(null);
  }, [fileInputRef]);

  return (
    <>
      {loading && <Loading />}
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        style={{ marginLeft: 0, marginTop: 0 }}
      >
        <Grid item xs={10}>
          <Grid
            container
            spacing={1}
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            style={{ marginBottom: 10 }}
          >
            <Grid item>
              <Button
                color="primary"
                variant="contained"
                className="buttons-bar"
                startIcon={<SettingsSuggestIcon />}
                onClick={toggleSidebarSettingsDrawer(true)}
              >
                Settings
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveWorkflow}
              >
                Save
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                variant="contained"
                startIcon={<IosShareIcon />}
                onClick={handleExport}
              >
                Export
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                id="import-button"
                aria-controls={importMenuOpen ? "import-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={importMenuOpen ? "true" : undefined}
                onClick={handleClickImportMenu}
              >
                <VisuallyHiddenInput
                  type="file"
                  onChange={handleImport}
                  ref={fileInputRef}
                />
                Import
                <Modal
                  title="Missing or incompatibles Pieces Repositories"
                  content={
                    <ul>
                      {incompatiblesPieces.map((item) => (
                        <li key={item}>
                          {`${item.split("ghcr.io/")[1].split(":")[0]}:  ${
                            item
                              .split("ghcr.io/")[1]
                              .split(":")[1]
                              .split("-")[0]
                          }`}
                        </li>
                      ))}
                    </ul>
                  }
                  ref={incompatiblePiecesModalRef}
                />
              </Button>
              <Menu
                id="import-menu"
                anchorEl={anchorEl}
                open={importMenuOpen}
                onClose={() => {
                  setAnchorEl(null);
                }}
                MenuListProps={{
                  "aria-labelledby": "import-button",
                }}
              >
                <MenuItem onClick={handleImportFromFile}>
                  Import from file
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                  }}
                >
                  Import from examples
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                  }}
                >
                  Import from workflows
                </MenuItem>
              </Menu>
            </Grid>

            <Grid item>
              <Button
                color="primary"
                variant="contained"
                startIcon={<ClearIcon />}
                onClick={handleClear}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
          <Paper sx={{ height: "80vh" }}>
            <WorkflowPanel
              editable
              ref={workflowPanelRef}
              onNodeDoubleClick={onNodeDoubleClick}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onInit={onLoad}
              onDrop={onDrop}
            />
          </Paper>
        </Grid>
        <Grid item xs={2}>
          <PermanentDrawerRightWorkflows
            setOrientation={setOrientation}
            orientation={orientation}
            handleClose={() => {
              setMenuOpen(!menuOpen);
            }}
          />
        </Grid>
      </Grid>
      <SidebarPieceForm
        title={formTitle}
        formId={formId}
        schema={formSchema}
        open={sidebarPieceDrawer}
        onClose={toggleSidebarPieceDrawer(false)}
      />
      <SidebarSettingsForm
        onClose={toggleSidebarSettingsDrawer(false)}
        open={sidebarSettingsDrawer}
        ref={sidebarSettingsRef}
      />
    </>
  );
};
