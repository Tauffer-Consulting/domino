import WorkflowPanelContextProvider from "./workflowPanelContext";
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
      <WorkflowPanelContextProvider>
        <WorkflowsEditorProviderItem>{children}</WorkflowsEditorProviderItem>
      </WorkflowPanelContextProvider>
    </WorkflowSettingsDataProvider>
  );
};

export default WorkflowsEditorProviderWrapper;
