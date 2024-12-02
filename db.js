const mysql = require('mysql2/promise');
class Database {
  constructor() {
      if (Database.instance) {
          return Database.instance;
        }
      this.pool = mysql.createPool({
          uri: 'mysql://root:BMRDuvXMizkAQEayQRFqlJCBINrjvCgW@autorack.proxy.rlwy.net:37284/railway',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        });

      Database.instance = this;
    }
    getPool() {
      return this.pool;
    }
}module.exports = new Database();
