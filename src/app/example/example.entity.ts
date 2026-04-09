export type ExampleEntity = {
  id: string;
  thing: string;
  userId: string;
};

export type ExampleEntityRead = ExampleEntity & {
  _id?: string;
};
