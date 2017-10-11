/* global describe, it, expect */
import * as Query from "../../src/query_builder";

describe("query builder", () => {

  it("BaseQuery", () => {
    let q = new Query.BaseQuery("custom").boost(1.5).build();
    expect(q).toEqual({type: "custom", boost: 1.5});
    expect(() => new Query.BaseQuery("custom").boost(-1)).toThrowErrorOfType("TypeError");
  });

  it("TermQuery", () => {
    let q = new Query.TermQuery("user", "albert").boost(2.5).build();
    expect(q).toEqual({type: "term", field: "user", value: "albert", boost: 2.5});
  });

  it("TermsQuery", () => {
    let q = new Query.TermsQuery("user", ["albert", "einstein"]).boost(3.5).build();
    expect(q).toEqual({type: "terms", field: "user", value: ["albert", "einstein"], boost: 3.5});
  });


  it("PrefixQuery", () => {
    let q = new Query.PrefixQuery("user", "alb").boost(5.5).build();
    expect(q).toEqual({type: "prefix", field: "user", value: "alb", boost: 5.5});
  });

  it("ExistsQuery", () => {
    let q = new Query.ExistsQuery("user").boost(6.5).build();
    expect(q).toEqual({type: "exists", field: "user", boost: 6.5});
  });

  it("MatchQuery", () => {
    let q = new Query.MatchQuery("user", "albert einstein").boost(7.5).build();
    expect(q).toEqual({type: "match", field: "user", value: "albert einstein", boost: 7.5});

    q = new Query.MatchQuery("1", "1").operator("and").fuzziness(3).prefixLength(3).build();
    expect(q).toEqual({type: "match", field: "1", value: "1", operator: "and", fuzziness: 3, prefix_length: 3});
    q = new Query.MatchQuery("2", "2").operator("or").minimumShouldMatch(3).build();
    expect(q).toEqual({type: "match", field: "2", value: "2", operator: "or", minimum_should_match: 3});
    q = new Query.MatchQuery("1", "1");
    expect(() => q.minimumShouldMatch(-2)).not.toThrowErrorOfType("TypeError");
    expect(() => q.minimumShouldMatch(4)).not.toThrowAnyError();
    expect(() => q.operator("and")).toThrowErrorOfType("SyntaxError");
    expect(() => q.operator("not")).toThrowErrorOfType("SyntaxError");
    q = new Query.MatchQuery("1", "1").operator("and");
    expect(() => q.minimumShouldMatch(3)).toThrowErrorOfType("SyntaxError");
    q = new Query.MatchQuery("1", "1");
    expect(() => q.fuzziness(-3)).toThrowErrorOfType("TypeError");
    expect(() => q.prefixLength(-1)).toThrowErrorOfType("TypeError");
  });

  it("MatchAllQuery", () => {
    let q = new Query.MatchAllQuery().boost(8.5).build();
    expect(q).toEqual({type: "match_all", boost: 8.5});
  });

  it("ConstantScoreQuery", () => {
    let q = new Query.ConstantScoreQuery().boost(8.5).build();
    expect(q).toEqual({type: "constant_score", boost: 8.5});

    q = new Query.ConstantScoreQuery().beginFilter()
      .term("user", "albert")
      .fuzzy("name", "einsten")
      .endFilter().build();
    expect(q).toEqual({
      type: "constant_score", filter: {
        type: "array",
        values: [new Query.TermQuery("user", "albert").build(), new Query.FuzzyQuery("name", "einsten").build()]
      }
    });
  });

  it("BoolQuery", () => {
    let q = new Query.BoolQuery().boost(8.5).build();
    expect(q).toEqual({type: "bool", boost: 8.5});

    expect(() => new Query.BoolQuery().minimumShouldMatch(-2)).not.toThrowErrorOfType("TypeError");
    expect(new Query.BoolQuery().minimumShouldMatch(2).build()).toEqual(
      {type: "bool", minimum_should_match: 2}
    );

    q = new Query.BoolQuery()
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
        values: [new Query.TermQuery("user", "albert").build(), new Query.FuzzyQuery("name", "einsten").build()]
      },
      must: {
        type: "array",
        boost: 3,
        values: [new Query.WildcardQuery("user", "alb?rt").build(), new Query.PrefixQuery("user", "alb").build(),
          new Query.ExistsQuery("name").build()]
      },
      should: {
        type: "array",
        boost: 4,
        values: [new Query.TermsQuery("quotes", ["infinity", "atom"]).build(), new Query.MatchAllQuery().build()]
      },
      not: {
        type: "array",
        boost: 5,
        values: [new Query.MatchQuery("user", "alb").build(), new Query.ConstantScoreQuery().build(),
          new Query.BoolQuery().build()]
      }
    });
  });

  it("QueryBuilder", () => {
    let q = new Query.QueryBuilder()
      .enableFinalScoring(true)
      .useBM25(0.1, 0.5)
      .term("user", "albert").build();
    expect(q).toEqual({
      final_scoring: true,
      scoring: {
        type: "BM25",
        k1: 0.1,
        b: 0.5,
      },
      query: {
        type: "term", field: "user", value: "albert",
      }
    });

    let scoring = {
      type: "BM25",
      k1: 1.2,
      b: 0.75,
    };

    expect(() => new Query.QueryBuilder().useBM25(-1, -1)).toThrowErrorOfType("TypeError");
    expect(() => new Query.QueryBuilder().useBM25(0, 2)).toThrowErrorOfType("TypeError");

    expect(new Query.QueryBuilder().bool().beginMust().term("user", "albert").endMust().build()).toEqual({
      query: {
        type: "bool",
        must: {
          type: "array",
          values: [{type: "term", field: "user", value: "albert"}]
        }
      },
      scoring: scoring
    });
    expect(new Query.QueryBuilder().constantScore().build()).toEqual({
      query: {
        type: "constant_score",
      },
      scoring: scoring
    });
    expect(new Query.QueryBuilder().term("user", "albert").build()).toEqual({
      query: {
        type: "term", field: "user", value: "albert",
      },
      scoring: scoring
    });
    expect(new Query.QueryBuilder().terms("quotes", ["infinity", "atom"]).build()).toEqual({
      query: {
        type: "terms", field: "quotes", value: ["infinity", "atom"],
      },
      scoring: scoring
    });
    expect(new Query.QueryBuilder().wildcard("user", "alb?rt").build()).toEqual({
      query: {
        type: "wildcard", field: "user", value: "alb?rt",
      },
      scoring: scoring
    });
    expect(new Query.QueryBuilder().fuzzy("name", "einsten").build()).toEqual({
      query: {
        type: "fuzzy", field: "name", value: "einsten",
      },
      scoring: scoring
    });
    expect(new Query.QueryBuilder().match("user", "alb").build()).toEqual({
      query: {
        type: "match", field: "user", value: "alb",
      },
      scoring: scoring
    });
    expect(new Query.QueryBuilder().matchAll().build()).toEqual({
      query: {
        type: "match_all",
      },
      scoring: scoring
    });
    expect(new Query.QueryBuilder().prefix("user", "alb").build()).toEqual({
      query: {
        type: "prefix", field: "user", value: "alb",
      },
      scoring: scoring
    });
    expect(new Query.QueryBuilder().exists("user").build()).toEqual({
      query: {
        type: "exists", field: "user"
      },
      scoring: scoring
    });
  });
});
