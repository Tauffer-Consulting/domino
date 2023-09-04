import { PrivateLayout } from "modules/layout";

import { WorkflowsComponent } from "./components/workflows.component";

/**
 * Workflows summary page
 */

export const WorkflowsPage = () => {
  return (
    <PrivateLayout>
      <WorkflowsComponent />
    </PrivateLayout>
  );
};

export default WorkflowsPage;
