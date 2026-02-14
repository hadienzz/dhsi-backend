import { paymentRepository } from "../feat/payments/payment.repository";

const handleWebhook = async (notification) => {
  const orderId = notification.order_id;

  const payment = await paymentRepository.findByOrderId(orderId);

  if (!payment) return;

  if (notification.transaction_status === "settlement") {

    await paymentRepository.updateStatus(orderId, "SUCCESS");

    await wallet.addBalance({
      user_id: payment.user_id,
      amount: packet.credits
    });
  }
};
