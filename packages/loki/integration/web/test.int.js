describe("test Loki", () => {
  it("by script", (done) => {
    loadScriptByTag("base/dist/packages/loki/lokidb.loki.js")
      .then(() => {
        expect(Loki).toBeFunction();
        expect(Loki.Collection).toBeFunction();

        const new Loki();

      }).then(() => {
        done();
    });
  })
});
