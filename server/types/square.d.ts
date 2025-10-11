/**
 * Type declarations for Square SDK
 */

declare module 'square' {
  export interface SquareClientOptions {
    accessToken: string;
    environment: 'sandbox' | 'production';
    version?: string;
  }

  export interface SquareClient {
    checkout: {
      paymentLinks: {
        create(request: any): Promise<{ result: any }>;
      };
    };
    terminal: {
      checkouts: {
        create(request: any): Promise<{ result: any }>;
      };
    };
    payments: {
      create(request: any): Promise<{ result: any }>;
    };
    locations: {
      list(): Promise<{ result: any }>;
    };
  }

  export class SquareClient {
    constructor(options: SquareClientOptions);
  }

  export enum SquareEnvironment {
    Sandbox = 'sandbox',
    Production = 'production'
  }
}
