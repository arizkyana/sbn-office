import { ZodString } from "zod";

export interface ILoginForm {
  username: ZodString;
  password: ZodString;
}
