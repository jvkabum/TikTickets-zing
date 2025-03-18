import { QueryInterface, DataTypes } from "sequelize"

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE "Messages" 
      ALTER COLUMN "protocolNumber" TYPE VARCHAR(255),
      ALTER COLUMN "protocolNumber" SET DEFAULT ''
    `)
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE "Messages" 
      ALTER COLUMN "protocolNumber" TYPE INTEGER USING ("protocolNumber"::integer),
      ALTER COLUMN "protocolNumber" SET DEFAULT 0
    `)
  }
}
