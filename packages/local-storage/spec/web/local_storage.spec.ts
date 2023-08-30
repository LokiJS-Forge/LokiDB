/* global describe, it, expect */
import { Loki } from "../../../loki/src/loki";
import { LocalStorage } from "../../src/local_storage";
import {
  InMemoryLocalStorage,
  AsyncInMemoryLocalStorage,
} from "../fixtures/in-memory-local-storage";

const STORAGES = {
  "window.localStorage": window.localStorage,
  InMemoryLocalStorage: new InMemoryLocalStorage(),
  AsyncInMemoryLocalStorage: new AsyncInMemoryLocalStorage(),
};

describe("testing local storage", function () {
  interface Name {
    name: string;
  }

  beforeAll(() => {
    LocalStorage.register();
  });

  afterAll(() => {
    LocalStorage.deregister();
  });

  for (const [storageName, storage] of Object.entries(STORAGES)) {
    describe(`Testing with ${storageName}`, () => {
      const adapter = new LocalStorage(storage);

      it("should isolate different databases, collections and objects", async function () {
        const db = new Loki("myTestApp");
        await db.initializePersistence({ adapter });
        db.addCollection<Name>("myColl").insert({ name: "Hello World" });
        await db.saveDatabase();

        const db2 = new Loki("myTestApp");
        await db2.initializePersistence({ adapter });
        await db2.loadDatabase();
        expect(db2.getCollection<Name>("myColl").find()[0].name).toEqual(
          "Hello World"
        );

        await db2.initializePersistence({
          persistenceMethod: "local-storage",
          adapter,
        });
        await db2.loadDatabase();
        expect(db2.getCollection<Name>("myColl").find()[0].name).toEqual(
          "Hello World"
        );

        const db3 = new Loki("other");
        await db3.initializePersistence({ adapter });
        await expect(async () => {
          await db3.loadDatabase();
        }).not.toThrow();

        await db.deleteDatabase();
        await expect(async () => {
          await db.loadDatabase();
        }).not.toThrow();
      });

      it("auto save and auto load", async function () {
        const db = new Loki("myTestApp2");

        await db.initializePersistence({
          autosave: true,
          autoload: true,
          adapter,
        });

        db.addCollection<Name>("myColl").insert({ name: "Hello World" });
        await db.close();

        const db2 = new Loki("myTestApp2");

        await db2.initializePersistence({ autosave: true, autoload: true });
        expect(db2.getCollection<Name>("myColl").find()[0].name).toEqual(
          "Hello World"
        );
      });
    });
  }
});
