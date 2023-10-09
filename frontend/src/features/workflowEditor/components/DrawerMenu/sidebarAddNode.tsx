import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { useWorkflowsEditor } from "features/workflowEditor/context";
import { type FC, useState } from "react";

import PiecesSidebarNode from "./sidebarNode";

/**
 * @todo cleanup comments when no longer needed
 * @todo move pieces rules to create workflow context
 * @todo improve loading/error/empty states
 */

const SidebarAddNode: FC = () => {
  const { repositories, repositoriesLoading, repositoryPieces } =
    useWorkflowsEditor();

  const [piecesMap, setPiecesMap] = useState<Record<string, Piece[]>>({});
  const [expandedRepos, setExpandedRepos] = useState<string[]>([]);

  /** controls if an accordion is loading Pieces */
  const [loadingPieces, setLoadingPieces] = useState<string | false>(false);

  return (
    <Box className="add-node-panel" sx={{ padding: "0px 0px 0px 0px" }}>
      {repositoriesLoading && (
        <Alert severity="info">Loading repositories...</Alert>
      )}
      {!repositoriesLoading &&
        repositories.map((repo) => (
          <Accordion
            TransitionProps={{ unmountOnExit: true }}
            expanded={expandedRepos.includes(repo.id)}
            key={repo.id}
            onChange={() => {
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
