test_integration("loki",
  {
    "Loki": (Loki) => {
      expect(Loki.Collection).toBeDefined();

      const loki = new Loki();
      expect(loki).toHaveMethod("initializePersistence");
      expect(loki).toHaveMethod("addCollection");
    },
    "Collection": (Collection) => {
      const coll = new Collection();
      expect(coll).toHaveMethod("insert");
      expect(coll).toHaveMethod("find");
    }
  }
);
