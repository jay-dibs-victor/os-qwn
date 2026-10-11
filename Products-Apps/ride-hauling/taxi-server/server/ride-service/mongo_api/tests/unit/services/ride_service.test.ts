import { expect } from 'chai';
import { RideService } from '../../../services/ride_service';

describe('Service: RideService Units', () => {
    describe('calculateFare', () => {
        it('should calculate base fare correctly for short distance', () => {
            const fare = RideService.calculateFare(1000, 300); 
            expect(fare).to.equal(1);
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
