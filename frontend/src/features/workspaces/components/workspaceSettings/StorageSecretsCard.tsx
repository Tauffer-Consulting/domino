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
  Alert,
} from "@mui/material";
import { usesPieces } from "context/workspaces";
import {
  useAuthenticatedGetRepositorySecrets,
  useAuthenticatedPatchRepositorySecret,
} from "features/myWorkflows/api";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

/* eslint-disable react/prop-types */
const StorageSecretsCard = () => {
  const filledDefaultValue = "******";
  const { register, getValues, resetField } = useForm();
  const [currrentEdittingSecretId, setCurrrentEdittingSecretId] = useState<
    number | null
  >(null);
  const [repositoryId, setRepositoryId] = useState<number | null>(null);

  const { defaultRepositories } = usesPieces();

  const storageRepository = useMemo(() => {
    return defaultRepositories.find((repository) => {
      return repository.name.includes("storage");
    });
  }, [defaultRepositories]);

  useEffect(() => {
    if (storageRepository) {
      setRepositoryId(+storageRepository.id);
    }
  }, [storageRepository]);

  const { data: secrets, mutate: refreshSecrets } =
    useAuthenticatedGetRepositorySecrets({
      repositoryId: storageRepository?.id.toString() ?? "",
    });

  const patchRepositorySecret = useAuthenticatedPatchRepositorySecret();

  const handleEditSecret = useCallback((e: any) => {
    e.preventDefault();
    const selectedSecretId = e.currentTarget.value;
    setCurrrentEdittingSecretId(selectedSecretId);
  }, []);

  const handleSaveSecret = useCallback(
    async (e: any) => {
      e.preventDefault();
      const selectedSecretId = e.currentTarget.value;

      if (!repositoryId) {
        toast.error("Repository not selected.");
        return;
      }

      if (e.currentTarget.ariaLabel === "clear") {
        const payload = {
          value: null,
        };
        patchRepositorySecret({
          repositoryId: repositoryId.toString(),
          secretId: selectedSecretId as string,
          payload,
        })
          .then((_response) => {
            toast.success("Secret updated.");
            void refreshSecrets();
            resetField(selectedSecretId?.toString(), { keepTouched: false });
            setCurrrentEdittingSecretId(null);
          })
          .catch((_err) => {
            toast.error("Error while updating secrets");
          });
        return;
      }

      const formValue = getValues(selectedSecretId?.toString());
      if (!formValue) {
        toast.warning("Please enter a valid value for the secret.");
        return;
      }
      if (formValue === filledDefaultValue) {
        toast.warning("Please enter a new value for the secret.");
        return;
      }

      const payload = {
        value: formValue,
      };
      patchRepositorySecret({
        repositoryId: repositoryId.toString(),
        secretId: selectedSecretId as string,
        payload,
      })
        .then((_response) => {
          toast.success("Secret updated");
          void refreshSecrets();
          setCurrrentEdittingSecretId(null);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error while updating secret.");
        });
    },
    [
      getValues,
      repositoryId,
      patchRepositorySecret,
      refreshSecrets,
      resetField,
    ],
  );

  const storageForms = useMemo(() => {
    const auxListItems =
      secrets && secrets?.length > 0
        ? secrets?.map((secret, index) => (
            <Grid item xs={12} key={index} container spacing={2}>
              <Grid item xs={7} sm={8} md={10}>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  autoFocus
                  id={`${repositoryId}-${secret.name}`}
                  label={`${secret.name}`}
                  disabled={
                    currrentEdittingSecretId?.toString() !==
                    secret.id.toString()
                  }
                  defaultValue={secret.is_filled ? filledDefaultValue : ""}
                  type="password"
                  fullWidth
                  {...register(`${secret.id}`)}
                />
              </Grid>
              <Grid item xs={5} sm={4} md={2}>
                {currrentEdittingSecretId?.toString() ===
                secret.id.toString() ? (
                  <div>
                    <Tooltip title="Save">
                      <IconButton
                        aria-label="save"
                        value={secret.id}
                        onClick={handleSaveSecret}
                      >
                        <SaveAltIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear">
                      <IconButton
                        aria-label="clear"
                        value={secret.id}
                        onClick={handleSaveSecret}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <IconButton
                        aria-label="cancel"
                        onClick={() => {
                          setCurrrentEdittingSecretId(null);
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
                      value={secret.id}
                      onClick={handleEditSecret}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          ))
        : "";
    return auxListItems;
  }, [
    secrets,
    currrentEdittingSecretId,
    register,
    repositoryId,
    handleEditSecret,
    handleSaveSecret,
  ]);

  return (
    <Card variant="outlined">
      <CardHeader
        title="Storage Secrets"
        titleTypographyProps={{ variant: "h6" }}
      />
      <CardContent>
        <Box>
          <Typography variant="body1">
            Storage Secrets are environment variables that are encrypted and
            injected to a sidecar container to the Pieces making use of shared
            storage. Anyone with access to this workspace can use these secrets
            for sharing storage between running Pieces.
          </Typography>
          {secrets && secrets?.length > 0 ? (
            <form>
              <Grid container spacing={2} sx={{ marginTop: "15px" }}>
                {storageForms}
              </Grid>
            </form>
          ) : (
            <Alert severity="warning" sx={{ mt: 1 }}>
              No storage repositories!
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StorageSecretsCard;
