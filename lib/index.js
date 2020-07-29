import Sequelize from 'sequelize'
import LodeRequire from '@lode/require'
import sql from './sql'
import additionsObjectid from './additions-objectid'
additionsObjectid(Sequelize)

const CONTEXT_ORM = Symbol('context#orm')
const CONTEXT_SEQUELIZE = Symbol('context#sequelize')
const CONTEXT_MODEL = Symbol('context#model')
const DEFAULT_NAME = 'default'
const cwd = process.cwd()
const Op = Sequelize.Op

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
}

const DB_TYPE = {
  MYSQL: 'mysql',
  MARIADB: 'mariadb',
  MSSQL: 'mssql',
  POSTGRES: 'postgres'
}

class Model {
  constructor () {
    this.dbMap = {}
    this.initd = false
  }
  push (v) {
    if (this.length === 0) {
      this.dbMap[DEFAULT_NAME] = v
    }
    this.dbMap[v.name] = v
  }
  get length () {
    return Object.keys(this.dbMap).length
  }
  get (name) {
    return this.dbMap[name || DEFAULT_NAME]
  }
  init () {
    if (this.length > 0 && !this.initd) {
      this.initd = true
      Object.assign(this, this.get().model)
    }
  }
}

class LodeORM {
  constructor (opt) {
    this.name = 'orm'
    this.isLode = true
    this.opt = opt
    this.connections = []
    this.orm = null
    this.model = new Model()
  }
  async install (lode) {
    // 单例模式
    if (lode.context.hasOwnProperty(CONTEXT_ORM) && lode.context.hasOwnProperty(CONTEXT_SEQUELIZE)) {
      return
    }
    this.opt = {
      ...(lode.$config.orm || {}),
      ...this.opt
    }
    if (this.opt && this.opt.client) {
      if (Array.isArray(this.opt.client)) {
        this.opt.client.forEach((item) => {
          this.createDB(item)
        })
      } else if (typeof this.opt.client === 'object') {
        this.createDB(this.opt.client)
      }
    }
    Object.defineProperties(lode.context, {
      [CONTEXT_ORM]: {
        value: this,
        writable: false
      },
      'orm': {
        value: this,
        writable: false
      },
      [CONTEXT_MODEL]: {
        value: this.model,
        writable: false
      },
      'model': {
        value: this.model,
        writable: false
      }
    })
  }
  loadModel (name, sequelize, opt) {
    const modelMap = {}
    LodeRequire({
      path: opt && opt.path ? opt.path : `${cwd}/src/model`,
      filter: '/**/*.js',
      onAfter: (fn, file) => {
        if (typeof fn === 'object') {
          fn = fn.default
        }
        const model = fn(sequelize, Sequelize.DataTypes)
        modelMap[model.name] = model
      }
    })
    this.model.push({
      name: name,
      model: modelMap
    })
    this.model.init()
  }
  loadSql (sequelize, opt) {
    return sql(sequelize, opt)
  }
  createDB (client) {
    const name = client.name || DEFAULT_NAME
    // if (this.connectionMap[name]) {
    //   throw new Error(`Duplicate name: '${name}'`);
    // }
    const type = client.uri ? client.uri.match(/([^\:]*)\:\/\//)[1] : client.type
    if (!type) throw new Error('type is undefined')
    let sequelize = null
    if (client.uri) {
      sequelize = new Sequelize(client.uri, {
        operatorsAliases
      })
    } else {
      sequelize = new Sequelize(client.database, client.username, client.password, {
        host: client.host,
        dialect: client.type,
        operatorsAliases
      })
    }
    sequelize.authenticate()
    .then(() => {
      console.log(name, 'Connection has been established successfully.')
    })
    .catch(err => {
      console.error(name, 'Unable to connect to the database:', err)
    })
    this.loadModel(name, sequelize, client.modelPath)
    this.connections.push({
      name: name,
      client: sequelize,
      Op: Sequelize.Op,
      model: this.model.get(name),
      ...this.loadSql(sequelize, client.sqlConfig)
    })
  }
  get connectionMap () {
    this.connections.reduce((s, v, i) => {
      if (i === 0) s[DEFAULT_NAME] = v
      s[v.name] = v
      return s
    }, {})
  }
  get (name) {
    this.connectionMap[name || DEFAULT_NAME]
  }
}

export default function (...arg) {
  return new LodeORM(...arg)
}
