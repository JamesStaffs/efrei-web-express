import type { Pet } from "../domain/pet.js";

export interface PetRepository {
  findAll(): Pet[];
  findById(id: number): Pet | undefined;
  create(pet: Pet): Pet;
  update(id: number, pet: Pet): Pet | undefined;
  delete(id: number): boolean;
}