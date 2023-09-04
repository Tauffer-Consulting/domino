import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, Grid, Typography } from "@mui/material";
import Tab from "@mui/material/Tab";
import { withContext } from "common/hocs/with-context.hoc";
import {
  WorkspaceSettingsProvider,
  useWorkspaceSettings,
} from "context/workspaces/workspace-settings.context";
import { PrivateLayout } from "modules/layout";
import { useState } from "react";

import { RepositoriesCard } from "./components/repositories-card.component";
import SecretsCard from "./components/repository-secrets-card.component";
import StorageSecretsCard from "./components/storage-secrets-card.component";
import { UsersCard } from "./components/users-card.component";
import WorkspaceSecretsCard from "./components/workspace-secrets-card.component";
import WorkspaceMembersCard from "./components/workspace-users-card.component";

export const WorkspaceSettingsPage = withContext(
  WorkspaceSettingsProvider,
  () => {
    const { workspace, selectedRepositoryId } = useWorkspaceSettings();

    const [value, setValue] = useState<string>("1");

    return (
      <PrivateLayout>
        <Box sx={{ mt: 2 }} />
        <Grid
          container
          spacing={1}
          style={{ maxWidth: "1440px", margin: "0 auto", marginBottom: "35px" }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
            Workspace: {workspace?.workspace_name}
          </Typography>
        </Grid>
        <TabContext value={value}>
          <Grid
            sx={{ borderBottom: 1, borderColor: "divider" }}
            style={{ maxWidth: "1380px", margin: "0 auto" }}
          >
            <TabList
              onChange={(e, newValue) => {
                setValue(newValue);
              }}
              aria-label="workspace-tabs"
            >
              <Tab label="Config" value="1" />
              <Tab label="Members" value="2" />
            </TabList>
          </Grid>
          <TabPanel value="1" sx={{ padding: "5px" }}>
            <Grid
              container
              spacing={1}
              style={{ maxWidth: "1440px", margin: "0 auto" }}
            >
              <Grid item xs={12} lg={12}>
                <WorkspaceSecretsCard />
              </Grid>
              <Grid item xs={12} lg={12}>
                <RepositoriesCard />
              </Grid>
              <Grid item xs={12} lg={12}>
                <SecretsCard repositoryId={selectedRepositoryId} />
              </Grid>
              <Grid item xs={12} lg={12}>
                <StorageSecretsCard />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value="2" sx={{ padding: "5px" }}>
            <Grid
              container
              spacing={1}
              style={{ maxWidth: "1440px", margin: "0 auto" }}
            >
              <Grid item xs={12} lg={12}>
                <UsersCard />
              </Grid>
              <Grid item xs={12} lg={12}>
                <WorkspaceMembersCard />
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      </PrivateLayout>
    );
  },
);
