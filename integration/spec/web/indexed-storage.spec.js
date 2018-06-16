test_integration("indexed-storage",
  [],
  {
    "IndexedStorage": (IndexedStorage) => {
      const is = new IndexedStorage();
      expect(is).toHaveMember("loadDatabase");
      expect(is).toHaveMember("saveDatabase");
      expect(is).toHaveMember("getDatabaseList");
    }
  }
);
