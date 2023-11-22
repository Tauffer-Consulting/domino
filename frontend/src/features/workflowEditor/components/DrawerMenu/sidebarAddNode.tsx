import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { usesPieces } from "context/workspaces";
import { type FC, useState, useMemo, useEffect } from "react";

import PiecesSidebarNode from "./sidebarNode";

interface Props {
  setOrientation: React.Dispatch<
    React.SetStateAction<"horizontal" | "vertical">
  >;
  orientation: "vertical" | "horizontal";
}

const SidebarAddNode: FC<Props> = ({ setOrientation, orientation }) => {
  const { repositories, repositoriesLoading, repositoryPieces } = usesPieces();

  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filteredRepositoryPieces = useMemo(() => {
    function filterPieces(
      repository: PiecesRepository,
      searchTerm: string,
    ): PiecesRepository {
      const filteredRepository: PiecesRepository = {};

      Object.keys(repository).forEach((key) => {
        const filteredPieces = repository[key].filter((piece) => {
          return (
            piece.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            piece.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });

        filteredRepository[key] = filteredPieces;
        if (filteredPieces.length) {
          setExpanded((e) => ({ ...e, [key]: true }));
        }
      });

      return filteredRepository;
    }

    console.log("repositoryPieces", repositoryPieces);
    return filterPieces(repositoryPieces, filter);
  }, [filter, repositoryPieces, setExpanded]);

  useEffect(() => {
    if (!filter) {
      setExpanded((e) => {
        const newExpanded = Object.keys(e).reduce<Record<string, boolean>>(
          (acc, next) => {
            acc[next] = false;
            return acc;
          },
          {},
        );

        return newExpanded;
      });
    }
  }, [filter]);

  return (
    <Box sx={{ padding: 2 }}>
      {repositoriesLoading && (
        <Alert severity="info">Loading repositories...</Alert>
      )}
      {!repositoriesLoading && (
        <ToggleButtonGroup
          sx={{ display: "flex" }}
          value={orientation}
          exclusive
          onChange={(_, value) => {
            if (value) setOrientation(value);
          }}
        >
          <ToggleButton value="horizontal" sx={{ flex: 1 }}>
            horizontal
          </ToggleButton>
          <ToggleButton value="vertical" sx={{ flex: 1 }}>
            vertical
          </ToggleButton>
        </ToggleButtonGroup>
      )}
      <TextField
        sx={{ marginTop: "10px", marginBottom: "10px" }}
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
        }}
        fullWidth
        variant="filled"
        label="search"
      />
      {!repositoriesLoading &&
        repositories.map((repo) => {
          if (!filteredRepositoryPieces[repo.id]?.length) {
            return null;
          }

          return (
            <Accordion
              expanded={expanded[repo.id]}
              onChange={(_, expanded) => {
                setExpanded((e) => ({ ...e, [repo.id]: expanded }));
              }}
              TransitionProps={{ unmountOnExit: true }}
              key={repo.id}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    WebkitLineClamp: "2",
                    WebkitBoxOrient: "vertical",
                    maxWidth: "180px",
                    fontWeight: "450",
                  }}
                >
                  {repo.label}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  margin: "0px 0px 0px 0px",
                  padding: "0px 0px 0px 0px",
                }}
              >
                {/* {!!loadingPieces && loadingPieces === repo.id && (
                <Alert severity="info">Loading Pieces...</Alert>
              )} */}

                {Boolean(filteredRepositoryPieces[repo.id]?.length) &&
                  filteredRepositoryPieces[repo.id].map((piece) => (
                    <PiecesSidebarNode piece={piece} key={piece.id} />
                  ))}
              </AccordionDetails>
            </Accordion>
          );
        })}
    </Box>
  );
};

export default SidebarAddNode;
