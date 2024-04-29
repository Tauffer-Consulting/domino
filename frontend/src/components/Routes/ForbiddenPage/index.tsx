import PrivateLayout from "@components/PrivateLayout";
import { useAuthentication } from "@context/authentication";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from "@mui/material";
import React from "react";
import { type NavigateFunction, useNavigate } from "react-router-dom";

export const ForbiddenPage: React.FC = () => {
  const { isLogged } = useAuthentication();
  const navigate = useNavigate();

  return (
    <>
      {isLogged ? (
        <PrivateLayout>
          <ForbiddenCard navigate={navigate} />
        </PrivateLayout>
      ) : (
        <ForbiddenCard navigate={navigate} />
      )}
    </>
  );
};

const ForbiddenCard: React.FC<{ navigate: NavigateFunction }> = ({
  navigate,
}) => (
  <Card
    sx={{
      maxWidth: 400,
      margin: "auto",
      marginTop: 4,
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    }}
  >
    <CardHeader
      title="Forbidden"
      sx={{
        backgroundColor: (theme) => theme.palette.error.main,
        color: "white",
        textAlign: "center",
      }}
    />
    <Divider />
    <CardContent
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
      }}
    >
      <Typography variant="body1" align="center">
        You are not authorized to access this page.
      </Typography>
      <Button
        onClick={() => {
          navigate(-1);
        }}
        variant="outlined"
        sx={{ marginTop: 2 }}
      >
        <Typography component="span">{`< Go back `}</Typography>
      </Button>
    </CardContent>
  </Card>
);
