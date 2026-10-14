import express, { type Request, type Response } from "express";
import { Canary } from "./domain/canary.js";
import { Parrot } from "./domain/parrot.js";
import type { Pet } from "./domain/pet.js";
import type { PetRepository } from "./repositories/pet-repository.js";

type PetInput = {
  species: unknown;
  name: unknown;
  age: unknown;
  wingspanCm: unknown;
  vocabularySize?: unknown;
  songStyle?: unknown;
};

export function createApp(pets: PetRepository) {
  const app = express();
  app.use(express.json());

  app.get("/pets", (_request, response) => {
    response.json(pets.findAll());
  });

  app.get("/pets/:id", (request, response) => {
    const id = parseId(request, response);
    if (id === undefined) return;

    const pet = pets.findById(id);
    if (!pet) {
      response.status(404).json({ error: "Pet not found" });
      return;
    }
    response.json(pet);
  });

  app.post("/pets", (request, response) => {
    const pet = parsePet(request.body, response);
    if (!pet) return;
    response.status(201).json(pets.create(pet));
  });

  app.put("/pets/:id", (request, response) => {
    const id = parseId(request, response);
    if (id === undefined) return;
    const pet = parsePet(request.body, response);
    if (!pet) return;

    const updated = pets.update(id, pet);
    if (!updated) {
      response.status(404).json({ error: "Pet not found" });
      return;
    }
    response.json(updated);
  });

  app.delete("/pets/:id", (request, response) => {
    const id = parseId(request, response);
    if (id === undefined) return;
    if (!pets.delete(id)) {
      response.status(404).json({ error: "Pet not found" });
      return;
    }
    response.status(204).end();
  });

  return app;
}

function parseId(request: Request, response: Response): number | undefined {
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    response.status(400).json({ error: "Pet id must be a positive integer" });
    return undefined;
  }
  return id;
}

function parsePet(value: unknown, response: Response): Pet | undefined {
  if (!value || typeof value !== "object") {
    response.status(400).json({ error: "Request body must be a pet object" });
    return undefined;
  }

  const input = value as PetInput;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (
    !name ||
    typeof input.age !== "number" ||
    !Number.isInteger(input.age) ||
    input.age < 0 ||
    typeof input.wingspanCm !== "number" ||
    !Number.isFinite(input.wingspanCm) ||
    input.wingspanCm <= 0
  ) {
    response.status(400).json({ error: "Provide a name, non-negative integer age, and positive wingspanCm" });
    return undefined;
  }

  if (input.species === "parrot" && Number.isInteger(input.vocabularySize) && Number(input.vocabularySize) >= 0) {
    return new Parrot(undefined, name, input.age, input.wingspanCm, Number(input.vocabularySize));
  }

  if (input.species === "canary" && typeof input.songStyle === "string" && input.songStyle.trim()) {
    return new Canary(undefined, name, input.age, input.wingspanCm, input.songStyle.trim());
  }

  response.status(400).json({ error: "Species must be parrot or canary with its required species-specific field" });
  return undefined;
}