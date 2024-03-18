import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Card,
  CardActionArea,
  CardHeader,
  CardContent,
  Typography,
  CardActions,
  Button,
  Grid,
  Divider,
  Tooltip,
  Chip,
} from "@mui/material";
import { type IWorkspaceSummary } from "context/workspaces/types";
import theme from "providers/theme.config";
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
          borderColor: isSelected ? theme.palette.success.main : "primary",
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
            color={isSelected ? "success" : "primary.main"}
            action={
              isSelected ? (
                <Typography
                  display="flex"
                  variant="body1"
                  sx={{
                    mt: "4px",
                    mr: "8px",
                    color: theme.palette.success.main,
                  }}
                >
                  <CheckBoxOutlinedIcon color="success" />
                  Selected
                </Typography>
              ) : (
                <Typography
                  display="flex"
                  variant="body1"
                  color="primary"
                  sx={{ mt: "4px", mr: "8px" }}
                >
                  <CheckBoxOutlineBlankIcon />
                  Select
                </Typography>
              )
            }
            sx={{ py: 1, width: "100%" }}
          />
          <CardContent
            sx={{
              width: "100%",
              borderTop: 1,
              borderBottom: 1,
              borderColor: "grey.300",
            }}
          >
            <Grid container columns={13}>
              <Grid item xs={6} md={3} sx={{ mr: "auto" }}>
                <Typography sx={{ fontSize: 16, my: 0 }} color="text.secondary">
                  Permission:
                </Typography>
                <Chip
                  label={workspace.user_permission}
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              </Grid>
              <Grid item xs={1}>
                <Divider orientation="vertical" sx={{ mr: "16px" }} />
              </Grid>
              <Grid item xs={6} md={3} sx={{ mr: "auto" }}>
                <Typography sx={{ fontSize: 16, my: 0 }} color="text.secondary">
                  Status:
                </Typography>
                <Chip
                  label={
                    workspace.status === "accepted"
                      ? "Collaborating"
                      : "Refused"
                  }
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
        <CardActions sx={{ width: "100%" }}>
          <Button
            size="small"
            color="primary"
            sx={{ minWidth: "auto" }}
            onClick={() => {
              handleSelect();
              navigate("/workspaces/settings");
            }}
          >
            <Tooltip title="Configure workspace">
              <SettingsIcon fontSize="medium" />
            </Tooltip>
          </Button>
          <Button
            size="small"
            color="primary"
            sx={{ minWidth: "auto" }}
            onClick={handleLeave}
          >
            <Tooltip title="Leave workspace">
              <LogoutIcon fontSize="medium" />
            </Tooltip>
          </Button>
          <Button
            size="small"
            color="error"
            sx={{ minWidth: "auto" }}
            onClick={handleDelete}
          >
            <Tooltip title="Delete workspace">
              <DeleteOutlineIcon />
            </Tooltip>
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
};
