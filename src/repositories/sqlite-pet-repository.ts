import { DatabaseSync } from "node:sqlite";
import { Canary } from "../domain/canary.js";
import { Parrot } from "../domain/parrot.js";
import type { Pet } from "../domain/pet.js";
import type { PetRepository } from "./pet-repository.js";

type PetRow = {
  id: number;
  species: string;
  name: string;
  age: number;
  wingspan_cm: number;
  vocabulary_size: number | null;
  song_style: string | null;
};

export class SqlitePetRepository implements PetRepository {
  constructor(private readonly database: DatabaseSync) {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        species TEXT NOT NULL CHECK (species IN ('parrot', 'canary')),
        name TEXT NOT NULL,
        age INTEGER NOT NULL CHECK (age >= 0),
        wingspan_cm REAL NOT NULL CHECK (wingspan_cm > 0),
        vocabulary_size INTEGER,
        song_style TEXT
      )
    `);
  }

  findAll(): Pet[] {
    const rows = this.database.prepare("SELECT * FROM pets ORDER BY id").all();
    return rows.map((row) => this.toPet(row as unknown as PetRow));
  }

  findById(id: number): Pet | undefined {
    const row = this.database.prepare("SELECT * FROM pets WHERE id = ?").get(id);
    return row ? this.toPet(row as unknown as PetRow) : undefined;
  }

  create(pet: Pet): Pet {
    const result = this.database
      .prepare(`
        INSERT INTO pets (species, name, age, wingspan_cm, vocabulary_size, song_style)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(...this.toValues(pet));

    return this.withId(pet, Number(result.lastInsertRowid));
  }

  update(id: number, pet: Pet): Pet | undefined {
    const result = this.database
      .prepare(`
        UPDATE pets
        SET species = ?, name = ?, age = ?, wingspan_cm = ?, vocabulary_size = ?, song_style = ?
        WHERE id = ?
      `)
      .run(...this.toValues(pet), id);

    return Number(result.changes) > 0 ? this.withId(pet, id) : undefined;
  }

  delete(id: number): boolean {
    const result = this.database.prepare("DELETE FROM pets WHERE id = ?").run(id);
    return Number(result.changes) > 0;
  }

  private toPet(row: PetRow): Pet {
    const birdArgs = [row.id, row.name, row.age, row.wingspan_cm] as const;

    switch (row.species) {
      case "parrot":
        return new Parrot(...birdArgs, row.vocabulary_size ?? 0);
      case "canary":
        return new Canary(...birdArgs, row.song_style ?? "");
      default:
        throw new Error(`Unsupported pet species: ${row.species}`);
    }
  }

  private toValues(pet: Pet): [string, string, number, number, number | null, string | null] {
    if (pet instanceof Parrot) {
      return [pet.species, pet.name, pet.age, pet.wingspanCm, pet.vocabularySize, null];
    }

    if (pet instanceof Canary) {
      return [pet.species, pet.name, pet.age, pet.wingspanCm, null, pet.songStyle];
    }

    throw new Error(`Unsupported pet type: ${pet.constructor.name}`);
  }

  private withId(pet: Pet, id: number): Pet {
    if (pet instanceof Parrot) {
      return new Parrot(id, pet.name, pet.age, pet.wingspanCm, pet.vocabularySize);
    }

    if (pet instanceof Canary) {
      return new Canary(id, pet.name, pet.age, pet.wingspanCm, pet.songStyle);
    }

    throw new Error(`Unsupported pet type: ${pet.constructor.name}`);
  }
}