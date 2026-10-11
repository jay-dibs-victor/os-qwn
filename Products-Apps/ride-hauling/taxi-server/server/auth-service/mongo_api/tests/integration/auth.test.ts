import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import { MongoAppDemo } from '../../App';
import UserModel from '../../models/User.model';

chai.use(chaiHttp);
const { expect } = chai;

describe('Integration: Authentication Flow', () => {
    let server: any;

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.DATABASE_TEST_URL || 'mongodb://localhost:27017/taxi_test_db');
        }
        const app = new MongoAppDemo();
        server = app.express;
    });

    after(async () => {
        // Keep connection open for other test suites running in the same process
        // await mongoose.connection.db.dropDatabase();
        // await mongoose.disconnect();
    });

    beforeEach(async () => {
        await UserModel.deleteMany({});
    });

    describe('POST /api/v1/auth/signup', () => {
        it('should register a new user successfully', async () => {
            const res = await (chai as any).request(server)
                .post('/api/v1/auth/signup')
                .send({
                    firstname: 'John',
                    lastname: 'Doe',
                    email: 'john@doe.com',
                    password: 'password123',
                    phoneNumber: '08012345678',
                    username: 'johndoe',
                    user_type: 'Individual User'
                });

            expect(res).to.have.status(201);
            expect(res.body.message).to.equal('User created successfully. Please verify your email.');
            expect(res.body.data[0]).to.have.property('token');
        });

        it('should fail if email is already taken', async () => {
            const signupData = {
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@doe.com',
                password: 'password123',
                phoneNumber: '08012345678',
                username: 'johndoe',
                user_type: 'Individual User'
            };
            await (chai as any).request(server).post('/api/v1/auth/signup').send(signupData);
            
            const res = await (chai as any).request(server).post('/api/v1/auth/signup').send(signupData);
            expect(res).to.have.status(409);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            // First signup
            await (chai as any).request(server)
                .post('/api/v1/auth/signup')
                .send({
                    firstname: 'John',
                    lastname: 'Doe',
                    email: 'john@doe.com',
                    password: 'password123',
                    phoneNumber: '08012345678',
                    username: 'johndoe',
                    user_type: 'Individual User'
                });

            await UserModel.updateOne({ email: 'john@doe.com' }, { isVerified: true });

            const res = await (chai as any).request(server)
                .post('/api/v1/auth/login')
                .send({
                    email: 'john@doe.com',
                    password: 'password123'
                });

            expect(res).to.have.status(200);
            expect(res.body.data[0]).to.have.property('token');
        });

        it('should fail with incorrect password', async () => {
             // First signup
             await (chai as any).request(server)
             .post('/api/v1/auth/signup')
             .send({
                 firstname: 'John',
                 lastname: 'Doe',
                 email: 'john@doe.com',
                 password: 'password123',
                 phoneNumber: '08012345678',
                 username: 'johndoe',
                 user_type: 'Individual User'
             });

            await UserModel.updateOne({ email: 'john@doe.com' }, { isVerified: true });

            const res = await (chai as any).request(server)
                .post('/api/v1/auth/login')
                .send({
                    email: 'john@doe.com',
                    password: 'wrongpassword'
                });

            expect(res).to.have.status(422);
            expect(res.body.error).to.exist;
        });
    });
});
