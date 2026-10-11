import Q from 'q';
import UniversalMailService from './UniversalMailService';

/**
 * MailMan - Legacy wrapper around the new UniversalMailService
 * Maintains backward compatibility with existing method signatures.
 */
const MailMan = {
  // Maintaining these for external legacy code that might check them
  _template: null as any,
  _transport: null as any,

  /**
   * Legacy init method - No longer strictly needed but kept for compatibility
   */
  init: function(config: { emailTplsDir: string }): Q.Promise<void> {
    const d = Q.defer<void>();
    // UniversalMailService initializes itself via .env
    d.resolve();
    return d.promise;
  },

  /**
   * Send a manual HTML/Text email
   */
  send: function(from: string, to: string, subject: string, text: string, html?: string): Q.Promise<any> {
    const d = Q.defer<any>();
    
    UniversalMailService.send({
      from,
      to,
      subject,
      text,
      html
    })
    .then(res => d.resolve(res))
    .catch(err => d.reject(err));

    return d.promise;
  },

  /**
   * Send an email using a Handlebars template
   */
  sendMail: function(from: string, to: string, subject: string, tplName: string, locals: any): Q.Promise<any> {
    const d = Q.defer<any>();
    
    UniversalMailService.send({
      from,
      to,
      subject,
      template: tplName,
      locals
    })
    .then(res => d.resolve(res))
    .catch(err => d.reject(err));

    return d.promise;
  },
};

export default MailMan;
