import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../shared/postgres_config';

export class City extends Model {
  public id!: number;
  public name!: string;
}

City.init(
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
  },
  {
    sequelize,
    tableName: 'cities',
    timestamps: true,
  }
);

export default City;
