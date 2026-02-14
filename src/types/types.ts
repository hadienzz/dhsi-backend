export type createWorkshopPayload = {
  title: string;
  description: string;
  short_description: string;
  thumbnail: string;
  benefits: string[];
  category: string;
  // level: string;
  credit_price: number;
  user_id: string;
};

export type PaymentPayload = {
  package_id: string;
  user_id: string;
  idempotency_key: string;
  name: string;
  email: string;
};

export interface SnapTransactionPayload {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  item_details: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  enabled_payments: string[];
  customer_details: {
    email: string;
    name: string;
  };
}

export type CreateTransactionPayload = {
  user_id: string;
  package_id: string;
  order_id: string;
  idempotency_key: string;
  transaction_token: string;
  status: "PENDING";
  amount: number;
};
