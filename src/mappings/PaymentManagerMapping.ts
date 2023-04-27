import {getOrCreateRentPayment} from "../getters";
import {generateIdFromTwoFields} from "../utils";
import {CryptoRentPaid, FiatRentPaid, ProtocolFeeRateUpdated} from "../../generated/PaymentManager/PaymentManager";

export function handleFiatRentPaid(event: FiatRentPaid): void {
  const rentPaymentId = generateIdFromTwoFields(event.params.leaseId.toString(), event.params.rentId.toString());
  const rentPayment = getOrCreateRentPayment(rentPaymentId);

  rentPayment.amount = event.params.amount;
  rentPayment.withoutIssues = event.params.withoutIssues;
  rentPayment.exchangeRate = event.params.exchangeRate;
  rentPayment.exchangeRateTimestamp = event.params.exchangeRateTimestamp;
  rentPayment.status = 'PAID';
  rentPayment.validationDate = event.block.timestamp;

  rentPayment.save();
}

export function handleCryptoRentPaid(event: CryptoRentPaid): void {
  const rentPaymentId = generateIdFromTwoFields(event.params.leaseId.toString(), event.params.rentId.toString());
  const rentPayment = getOrCreateRentPayment(rentPaymentId);

  rentPayment.amount = event.params.amount;
  rentPayment.withoutIssues = event.params.withoutIssues;
  rentPayment.status = 'PAID';
  rentPayment.validationDate = event.block.timestamp;

  rentPayment.save();
}

// export const handleProtocolFeeRateUpdated = (event: ProtocolFeeRateUpdated): void => {
//   // TODO: Integrate Protocol entity
//   // const protocol = getOrCreateProtocol();
//   // protocolFeeRate.rate = event.params.rate;
//   //
//   // protocolFeeRate.save();
// };