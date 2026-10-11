export class NubanUtils {
  private static readonly WEIGHTS = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3];

  /**
   * Generates a 10-digit NUBAN account number
   * @param bankCode 3-digit bank code
   * @param serial 9-digit serial number
   */
  static generate(bankCode: string, serial: string): string {
    if (bankCode.length !== 3) throw new Error('Bank code must be 3 digits');
    if (serial.length !== 9) throw new Error('Serial number must be 9 digits');

    const combined = bankCode + serial;
    let sum = 0;

    for (let i = 0; i < combined.length; i++) {
      sum += parseInt(combined[i]) * this.WEIGHTS[i];
    }

    const modulo = sum % 10;
    let checkDigit = 10 - modulo;
    if (checkDigit === 10) checkDigit = 0;

    return serial + checkDigit.toString();
  }

  /**
   * Validates a 10-digit NUBAN for a given bank code
   */
  static validate(bankCode: string, accountNo: string): boolean {
    if (bankCode.length !== 3 || accountNo.length !== 10) return false;
    const serial = accountNo.substring(0, 9);
    const expected = this.generate(bankCode, serial);
    return expected === accountNo;
  }
}
