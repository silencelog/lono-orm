import ObjectID from './ObjectID'

/**
 * datatype扩展 OBJECTID
 **/
export default function sequelizeAdditions (Sequelize) {

  const DataTypes = Sequelize.DataTypes
  /*
   * 创建新类型
   */
  class OBJECTID extends DataTypes.ABSTRACT {
    constructor () {
      super()
    }
    toSql () {
      return 'VARCHAR(24) BINARY'
    }
    // 可选，验证器函数
    validate (value, options) {
      return (typeof value === 'string') && (value.length === 24)
    }
    // 可选, 检查器
    _sanitize(value) {
      if (!value || value.length < 24) {
        value = ObjectID().toString()
      }
      return value + ''
    }
    // 可选，在发送到数据库前对值字符串化
    _stringify(value) {
      return value.toString()
    }
    // 可选，从数据库获取值后进行解析
    static parse(value) {
      return Object.prototype.toString.call(value)
    }
    // 设置初始值
    static defaultValue () {
      return ObjectID().toString()
    }
  }

  DataTypes.OBJECTID = OBJECTID

  // 必须，设定键
  DataTypes.OBJECTID.prototype.key = DataTypes.OBJECTID.key = 'OBJECTID'

  // 可选，禁用在字符串化后转义。不建议。
  // Warning: disables Sequelize protection against SQL injections
  // DataTypes.OBJECTID.escape = false

  // For convenience
  // `classToInvokable` allows you to use the datatype without `new`
  Sequelize.OBJECTID = Sequelize.Utils.classToInvokable(DataTypes.OBJECTID)
}
