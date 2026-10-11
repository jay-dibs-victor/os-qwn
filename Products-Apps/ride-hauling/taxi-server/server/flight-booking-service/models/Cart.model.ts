import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../shared/postgres_config';

export class Cart extends Model {
  public id!: number;
  public user_id!: string;
  public items!: any; // JSON array of flight offers
  public total_amount!: number;
}

Cart.init(
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
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    total_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'flight_carts',
    timestamps: true,
  }
);

export default Cart;
