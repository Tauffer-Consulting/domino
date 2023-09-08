import PiecesProvider from "./pieces";
import WorkflowsEdgesProvider from "./workflowEdges";
import WorkflowsNodesProvider from "./workflowNodes";
import WorkflowPiecesProvider from "./workflowPieces";
import WorkflowPiecesDataProvider from "./workflowPiecesData";
import WorkflowsEditorProviderItem, {
  useWorkflowsEditor,
} from "./workflowsEditor";
import WorkflowSettingsDataProvider from "./workflowSettingsData";

export { useWorkflowsEditor };

const WorkflowsEditorProviderWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <WorkflowSettingsDataProvider>
      <PiecesProvider>
        <WorkflowsEdgesProvider>
          <WorkflowsNodesProvider>
            <WorkflowPiecesProvider>
              <WorkflowPiecesDataProvider>
                <WorkflowsEditorProviderItem>
                  {children}
                </WorkflowsEditorProviderItem>
              </WorkflowPiecesDataProvider>
            </WorkflowPiecesProvider>
          </WorkflowsNodesProvider>
        </WorkflowsEdgesProvider>
      </PiecesProvider>
    </WorkflowSettingsDataProvider>
  );
};

export default WorkflowsEditorProviderWrapper;
