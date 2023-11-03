import ReactWorkflowPersistenceProvider from "./reactWorkflowPersistence";
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
      <ReactWorkflowPersistenceProvider>
        <WorkflowPiecesProvider>
          <WorkflowPiecesDataProvider>
            <WorkflowsEditorProviderItem>
              {children}
            </WorkflowsEditorProviderItem>
          </WorkflowPiecesDataProvider>
        </WorkflowPiecesProvider>
      </ReactWorkflowPersistenceProvider>
    </WorkflowSettingsDataProvider>
  );
};

export default WorkflowsEditorProviderWrapper;
