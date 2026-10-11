import { expect } from 'chai';
import { RideService } from '../../../../../ride-service/mongo_api/services/ride_service';

describe('Service: RideService Units', () => {
    describe('calculateFare', () => {
        it('should calculate base fare correctly for short distance', () => {
            // base (500) + (1km * 180) + (5min * 25) = 500 + 180 + 125 = 805
            const fare = RideService.calculateFare(1000, 300); 
            expect(fare).to.equal(805);
        });

        it('should apply surge multiplier correctly', () => {
            const normalFare = RideService.calculateFare(1000, 300, 1.0);
            const surgedFare = RideService.calculateFare(1000, 300, 2.0);
            expect(surgedFare).to.equal(normalFare * 2);
        });
    });

    describe('calculateCoinFare', () => {
        it('should convert Naira to Coins at 1:2 ratio', () => {
            expect(RideService.calculateCoinFare(500)).to.equal(1000);
        });
    });
});
