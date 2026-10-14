import { Bird } from "./bird.js";

export class Canary extends Bird {
  readonly species = "canary";

  constructor(
    id: number | undefined,
    name: string,
    age: number,
    wingspanCm: number,
    readonly songStyle: string,
  ) {
    super(id, name, age, wingspanCm);
  }
}