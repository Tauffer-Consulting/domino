/* eslint-disable react/prop-types */
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Grid,
  TextField,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useWorkspaces } from "context/workspaces";
import { useAuthenticatedPatchWorkspace } from "context/workspaces/api";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

/* eslint-disable react/prop-types */
const WorkspaceSecretsCard = () => {
  // const filledDefaultValue = '******'
  const [defaultValue, setDefaultValue] = useState<string>("******");
  const { register, getValues, resetField } = useForm();
  const [currentEdittingToken, setCurrentEdittingToken] =
    useState<boolean>(false);
  const { handleUpdateWorkspace } = useWorkspaces();
  const { workspace } = useWorkspaces();

  const patchWorkspace = useAuthenticatedPatchWorkspace();

  useEffect(() => {
    if (workspace) {
      handleUpdateWorkspace(workspace);
      if (workspace.github_access_token_filled) {
        setDefaultValue("******");
      } else {
        setDefaultValue("");
      }
    }
  }, [workspace, handleUpdateWorkspace]);

  const handleSaveToken = useCallback(
    async (e: any) => {
      e.preventDefault();
      setCurrentEdittingToken(false);
      if (!workspace) {
        toast.error("Workspace not selected.");
        return;
      }

      if (e.currentTarget.ariaLabel === "clear") {
        const payload = {
          github_access_token: null,
        };
        patchWorkspace({
          workspaceId: workspace?.id,
          payload,
        })
          .then((response) => {
            toast.success("Secret updated.");
            handleUpdateWorkspace(response.data);
            resetField(`github-token-workspace-${workspace?.id}`, {
              keepTouched: false,
            });
          })
          .catch((_err) => {
            toast.error("Error while updating secrets");
          });
        setCurrentEdittingToken(false);
        return;
      }

      const formValue = getValues(`github-token-workspace-${workspace?.id}`);
      if (!formValue) {
        toast.warning("Please enter a valid value for the secret.");
        return;
      }
      if (formValue === defaultValue) {
        toast.warning("Please enter a new value for the secret.");
        return;
      }

      const payload = {
        github_access_token: formValue,
      };
      patchWorkspace({
        workspaceId: workspace?.id,
        payload,
      })
        .then((response) => {
          toast.success("Secret updated.");
          handleUpdateWorkspace(response.data);
        })
        .catch((_err) => {
          toast.error("Error while updating secrets");
        });
      setCurrentEdittingToken(false);
    },
    [
      workspace,
      getValues,
      patchWorkspace,
      resetField,
      handleUpdateWorkspace,
      defaultValue,
    ],
  );

  if (!workspace) {
    return <h1>Workspace not selected.</h1>;
  }
  return (
    <Card variant="outlined">
      <CardHeader
        title="Workspace Secrets"
        titleTypographyProps={{ variant: "h6" }}
      />
      <CardContent>
        <Box>
          <Typography variant="body1">
            Workspace github token is used to access private pieces
            repositories. Furhtermore, authenticated requests get a higher rate
            limit from Github.
          </Typography>
        </Box>
        <form>
          <Grid item xs={12} container spacing={2} sx={{ marginTop: "15px" }}>
            <Grid item xs={7} sm={8} md={10}>
              <TextField
                InputLabelProps={{ shrink: true }}
                autoFocus
                id={`github-token-workspace-${workspace.id}`}
                label="Github Access Token"
                disabled={!currentEdittingToken}
                defaultValue={
                  workspace.github_access_token_filled ? "******" : ""
                }
                type="password"
                fullWidth
                {...register(`github-token-workspace-${workspace.id}`)}
              />
            </Grid>
            <Grid item xs={5} sm={4} md={2}>
              {currentEdittingToken ? (
                <div>
                  <Tooltip title="Save">
                    <IconButton aria-label="save" onClick={handleSaveToken}>
                      <SaveAltIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Clear">
                    <IconButton aria-label="clear" onClick={handleSaveToken}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton
                      aria-label="cancel"
                      onClick={() => {
                        setCurrentEdittingToken(false);
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              ) : (
                <Tooltip title="Edit">
                  <IconButton
                    aria-label="edit"
                    onClick={() => {
                      setCurrentEdittingToken(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkspaceSecretsCard;
