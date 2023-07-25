import FormsDataProvider from "./forms-data.context";
import PiecesProvider from "./pieces.context";
import WorkflowsEdgesProvider from "./workflow-edges.context";
import WorkflowsNodesProvider from "./workflow-nodes.context";
import WorkflowPiecesProvider from "./workflow-pieces.context";
import WorkflowPiecesDataProvider from "./workflow-pieces-data.context";

const ProviderContextWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FormsDataProvider>
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
    </FormsDataProvider>
  );
}

export default ProviderContextWrapper
