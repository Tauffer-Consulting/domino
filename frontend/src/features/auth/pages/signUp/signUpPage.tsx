import {
  Box,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Link as LinkMui,
} from "@mui/material";
import PublicLayout from "components/PublicLayout";
import TextInput from "components/TextInput";
import { useAuthentication } from "context/authentication";
import { type FC, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { yupResolver } from "utils";
import * as yup from "yup";

/**
 * Sign up component
 * @TODO: differentiate more from the login page?
 */

interface ISignUp {
  email: string;
  password: string;
}

const validationSignUp: yup.ObjectSchema<ISignUp> = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export const SignUpPage: FC = () => {
  const { register, authLoading } = useAuthentication();

  const resolver = yupResolver(validationSignUp);

  const methods = useForm<ISignUp>({
    reValidateMode: "onChange",
    resolver,
  });

  const handleSubmit = useCallback(
    async (data: ISignUp) => {
      await register(data.email, data.password);
    },
    [register],
  );

  return (
    <PublicLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            margin: "0 auto",
            marginBottom: 2,
            maxWidth: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src="assets/logo2.png" alt="logo" style={{ width: "360px" }} />
        </Box>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontWeight: "semi-bold" }}
        >
          Create an account
        </Typography>
      </Box>
      <Box
        component="form"
        onSubmit={methods.handleSubmit(async (data) => {
          await handleSubmit(data);
        })}
        noValidate
        sx={{ mt: 1 }}
      >
        <FormProvider {...methods}>
          <TextInput
            margin="normal"
            required
            fullWidth
            variant="outlined"
            id="email"
            label="E-mail address"
            name="email"
            autoComplete="email"
            autoFocus
            disabled={authLoading}
          />
          <TextInput
            margin="normal"
            required
            fullWidth
            variant="outlined"
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            disabled={authLoading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={authLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {authLoading ? <CircularProgress size={20} /> : "Sign Up"}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link to="/recover-password">
                <Typography variant="body2" color="text.primary">
                  Forgot password?
                </Typography>
              </Link>
            </Grid>
            <Grid item>
              <Link to="/sign-in">
                <Typography variant="body2" color="text.primary">
                  Do you have an account? Sign In
                </Typography>
              </Link>
            </Grid>
          </Grid>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 4 }}
          >
            {"Copyright © "}
            <LinkMui color="inherit" href="https://www.taufferconsulting.com/">
              Tauffer Consulting
            </LinkMui>
            {" 2023."}
          </Typography>
        </FormProvider>
      </Box>
    </PublicLayout>
  );
};

export default SignUpPage;
