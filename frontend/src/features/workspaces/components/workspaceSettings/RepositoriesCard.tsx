import {
  GitHub as GitHubIcon,
  Folder as FolderIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import KeyIcon from "@mui/icons-material/Key";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Tooltip,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { ERepositorySource } from "interfaces/repositorySource.enum";
import { type FC, type ReactNode, useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { type IOperatorRepositoryMetadata } from "services/requests/piece";

import { useWorkspaceSettings } from "../../context/workspaceSettings";

/**
 * @todo this file is growing too much, maybe it's time to split into smaller components
 * @todo add more repo options (sync this info with backend)
 * @returns Repositories card component
 */
export const RepositoriesCard: FC = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | false>(false);
  const [step, setStep] = useState<StepType>("FETCH_METADATA");
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [version, setVersion] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [availableVersions, setAvailableVersions] = useState<
    IOperatorRepositoryMetadata[]
  >([]);

  const {
    repositories,
    handleAddRepository,
    handleFetchRepoReleases,
    handleRefreshRepositories,
    setSelectedRepositoryId,
    selectedRepositoryId,
    handleDeleteRepository,
  } = useWorkspaceSettings();

  /**
   * 1- fetch metadata for given url
   * 2- select version
   */
  type StepType = "FETCH_METADATA" | "SELECT_VERSION";

  /** @todo improve when more sources become available */
  const { source, path } = useMemo(() => {
    if (url.length > 5) {
      const [source, path] = url
        .trim()
        .toLowerCase()
        .replace("https://", "")
        .split(".com/");

      if (source !== "github")
        setError(`Invalid repository source ${source}. Expected github.`);

      return { source, path };
    } else {
      setError(false);
      return { source: "", path: "" };
    }
  }, [url]);

  /**
   * Submit handler
   */
  const submitRepo = useCallback(() => {
    setIsStepLoading(true);
    void handleAddRepository({
      path,
      source,
      version,
    }).finally(() => {
      setStep("FETCH_METADATA");
      setAvailableVersions([]);
      handleRefreshRepositories();
      setUrl("");
      setIsStepLoading(false);
    });
  }, [handleAddRepository, handleRefreshRepositories, path, source, version]);

  const handleNextStep = useCallback(() => {
    switch (step) {
      case "FETCH_METADATA":
        setIsStepLoading(true);
        handleFetchRepoReleases({
          path,
          source: source as ERepositorySource,
        })
          .then((data) => {
            setAvailableVersions(data.splice(0, 10));
            setStep("SELECT_VERSION");
          })
          .catch((e) => {
            if (e.response.data.detail) {
              toast.error(e.response.data.detail);
            } else {
              toast.error("Error fetching repo metadata");
            }
          })
          .finally(() => {
            setIsStepLoading(false);
          });
        break;

      case "SELECT_VERSION":
        submitRepo();
        break;

      default:
        return null;
    }
  }, [handleFetchRepoReleases, path, source, step, submitRepo]);

  const stepButtonContent: Record<StepType, ReactNode> = {
    FETCH_METADATA: (
      <>
        Search repository <ChevronRightIcon sx={{ ml: 1 }} />
      </>
    ),
    SELECT_VERSION: (
      <>
        Add repository to workspace <AddIcon sx={{ ml: 1 }} />
      </>
    ),
  };

  const handleSelectRepository = useCallback(
    (e: any) => {
      const repositoryId = e.currentTarget.value;
      if (repositoryId === selectedRepositoryId) {
        setSelectedRepositoryId(null);
        setSelectedIndex(null);
      } else {
        setSelectedRepositoryId(repositoryId || null);
        setSelectedIndex(repositoryId || null);
      }
    },
    [setSelectedRepositoryId, selectedRepositoryId],
  );

  const handleDeleteOperatorRepository = useCallback(
    (e: React.SyntheticEvent<HTMLButtonElement>) => {
      const repositoryId = e.currentTarget.value;
      handleDeleteRepository(repositoryId)
        .then(() => {
          handleRefreshRepositories();
        })
        .catch((error) => {
          toast.error(error.response.data.detail);
        });
    },
    [handleDeleteRepository, handleRefreshRepositories],
  );

  return (
    <Card variant="outlined">
      <CardHeader
        title="Repositories"
        titleTypographyProps={{ variant: "h6" }}
      />
      <CardContent>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Add repository
          </Typography>
          <TextField
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
            fullWidth
            variant="outlined"
            id="repository"
            label="Repository URL"
            name="repository"
            error={!!error}
            helperText={error || ""}
            disabled={step !== "FETCH_METADATA"}
            InputProps={{
              ...(!!url && {
                startAdornment:
                  source === ERepositorySource.github ? (
                    <GitHubIcon sx={{ mr: 1 }} />
                  ) : (
                    <FolderIcon sx={{ mr: 1 }} />
                  ),
              }),
            }}
          />

          {!!availableVersions.length && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Repository version
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={version}
                  label="Repository versoin"
                  disabled={step !== "SELECT_VERSION"}
                  onChange={(e) => {
                    setVersion(e.target.value);
                  }}
                >
                  {availableVersions.map(({ version }) => (
                    <MenuItem value={version} key={version}>
                      {version}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Button
            disabled={
              !url ||
              isStepLoading ||
              !!error ||
              (step === "SELECT_VERSION" && !version)
            }
            color="primary"
            variant="contained"
            onClick={handleNextStep}
            sx={{
              mt: 1,
              width: "100%",
              display: "flex",
              alignItems: "centerr",
            }}
          >
            {isStepLoading ? <CircularProgress /> : stepButtonContent[step]}
          </Button>
        </Box>

        {repositories.length ? (
          <List>
            {repositories.map((repo, index) => (
              <ListItem
                key={index}
                selected={selectedIndex?.toString() === repo.id.toString()}
              >
                <ListItemAvatar>
                  <IconButton value={repo.id}>
                    <Avatar>
                      {repo.source === ERepositorySource.github ? (
                        <GitHubIcon />
                      ) : (
                        <FolderIcon />
                      )}
                    </Avatar>
                  </IconButton>
                </ListItemAvatar>
                <ListItemText
                  primary={repo.name}
                  secondary={`${repo.path} - version: ${repo.version}`}
                />
                <IconButton value={repo.id} onClick={handleSelectRepository}>
                  <Tooltip title="Edit repository secrets.">
                    <KeyIcon />
                  </Tooltip>
                </IconButton>
                <IconButton
                  value={repo.id}
                  onClick={handleDeleteOperatorRepository}
                >
                  <Tooltip title="Delete repository.">
                    <DeleteIcon />
                  </Tooltip>
                </IconButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="warning" sx={{ mt: 1 }}>
            No repositories!
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
