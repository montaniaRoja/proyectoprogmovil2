'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cliente extends Model {
    static associate(models) {
      // define association here
      Cliente.hasMany(models.Cuenta, { foreignKey: 'id_cliente' });
    }
  }

  Cliente.init({
    no_doc: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    usuario: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clave_secreta: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Cliente',
    tableName: 'tbl_clientes',
    timestamps: true
  });

  return Cliente;
};
