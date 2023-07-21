import { Dayjs } from "dayjs";

type Value = string | number | boolean | Dayjs | null
interface BaseInput {
  fromUpstream: boolean, //? allowed | never | always
  upstreamArgument: string | null,
  upstreamId: string | null,
  upstreamValue: string | null,
  value: Value
}

export interface ObjectInput {
  fromUpstream: boolean, //? allowed | never | always
  upstreamArgument: string | null,
  upstreamId: string | null,
  upstreamValue: string | null,
  value: Record<string, Value>
}

export type InputArray = BaseInput & {
  value: Record<string,BaseInput>[] | Record<string,ObjectInput>[]
}

export type Input = BaseInput
