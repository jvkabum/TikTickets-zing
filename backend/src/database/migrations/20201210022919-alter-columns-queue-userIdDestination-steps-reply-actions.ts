import { QueryInterface, DataTypes } from "sequelize";
import { Promise as SequelizePromise } from "sequelize";

interface TableInfo {
  [key: string]: {
    type: string;
    allowNull: boolean;
  };
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo = (await queryInterface.describeTable("StepsReplyActions")) as TableInfo;
    
    const actions: SequelizePromise<void>[] = [];
    
    if (tableInfo.queue) {
      actions.push(queryInterface.removeColumn("StepsReplyActions", "queue"));
    }
    
    if (!tableInfo.queueId) {
      actions.push(
        queryInterface.addColumn("StepsReplyActions", "queueId", {
          type: DataTypes.INTEGER,
          references: { model: "Queues", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "restrict",
          defaultValue: null,
          allowNull: true
        })
      );
    }

    return Promise.all(actions);
  },

  down: async (queryInterface: QueryInterface) => {
    const tableInfo = (await queryInterface.describeTable("StepsReplyActions")) as TableInfo;
    
    const actions: SequelizePromise<void>[] = [];
    
    if (tableInfo.queueId) {
      actions.push(queryInterface.removeColumn("StepsReplyActions", "queueId"));
    }
    
    if (!tableInfo.queue) {
      actions.push(
        queryInterface.addColumn("StepsReplyActions", "queue", {
          type: DataTypes.INTEGER,
          defaultValue: null,
          allowNull: true
        })
      );
    }

    return Promise.all(actions);
  }
};
