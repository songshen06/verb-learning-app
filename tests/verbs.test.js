import { VERBS } from "../src/js/config/verbs";

describe("Verbs Data", () => {
  test("should have correct data structure for each verb", () => {
    VERBS.forEach((verb) => {
      expect(verb).toHaveProperty("infinitive");
      expect(verb).toHaveProperty("past");
      expect(verb).toHaveProperty("pastParticiple");
      expect(verb).toHaveProperty("definition");
      expect(verb).toHaveProperty("examples");
      expect(Array.isArray(verb.examples)).toBe(true);
    });
  });

  test("should have valid Chinese definitions", () => {
    VERBS.forEach((verb) => {
      expect(typeof verb.definition).toBe("string");
      expect(verb.definition.length).toBeGreaterThan(0);
      // 检查是否包含中文字符
      expect(/[\u4e00-\u9fa5]/.test(verb.definition)).toBe(true);
    });
  });

  test("should have valid examples", () => {
    VERBS.forEach((verb) => {
      expect(verb.examples.length).toBeGreaterThan(0);
      verb.examples.forEach((example) => {
        expect(typeof example).toBe("string");
        expect(example.length).toBeGreaterThan(0);
        // 检查示例是否包含动词的某种形式（更灵活的检查）
        const infinitive = verb.infinitive.toLowerCase();
        const past = verb.past.toLowerCase();
        const exampleLower = example.toLowerCase();

        // 检查是否包含原型、过去式或者动词的词根
        const containsVerbForm =
          exampleLower.includes(infinitive) ||
          exampleLower.includes(past) ||
          exampleLower.includes(`to ${infinitive}`) ||
          // 特殊情况处理
          (infinitive === "is" &&
            (exampleLower.includes("is") || exampleLower.includes("was"))) ||
          (infinitive === "like" &&
            (exampleLower.includes("like") || exampleLower.includes("liked")));

        expect(containsVerbForm).toBe(true);
      });
    });
  });

  test("should have unique verbs", () => {
    const infinitives = VERBS.map((verb) => verb.infinitive.toLowerCase());
    const uniqueInfinitives = new Set(infinitives);
    expect(uniqueInfinitives.size).toBe(infinitives.length);
  });

  test("should have consistent verb forms", () => {
    VERBS.forEach((verb) => {
      expect(typeof verb.past).toBe("string");
      expect(typeof verb.pastParticiple).toBe("string");
      expect(verb.past.length).toBeGreaterThan(0);
      expect(verb.pastParticiple.length).toBeGreaterThan(0);
    });
  });
});
