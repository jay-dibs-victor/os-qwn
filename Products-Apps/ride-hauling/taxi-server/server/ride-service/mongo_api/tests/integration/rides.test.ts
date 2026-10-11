import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { MongoAppDemo } from '../../App';
import UserModel from '../../models/User.model';
import RideModel from '../../models/Ride.model';
import { RedisService } from '../../services/redis_service';
import axios from 'axios';

chai.use(chaiHttp);
const { expect } = chai;

describe('Integration: Ride Lifecycle', () => {
    let server: any;
    let passengerToken: string;
    let passengerId: string;
    const secret = process.env.SECRET || 'default_secret';

    before(async function () {
        this.timeout(10000);
        const url = process.env.DATABASE_TEST_URL || 'mongodb://localhost:27017/taxi_test_db';
        const waitForConnection = (ms: number) =>
            new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    cleanup();
                    reject(new Error('timeout'));
                }, ms);
                const onConnected = () => {
                    cleanup();
                    resolve();
                };
                const onError = (err: any) => {
                    cleanup();
                    reject(err);
                };
                const cleanup = () => {
                    clearTimeout(timeout);
                    mongoose.connection.off('connected', onConnected);
                    mongoose.connection.off('error', onError);
                };
                mongoose.connection.once('connected', onConnected);
                mongoose.connection.once('error', onError);
            });

        try {
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(url, {
                    serverSelectionTimeoutMS: 2000,
                    connectTimeoutMS: 2000
                });
            } else if (mongoose.connection.readyState === 2) {
                await waitForConnection(2000);
            }
        } catch {
            this.skip();
            return;
        }

        if (mongoose.connection.readyState !== 1) {
            this.skip();
            return;
        }
        const app = new MongoAppDemo();
        server = app.express;
        // Mock socket.io for tests
        server.io = {
            to: sinon.stub().returns({ emit: sinon.stub() }),
            emit: sinon.stub()
        };
    });

    after(async () => {
        // Keep connection open for other test suites running in the same process
        // await mongoose.connection.db.dropDatabase();
        // await mongoose.disconnect();
    });

    beforeEach(async function () {
        this.timeout(10000);
        await UserModel.deleteMany({});
        await RideModel.deleteMany({});
        
        const user = await UserModel.create({
            id: 99991,
            firstname: 'Passenger',
            email: 'pass@test.com',
            password: 'password',
            completed_trips: 10,
            isVerified: true
        });
        passengerId = user._id.toString();
        passengerToken = jwt.sign({ id: user.id, isAdmin: false }, secret);

        sinon.stub(RedisService, 'addActiveSearch').resolves();
        sinon.stub(axios, 'get').resolves({ data: { code: 'Ok', routes: [{ distance: 5000, duration: 600 }] } });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('POST /api/v1/rides/request', () => {
        it('should create a new ride request and return 201', async () => {
            const res = await (chai as any).request(server)
                .post('/api/v1/rides/request')
                .set('Authorization', `Bearer ${passengerToken}`)
                .send({
                    passenger_id: passengerId,
                    pickup_lat: 6.45,
                    pickup_lng: 3.39,
                    dest_lat: 6.52,
                    dest_lng: 3.37,
                    payment_method: 'CASH'
                });

            if (res.status !== 201) console.log('Ride Request Failed:', res.body);
            expect(res).to.have.status(201);
            expect(res.body.data.ride.status).to.equal('SEARCHING');
        });
    });

    describe('POST /api/v1/rides/accept', () => {
        it('should allow a driver to accept a searching ride', async () => {
            // Setup a ride
            const ride = await RideModel.create({
                passenger_id: passengerId,
                status: 'SEARCHING',
                pickup_location: { type: 'Point', coordinates: [3.39, 6.45] },
                destination_location: { type: 'Point', coordinates: [3.37, 6.52] },
                fare: 2000
            });

            // Setup a driver
            const driver = await UserModel.create({
                id: 99992,
                firstname: 'Driver',
                email: 'driver@test.com',
                password: 'password',
                roles: 'Individual Driver',
                is_available: true
            });
            const driverToken = jwt.sign({ id: driver.id, isAdmin: false }, secret);

            const res = await (chai as any).request(server)
                .post('/api/v1/rides/accept')
                .set('Authorization', `Bearer ${driverToken}`)
                .send({
                    ride_id: ride._id,
                    driver_id: driver.id
                });

            if (res.status !== 200) console.log('Ride Accept Failed:', res.body);
            expect(res).to.have.status(200);
            expect(res.body.data.status).to.equal('ACCEPTED');
        });
    });
});
