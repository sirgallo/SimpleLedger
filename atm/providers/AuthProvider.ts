import { randomUUID } from 'crypto';

import { JwtProvider, TIMESPAN, REFRESHTIMESPAN } from '@core/auth/providers/JwtProvider';
import { cryptoOptions } from '@core/crypto/CryptoOptions';
import { EncryptProvider } from '@core/auth/providers/EncryptProvider';
import { LogProvider } from '@core/providers/LogProvider';

import { ATMMongooseProvider } from '@db/providers/ATMMongooseProvider';
import { IToken, IUser } from '@db/models/User';
import { jwtSecret, refreshSecret } from '@core/auth/configs/Secret';
import { AuthEndpoints } from '@atm/models/Endpoints';

const NAME = 'Auth Provider'

export const withinExpiration = (issueDate: Date, expiresIn: string): boolean => (issueDate.getTime() + parseInt(expiresIn)) > new Date().getTime();

export class AuthProvider implements AuthEndpoints {
  name = NAME;

  private log: LogProvider = new LogProvider(NAME);
  private crypt: EncryptProvider = new EncryptProvider();
  private jwt: JwtProvider = new JwtProvider(jwtSecret);

  constructor(private atmDb: ATMMongooseProvider) {}

  async authenticate(user: Partial<IUser>): Promise<string | Error> {
    try {
      const currUserEntry: IUser = await this.atmDb.MUser.findOne({ email: user.email });
      this.log.info(`Got User with Id: ${currUserEntry.userId}`);

      if (await this.crypt.compare(user.password, currUserEntry.password)) {
        const jwToken = await this.jwt.sign(currUserEntry.userId);
        const refreshToken = await this.jwt.sign(currUserEntry.userId, refreshSecret, REFRESHTIMESPAN);

        const tokenEntry: IToken = await this.atmDb.MToken.findOne({ userId: currUserEntry.userId });
    
        if (! tokenEntry) {
          const newAccessToken = new this.atmDb.MToken({
            userId: currUserEntry.userId,
            token: jwToken,
            refreshToken: refreshToken,
            issueDate: new Date().toISOString(),
            expiresIn: TIMESPAN
          });

          const resp = await this.atmDb.MToken.create(newAccessToken);
          this.log.success(`New Token added with User Id: ${resp.userId}`);

          return jwToken;
        } else if (tokenEntry) {
          const jwtEntry = await this.jwt.verified(tokenEntry.token);
          const refreshEntry = await this.jwt.verified(tokenEntry.refreshToken, refreshSecret);
          
          const isWithinExpiration = withinExpiration(tokenEntry.issueDate, tokenEntry.expiresIn);
          this.log.info(`JWT within expiration: ${isWithinExpiration}`);

          if (jwtEntry.verified && isWithinExpiration) {
            this.log.info('JWT already exists that is valid');

            if (! refreshEntry.verified || ! withinExpiration(tokenEntry.refreshIssueDate, tokenEntry.refreshExpiresIn)) {
              await this.atmDb.MToken.findOneAndUpdate(
                { userId: currUserEntry.userId }, 
                {
                  $set: { 
                    refreshToken: refreshToken,
                    refreshIssueDate: new Date().toISOString()
                  }
                }
              );

              this.log.info('Refresh Token Successfully updated');
            }

            return jwtEntry.token;
          } else {
            await this.atmDb.MToken.findOneAndUpdate(
              { userId: currUserEntry.userId }, 
              { 
                $set: {
                  token: jwToken,
                  refreshToken: refreshToken,
                  issueDate: new Date().toISOString(),
                  refreshIssueDate: new Date().toISOString()
                }
              }
            );
          }

          this.log.success(`Token updated with User Id: ${currUserEntry.userId}`);
        } else { return new Error('Unknown error trying to find MToken entry.'); }
      } else { return new Error('Passwords do not match.'); }
    } catch (err) {
      this.log.error(err);
      throw err;
    }
  }

  async register(newUser: Partial<IUser>): Promise<string> {
    try {
      const hashPassword = await this.crypt.encrypt(newUser.password);
      this.log.info('Hashed User Password');
      
      newUser.password = hashPassword;
      newUser.id = randomUUID(cryptoOptions);

      const newUserEntry = new this.atmDb.MUser({ ...newUser });
      const newUserResp = await this.atmDb.MUser.create(newUserEntry);
      this.log.success(`New User added with User Id: ${newUserResp.id}`);

      const jwToken = await this.jwt.sign(newUserEntry.userId);
      const refreshToken = await this.jwt.sign(newUserEntry.userId, refreshSecret, REFRESHTIMESPAN);

      const newAccessToken = new this.atmDb.MToken({
        userId: newUserResp.userId,
        token: jwToken,
        refreshToken: refreshToken,
        issueDate: new Date().toISOString(),
        refreshIssueDate: new Date().toISOString(),
        expiresIn: TIMESPAN,
        refreshExpiresIn: REFRESHTIMESPAN
      });

      const resp = await this.atmDb.MToken.create(newAccessToken);
      this.log.success(`New Token added with User Id: ${resp.userId}`);

      return jwToken;
    } catch (err) {
      this.log.error(err);
      throw err;
    }
  }

  async checkToken(userId: string, token: string) {
    const tokenEntry: IToken = await this.atmDb.MToken.findOne({ userId });

    if (! tokenEntry || tokenEntry.token !== token) return false;
    else {
      const jwtEntry = await this.jwt.verified(tokenEntry.token);
      const isWithinExpiration = withinExpiration(tokenEntry.issueDate, tokenEntry.expiresIn);

      return (jwtEntry.verified && isWithinExpiration);
    }
  }
}