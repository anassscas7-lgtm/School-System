export const sameFeeMonth = (left, right) =>
  String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase();

export const buildStudentFeeRows = (fees = [], vouchers = []) => {
  const voucherRows = vouchers.map((voucher) => {
    const matchingPayment = fees.find((fee) => sameFeeMonth(fee.fee_month, voucher.fee_month));

    return {
      ...voucher,
      row_id: `voucher-${voucher.voucher_id}`,
      payment_id: matchingPayment?.payment_id,
      payment_type: matchingPayment?.payment_type || 'Monthly fee',
      payment_date: matchingPayment?.payment_date || null,
      amount_due: Number(voucher.amount_due || 0),
      amount_received: Number(matchingPayment?.amount_received || 0),
      payment_method: matchingPayment?.payment_method || '-',
      voucher_id: voucher.voucher_id,
      hasVoucher: true
    };
  });

  const paymentOnlyRows = fees
    .filter((fee) => !vouchers.some((voucher) => sameFeeMonth(voucher.fee_month, fee.fee_month)))
    .map((fee) => ({
      ...fee,
      row_id: `payment-${fee.payment_id}`,
      amount_due: Number(fee.amount_due || 0),
      amount_received: Number(fee.amount_received || 0),
      hasVoucher: false
    }));

  return [...voucherRows, ...paymentOnlyRows];
};

export const getStudentFeeSummary = (feeRows = []) => {
  const totalBilled = feeRows.reduce((sum, item) => sum + Number(item.amount_due || 0), 0);
  const totalPaid = feeRows.reduce((sum, item) => sum + Number(item.amount_received || 0), 0);
  const totalDue = feeRows.reduce((sum, item) => {
    const billed = Number(item.amount_due || 0);
    const received = Number(item.amount_received || 0);
    return sum + Math.max(billed - received, 0);
  }, 0);
  const hasBills = feeRows.some((item) => Number(item.amount_due || 0) > 0);

  return {
    totalBilled,
    totalPaid,
    totalDue,
    accountStatus: hasBills && totalDue <= 0 ? 'Paid' : 'Pending'
  };
};
