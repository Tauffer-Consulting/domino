import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useWorkflowsEditor } from "features/workflowEditor/context";
import { type FC, type SyntheticEvent, useState } from "react";

import PiecesSidebarNode from "./sidebarNode";

/**
 * @todo cleanup comments when no longer needed
 * @todo move pieces rules to create workflow context
 * @todo improve loading/error/empty states
 */
const SidebarAddNode: FC = () => {
  const {
    repositories,
    repositoriesLoading,
    repositoryPieces,
    nodeDirection,
    toggleNodeDirection,
  } = useWorkflowsEditor();

  const [piecesMap, setPiecesMap] = useState<Record<string, Piece[]>>({});
  const [expandedRepos, setExpandedRepos] = useState<string[]>([]);

  /** controls if an accordion is loading Pieces */
  const [loadingPieces, setLoadingPieces] = useState<string | false>(false);

  return (
    <Box className="add-node-panel" sx={{ padding: "0px 0px 0px 0px" }}>
      <Box sx={{ display: "flex", flexDirection: "column", mb: 1 }}>
        <ToggleButtonGroup
          value={nodeDirection}
          exclusive
          onChange={toggleNodeDirection}
          aria-label="Node direction"
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <ToggleButton
            value="horizontal"
            aria-label="left aligned"
            sx={{ padding: "0px 0px 0px 0px", width: "120px" }}
          >
            horizontal
          </ToggleButton>
          <ToggleButton
            value="vertical"
            aria-label="centered"
            sx={{ padding: "0px 0px 0px 0px", width: "120px" }}
          >
            vertical
          </ToggleButton>
        </ToggleButtonGroup>

        {/* <TextField
          variant='outlined'
          margin='normal'
          label='Search repository'
          type='search'
          name='search-form'
          id='search-form'
          className='search-input'
          value={search}
        onChange={(e) => handleSearch(e.target.value)}
        /> */}
      </Box>

      {repositoriesLoading && (
        <Alert severity="info">Loading repositories...</Alert>
      )}
      {!repositoriesLoading &&
        repositories.map((repo) => (
          <Accordion
            TransitionProps={{ unmountOnExit: true }}
            expanded={expandedRepos.includes(repo.id)}
            key={repo.id}
            onChange={(event: SyntheticEvent, expanded: boolean) => {
              if (loadingPieces) return;
              setLoadingPieces(repo.id);

              // Check if the repo is currently expanded
              const isExpanded = expandedRepos.includes(repo.id);

              // If the repo is already expanded, remove it from the expandedRepos array
              // Otherwise, add it to the expandedRepos array
              setExpandedRepos(
                isExpanded
                  ? (prev) => prev.filter((id) => id !== repo.id)
                  : (prev) => [...prev, repo.id],
              );

              // If the repo is not currently expanded, load its pieces
              if (!isExpanded) {
                setPiecesMap((prev) => ({
                  ...prev,
                  [repo.id]: repositoryPieces[repo.id],
                }));
              }

              setLoadingPieces(false);
            }}
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
              {!!loadingPieces && loadingPieces === repo.id && (
                <Alert severity="info">Loading Pieces...</Alert>
              )}
              {expandedRepos.includes(repo.id) &&
                piecesMap[repo.id]?.length &&
                piecesMap[repo.id].map((piece) => (
                  <PiecesSidebarNode piece={piece} key={piece.id} />
                ))}
            </AccordionDetails>
          </Accordion>
        ))}
    </Box>
  );
};

export default SidebarAddNode;
