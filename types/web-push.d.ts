// Declaración de tipos para web-push (librería CommonJS sin default export)
declare module "web-push" {
  export interface PushSubscriptionKeys {
    p256dh: string;
    auth: string;
  }

  export interface PushSubscription {
    endpoint: string;
    keys: PushSubscriptionKeys;
  }

  export interface SendOptions {
    TTL?: number;
    encoding?: string;
    vapidDetails?: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
  }

  export interface SendResult {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }

  export interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string,
  ): void;

  export function sendNotification(
    subscription: PushSubscription,
    payload?: string,
    options?: SendOptions,
  ): Promise<SendResult>;

  export function generateVAPIDKeys(): VapidKeys;
}
