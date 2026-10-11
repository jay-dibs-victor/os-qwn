import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../shared/postgres_config';
import Airplane from './Airplane.model';
import Airport from './Airport.model';

export class Flight extends Model {
  public id!: number;
  public flight_number!: string;
  public airplane_id!: number;
  public departure_airport_id!: string;
  public arrival_airport_id!: string;
  public departure_time!: Date;
  public arrival_time!: Date;
  public price!: number;
  public boarding_gate!: string;
  public total_seats!: number;
  public source!: string;
  public raw_data!: any;
}

Flight.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    flight_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    airplane_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Optional for external flights
      references: {
        model: 'airplanes',
        key: 'id',
      },
    },
    departure_airport_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    arrival_airport_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    departure_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    arrival_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    boarding_gate: {
      type: DataTypes.STRING,
    },
    total_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: 'local',
    },
    raw_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'flights',
    timestamps: true,
  }
);

Flight.belongsTo(Airplane, { foreignKey: 'airplane_id', as: 'airplane' });
// We use 'code' for airports in the original project, but 'id' is safer. 
// I'll stick to codes for now as it's easier for flight search UI.

export default Flight;
