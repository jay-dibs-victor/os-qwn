import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../shared/postgres_config';

export class Airplane extends Model {
  public id!: number;
  public model_number!: string;
  public capacity!: number;
}

Airplane.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    model_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'airplanes',
    timestamps: true,
  }
);

export default Airplane;
