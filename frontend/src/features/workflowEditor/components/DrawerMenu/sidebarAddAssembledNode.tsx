import { Alert, Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { type FC, useState, useEffect } from "react";

import AssembledPiecesSidebarNode from "./sidebarAssembledPiece";

/**
 * @todo cleanup comments when no longer needed
 * @todo move pieces rules to create workflow context
 * @todo improve loading/error/empty states
 */

interface Props {
  setOrientation: React.Dispatch<
    React.SetStateAction<"horizontal" | "vertical">
  >;
  orientation: "vertical" | "horizontal";
}

const SidebarAddAssembledNode: FC<Props> = ({
  setOrientation,
  orientation,
}) => {
  // const { loadingPieces } = useWorkflowsEditor();

  /** controls if an accordion is loading Pieces */
  const [loadingPieces, setLoadingPieces] = useState<string | false>(false);

  const [assembledPieces, setAssembledPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/assembled_pieces");
        const data = await res.json();
        console.log("data", data);
        setAssembledPieces(data.assembled_pieces);
      } catch (error) {
        console.error("Error fetching data: ", error);
        // 可以在这里处理错误，例如设置错误状态或显示通知
      }
    };

    fetchData()
      .then(() => {
        setLoadingPieces(false);
        console.log("fetch data success");
      })
      .catch((error) => {
        console.log("error", error);
      });
  }, []);

  console.log("assembledPieces", assembledPieces);
  console.log(Array.isArray(assembledPieces)); // 应该输出 true
  return (
    <Box className="add-node-panel" sx={{ padding: "0px 0px 0px 0px" }}>
      {loadingPieces && <Alert severity="info">Loading repositories...</Alert>}
      {!loadingPieces && (
        <ToggleButtonGroup
          sx={{ width: "100%", display: "flex" }}
          value={orientation}
          exclusive
          onChange={(_, value) => {
            console.log("value", value);
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
      {!loadingPieces &&
        assembledPieces.map((piece) => (
          <AssembledPiecesSidebarNode piece={piece} key={piece.id} />
        ))}
    </Box>
  );
};

export default SidebarAddAssembledNode;
