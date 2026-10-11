import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../shared/postgres_config';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export class FlightPayment extends Model {
  public id!: number;
  public user_id!: string;
  public amount!: number;
  public currency!: string;
  public gateway!: string;
  public gateway_reference!: string;
  public status!: PaymentStatus;
  public metadata!: any;
}

FlightPayment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    gateway: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gateway_reference: {
      type: DataTypes.STRING,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      defaultValue: PaymentStatus.PENDING,
    },
    metadata: {
      type: DataTypes.JSON,
    },
  },
  {
    sequelize,
    tableName: 'flight_payments',
    timestamps: true,
  }
);

export default FlightPayment;
