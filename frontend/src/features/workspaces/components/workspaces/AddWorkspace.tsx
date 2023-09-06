import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  CircularProgress,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useWorkspaces } from "context/workspaces";
import { type FC, useCallback, useState } from "react";

export const AddWorkspace: FC = () => {
  const { workspaces, handleCreateWorkspace } = useWorkspaces();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const regExp = /[a-zA-Z0-9]/g;

  const createWorkspace = useCallback(async () => {
    setIsLoading(true);
    void handleCreateWorkspace(name).then(() => {
      setName("");
      setIsLoading(false);
    });
  }, [handleCreateWorkspace, name]);

  return (
    <Grid item xs={12} md={6} lg={4} xl={3}>
      <Card variant="outlined">
        <CardHeader
          title="Add Workspace"
          titleTypographyProps={{ variant: "body1" }}
        />
        <CardContent sx={{ py: 0.5 }}>
          <TextField
            variant="outlined"
            margin="none"
            fullWidth
            id="workspace-name"
            label="Name"
            name="name"
            autoComplete="off"
            value={name}
            inputProps={{ maxLength: 100 }}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between" }}>
          <Button
            size="small"
            color="error"
            onClick={() => {
              setName("");
            }}
            disabled={!regExp.test(name)}
          >
            Clear
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={createWorkspace}
            disabled={
              !regExp.test(name) ||
              !!workspaces?.find((e) => e.workspace_name === name)
            }
          >
            {isLoading ? (
              <CircularProgress style={{ width: "35px", height: "100%" }} />
            ) : !!workspaces?.find((e) => e.workspace_name === name) &&
              name !== "" ? (
              "The workspace already exists"
            ) : (
              "Create"
            )}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
};
