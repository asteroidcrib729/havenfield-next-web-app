// @ts-check
import { module } from "@prisma/composer";
import havenfieldService from "./service.mjs";

export default module("havenfield", ({ provision }) => {
  provision(havenfieldService);
});
