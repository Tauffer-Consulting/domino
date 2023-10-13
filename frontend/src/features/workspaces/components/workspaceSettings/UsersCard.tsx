import { PersonAdd } from "@mui/icons-material";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Grid,
  InputLabel,
  FormControl,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useWorkspaces } from "context/workspaces";
import { type FC, useCallback, useState } from "react";
import { toast } from "react-toastify";

import { useWorkspaceSettings } from "../../context/workspaceSettings";

/**
 * @todo integrate with backend
 * @returns Users card component
 */
export const UsersCard: FC = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [permission, setPermission] = useState<string>("");
  const { workspaceData } = useWorkspaceSettings();
  const { handleInviteUserWorkspace } = useWorkspaces();

  const inviteUser = useCallback(() => {
    // if not user email or not permission toastfail
    if (!userEmail || !permission) {
      toast.error("Email and permission are required.");
      return;
    }
    if (!workspaceData) {
      toast.error("Workspace not found.");
      return;
    }
    handleInviteUserWorkspace(workspaceData.id, userEmail, permission);
    setUserEmail("");
    setPermission("");
  }, [permission, userEmail, handleInviteUserWorkspace, workspaceData]);

  if (!workspaceData) {
    return null;
  }
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardHeader title="Users" titleTypographyProps={{ variant: "h6" }} />
      <CardContent>
        <Box>
          <Typography variant="subtitle1">Invite user</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 64px",
              gap: 1,
              mt: 1,
            }}
          >
            <TextField
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
              }}
              fullWidth
              variant="outlined"
              id="user"
              label="User e-mail"
              type="email"
              name="user"
            />
            <Button color="primary" variant="contained" onClick={inviteUser}>
              <PersonAdd />
            </Button>
          </Box>
        </Box>
        <Grid container mt={2}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Permission</InputLabel>
            <Select
              labelId="label-select-workspace-invite-permission"
              id="select-workspace-invite-permission"
              value={permission}
              label="Permission"
              onChange={(e) => {
                setPermission(e.target.value);
              }}
            >
              <MenuItem value={"read"}>Read</MenuItem>
              <MenuItem value={"owner"}>Owner</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* {!!workspaceData?.users?.length ? (
          <List>
            {workspaceData.users.map((user, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`user ${user.user_id}`}
                  secondary={user.permission}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity='warning' sx={{ mt: 1 }}>
            No users!
          </Alert>
        )} */}
      </CardContent>
    </Card>
  );
};
