/* global describe, it, expect */
import * as Query from "../../src/query_builder";

describe("query builder", () => {
  it("TermQueryBuilder", () => {
    let q = new Query.TermQueryBuilder("user", "albert").boost(2.5).build();
    expect(q).toEqual({type: "term", field: "user", value: "albert", boost: 2.5});
  });

  it("TermsQueryBuilder", () => {
    let q = new Query.TermsQueryBuilder("user", ["albert", "einstein"]).boost(3.5).build();
    expect(q).toEqual({type: "terms", field: "user", value: ["albert", "einstein"], boost: 3.5});
  });


  it("PrefixQueryBuilder", () => {
    let q = new Query.PrefixQueryBuilder("user", "alb").boost(5.5).build();
    expect(q).toEqual({type: "prefix", field: "user", value: "alb", boost: 5.5});
  });

  it("ExistsQueryBuilder", () => {
    let q = new Query.ExistsQueryBuilder("user").boost(6.5).build();
    expect(q).toEqual({type: "exists", field: "user", boost: 6.5});
  });

  it("MatchQueryBuilder", () => {
    let q = new Query.MatchQueryBuilder("user", "albert einstein").boost(7.5).build();
    expect(q).toEqual({type: "match", field: "user", value: "albert einstein", boost: 7.5});

    q = new Query.MatchQueryBuilder("1", "1").operator("and").fuzziness(2).prefixLength(3).build();
    expect(q).toEqual({type: "match", field: "1", value: "1", operator: "and", fuzziness: 2, prefix_length: 3});
    q = new Query.MatchQueryBuilder("2", "2").operator("or").minimumShouldMatch(3).build();
    expect(q).toEqual({type: "match", field: "2", value: "2", operator: "or", minimum_should_match: 3});
    q = new Query.MatchQueryBuilder("1", "1");
    expect(() => q.minimumShouldMatch(-2)).not.toThrowErrorOfType("TypeError");
    expect(() => q.minimumShouldMatch(4)).not.toThrowAnyError();
    expect(() => q.operator("and")).toThrowErrorOfType("SyntaxError");
    expect(() => q.operator("not")).toThrowErrorOfType("SyntaxError");
    q = new Query.MatchQueryBuilder("1", "1").operator("and");
    expect(() => q.minimumShouldMatch(3)).toThrowErrorOfType("SyntaxError");
    q = new Query.MatchQueryBuilder("1", "1");
    expect(() => q.fuzziness(3)).toThrowErrorOfType("TypeError");
    expect(() => q.fuzziness(-3)).toThrowErrorOfType("TypeError");
    expect(() => q.prefixLength(-1)).toThrowErrorOfType("TypeError");
  });

  it("MatchAllQueryBuilder", () => {
    let q = new Query.MatchAllQueryBuilder().boost(8.5).build();
    expect(q).toEqual({type: "match_all", boost: 8.5});
  });

  it("ConstantScoreQueryBuilder", () => {
    let q = new Query.ConstantScoreQueryBuilder().boost(8.5).build();
    expect(q).toEqual({type: "constant_score", boost: 8.5});

    q = new Query.ConstantScoreQueryBuilder().beginFilter()
      .term("user", "albert")
      .fuzzy("name", "einsten")
      .endFilter().build();
    expect(q).toEqual({
      type: "constant_score", filter: {
        type: "array",
        values: [new Query.TermQueryBuilder("user", "albert").build(), new Query.FuzzyQueryBuilder("name", "einsten").build()]
      }
    });
  });

  it("BoolQueryBuilder", () => {
    let q = new Query.BoolQueryBuilder().boost(8.5).build();
    expect(q).toEqual({type: "bool", boost: 8.5});

    expect(() => new Query.BoolQueryBuilder().minimumShouldMatch(-2)).not.toThrowErrorOfType("TypeError");
    expect(new Query.BoolQueryBuilder().minimumShouldMatch(2).build()).toEqual(
      {type: "bool", minimum_should_match: 2}
    );

    q = new Query.BoolQueryBuilder()
      .beginFilter().boost(2)
      .term("user", "albert")
      .fuzzy("name", "einsten")
      .endFilter()
      .beginMust().boost(3)
      .wildcard("user", "alb?rt")
      .prefix("user", "alb")
      .exists("name")
      .endMust()
      .beginShould().boost(4)
      .terms("quotes", ["infinity", "atom"])
      .matchAll()
      .endShould()
      .beginNot().boost(5)
      .match("user", "alb")
      .constantScore()
      .bool()
      .endNot()
      .build();
    expect(q).toEqual({
      type: "bool",
      filter: {
        type: "array",
        boost: 2,
        values: [new Query.TermQueryBuilder("user", "albert").build(), new Query.FuzzyQueryBuilder("name", "einsten").build()]
      },
      must: {
        type: "array",
        boost: 3,
        values: [new Query.WildcardQueryBuilder("user", "alb?rt").build(), new Query.PrefixQueryBuilder("user", "alb").build(),
          new Query.ExistsQueryBuilder("name").build()]
      },
      should: {
        type: "array",
        boost: 4,
        values: [new Query.TermsQueryBuilder("quotes", ["infinity", "atom"]).build(), new Query.MatchAllQueryBuilder().build()]
      },
      not: {
        type: "array",
        boost: 5,
        values: [new Query.MatchQueryBuilder("user", "alb").build(), new Query.ConstantScoreQueryBuilder().build(),
          new Query.BoolQueryBuilder().build()]
      }
    });
  });

  it("QueryBuilder", () => {
    let q = new Query.QueryBuilder()
      .enableFinalScoring(true)
      .BM25Similarity(0.1, 0.5)
      .term("user", "albert").build();
    expect(q).toEqual({
      final_scoring: true,
      bm25: {
        k1: 0.1,
        b: 0.5,
      },
      query: {
        type: "term", field: "user", value: "albert",
      }
    });

    expect(() => new Query.QueryBuilder().BM25Similarity(-1, -1)).toThrowErrorOfType("TypeError");
    expect(() => new Query.QueryBuilder().BM25Similarity(0, 2)).toThrowErrorOfType("TypeError");

    expect(new Query.QueryBuilder().bool().beginMust().term("user", "albert").endMust().build()).toEqual({
      query: {
        type: "bool",
        must: {
          type: "array",
          values: [{type: "term", field: "user", value: "albert"}]
        }
      }
    });
    expect(new Query.QueryBuilder().constantScore().build()).toEqual({
      query: {
        type: "constant_score",
      }
    });
    expect(new Query.QueryBuilder().term("user", "albert").build()).toEqual({
      query: {
        type: "term", field: "user", value: "albert",
      }
    });
    expect(new Query.QueryBuilder().terms("quotes", ["infinity", "atom"]).build()).toEqual({
      query: {
        type: "terms", field: "quotes", value: ["infinity", "atom"],
      }
    });
    expect(new Query.QueryBuilder().wildcard("user", "alb?rt").build()).toEqual({
      query: {
        type: "wildcard", field: "user", value: "alb?rt",
      }
    });
    expect(new Query.QueryBuilder().fuzzy("name", "einsten").build()).toEqual({
      query: {
        type: "fuzzy", field: "name", value: "einsten",
      }
    });
    expect(new Query.QueryBuilder().match("user", "alb").build()).toEqual({
      query: {
        type: "match", field: "user", value: "alb",
      }
    });
    expect(new Query.QueryBuilder().matchAll().build()).toEqual({
      query: {
        type: "match_all",
      }
    });
    expect(new Query.QueryBuilder().prefix("user", "alb").build()).toEqual({
      query: {
        type: "prefix", field: "user", value: "alb",
      }
    });
    expect(new Query.QueryBuilder().exists("user").build()).toEqual({
      query: {
        type: "exists", field: "user"
      }
    });
  });
});
