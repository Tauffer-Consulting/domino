import Loading from "components/Loading";
import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createCustomContext } from "utils";

import { postAuthLogin, postAuthRegister } from "./api";
import {
  authStatus,
  type IAuthenticationContext,
  type IAuthenticationStore,
} from "./authentication.interface";
import { DOMINO_LOGOUT } from "./authentication.logout";

export const [AuthenticationContext, useAuthentication] =
  createCustomContext<IAuthenticationContext>("Authentication Context");

/**
 * Authentication provider.
 * @todo refactor local storage implementation with Local Forage
 */
export const AuthenticationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(authStatus.Loading);
  const [authLoading, setAuthLoading] = useState(false);
  const [store, setStore] = useState<IAuthenticationStore>({
    token: localStorage.getItem("auth_token"),
    userId: localStorage.getItem("userId"),
  });

  const isLogged = useRef(!!store.token);

  const login = useCallback(
    (token: string, userId: string, tokenExpiresIn: number, redirect = "") => {
      isLogged.current = true;
      setStore((store) => ({
        ...store,
        token,
        userId,
        tokenExpiresIn,
      }));
      const currentDate = new Date();
      const tokenExpirationDate = new Date(
        currentDate.getTime() + tokenExpiresIn * 1000,
      );
      localStorage.setItem("auth_token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem(
        "tokenExpiresAtTimestamp",
        tokenExpirationDate.getTime().toString(),
      );
      setStatus(authStatus.SignedIn);
      navigate(redirect);
    },
    [navigate],
  );

  const logout = useCallback(() => {
    localStorage.clear();
    isLogged.current = false;
    setStore((store) => ({
      ...store,
      token: null,
    }));
    setStatus(authStatus.SignedOut);
    navigate("/sign-in");
  }, [navigate]);

  const authenticate = useCallback(
    async (email: string, password: string) => {
      setAuthLoading(true);
      void postAuthLogin({ email, password })
        .then((res) => {
          if (res.status === 200) {
            login(
              res.data.access_token,
              res.data.user_id,
              res.data.token_expires_in,
            );
          }
        })
        .finally(() => {
          setAuthLoading(false);
        });
    },
    [login],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      setAuthLoading(true);
      postAuthRegister({ email, password })
        .then((res) => {
          if (res.status === 201) {
            toast.success("E-mail and password registered successfully!");
            void authenticate(email, password);
          }
        })
        .catch((err) => {
          console.log(err?.response?.status);
          if (err?.response?.status === 409) {
            toast.warning(`This e-mail is already registered`);
          } else {
            toast.error(err?.response?.data?.detail ?? `Error while register`);
          }
        })
        .finally(() => {
          setAuthLoading(false);
        });
    },
    [authenticate],
  );

  const tokenExpired = useCallback(() => {
    const tokenTimestamp = localStorage.getItem("tokenExpiresAtTimestamp");
    if (tokenTimestamp) {
      const date1 = Number(tokenTimestamp);
      const date2 = new Date().getTime();
      return date1 <= date2;
    }
    return true;
  }, []);

  /**
   * Listen to "logout" event and handles it (ie. unauthorized request)
   */
  useEffect(() => {
    window.addEventListener(DOMINO_LOGOUT, () => {
      logout();
    });
    return () => {
      window.removeEventListener(DOMINO_LOGOUT, () => {
        logout();
      });
    };
  }, [logout]);

  useEffect(() => {
    const expired = tokenExpired();

    if (expired) {
      logout();
    } else {
      setStatus(authStatus.SignedIn);
    }
  }, [tokenExpired]);

  const value = useMemo((): IAuthenticationContext => {
    return {
      store,
      isLogged: isLogged.current,
      authLoading,
      logout,
      authenticate,
      register,
    };
  }, [store, logout, authenticate, register, authLoading]);

  if (status === authStatus.Loading) {
    return <Loading />;
  }

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
};
