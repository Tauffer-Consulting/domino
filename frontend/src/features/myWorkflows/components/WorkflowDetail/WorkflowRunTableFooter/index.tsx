import { Button, Grid } from "@mui/material";
import {
  type GridSlotsComponentsProps,
  useGridRootProps,
} from "@mui/x-data-grid";
import React from "react";

declare module "@mui/x-data-grid" {
  interface FooterPropsOverrides {
    triggerRun: () => void;
  }
}

interface Props extends NonNullable<GridSlotsComponentsProps["footer"]> {
  triggerRun: () => void;
}

export const WorkflowRunTableFooter = React.forwardRef<HTMLDivElement, Props>(
  ({ triggerRun }) => {
    const rootProps = useGridRootProps();

    const paginationElement = rootProps.pagination &&
      !rootProps.hideFooterPagination &&
      rootProps.slots.pagination && (
        <rootProps.slots.pagination {...rootProps.slotProps?.pagination} />
      );

    return (
      <Grid container>
        <Grid item xs={6}>
          <Grid
            container
            alignContent="center"
            justifyContent="start"
            sx={{ height: "100%" }}
          >
            <Grid item sx={{ paddingLeft: "1rem" }}>
              <Button variant="contained" onClick={triggerRun}>
                Run
              </Button>
            </Grid>
            <Grid item sx={{ paddingLeft: "1rem" }}>
              <Button disabled variant="contained">
                Cancel
              </Button>
            </Grid>
            <Grid item sx={{ paddingLeft: "1rem" }}>
              <Button disabled variant="contained">
                Pause
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          {paginationElement}
        </Grid>
      </Grid>
    );
  },
);

WorkflowRunTableFooter.displayName = "WorkflowRunTableFooter";
