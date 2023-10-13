import {
  Card,
  CardActionArea,
  CardHeader,
  CardContent,
  Typography,
  CardActions,
  Button,
  Grid,
} from "@mui/material";
import { type IWorkspaceSummary } from "context/workspaces/types";
import { type FC } from "react";
import { useNavigate } from "react-router-dom";

export const WorkspaceListItem: FC<{
  workspace: IWorkspaceSummary;
  handleSelect: () => void;
  handleDelete: () => void;
  handleLeave: () => void;
  selectedWorkspaceId: string | undefined;
}> = ({
  workspace,
  handleSelect,
  handleDelete,
  handleLeave,
  selectedWorkspaceId,
}) => {
  const isSelected = workspace.id === selectedWorkspaceId;

  const navigate = useNavigate();

  return (
    <Grid
      item
      xs={12}
      md={6}
      lg={4}
      xl={3}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Card
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: "column",
          borderColor: isSelected ? "darkgray" : "primary",
        }}
      >
        <CardActionArea
          onClick={handleSelect}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            flexGrow: 1,
          }}
        >
          <CardHeader
            title={workspace.workspace_name}
            titleTypographyProps={{ variant: "body1" }}
            color={isSelected ? "success" : "primary"}
          />
          <CardContent sx={{ width: "100%" }}>
            <Grid container>
              <Grid item xs={12} md={3}>
                <Typography sx={{ fontSize: 14, my: 0 }} color="text.secondary">
                  Permission:
                </Typography>
                <Typography>{workspace.user_permission}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography sx={{ fontSize: 14, my: 0 }} color="text.secondary">
                  Status:
                </Typography>
                <Typography>
                  {workspace.status === "accepted"
                    ? "Collaborating"
                    : "Refused"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
        <CardActions sx={{ width: "100%" }}>
          <Button
            size="small"
            color={isSelected ? "success" : "primary"}
            onClick={handleSelect}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
          <Button
            size="small"
            color="info"
            sx={{ ml: "auto" }}
            onClick={() => {
              handleSelect();
              navigate("/workspace-settings");
            }}
          >
            Config
          </Button>
          <Button size="small" color="warning" onClick={handleLeave}>
            Leave
          </Button>
          <Button size="small" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
};
