const models = require("../models");

const globalConfig = {
  models: {
    Company: {
      plural: "Companies"
    }
  }
};

const capitalizeFirst = str => str.charAt(0).toUpperCase() + str.substring(1);

const getModelPluralName = ModelName => {
  return globalConfig.models &&
    globalConfig.models[ModelName] &&
    globalConfig.models[ModelName].plural
    ? globalConfig.models[ModelName].plural
    : `${ModelName}s`;
};

/**
 * Creates the default graphql queries for a given model
 * For instance, defaultQueries('user') would return the following:
 *   users(user: UserInput): [User]
 *   user(user: UserInput): User
 *
 * @param {string} model
 */
const defaultQueries = (model = "") => {
  return `${model}s(${model}: ${capitalizeFirst(
    model
  )}Input): [${capitalizeFirst(model)}]
    ${model}(${model}: ${capitalizeFirst(model)}Input): ${capitalizeFirst(
    model
  )}`;
};

const defaultMutations = (model = "") => {
  const Model = capitalizeFirst(model);
  return `add${Model}(${model}: ${Model}Input): ${Model}
  edit${Model}(${model}: ${Model}Input): ${Model}
  remove${Model}(${model}: ${Model}Input): ${Model}`;
};

const defaultQueriesResolvers = (model = "") => ({
  [`${model}s`]: linkToModel(),
  [model]: linkToModel()
});

const defaultMutationsResolvers = (model = "") => {
  const Model = capitalizeFirst(model);
  return {
    [`add${Model}`]: addMutation({ model: Model }),
    [`edit${Model}`]: editMutation({ model: Model }),
    [`remove${Model}`]: removeMutation({ model: Model })
  };
};

const prepare = obj => {
  if (obj) {
    obj = obj.toObject();
    obj._id = String(obj._id);
    return obj;
  } else {
    return null;
  }
};

const getInfo = (info, config = {}) => {
  const ModelName = info.returnType
    .toString()
    .replace("[", "")
    .replace("]", "");
  const modelName = ModelName.replace(/^\w/, c => c.toLowerCase());

  const Model = models[getModelPluralName(ModelName)];

  const ParentName = info.parentType.toString();
  const parentName = ParentName.replace(/^\w/, c => c.toLowerCase());
  const ParentModel = models[getModelPluralName(ParentName)];

  const isCollection = info.returnType.toString().indexOf("[") >= 0;

  return { Model, modelName, ParentModel, parentName, isCollection };
};

const linkToParent = config => async (parent, args, context, info) => {
  if (!config)
    config = {
      habtm: false
    };
  const { Model, modelName, parentName, isCollection } = getInfo(info);

  if (config.habtm) {
    let field = Object.keys(Model.schema.obj).find(
      field => field === `${parentName}_ids`
    );
    if (typeof field === "undefined") {
      const possibleValues =
        parent[`${config.fieldName ? config.fieldName : modelName + "_ids"}`];
      return (await Model.find({ _id: { $in: possibleValues } }).exec()).map(
        prepare
      );
    }
  }
  return isCollection
    ? (
        await Model.find({
          [`${parentName}_id${config.habtm ? "s" : ""}`]: parent._id
        }).exec()
      ).map(prepare)
    : prepare(
        await Model.findOne({
          _id: parent[`${config.fieldName ? config.fieldName : modelName}_id`]
        })
      );
};

const linkToModel = config => async (parent, args, context, info) => {
  const { Model, modelName, isCollection } = getInfo(info, config);

  if (typeof args[modelName] !== "undefined") args = args[modelName];

  Object.keys(args).map(key => {
    if (key.includes("_ids") && Array.isArray(args[key])) {
      args[key] = { $all: args[key] };
    }
  });

  return isCollection
    ? (await Model.find(args).exec()).map(prepare)
    : prepare(await Model.findOne(args).exec());
};

const addMutation = config => async (parent, args, context, info) => {
  const Model = config.model;
  const model = Model.replace(/^\w/, c => c.toLowerCase());

  if (config.insertMany) {
    const res = (
      await models[getModelPluralName(Model)].insertMany(args[`${model}s`])
    ).map(prepare);
    if (typeof config.postHook === "function")
      config.postHook(args[`${model}s`]);
    return res;
  } else {
    const res = prepare(
      await models[getModelPluralName(Model)].create(args[model])
    );
    if (typeof config.postHook === "function") config.postHook(args[model]);
    return res;
  }
};

const editMutation = config => async (parent, args, context, info) => {
  const Model = config.model;
  const model = Model.replace(/^\w/, c => c.toLowerCase());
  const { _id } = args[model];
  const setArgs = { ...args[model] };
  delete setArgs._id;
  await models[getModelPluralName(Model)].update({ _id }, { $set: setArgs });
  return prepare(
    await models[getModelPluralName(Model)].findOne({ _id }).exec()
  );
};

const removeMutation = config => async (parent, args, context, info) => {
  const Model = config.model;
  const model = Model.replace(/^\w/, c => c.toLowerCase());
  const { _id } = args[model];
  await models[getModelPluralName(Model)].deleteOne({ _id }).exec();
  return { _id };
};

const authenticated = next => (root, args, context, info) => {
  if (!context.currentUser) {
    throw new Error(`Unauthenticated!`);
  }

  return next(root, args, context, info);
};

module.exports = {
  capitalizeFirst,
  defaultQueries,
  defaultMutations,
  defaultQueriesResolvers,
  defaultMutationsResolvers,
  prepare,
  getModelPluralName,
  getInfo,
  linkToParent,
  linkToModel,
  addMutation,
  editMutation,
  removeMutation,
  authenticated
};
