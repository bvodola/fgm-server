const { ApolloServer, gql } = require("apollo-server-express");

const {
  defaultQueries,
  defaultMutations,
  defaultQueriesResolvers,
  defaultMutationsResolvers,
  linkToParent
} = require("./functions");

const { getReceipt } = require("./custom_functions");

const typeDefs = gql`
  type User {
    _id: ID
    name: String
    email: String
    phone: String
    role: String
    tokens: Tokens
    password: String
    created: String

    cro: String
    cpf: String
    rg_cnpj: String
    receipts: [Receipt]
  }

  input UserInput {
    _id: ID
    name: String
    email: String
    phone: String
    role: String
    tokens: TokensInput
    password: String

    cro: String
    cpf: String
    rg_cnpj: String
    receipts: [ReceiptInput]
  }

  type Receipt {
    _id: ID
    approved: Boolean
    dental_name: String
    code: String
    amount: String
    files: [String]
  }

  input ReceiptInput {
    _id: ID
    approved: Boolean
    dental_name: String
    code: String
    amount: String
    files: [String]
  }

  type Tokens {
    local: String
  }

  input TokensInput {
    local: String
  }

  type Draw {
    _id: ID
    receipt: Receipt
    winner: User
    prize: String
    published: Boolean
    date_scheduled: String
    date_performed: String
    created: String
  }

  input DrawInput {
    _id: ID
    receipt_id: ID
    winner_id: ID
    prize: String
    published: Boolean
    date_scheduled: String
    date_performed: String
    created: String
  }

  type Query {
    ${defaultQueries("user")}
    ${defaultQueries("draw")}
  }

  type Mutation {
    ${defaultMutations("user")}
    ${defaultMutations("draw")}
  }
`;

const resolvers = {
  // ============
  // Custom Types
  // ============
  Draw: {
    receipt: getReceipt(),
    winner: linkToParent({ fieldName: "winner" })
  },

  // =====
  // Query
  // =====
  Query: {
    ...defaultQueriesResolvers("user"),
    ...defaultQueriesResolvers("draw")
  },

  // ========
  // Mutation
  // ========
  Mutation: {
    ...defaultMutationsResolvers("user"),
    ...defaultMutationsResolvers("draw")
  }
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    settings: { "editor.cursorShape": "line" }
  }
});

module.exports = apolloServer;
