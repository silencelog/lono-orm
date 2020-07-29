"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sk = _interopRequireDefault(require("sk2"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (sequelize, config) => {
  function query(text, values, options) {
    options = Object.assign({
      replacements: values
    }, options);

    if (/select /i.test(text) && !options.type) {
      options.type = sequelize.QueryTypes.SELECT;
    }

    return sequelize.query(text, options);
  }

  function queryOne(text, values, options) {
    return query(text, values, options).then(rows => {
      return rows && rows[0];
    });
  }

  return {
    sql: (0, _sk.default)(sequelize, config),
    query: query,
    queryOne: queryOne
  };
};

exports.default = _default;