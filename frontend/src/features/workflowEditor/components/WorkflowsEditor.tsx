import { Settings as SettingsSuggestIcon } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import { Button, Grid, Paper, Backdrop, CircularProgress } from "@mui/material";
import { AxiosError } from "axios";
import { useWorkspaces } from "context/workspaces";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { yupResolver } from "utils";
import * as yup from "yup";

import { useWorkflowsEditor } from "../context/workflowsEditor";

import { PermanentDrawerRightWorkflows } from "./DrawerMenu";
import SidebarSettingsForm, {
  WorkflowSettingsFormSchema,
} from "./SidebarSettingsForm";
import WorkflowEditorPanelComponent from "./WorkflowEditorPanel";
import { ContainerResourceFormSchema } from "./WorkflowEditorPanel/sidebarForm/containerResourceForm";
import { createInputsSchemaValidation } from "./WorkflowEditorPanel/sidebarForm/pieceForm/validation";
import { storageFormSchema } from "./WorkflowEditorPanel/sidebarForm/storageForm";
/**
 * Create workflow tab
 // TODO refactor/simplify inner files
 // TODO handle runtime errors
 // TODO make it look good
 // TODO remove all '// @ts-ignore: Unreachable code error"'
 */
export const WorkflowsEditorComponent: React.FC = () => {
  const [drawerState, setDrawerState] = useState(false);
  const [backdropIsOpen, setBackdropIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { workspace } = useWorkspaces();

  const {
    clearForageData,
    workflowsEditorBodyFromFlowchart,
    fetchWorkflowForage,
    setNodes,
    setEdges,
    handleCreateWorkflow,
  } = useWorkflowsEditor();

  const validateWorkflowSettings = useCallback(async (payload: any) => {
    const resolver = yupResolver(WorkflowSettingsFormSchema);
    const validatedData = await resolver(payload.workflowSettingsData);
    if (!Object.keys(validatedData.errors).length) {
      setNodesWithErros([]);
    } else {
      throw new Error("Please review your workflow settings.");
    }
  }, []);

  const validateWorkflowPiecesData = useCallback(async (payload: any) => {
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
      setNodesWithErros([]);
    } else {
      const nodeIds = Object.keys(validatedData.errors);
      setNodesWithErros(nodeIds);

      throw new Error("Please review the errors on your workflow.");
    }
  }, []);

  const [nodesWithErros, setNodesWithErros] = useState<string[]>([]);

  const handleSaveWorkflow = useCallback(async () => {
    try {
      setBackdropIsOpen(true);
      if (!workspace?.id) {
        throw new Error("No selected Workspace");
      }
      const payload = await fetchWorkflowForage();

      await validateWorkflowPiecesData(payload);
      await validateWorkflowSettings(payload);

      const data = await workflowsEditorBodyFromFlowchart();

      // TODO fill workspace id correctly
      await handleCreateWorkflow({ workspace_id: workspace?.id, ...data });

      toast.success("Workflow created successfully.");
      setBackdropIsOpen(false);
    } catch (err) {
      setBackdropIsOpen(false);
      if (err instanceof AxiosError) {
        toast.error(JSON.stringify(err?.response?.data));
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

  // @ts-expect-error: Unreachable code error
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerState(open);
  };

  // Open Config Workflow Form
  const handleConfigWorkflow = useCallback(() => {
    setDrawerState(true);
  }, []);

  const handleClear = useCallback(async () => {
    setNodes([]);
    setEdges([]);
    await clearForageData();
  }, [setNodes, setEdges, clearForageData]);

  return (
    <>
      <div className="reactflow-parent-div">
        <Backdrop open={backdropIsOpen} sx={{ zIndex: 9999 }}>
          <CircularProgress />
        </Backdrop>
        <Grid
          container
          spacing={4}
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
          style={{ marginLeft: 0, marginTop: 0 }}
        >
          <Grid
            item
            xs={12}
            sx={{
              paddingLeft: "0px",
              paddingRight: "300px",
              marginLeft: 0,
            }}
          >
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
                  onClick={() => {
                    handleConfigWorkflow();
                  }}
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
            <Paper>
              <WorkflowEditorPanelComponent nodesWithErros={nodesWithErros} />
            </Paper>
          </Grid>
          <PermanentDrawerRightWorkflows
            handleClose={() => {
              setMenuOpen(!menuOpen);
            }}
          />
        </Grid>
        <SidebarSettingsForm onClose={toggleDrawer(false)} open={drawerState} />
      </div>
    </>
  );
};
