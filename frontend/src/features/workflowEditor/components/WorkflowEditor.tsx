import { Settings as SettingsSuggestIcon } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import { Button, Grid, Paper } from "@mui/material";
import { AxiosError } from "axios";
import Loading from "components/Loading";
import {
  type WorkflowPanelRef,
  WorkflowPanel,
  type DefaultNode,
} from "components/WorkflowPanel";
import { useWorkspaces } from "context/workspaces";
import { useWorkflowsEditor } from "features/workflowEditor/context";
import { type DragEvent, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import { type Edge, type Node, type XYPosition } from "reactflow";
import { yupResolver, useInterval } from "utils";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import { type IWorkflowPieceData, storageAccessModes } from "../context/types";
import { containerResourcesSchema } from "../schemas/containerResourcesSchemas";
import { extractDefaultInputValues, extractDefaultValues } from "../utils";

import { PermanentDrawerRightWorkflows } from "./DrawerMenu";
import SidebarPieceForm from "./SidebarForm";
import { ContainerResourceFormSchema } from "./SidebarForm/ContainerResourceForm";
import { createInputsSchemaValidation } from "./SidebarForm/PieceForm/validation";
import { storageFormSchema } from "./SidebarForm/StorageForm";
import SidebarSettingsForm, {
  WorkflowSettingsFormSchema,
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

export const WorkflowsEditorComponent: React.FC = () => {
  const workflowPanelRef = useRef<WorkflowPanelRef>(null);
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
    workflowsEditorBodyFromFlowchart,
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
    setForageWorkflowPiecesData,
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

      const data = await workflowsEditorBodyFromFlowchart();

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
    workflowsEditorBodyFromFlowchart,
    workspace?.id,
  ]);

  const handleClear = useCallback(async () => {
    await clearForageData();
    workflowPanelRef.current?.setEdges([]);
    workflowPanelRef.current?.setNodes([]);
  }, [clearForageData]);

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

      await setForageWorkflowPiecesData(newNode.id, defaultWorkflowPieceData);
      return newNode;
    },
    [
      orientation,
      fetchForagePieceById,
      setForageWorkflowPieces,
      getForageWorkflowPieces,
      setForageWorkflowPiecesData,
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
                startIcon={<DownloadIcon />}
              >
                Load
              </Button>
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
      />
    </>
  );
};
