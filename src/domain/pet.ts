export abstract class Pet {
  abstract readonly species: string;

  protected constructor(
    readonly id: number | undefined,
    readonly name: string,
    readonly age: number,
  ) {}
}
