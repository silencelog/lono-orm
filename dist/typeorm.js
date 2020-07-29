"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _typeorm = _interopRequireDefault(require("typeorm"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const DB_TYPE = {
  MYSQL: 'mysql',
  MARIADB: 'mariadb',
  MSSQL: 'mssql',
  POSTGRES: 'postgres'
};

class LodeORM {
  constructor(opt) {
    this.name = 'orm';
    this.isLode = true;
    this.opt = opt;
    this.connections = [];
    this.orm = null;
  }

  install(lode) {
    var _this = this;

    return _asyncToGenerator(function* () {
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

      lode.context.orm = _this;
    })();
  }

  createDB(client) {
    const name = client.name || 'default';
    const type = client.uri ? client.uri.match(/([^\:]*)\:\/\//)[1] : client.type;
    if (!type) throw new Error('type is undefined');
    let sequelize = null;

    if (client.uri) {
      sequelize = new Sequelize(client.uri);
    } else {
      sequelize = new Sequelize(client.database, client.username, client.password, {
        host: client.host,
        dialect: client.type
      });
    }

    sequelize.authenticate().then(() => {
      console.log(client.name || 'default', 'Connection has been established successfully.');
    }).catch(err => {
      console.error(client.name || 'default', 'Unable to connect to the database:', err);
    });
    this.connections.push({
      name: type.name,
      client: sequelize
    });
  }

  get connectionMap() {
    this.connections.reduce((s, v, i) => {
      if (i === 0) s['default'] = v.client;
      s[v.name] = v.client;
      return s;
    }, {});
  }

  get(name) {
    this.connectionMap[name || 'default'];
  }

}

function _default(...arg) {
  return new LodeORM(...arg);
}