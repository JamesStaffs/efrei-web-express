import { Bird } from "./bird.js";

export class Parrot extends Bird {
  readonly species = "parrot";

  constructor(
    id: number | undefined,
    name: string,
    age: number,
    wingspanCm: number,
    readonly vocabularySize: number,
  ) {
    super(id, name, age, wingspanCm);
  }
}