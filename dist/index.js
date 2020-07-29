"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _require = _interopRequireDefault(require("@lode/require"));

var _sql = _interopRequireDefault(require("./sql"));

var _additionsObjectid = _interopRequireDefault(require("./additions-objectid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

(0, _additionsObjectid.default)(_sequelize.default);
const CONTEXT_ORM = Symbol('context#orm');
const CONTEXT_SEQUELIZE = Symbol('context#sequelize');
const CONTEXT_MODEL = Symbol('context#model');
const DEFAULT_NAME = 'default';
const cwd = process.cwd();
const Op = _sequelize.default.Op;
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
};
const DB_TYPE = {
  MYSQL: 'mysql',
  MARIADB: 'mariadb',
  MSSQL: 'mssql',
  POSTGRES: 'postgres'
};

class Model {
  constructor() {
    this.dbMap = {};
    this.initd = false;
  }

  push(v) {
    if (this.length === 0) {
      this.dbMap[DEFAULT_NAME] = v;
    }

    this.dbMap[v.name] = v;
  }

  get length() {
    return Object.keys(this.dbMap).length;
  }

  get(name) {
    return this.dbMap[name || DEFAULT_NAME];
  }

  init() {
    if (this.length > 0 && !this.initd) {
      this.initd = true;
      Object.assign(this, this.get().model);
    }
  }

}

class LodeORM {
  constructor(opt) {
    this.name = 'orm';
    this.isLode = true;
    this.opt = opt;
    this.connections = [];
    this.orm = null;
    this.model = new Model();
  }

  install(lode) {
    var _this = this;

    return _asyncToGenerator(function* () {
      // 单例模式
      if (lode.context.hasOwnProperty(CONTEXT_ORM) && lode.context.hasOwnProperty(CONTEXT_SEQUELIZE)) {
        return;
      }

      _this.opt = { ...(lode.$config.orm || {}),
        ..._this.opt
      };

      if (_this.opt && _this.opt.client) {
        if (Array.isArray(_this.opt.client)) {
          _this.opt.client.forEach(item => {
            _this.createDB(item);
          });
        } else if (typeof _this.opt.client === 'object') {
          _this.createDB(_this.opt.client);
        }
      }

      Object.defineProperties(lode.context, {
        [CONTEXT_ORM]: {
          value: _this,
          writable: false
        },
        'orm': {
          value: _this,
          writable: false
        },
        [CONTEXT_MODEL]: {
          value: _this.model,
          writable: false
        },
        'model': {
          value: _this.model,
          writable: false
        }
      });
    })();
  }

  loadModel(name, sequelize, opt) {
    const modelMap = {};
    (0, _require.default)({
      path: opt && opt.path ? opt.path : `${cwd}/src/model`,
      filter: '/**/*.js',
      onAfter: (fn, file) => {
        if (typeof fn === 'object') {
          fn = fn.default;
        }

        const model = fn(sequelize, _sequelize.default.DataTypes);
        modelMap[model.name] = model;
      }
    });
    this.model.push({
      name: name,
      model: modelMap
    });
    this.model.init();
  }

  loadSql(sequelize, opt) {
    return (0, _sql.default)(sequelize, opt);
  }

  createDB(client) {
    const name = client.name || DEFAULT_NAME; // if (this.connectionMap[name]) {
    //   throw new Error(`Duplicate name: '${name}'`);
    // }

    const type = client.uri ? client.uri.match(/([^\:]*)\:\/\//)[1] : client.type;
    if (!type) throw new Error('type is undefined');
    let sequelize = null;

    if (client.uri) {
      sequelize = new _sequelize.default(client.uri, {
        operatorsAliases
      });
    } else {
      sequelize = new _sequelize.default(client.database, client.username, client.password, {
        host: client.host,
        dialect: client.type,
        operatorsAliases
      });
    }

    sequelize.authenticate().then(() => {
      console.log(client.name || 'default', 'Connection has been established successfully.');
    }).catch(err => {
      console.error(client.name || 'default', 'Unable to connect to the database:', err);
    });
    this.loadModel(name, sequelize, client.modelPath);
    this.connections.push({
      name: name,
      client: sequelize,
      Op: _sequelize.default.Op,
      model: this.model.get(name),
      ...this.loadSql(sequelize, client.sqlConfig)
    });
  }

  get connectionMap() {
    this.connections.reduce((s, v, i) => {
      if (i === 0) s[DEFAULT_NAME] = v;
      s[v.name] = v;
      return s;
    }, {});
  }

  get(name) {
    this.connectionMap[name || DEFAULT_NAME];
  }

}

function _default(...arg) {
  return new LodeORM(...arg);
}