test_integration("memory-storage",
  [],
  {
    "MemoryStorage": (MemoryStorage) => {
      const ms = new MemoryStorage();
      expect(ms).toHaveMember("loadDatabase");
      expect(ms).toHaveMember("saveDatabase");
    }
  }
);
