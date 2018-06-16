test_integration("fs-storage",
  [],
  {
    "FSStorage": (FSStorage) => {
      const ms = new FSStorage();
      expect(ms).toHaveMember("loadDatabase");
      expect(ms).toHaveMember("saveDatabase");
    }
  }
);
