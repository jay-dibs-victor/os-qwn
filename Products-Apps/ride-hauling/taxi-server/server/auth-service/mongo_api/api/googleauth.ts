import { google } from 'googleapis';
import config from '../config/mongo_config';

class GoogleApi {
  private oAuth2Client: any;

  constructor() {
    const { clientID, clientSecret, callbackURL } = config.google;
    this.oAuth2Client = new google.auth.OAuth2(clientID, clientSecret, callbackURL);
  }

  generateUrl(scopes: string[]): string {
    const url = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.join(' '),
    });
    return url;
  }

  async getUserInfo(code: string): Promise<any> {
    const credentials = await this.oAuth2Client.getToken(code);
    this.oAuth2Client.setCredentials(credentials.tokens);
    // Note: google.plus is deprecated, but keeping it for now as per original code
    const plus = (google as any).plus({
      version: 'v1',
      auth: this.oAuth2Client,
    });
    const data = await plus.people.get({ userId: 'me' });
    return data;
  }
}

export default new GoogleApi();
