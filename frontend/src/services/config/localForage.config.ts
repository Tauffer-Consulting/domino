import * as localForage from "localforage";

localForage.config({
  name: "Domino",
  storeName: "domino_data", // Should be alphanumeric, with underscores.
  description: "Domino database",
});

export default localForage;
