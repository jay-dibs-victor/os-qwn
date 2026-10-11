import { expect } from 'chai';
import sinon from 'sinon';
import { GamificationService } from '../../../../../ride-service/mongo_api/services/gamification_service';

import UserModel from '../../../models/User.model';
import CoinTransaction from '../../../models/CoinTransaction.model';
import * as App from '../../../App';

describe('Service: GamificationService Units', () => {
    let userStub: any;
    let coinTxStub: any;
    let ioStub: any;

    beforeEach(() => {
        userStub = sinon.stub(UserModel, 'findOne');
        coinTxStub = sinon.stub(CoinTransaction, 'create');
        ioStub = sinon.stub(App, 'getIO').returns({
            to: sinon.stub().returns({
                emit: sinon.stub()
            })
        } as any);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('addCoins', () => {
        it('should correctly add coins to user and record transaction', async () => {
            const fakeUser = {
                id: 'u1',
                taxi_coins: 100,
                save: sinon.stub().resolves()
            };
            userStub.resolves(fakeUser);

            const balance = await GamificationService.addCoins('u1', 50, 'REWARD', 'Test');
            
            expect(fakeUser.taxi_coins).to.equal(150);
            expect(fakeUser.save.calledOnce).to.be.true;
            expect(coinTxStub.calledOnce).to.be.true;
            expect(balance).to.equal(150);
        });

        it('should throw error if user not found', async () => {
            userStub.resolves(null);
            try {
                await GamificationService.addCoins('nonexistent', 50, 'REWARD', 'Test');
                expect.fail('Should have thrown error');
            } catch (e: any) {
                expect(e.message).to.equal('User not found');
            }
        });
    });

    describe('exchangeNairaToCoins', () => {
        it('should deduct naira and add coins correctly', async () => {
            const fakeUser = {
                id: 'u1',
                balance: '500.00',
                taxi_coins: 0,
                save: sinon.stub().resolves()
            };
            userStub.resolves(fakeUser);

            const result = await GamificationService.exchangeNairaToCoins('u1', 100);
            
            expect(fakeUser.balance).to.equal('400.00');
            expect(fakeUser.taxi_coins).to.equal(200); // 100 * 2
            expect(result.taxi_coins).to.equal(200);
        });

        it('should throw error if insufficient balance', async () => {
            const fakeUser = { balance: '50.00' };
            userStub.resolves(fakeUser);
            try {
                await GamificationService.exchangeNairaToCoins('u1', 100);
                expect.fail('Should have thrown error');
            } catch (e: any) {
                expect(e.message).to.equal('Insufficient wallet balance');
            }
        });
    });
});
