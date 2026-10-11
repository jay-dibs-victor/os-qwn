import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../shared/postgres_config';
import City from './City.model';

export class Airport extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public address!: string;
  public city_id!: number;
}

Airport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'airports',
    timestamps: true,
  }
);

Airport.belongsTo(City, { foreignKey: 'city_id', as: 'city' });
City.hasMany(Airport, { foreignKey: 'city_id', as: 'airports' });

export default Airport;
