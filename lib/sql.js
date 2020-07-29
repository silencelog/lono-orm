import sk2 from 'sk2'

export default (sequelize, config) => {
  function query (text, values, options) {
    options = Object.assign({
      replacements: values
    }, options)

    if (/select /i.test(text) && !options.type) {
      options.type = sequelize.QueryTypes.SELECT;
    }

    return sequelize.query(text, options)
  }

  function queryOne(text, values, options) {
    return query(text, values, options).then(rows => {
      return rows && rows[0];
    })
  }

  return {
    sql: sk2(sequelize, config),
    query: query,
    queryOne: queryOne
  }
}
