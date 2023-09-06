import MockAdapter from "axios-mock-adapter";

import {
  postAuthLoginMockResponse,
  postAuthRegisterMockResponse,
} from "../requests/authentication";

import { dominoApiClient } from "./domino.client";

export const dominoMock = () => {
  const dominoApiMockAdapter = new MockAdapter(dominoApiClient, {
    delayResponse: 3000,
    onNoMatch: "passthrough",
  });
  dominoApiMockAdapter
    .onPost("/auth/login")
    .reply(200, postAuthLoginMockResponse);
  dominoApiMockAdapter
    .onPost("/auth/register")
    .reply(200, postAuthRegisterMockResponse);
};
