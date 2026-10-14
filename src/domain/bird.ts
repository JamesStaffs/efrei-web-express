import { Pet } from "./pet.js";

export abstract class Bird extends Pet {
  protected constructor(
    id: number | undefined,
    name: string,
    age: number,
    readonly wingspanCm: number,
  ) {
    super(id, name, age);
  }
}