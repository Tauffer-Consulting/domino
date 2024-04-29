import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import {
  Card,
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
import { useWorkspaces } from "context/workspaces";
import { type WorkspaceSummary } from "context/workspaces/types";
import { type FC } from "react";

export const WorkspacePendingListItem: FC<{
  workspace: WorkspaceSummary;
  selectedWorkspaceId: string | undefined;
}> = ({ workspace }) => {
  const { handleAcceptWorkspaceInvite, handleRejectWorkspaceInvite } =
    useWorkspaces();

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
          borderColor: "warning.main",
        }}
      >
        <CardHeader
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {workspace.workspace_name}
              <Tooltip title="You've been invited to a workspace.">
                <MailOutlineIcon color="warning" fontSize="medium" />
              </Tooltip>
            </div>
          }
          titleTypographyProps={{ variant: "body1" }}
          color="primary"
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
                label="Pending"
                variant="outlined"
                color="primary"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions sx={{ width: "100%" }}>
          <Button
            size="small"
            color="success"
            sx={{ minWidth: "auto" }}
            onClick={() => {
              handleAcceptWorkspaceInvite(workspace.id);
            }}
          >
            <CheckIcon fontSize="medium" />
            <Typography>Accept</Typography>
          </Button>
          <Button
            size="small"
            color="error"
            sx={{ minWidth: "auto" }}
            onClick={() => {
              handleRejectWorkspaceInvite(workspace.id);
            }}
          >
            <CloseIcon fontSize="medium" />
            <Typography>Refuse</Typography>
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
};
