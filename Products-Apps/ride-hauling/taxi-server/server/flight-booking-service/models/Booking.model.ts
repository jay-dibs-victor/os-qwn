import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../shared/postgres_config';

export enum BookingStatus {
  BOOKED = 'booked',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  INITIATED = 'initiated'
}

export class Booking extends Model {
  public id!: number;
  public flight_id!: number;
  public user_id!: string; // Using string to match our MongoDB User ID shape if needed, or number if using Postgres users.
  public status!: BookingStatus;
  public no_of_seats!: number;
  public total_cost!: number;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    flight_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BookingStatus)),
      allowNull: false,
      defaultValue: BookingStatus.INITIATED,
    },
    no_of_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    total_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'bookings',
    timestamps: true,
  }
);

export default Booking;
