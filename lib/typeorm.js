// import typeorm from 'typeorm'

// const DB_TYPE = {
//   MYSQL: 'mysql',
//   MARIADB: 'mariadb',
//   MSSQL: 'mssql',
//   POSTGRES: 'postgres'
// }

// class LodeORM {
//   constructor(opt) {
//     this.name = 'orm'
//     this.isLode = true
//     this.opt = opt
//     this.connections = []
//     this.orm = null
//   }
//   async install (lode) {
//     this.opt = {
//       ...(lode.$config.orm || {}),
//       ...this.opt
//     }
//     if (this.opt && this.opt.client) {
//       if (Array.isArray(this.opt.client)) {
//         this.opt.client.forEach((item) => {
//           this.createDB(item)
//         })
//       } else if (typeof this.opt.client === 'object') {
//         this.createDB(this.opt.client)
//       }
//     }
//     lode.context.orm = this
//   }
//   createDB (client) {
//     const name = client.name || 'default'
//     const type = client.uri ? client.uri.match(/([^\:]*)\:\/\//)[1] : client.type
//     if (!type) throw new Error('type is undefined')
//     let sequelize = null
//     if (client.uri) {
//       sequelize = new Sequelize(client.uri)
//     } else {
//       sequelize = new Sequelize(client.database, client.username, client.password, {
//         host: client.host,
//         dialect: client.type
//       })
//     }
//     sequelize.authenticate()
//     .then(() => {
//       console.log(client.name || 'default', 'Connection has been established successfully.')
//     })
//     .catch(err => {
//       console.error(client.name || 'default', 'Unable to connect to the database:', err)
//     })
//     this.connections.push({
//       name: type.name,
//       client: sequelize
//     })
//   }
//   get connectionMap () {
//     this.connections.reduce((s, v, i) => {
//       if (i === 0) s['default'] = v.client
//       s[v.name] = v.client
//       return s
//     }, {})
//   }
//   get (name) {
//     this.connectionMap[name || 'default']
//   }
// }

// export default function (...arg) {
//   return new LodeORM(...arg)
// }
