declare module 'midtrans-client' {
  export interface CoreApiOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  export interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  export interface TransactionResponse {
    token: string;
    redirect_url: string;
  }

  export interface TransactionStatus {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    merchant_id: string;
    gross_amount: string;
    currency: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    fraud_status: string;
    va_numbers?: Array<{
      bank: string;
      va_number: string;
    }>;
    bca_va_number?: string;
    pdf_url?: string;
    finish_redirect_url?: string;
  }

  export class CoreApi {
    constructor(options: CoreApiOptions);
    transaction: {
      status(orderId: string): Promise<TransactionStatus>;
      statusB2b(orderId: string): Promise<TransactionStatus>;
      approve(orderId: string): Promise<any>;
      deny(orderId: string): Promise<any>;
      cancel(orderId: string): Promise<any>;
      expire(orderId: string): Promise<any>;
      refund(orderId: string, parameters?: any): Promise<any>;
      refundDirect(orderId: string, parameters?: any): Promise<any>;
    };
    charge(parameters: any): Promise<any>;
    capture(parameters: any): Promise<any>;
    cardRegister(parameters: any): Promise<any>;
    cardToken(parameters: any): Promise<any>;
    cardPointInquiry(tokenId: string): Promise<any>;
  }

  export class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameter: any): Promise<TransactionResponse>;
    createTransactionToken(parameter: any): Promise<string>;
    createTransactionRedirectUrl(parameter: any): Promise<string>;
  }

  export const createClient: {
    CoreApi: typeof CoreApi;
    Snap: typeof Snap;
  };

  export class MidtransError extends Error {
    httpStatusCode?: number;
    ApiResponse?: any;
    rawHttpClientData?: any;
  }
}
