import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import TokenVerification from '../../../middlewares/token_validator';

describe('Middleware: TokenVerification', () => {
    let req: any;
    let res: any;
    let next: sinon.SinonSpy;
    const secret = process.env.SECRET || 'default_secret';

    beforeEach(() => {
        req = {
            header: sinon.stub(),
        };
        res = {
            status: sinon.stub().returns({
                json: sinon.stub()
            }),
        };
        next = sinon.spy();
    });

    describe('userAuthentication', () => {
        it('should return 401 if no token is provided', () => {
            req.header.returns(null);
            TokenVerification.userAuthentication(req, res, next);
            expect(res.status.calledWith(401)).to.be.true;
        });

        it('should move to next() if valid token is provided', () => {
            const token = jwt.sign({ id: 'user1' }, secret);
            req.header.withArgs('Authorization').returns(`Bearer ${token}`);
            
            TokenVerification.userAuthentication(req, res, next);
            expect(next.calledOnce).to.be.true;
            expect(req.user.id).to.equal('user1');
        });

        it('should return 403 if token is invalid', () => {
            req.header.withArgs('Authorization').returns('Bearer invalid-token');
            TokenVerification.userAuthentication(req, res, next);
            expect(res.status.calledWith(403)).to.be.true;
        });
    });

    describe('adminAuthentication', () => {
        it('should return 403 if user is not an admin', () => {
            const token = jwt.sign({ id: 'user1', isAdmin: false }, secret);
            req.header.withArgs('Authorization').returns(`Bearer ${token}`);
            
            TokenVerification.adminAuthentication(req, res, next);
            expect(res.status.calledWith(403)).to.be.true;
        });

        it('should move to next() if user is an admin', () => {
            const token = jwt.sign({ id: 'admin1', isAdmin: true }, secret);
            req.header.withArgs('Authorization').returns(`Bearer ${token}`);
            
            TokenVerification.adminAuthentication(req, res, next);
            expect(next.calledOnce).to.be.true;
        });
    });
});
