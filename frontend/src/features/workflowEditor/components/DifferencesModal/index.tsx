import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { Modal, type ModalRef } from "components/Modal";
import { useWorkspaces, usesPieces } from "context/workspaces";
import {
  useAuthenticatedGetWorkspace,
  useAuthenticatedPostPiecesRepository,
} from "context/workspaces/api";
import { type Differences } from "features/workflowEditor/utils/importWorkflow";
import React, { forwardRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";

interface Props {
  incompatiblesPieces: Differences[];
}

export const DifferencesModal = forwardRef<ModalRef, Props>(
  ({ incompatiblesPieces }, ref) => {
    const { workspace } = useWorkspaces();
    const { handleRefreshRepositories } = usesPieces();
    const handleAddRepository = useAuthenticatedPostPiecesRepository({
      workspace: workspace?.id ?? "",
    });

    const { mutate: refreshWorkspaceData } = useAuthenticatedGetWorkspace({
      id: workspace?.id ?? "",
    });

    const { installedPieces, uninstalledPieces } = useMemo(() => {
      return {
        installedPieces: incompatiblesPieces.filter((p) => p.installedVersion),
        uninstalledPieces: incompatiblesPieces.filter(
          (p) => !p.installedVersion,
        ),
      };
    }, [incompatiblesPieces]);

    const installRepositories = useCallback(
      (e: Omit<Differences, "installedVersion">) => {
        const addRepository = {
          workspace_id: workspace?.id ?? "",
          source: "github",
          path: e.source,
          version: e.requiredVersion,
          url: `http://github.com/${e.source}`,
        };

        handleAddRepository(addRepository)
          .then(async () => {
            await refreshWorkspaceData().catch((e) => {
              console.log(e);
            });
            await handleRefreshRepositories().catch((e) => {
              console.log(e);
            });
          })
          .catch((e) => {
            console.log(e);
          })
          .finally(() => {});
      },
      [handleAddRepository],
    );

    const handleInstallMissingRepositories = useCallback(async () => {
      await Promise.allSettled(uninstalledPieces.map(installRepositories));
    }, [installRepositories, uninstalledPieces]);

    return (
      <Modal
        title="Missing or incompatibles Pieces Repositories"
        content={
          <Grid container>
            <Grid item xs={12}>
              <Typography style={{ textAlign: "justify" }}>
                Some of the pieces necessary to run this workflow are not
                present in this workspace or mismatch the correct version.
              </Typography>
              {!!installedPieces.length && (
                <>
                  <Typography style={{ textAlign: "justify" }}>
                    Incorrect version pieces need to be manually update on
                  </Typography>
                  <Link to="/workspace-settings">workspace settings</Link>
                </>
              )}
            </Grid>
            <Grid item xs={12}>
              <List>
                {uninstalledPieces.map((item) => (
                  <ListItem
                    key={`${item.source}-${item.requiredVersion}`}
                    secondaryAction={
                      <ListItemIcon>
                        <Tooltip
                          placement="top"
                          title="Please install this repository to use this workflow"
                        >
                          <ErrorOutlineIcon />
                        </Tooltip>
                        <Typography sx={{ marginLeft: 1 }}>
                          Install {item.requiredVersion}
                        </Typography>
                      </ListItemIcon>
                    }
                  >
                    <ListItemText
                      primary={item.source}
                      secondary={item.installedVersion ?? "Not installed"}
                    />
                  </ListItem>
                ))}
                {installedPieces.map((item) => (
                  <ListItem
                    key={`${item.source}-${item.requiredVersion}`}
                    secondaryAction={
                      <ListItemIcon>
                        <Tooltip
                          placement="top"
                          title="Repositories updates need to be done manually on workspace settings"
                        >
                          <ErrorOutlineIcon />
                        </Tooltip>
                        <Typography sx={{ marginLeft: 1 }}>
                          Update to {item.requiredVersion}
                        </Typography>
                      </ListItemIcon>
                    }
                  >
                    <ListItemText
                      primary={item.source}
                      secondary={item.installedVersion ?? "Not installed"}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            {!!uninstalledPieces.length && (
              <Grid container item xs={12} justifyContent="center">
                <Grid item xs="auto">
                  <Button onClick={handleInstallMissingRepositories}>
                    Install missing repositories
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        }
        ref={ref}
      />
    );
  },
);

DifferencesModal.displayName = "DifferencesModal";
