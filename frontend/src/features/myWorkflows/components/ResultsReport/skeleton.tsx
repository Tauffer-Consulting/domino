import {
  Button,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import React from "react";

import { PaperA4 } from "./PaperA4";

export const ResultsReportSkeleton: React.FC = () => {
  const array = Array(5).fill(0);

  return (
    <Grid
      container
      style={{
        height: `88vh`,
        width: "100%",
        margin: 0,
      }}
    >
      <Grid item xs={2} direction="column">
        <Button variant="text" onClick={() => {}}>
          {"< Go Back"}
        </Button>
        <Paper>
          <Container sx={{ paddingTop: 2 }}>
            <Typography variant="h6" component="h2">
              Pieces :
            </Typography>

            <List>
              {array.map((_, idx) => (
                <>
                  <ListItem
                    key={`ResultsReport-key-${idx}`}
                    disablePadding
                    sx={{ maxHeight: "60px", overflow: "hidden" }}
                  >
                    <ListItemButton onClick={() => {}}>
                      <ListItemText primary={<Skeleton />} />
                    </ListItemButton>
                  </ListItem>
                  {idx !== array.length - 1 ? <Divider /> : null}
                </>
              ))}
            </List>
          </Container>
        </Paper>
      </Grid>
      <Grid item xs={9}>
        <PaperA4 id="skeleton">
          <Skeleton
            variant="rectangular"
            sx={{
              height: "84vh",
            }}
          ></Skeleton>
        </PaperA4>
      </Grid>
    </Grid>
  );
};
