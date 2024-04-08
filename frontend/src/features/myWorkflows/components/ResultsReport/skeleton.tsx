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
import { useNavigate } from "react-router-dom";

import { PaperA4 } from "./PaperA4";

export const ResultsReportSkeleton: React.FC = () => {
  const navigate = useNavigate();

  const array = Array(5).fill(0);

  return (
    <Grid
      container
      spacing={2}
      style={{
        height: `86vh`,
        width: "100%",
        margin: 0,
      }}
    >
      <Grid item xs={12}>
        <Button
          onClick={() => {
            navigate(-1);
          }}
          variant="text"
        >
          <Typography component="span">{`< Go back to Detail`}</Typography>
        </Button>
      </Grid>
      <Grid item xs={2} container direction="column">
        <Paper>
          <Container sx={{ paddingTop: 2 }}>
            <Typography variant="h6" component="h2">
              Pieces :
            </Typography>

            <List>
              {array.map((_, idx) => (
                <div key={`ResultsReport-key-${idx}`}>
                  <ListItem
                    disablePadding
                    sx={{ maxHeight: "60px", overflow: "hidden" }}
                  >
                    <ListItemButton onClick={() => {}}>
                      <ListItemText primary={<Skeleton />} />
                    </ListItemButton>
                  </ListItem>
                  {idx !== array.length - 1 ? <Divider /> : null}
                </div>
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
              height: "80vh",
            }}
          ></Skeleton>
        </PaperA4>
      </Grid>
    </Grid>
  );
};
