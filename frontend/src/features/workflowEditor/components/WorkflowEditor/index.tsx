import { Grid, Paper } from "@mui/material";
import { AxiosError } from "axios";
import Loading from "components/Loading";
import { useWorkspaces } from "context/workspaces";
import { useWorkflowsEditor } from "features/workflowEditor/context";
import React, { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import { type Node } from "reactflow";
import { exportToJson, useInterval, yupResolver } from "utils";
import * as yup from "yup";

import { type GenerateWorkflowsParams } from "../../context/workflowsEditor";
import { createInputsSchemaValidation } from "../../utils/validation";
import { ButtonsMenu } from "../ButtonsMenu";
import {
  PiecesDrawer,
  SettingsFormDrawer,
  type SettingsFormDrawerRef,
  WorkflowSettingsFormSchema,
  PieceFormDrawer,
} from "../Drawers";
import { ContainerResourceFormSchema } from "../Drawers/PieceFormDrawer/ContainerResourceForm";
import { storageFormSchema } from "../Drawers/PieceFormDrawer/StorageForm";
import { type WorkflowPanelRef, WorkflowPanel } from "../Panel/WorkflowPanel";

export const WorkflowsEditorComponent: React.FC = () => {
  const workflowPanelRef = useRef<WorkflowPanelRef>(null);
  const sidebarSettingsRef = useRef<SettingsFormDrawerRef>(null);
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

  const saveDataToLocalForage = useCallback(() => {
    if (workflowPanelRef?.current) {
      setWorkflowEdges(workflowPanelRef.current.edges ?? []);
      setWorkflowNodes(workflowPanelRef.current.nodes ?? []);
    }
  }, [workflowPanelRef.current]);

  useInterval(saveDataToLocalForage, 1000);

  const {
    clearStorageData,
    generateWorkflowsEditorBodyParams,
    getWorkflow,
    handleCreateWorkflow,
    getWorkflowPieceById,
    importWorkflowToStorage,
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
      saveDataToLocalForage();
      setBackdropIsOpen(true);
      if (!workspace?.id) {
        throw new Error("No selected Workspace");
      }
      const payload = getWorkflow();

      await validateWorkflowPiecesData(payload);
      await validateWorkflowSettings(payload);

      const data = generateWorkflowsEditorBodyParams(payload);

      await handleCreateWorkflow({ ...data });

      toast.success("Workflow created successfully.");
      setBackdropIsOpen(false);
    } catch (err) {
      setBackdropIsOpen(false);
      if (err instanceof AxiosError) {
        console.error(err);
      } else if (err instanceof Error) {
        console.error(err);
        toast.error(
          "Error while creating workflow, check your workflow settings and tasks.",
        );
      }
    }
  }, [
    getWorkflow,
    handleCreateWorkflow,
    validateWorkflowPiecesData,
    validateWorkflowSettings,
    generateWorkflowsEditorBodyParams,
    workspace?.id,
  ]);

  const handleClear = useCallback(() => {
    clearStorageData();
    workflowPanelRef.current?.setEdges([]);
    workflowPanelRef.current?.setNodes([]);
    sidebarSettingsRef.current?.loadData();
  }, [clearStorageData]);

  const handleExport = useCallback(() => {
    saveDataToLocalForage();
    const payload = getWorkflow();
    if (Object.keys(payload.workflowPieces).length === 0) {
      toast.error("Workflow must have at least one piece to be exported.");
      return;
    }
    const name = payload.workflowSettingsData?.config?.name;

    const exportedJson: any = { ...payload };

    delete exportedJson.workflowSettingsData;

    exportToJson(exportedJson, name);
  }, []);

  const handleImportedJson = useCallback(
    (json: GenerateWorkflowsParams) => {
      workflowPanelRef?.current?.setNodes(json.workflowNodes);
      workflowPanelRef?.current?.setEdges(json.workflowEdges);
      importWorkflowToStorage(json);
    },
    [workflowPanelRef, importWorkflowToStorage],
  );

  // Node double click open drawer with forms
  const onNodeDoubleClick = useCallback(
    (_e: any, node: Node) => {
      const pieceNode = getWorkflowPieceById(node.id);
      setFormSchema(pieceNode?.input_schema);
      setFormId(node.id);
      setFormTitle(() => {
        return pieceNode?.name ? pieceNode.name : "";
      });
      setSidebarPieceDrawer(true);
    },
    [getWorkflowPieceById],
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
          <ButtonsMenu
            handleClear={handleClear}
            handleExport={handleExport}
            handleImported={handleImportedJson}
            handleSave={handleSaveWorkflow}
            handleSettings={toggleSidebarSettingsDrawer(true)}
          />
          <Paper sx={{ height: "80vh" }}>
            <WorkflowPanel
              ref={workflowPanelRef}
              onNodeDoubleClick={onNodeDoubleClick}
            />
          </Paper>
        </Grid>
        <Grid item xs={2}>
          <PiecesDrawer
            setOrientation={setOrientation}
            orientation={orientation}
            handleClose={() => {
              setMenuOpen(!menuOpen);
            }}
          />
        </Grid>
      </Grid>
      <PieceFormDrawer
        title={formTitle}
        formId={formId}
        schema={formSchema}
        open={sidebarPieceDrawer}
        onClose={toggleSidebarPieceDrawer(false)}
      />
      <SettingsFormDrawer
        onClose={toggleSidebarSettingsDrawer(false)}
        open={sidebarSettingsDrawer}
        ref={sidebarSettingsRef}
      />
    </>
  );
};
