import PiecesProvider from "./pieces.context";
import WorkflowsEdgesProvider from "./workflowEdges.context";
import WorkflowsNodesProvider from "./workflowNodes.context";
import WorkflowPiecesProvider from "./workflowPieces.context";
import WorkflowPiecesDataProvider from "./workflowPiecesData.context";
import WorkflowSettingsDataProvider from "./workflowSettingsData.context";

const ProviderContextWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <WorkflowSettingsDataProvider>
      <PiecesProvider>
        <WorkflowsEdgesProvider>
          <WorkflowsNodesProvider>
            <WorkflowPiecesProvider>
              <WorkflowPiecesDataProvider>
                {children}
              </WorkflowPiecesDataProvider>
            </WorkflowPiecesProvider>
          </WorkflowsNodesProvider>
        </WorkflowsEdgesProvider>
      </PiecesProvider>
    </WorkflowSettingsDataProvider>
  );
};

export default ProviderContextWrapper;
