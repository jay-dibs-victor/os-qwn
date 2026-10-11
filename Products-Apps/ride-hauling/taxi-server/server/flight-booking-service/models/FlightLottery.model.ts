import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../shared/postgres_config';

export enum LotteryPaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export class FlightLottery extends Model {
  public id!: number;
  public user_id!: string;
  public lottery_number!: string;
  public amount_paid!: number;
  public currency!: string;
  public payment_status!: LotteryPaymentStatus;
  public is_winner!: boolean;
  public prize_level!: string | null;
  public month!: string;
}

FlightLottery.init(
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
    lottery_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    amount_paid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'NGN',
    },
    payment_status: {
      type: DataTypes.ENUM(...Object.values(LotteryPaymentStatus)),
      defaultValue: LotteryPaymentStatus.PENDING,
    },
    is_winner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    prize_level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    month: {
      type: DataTypes.STRING, // e.g. "2026-04"
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'flight_lotteries',
    timestamps: true,
  }
);

export default FlightLottery;
