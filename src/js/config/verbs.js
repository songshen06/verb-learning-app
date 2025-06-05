// Verb data configuration
export const verbData = [
  {
    id: 1,
    infinitive: "go",
    past: "went",
    definition: "去，前往",
    example: "I go to school every day.",
    past_example: "Yesterday, I went to the park.",
    type: "irregular",
    category: "movement",
  },
  {
    id: 2,
    infinitive: "take",
    past: "took",
    definition: "拿，带走",
    example: "I take my bag to school.",
    past_example: "She took her umbrella yesterday.",
    type: "irregular",
    category: "action",
  },
  {
    id: 3,
    infinitive: "see",
    past: "saw",
    definition: "看见，看到",
    example: "I see a bird in the tree.",
    past_example: "We saw a movie last night.",
    type: "irregular",
    category: "action",
  },
  {
    id: 4,
    infinitive: "is",
    past: "was",
    definition: "是，在",
    example: "The cat is sleeping.",
    past_example: "The cat was sleeping yesterday.",
    type: "irregular",
    category: "state",
  },
  {
    id: 5,
    infinitive: "look",
    past: "looked",
    definition: "看，瞧",
    example: "I look at the board.",
    past_example: "She looked at the stars last night.",
    type: "regular",
    category: "action",
  },
  {
    id: 6,
    infinitive: "visit",
    past: "visited",
    definition: "访问，参观",
    example: "We visit our grandparents.",
    past_example: "They visited the museum yesterday.",
    type: "regular",
    category: "action",
  },
  {
    id: 7,
    infinitive: "play",
    past: "played",
    definition: "玩，玩耍",
    example: "Children play in the park.",
    past_example: "We played soccer yesterday.",
    type: "regular",
    category: "action",
  },
  {
    id: 8,
    infinitive: "dance",
    past: "danced",
    definition: "跳舞",
    example: "She loves to dance.",
    past_example: "They danced at the party.",
    type: "regular",
    category: "action",
  },
  {
    id: 9,
    infinitive: "do",
    past: "did",
    definition: "做，干",
    example: "I do my homework.",
    past_example: "He did his chores yesterday.",
    type: "irregular",
    category: "action",
  },
  {
    id: 10,
    infinitive: "build",
    past: "built",
    definition: "建造，建筑",
    example: "We build sandcastles.",
    past_example: "They built a treehouse last summer.",
    type: "irregular",
    category: "action",
  },
  {
    id: 11,
    infinitive: "tell",
    past: "told",
    definition: "告诉，讲述",
    example: "I tell stories to my friends.",
    past_example: "The actors told lots of jokes.",
    type: "irregular",
    category: "action",
  },
  {
    id: 12,
    infinitive: "wear",
    past: "wore",
    definition: "穿，戴",
    example: "I wear a uniform to school.",
    past_example: "The men wore women's clothes.",
    type: "irregular",
    category: "action",
  },
  {
    id: 13,
    infinitive: "eat",
    past: "ate",
    definition: "吃",
    example: "I eat breakfast at 8 AM.",
    past_example: "We all ate hamburgers and chips.",
    type: "irregular",
    category: "action",
  },
  {
    id: 14,
    infinitive: "have",
    past: "had",
    definition: "有，拥有；举办",
    example: "I have a new book.",
    past_example: "We had a party yesterday.",
    type: "irregular",
    category: "action",
  },
  {
    id: 15,
    infinitive: "buy",
    past: "bought",
    definition: "买，购买",
    example: "I buy groceries every week.",
    past_example: "Mum bought new chopsticks for you.",
    type: "irregular",
    category: "action",
  },
  {
    id: 16,
    infinitive: "read",
    past: "read",
    definition: "读，阅读",
    example: "I read books every day.",
    past_example: "Dad read a book about Chinese history.",
    type: "irregular",
    category: "action",
  },
  {
    id: 17,
    infinitive: "laugh",
    past: "laughed",
    definition: "笑，大笑",
    example: "The joke makes me laugh.",
    past_example: "We laughed a lot.",
    type: "regular",
    category: "action",
  },
  {
    id: 18,
    infinitive: "like",
    past: "liked",
    definition: "喜欢",
    example: "I like ice cream.",
    past_example: "She liked them.",
    type: "regular",
    category: "action",
  },
  {
    id: 19,
    infinitive: "borrow",
    past: "borrowed",
    definition: "借，借用",
    example: "I borrow books from the library.",
    past_example: "We borrowed a bike for you.",
    type: "regular",
    category: "action",
  },
];

// Verb types
export const VERB_TYPES = {
  REGULAR: "regular",
  IRREGULAR: "irregular",
};

// Verb categories
export const VERB_CATEGORIES = {
  MOVEMENT: "movement",
  ACTION: "action",
  STATE: "state",
};

// Transform verbData to match test expectations
export const VERBS = verbData.map((verb) => {
  // Define proper past participles for irregular verbs
  const pastParticiples = {
    go: "gone",
    take: "taken",
    see: "seen",
    is: "been",
    do: "done",
    build: "built",
    tell: "told",
    wear: "worn",
    eat: "eaten",
    have: "had",
    buy: "bought",
    read: "read",
  };

  return {
    infinitive: verb.infinitive,
    past: verb.past,
    pastParticiple: pastParticiples[verb.infinitive] || verb.past, // Use proper past participle or fallback to past
    definition: verb.definition,
    examples: [verb.example, verb.past_example],
    type: verb.type,
    category: verb.category,
    id: verb.id,
  };
});

// Helper functions
export function getVerbById(id) {
  return verbData.find((verb) => verb.id === id);
}

export function getVerbsByType(type) {
  return verbData.filter((verb) => verb.type === type);
}

export function getVerbsByCategory(category) {
  return verbData.filter((verb) => verb.category === category);
}

export function getRandomVerbs(count = 5) {
  const shuffled = [...verbData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
