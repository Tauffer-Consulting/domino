import { Dayjs } from "dayjs";

export interface IInput {
  fromUpstream: boolean, //? allowed | never | always
  upstreamArgument: string | null,
  upstreamId: string | null,
  value: string | number | boolean | Dayjs | null | IInput[]
}
