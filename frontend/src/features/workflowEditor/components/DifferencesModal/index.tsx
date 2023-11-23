import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  Button,
  CircularProgress,
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
import { type Differences } from "features/workflowEditor/utils/importWorkflow";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  incompatiblesPieces: Differences[];
}

export const DifferencesModal = forwardRef<ModalRef, Props>(
  ({ incompatiblesPieces }, ref) => {
    const { workspace } = useWorkspaces();
    const { handleAddRepository } = usesPieces();
    const [buttonState, setButtonState] = useState<0 | 1 | 2>(0);

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
          url: `https://github.com/${e.source}`,
        };

        handleAddRepository(addRepository)
          .catch((e) => {
            console.log(e);
          })
          .finally(() => {});
      },
      [handleAddRepository],
    );

    const handleInstallMissingRepositories = useCallback(async () => {
      await Promise.allSettled(uninstalledPieces.map(installRepositories))
        .then(() => {
          setButtonState(2);
        })
        .catch(() => {
          setButtonState(0);
        });
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
                {!!installedPieces.length && (
                  <>
                    Incorrect version pieces need to be manually update on
                    <Link to="/workspace-settings"> workspace settings</Link>,
                  </>
                )}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <List>
                {installedPieces.map((item) => (
                  <ListItem
                    disablePadding
                    key={`${item.source}-${item.requiredVersion}`}
                    secondaryAction={
                      <ListItemIcon style={{ right: 0 }}>
                        <Tooltip
                          placement="top"
                          title="Repositories updates need to be done manually on workspace settings"
                        >
                          <ErrorOutlineIcon />
                        </Tooltip>
                        <Typography sx={{ marginLeft: 1 }}>
                          Change to {item.requiredVersion}
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
                {uninstalledPieces.map((item) => (
                  <ListItem
                    disablePadding
                    key={`${item.source}-${item.requiredVersion}`}
                    secondaryAction={
                      <ListItemIcon style={{ right: 0 }}>
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
              </List>
            </Grid>
            {!!uninstalledPieces.length && (
              <Grid container item xs={12} justifyContent="center">
                <Grid item xs="auto">
                  <Button
                    variant="outlined"
                    onClick={handleInstallMissingRepositories}
                    disabled={buttonState === 2 || buttonState === 1}
                  >
                    {buttonState === 1 && <CircularProgress />}
                    {buttonState === 0 && "Install missing repositories"}
                    {buttonState === 2 && "Success"}
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
