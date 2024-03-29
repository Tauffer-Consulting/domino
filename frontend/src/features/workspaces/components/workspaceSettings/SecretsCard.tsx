/* eslint-disable react/prop-types */
import {
  useRepositorySecrets,
  useUpdateRepositorySecret,
} from "@features/workspaces/api";
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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  useState,
  useImperativeHandle,
  useCallback,
  forwardRef,
  type Ref,
  useMemo,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface SecretsCardProps {
  repositoryId?: number;
}

/* eslint-disable react/prop-types */
const SecretsCard = (props: SecretsCardProps, ref: Ref<any>) => {
  const filledDefaultValue = "******";
  const { repositoryId } = props;
  const { register, getValues, resetField } = useForm();
  const [currrentEdittingSecretId, setCurrrentEdittingSecretId] = useState<
    number | null
  >(null);

  useImperativeHandle(ref, () => ({
    ...ref,
  }));

  const { data: secrets, refetch: refreshSecrets } = useRepositorySecrets({
    repositoryId: repositoryId?.toString() ?? "",
  });

  const { mutateAsync: patchRepository } = useUpdateRepositorySecret();

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
        patchRepository({
          repositoryId: repositoryId.toString(),
          secretId: selectedSecretId as string,
          payload,
        })
          .then(() => {
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
      patchRepository({
        repositoryId: repositoryId.toString(),
        secretId: selectedSecretId as string,
        payload,
      })
        .then(() => {
          toast.success("Secret updated");
          void refreshSecrets();
          setCurrrentEdittingSecretId(null);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    [getValues, repositoryId, patchRepository, refreshSecrets, resetField],
  );

  const listItems = useMemo(() => {
    const auxListItems =
      secrets && secrets?.length > 0 ? (
        secrets.map((secret, index) => (
          <Grid item xs={12} key={index} container spacing={2}>
            <Grid item xs={7} sm={8} md={10}>
              <TextField
                InputLabelProps={{ shrink: true }}
                autoFocus
                id={`${repositoryId}-${secret.name}`}
                label={`${secret.name}`}
                disabled={
                  currrentEdittingSecretId?.toString() !== secret.id.toString()
                }
                defaultValue={secret.is_filled ? filledDefaultValue : ""}
                type="password"
                fullWidth
                {...register(`${secret.id}`)}
              />
            </Grid>
            <Grid item xs={5} sm={4} md={2}>
              {currrentEdittingSecretId?.toString() === secret.id.toString() ? (
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
      ) : (
        <Grid item xs={12}>
          {repositoryId === null ? (
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              No repository selected.
            </Typography>
          ) : (
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              This repository has no secrets.
            </Typography>
          )}
        </Grid>
      );
    return auxListItems;
  }, [
    secrets,
    repositoryId,
    currrentEdittingSecretId,
    handleEditSecret,
    handleSaveSecret,
    register,
  ]);

  return (
    <Card variant="outlined">
      <CardHeader
        title="Repository Secrets"
        titleTypographyProps={{ variant: "h6" }}
      />
      <CardContent>
        <Box>
          <Typography variant="body1">
            {`Secrets are environment variables that are encrypted and injected to the Piece container based on the Piece's SecretsModel. Anyone with access to this workspace can use these secrets for running Pieces.`}
          </Typography>
          <form>
            <Grid container spacing={2} sx={{ marginTop: "15px" }}>
              {listItems}
            </Grid>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
};

export default forwardRef(SecretsCard);
