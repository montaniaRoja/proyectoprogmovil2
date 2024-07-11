'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cuenta extends Model {
    static associate(models) {
      // define association here
      Cuenta.belongsTo(models.Cliente, { foreignKey: 'id_cliente' });
      Cuenta.hasMany(models.Transaccion, { foreignKey: 'cuenta_id' });
    }
  }
  Cuenta.init({
    no_cuenta: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    moneda: {
      type: DataTypes.STRING,
      allowNull: false
    },
    saldo: {
      type: DataTypes.FLOAT,
      allowNull: true
  }
  }, {
    sequelize,
    modelName: 'Cuenta',
    tableName: 'tbl_cuentas',
    timestamps: true
  });
  return Cuenta;
};
