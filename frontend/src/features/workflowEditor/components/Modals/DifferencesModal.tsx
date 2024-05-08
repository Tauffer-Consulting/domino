import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
  useTheme,
} from "@mui/material";
import { Modal, type ModalRef } from "components/Modal";
import { useWorkspaces, usesPieces } from "context/workspaces";
import { type Differences } from "features/workflowEditor/utils/importWorkflow";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

interface Props {
  incompatiblesPieces: Differences[];
}

enum installStateEnum {
  notInstalled = 0,
  installing = 1,
  installed = 2,
  error = 3,
}

export const DifferencesModal = forwardRef<ModalRef, Props>(
  ({ incompatiblesPieces }, ref) => {
    const theme = useTheme();
    const { workspace } = useWorkspaces();
    const { handleAddRepository } = usesPieces();
    const [installState, setInstallState] = useState<installStateEnum>(0);

    const { installedPieces, uninstalledPieces } = useMemo(() => {
      return {
        installedPieces: incompatiblesPieces.filter((p) => p.installedVersion),
        uninstalledPieces: incompatiblesPieces.filter(
          (p) => !p.installedVersion,
        ),
      };
    }, [incompatiblesPieces]);

    const installRepositories = useCallback(
      async (e: Omit<Differences, "installedVersion">) => {
        const addRepository = {
          workspace_id: workspace?.id ?? "",
          source: "github",
          path: e.source,
          version: e.requiredVersion,
          url: `https://github.com/${e.source}`,
        };
        try {
          await handleAddRepository(addRepository);
        } catch (e) {
          throw new Error();
        }
      },
      [handleAddRepository],
    );

    const handleInstallMissingRepositories = useCallback(async () => {
      try {
        setInstallState(1);
        await Promise.all(uninstalledPieces.map(installRepositories));
        setInstallState(2);
      } catch (e) {
        toast.error(e as string);
        setInstallState(3);
      }
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
                    <Link to="/workspaces/settings"> workspace settings</Link>,
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
                        {installState === 2 ? (
                          <>
                            <CheckCircleOutlineIcon />
                            <Typography sx={{ marginLeft: 1 }}>
                              Installed {item.requiredVersion}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Tooltip
                              placement="top"
                              title="Please install this repository to use this workflow"
                            >
                              <ErrorOutlineIcon />
                            </Tooltip>
                            <Typography sx={{ marginLeft: 1 }}>
                              Install {item.requiredVersion}
                            </Typography>
                          </>
                        )}
                      </ListItemIcon>
                    }
                  >
                    <ListItemText
                      primary={item.source}
                      secondary={
                        installState === 2
                          ? item.requiredVersion
                          : item.installedVersion ?? "Not installed"
                      }
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
                    disabled={installState !== 0}
                    style={
                      installState === 2
                        ? {
                            borderColor: theme.palette.success.main,
                            color: theme.palette.success.main,
                          }
                        : installState === 3
                          ? {
                              borderColor: theme.palette.error.main,
                              color: theme.palette.error.main,
                            }
                          : {}
                    }
                  >
                    {installState === 1 && (
                      <>
                        <CircularProgress size={16} sx={{ marginRight: 1 }} />
                        Installing
                      </>
                    )}
                    {installState === 0 && "Install missing repositories"}
                    {installState === 2 && (
                      <>
                        <CheckCircleOutlineIcon sx={{ marginRight: 1 }} />
                        Success
                      </>
                    )}
                    {installState === 3 && (
                      <>
                        <ErrorOutlineIcon sx={{ marginRight: 1 }} />
                        Error
                      </>
                    )}
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        }
        onClose={() => {
          setInstallState(0);
        }}
        ref={ref}
      />
    );
  },
);

DifferencesModal.displayName = "DifferencesModal";
