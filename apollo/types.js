const { ApolloServer, gql } = require("apollo-server-express");

const {
  defaultQueries,
  defaultMutations,
  defaultQueriesResolvers,
  defaultMutationsResolvers,
  linkToParent
} = require("./functions");

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

  type Query {
    ${defaultQueries("user")}
  }

  type Mutation {
    ${defaultMutations("user")}
  }

  
`;

const resolvers = {
  // ============
  // Custom Types
  // ============

  // =====
  // Query
  // =====
  Query: {
    ...defaultQueriesResolvers("user")
  },

  // ========
  // Mutation
  // ========
  Mutation: {
    ...defaultMutationsResolvers("user")
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
