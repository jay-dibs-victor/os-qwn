import UserModel from '../models/User.model';
import CoinTransaction from '../models/CoinTransaction.model';
import RewardTask from '../models/RewardTask.model';
import { CurrencyService } from './currency_service';
import { getIO } from '../App';

export class GamificationService {
  static get COIN_EXCHANGE_RATE() { return Number(process.env.COIN_EXCHANGE_RATE) || 2; }

  /**
   * Core logic to add coins to a user
   */
  static async addCoins(userId: string, amount: number, type: any, reason: string, metadata?: any) {
    const user = await UserModel.findOne({ $or: [{ id: userId }, { _id: userId }] });
    if (!user) throw new Error('User not found');

    const amountNum = Number(amount);
    user.taxi_coins = (user.taxi_coins || 0) + amountNum;
    await user.save();

    await CoinTransaction.create({
      userId: user.id || user._id,
      amount: amountNum,
      type,
      reason,
      metadata
    });

    try {
      const io = getIO();
      if (io) {
        io.to(`user-${user.id || user._id}`).emit('walletUpdated', {
          action: 'COIN_CREDIT',
          amount: amountNum,
          taxi_coins: user.taxi_coins,
          balance: user.balance,
          reason
        });
      }
    } catch (e) {
      console.error('[GamificationService] Socket emission failed:', e);
    }

    return user.taxi_coins;
  }

  /**
   * Exchange Naira from wallet for TaxiCoins
   */
  static async exchangeNairaToCoins(userId: string, nairaAmount: number) {
    const user = await UserModel.findOne({ $or: [{ id: userId }, { _id: userId }] });
    if (!user) throw new Error('User not found');

    const currentBalance = parseFloat(user.balance || '0');
    if (currentBalance < nairaAmount) throw new Error('Insufficient wallet balance');

    // Deduct Naira
    user.balance = (currentBalance - nairaAmount).toFixed(2);
    
    // Add Coins (e.g. 500 Naira * 2 = 1000 Coins)
    const coinsToAdd = nairaAmount * this.COIN_EXCHANGE_RATE;
    user.taxi_coins = (user.taxi_coins || 0) + coinsToAdd;
    
    await user.save();

    await CoinTransaction.create({
      userId: user.id || user._id,
      amount: coinsToAdd,
      type: 'EXCHANGE',
      reason: `Exchanged ₦${nairaAmount} for ${coinsToAdd} TaxiCoins`,
      metadata: { nairaAmount }
    });

    try {
      const io = getIO();
      if (io) {
        io.to(`user-${user.id || user._id}`).emit('walletUpdated', {
          action: 'WALLET_EXCHANGE',
          exchanged_naira: nairaAmount,
          received_coins: coinsToAdd,
          taxi_coins: user.taxi_coins,
          balance: user.balance
        });
      }
    } catch (e) {
      console.error('[GamificationService] Socket emission failed:', e);
    }

    return { taxi_coins: user.taxi_coins, balance: user.balance };
  }

  /**
   * Handlers for sign up and referrals
   */
  static async awardSignupBonus(userId: string, role: string = 'user') {
    try {
      const amount = role === 'user' 
        ? Number(process.env.COIN_SIGNUP_BONUS_USER) || 300 
        : 0; // drivers wait for verification
      if (amount > 0) {
        await this.addCoins(userId, amount, 'REWARD', 'Welcome Bonus');
      }
    } catch(e) {
      console.error('Failed to award signup bonus:', e);
    }
  }

  static async awardDriverVerificationBonus(driverId: string) {
    try {
      const amount = Number(process.env.COIN_SIGNUP_BONUS_DRIVER) || 500;
      await this.addCoins(driverId, amount, 'REWARD', 'Driver Verification Bonus');
    } catch(e) {
      console.error('Failed to award driver verification bonus:', e);
    }
  }

  static async handleReferralMilestone(referrerId: string, type: 'USER' | 'DRIVER') {
    try {
      const user = await UserModel.findOne({ $or: [{ id: referrerId }, { _id: referrerId }, { referral_code: referrerId }] });
      if (!user) return;

      if (type === 'USER') {
        user.referred_users_count = (user.referred_users_count || 0) + 1;
        if (user.referred_users_count % 5 === 0) {
          const reward = Number(process.env.COIN_REFERRAL_USER_MILESTONE) || 500;
          await user.save();
          await this.addCoins(user.id || user._id, reward, 'REWARD', 'Referral Milestone: 5 Users');
          return;
        }
      } else {
        user.referred_drivers_count = (user.referred_drivers_count || 0) + 1;
        if (user.referred_drivers_count % 5 === 0) {
          const reward = Number(process.env.COIN_REFERRAL_DRIVER_MILESTONE) || 700;
          await user.save();
          await this.addCoins(user.id || user._id, reward, 'REWARD', 'Referral Milestone: 5 Drivers');
          return;
        }
      }
      
      await user.save();
    } catch (e) {
      console.error('Failed to handle referral milestone:', e);
    }
  }

  /**
   * Get Gamification Stats for Dashboard
   */
  static async getStats(userId: string, lat?: number, lng?: number) {
    const user = await UserModel.findOne({ $or: [{ id: userId }, { _id: userId }] });
    if (!user) throw new Error('User not found');

    const history = await CoinTransaction.find({ userId: user.id || user._id })
      .sort({ created_at: -1 })
      .limit(10);

    const activeTasks = await RewardTask.find({ is_active: true });

    let local_wallet = null;
    if (lat && lng) {
      try {
        const currencyInfo = await CurrencyService.getLocalCurrencyInfo(lat, lng);
        const nairaBalance = parseFloat(user.balance || '0');
        local_wallet = {
          currency: currencyInfo.code,
          symbol: currencyInfo.symbol,
          balance: Number((nairaBalance * currencyInfo.rate).toFixed(2))
        };
      } catch (e) {
        console.error('[GamificationService] Local wallet conversion error:', e);
      }
    }

    return {
      taxi_coins: user.taxi_coins,
      streak_count: user.streak_count,
      completed_trips: user.completed_trips || 0,
      referred_users_count: user.referred_users_count || 0,
      referred_drivers_count: user.referred_drivers_count || 0,
      history,
      activeTasks,
      exchange_rate: this.COIN_EXCHANGE_RATE,
      local_wallet
    };
  }

  /**
   * Update Streak on daily basis
   */
  static async updateStreak(userId: string) {
    const user = await UserModel.findOne({ $or: [{ id: userId }, { _id: userId }] });
    if (!user) return;

    const now = new Date();
    const lastTrip = user.last_trip_date ? new Date(user.last_trip_date) : null;

    if (!lastTrip) {
      user.streak_count = 1;
    } else {
      const diffDays = Math.floor((now.getTime() - lastTrip.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        user.streak_count += 1;
        // Award streak coins
        const bonus = Number(process.env.COIN_STREAK_BONUS) || 50;
        await this.addCoins(userId, bonus, 'REWARD', `Streak Reward: Day ${user.streak_count}`);
      } else if (diffDays > 1) {
        user.streak_count = 1;
      }
    }

    user.last_trip_date = now;
    await user.save();
  }
}
