import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import User from '../models/User.model';
import config from './mongo_config';
import AutoincrementId from '../helpers/autoincrement_mongo';

passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
      profileFields: ['email', 'name'],
    },
    function(accessToken: any, refreshToken: any, profile: any, done: any) {
      const { email, first_name, last_name } = profile._json;

      (User as any).findOne({ email: email }, function(err: any, user: any) {
        if (err) {
          console.log(err); // handle errors!
        }
        if (!err && user !== null) {
          done(null, user);
        } else {
          user = new (User as any)({
            id: AutoincrementId(User).counter(),
            name: profile.displayName,
            email: email,
            firstname: first_name,
            lastname: last_name,
            created: Date.now(),
          });
          user.save(function(err: any, user: any) {
            if (err) {
              console.log(err); // handle errors!
            } else {
              console.log('saving user ...');
              console.log(JSON.stringify(user));
              done(null, user);
            }
          });
        }
      });
    },
  ),
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: config.twitter.consumerKey,
      consumerSecret: config.twitter.consumerSecret,
      callbackURL: config.twitter.callbackURL,
    },
    function(accessToken: any, refreshToken: any, profile: any, done: any) {
      (User as any).findOne({ oauthID: profile.id }, function(err: any, user: any) {
        if (err) {
          console.log(err); // handle errors!
        }
        if (!err && user !== null) {
          done(null, user);
        } else {
          user = new (User as any)({
            oauthID: profile.id,
            username: profile.displayName,
            created: Date.now(),
          });
          user.save(function(err: any) {
            if (err) {
              console.log(err); // handle errors!
            } else {
              console.log('saving user ...');
              done(null, user);
            }
          });
        }
      });
    },
  ),
);

passport.use(
  new (GoogleStrategy as any)(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
      passReqToCallback: true,
    },
    function(request: any, accessToken: any, refreshToken: any, profile: any, done: any) {
      const email = profile.emails?.[0]?.value || profile._json?.email;
      const firstname = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
      const lastname = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
      const avatar = profile.photos?.[0]?.value || '';

      if (!email) return done(new Error('No email from Google profile'));

      (User as any).findOne({ email }, function(err: any, user: any) {
        if (err) return done(err);

        if (user) {
          // Existing user — ensure verified and update avatar
          user.isVerified = true;
          user.avatar = user.avatar || avatar;
          user.oauthID = user.oauthID || profile.id;
          return user.save((saveErr: any) => done(saveErr, user));
        }

        // New user via Google — auto-verified
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        const newUser = new (User as any)({
          id: AutoincrementId(User).counter(),
          oauthID: profile.id,
          firstname,
          lastname,
          username,
          email,
          avatar,
          phone_number: '',
          password: '',
          is_admin: false,
          isVerified: true,
          roles: 'user',
          user_type: 'Individual',
          referral_code: (firstname.substring(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase(),
        });
        newUser.save(function(saveErr: any, savedUser: any) {
          if (saveErr) return done(saveErr);
          done(null, savedUser);
        });
      });
    },
  ),
);

passport.use(
  new InstagramStrategy(
    {
      clientID: config.instagram.clientID,
      clientSecret: config.instagram.clientSecret,
      callbackURL: config.instagram.callbackURL,
    },
    function(accessToken: any, refreshToken: any, profile: any, done: any) {
      (User as any).findOne({ oauthID: profile.id }, function(err: any, user: any) {
        if (err) {
          console.log(err); // handle errors!
        }
        if (!err && user !== null) {
          done(null, user);
        } else {
          user = new (User as any)({
            oauthID: profile.id,
            name: profile.displayName,
            created: Date.now(),
          });
          user.save(function(err: any) {
            if (err) {
              console.log(err); // handle errors!
            } else {
              console.log('saving user ...');
              done(null, user);
            }
          });
        }
      });
    },
  ),
);

export default passport;
