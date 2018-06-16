test_integration("local-storage",
  [],
  {
    "LocalStorage": (LocalStorage) => {
      const ls = new LocalStorage();
      expect(ls).toHaveMember("loadDatabase");
      expect(ls).toHaveMember("saveDatabase");
    },
  }
);
