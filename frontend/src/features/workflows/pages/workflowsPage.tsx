import PrivateLayout from "components/PrivateLayout";

import { WorkflowsComponent } from "../components/Workflows";
import { WorkflowsProvider } from "../context/workflows";

/**
 * Workflows summary page
 */

export const WorkflowsPage: React.FC = () => {
  return (
    <PrivateLayout>
      <WorkflowsProvider>
        <WorkflowsComponent />
      </WorkflowsProvider>
    </PrivateLayout>
  );
};
