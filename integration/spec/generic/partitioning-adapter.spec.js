test_integration("partitioning-adapter",
  [],
  {
    "PartitioningAdapter": (PartitioningAdapter) => {
      const ms = new PartitioningAdapter({});
      expect(ms).toHaveMember("loadDatabase");
      expect(ms).toHaveMember("exportDatabase");
    }
  }
);
