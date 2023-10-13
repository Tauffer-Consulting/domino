import { type Dayjs } from "dayjs";

type Value = string | number | boolean | Dayjs;
interface BaseInput {
  fromUpstream: boolean; // ? allowed | never | always
  upstreamArgument: string;
  upstreamId: string;
  upstreamValue: string;
  value: Value;
}

export interface ObjectInput {
  fromUpstream: Record<string, boolean>;
  upstreamArgument: Record<string, string>;
  upstreamId: Record<string, string>;
  upstreamValue: Record<string, string>;
  value: Record<string, Value>;
}

export type InputArray = BaseInput & {
  value: BaseInput[] | ObjectInput[];
};

export type Input = BaseInput;
