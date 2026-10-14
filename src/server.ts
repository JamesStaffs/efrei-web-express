import { DatabaseSync } from "node:sqlite";
import { createApp } from "./app.js";
import { SqlitePetRepository } from "./repositories/sqlite-pet-repository.js";

const database = new DatabaseSync("pets.sqlite");
const repository = new SqlitePetRepository(database);
const port = Number(process.env.PORT ?? 3000);

createApp(repository).listen(port, () => {
  console.log(`Pet store API listening on http://localhost:${port}`);
});