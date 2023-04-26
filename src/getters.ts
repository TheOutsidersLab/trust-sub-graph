import {ZERO, ZERO_ADDRESS} from "./constants";
import {Lease, User, RentPayment} from "../generated/schema";

export function getOrCreateUser(id: string): User {
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.handle = '';
    user.address = ZERO_ADDRESS;
    user.uri = '';
    user.save();
  }
  return user;
}

export function getOrCreateLease(id: string, tenantId: string, ownerId: string): Lease {
  let lease = Lease.load(id);
  if (!lease) {
    lease = new Lease(id);
    lease.owner = ownerId;
    lease.tenant = tenantId;
    lease.rentAmount = ZERO;
    lease.totalNumberOfRents = ZERO;
    lease.paymentToken = ZERO_ADDRESS;
    lease.currencyPair = '';
    lease.rentPaymentInterval = ZERO;
    lease.rentPaymentLimitTime = ZERO;
    lease.startDate = ZERO;
    lease.status = 'PENDING';
    lease.cancelledByOwner = false;
    lease.cancelledByTenant = false;
    lease.save();
  }
  return lease;
}

export function getOrCreateRentPayment(id: string): RentPayment {
  let rentPayment = RentPayment.load(id);
  if (!rentPayment) {
    rentPayment = new RentPayment(id);
    rentPayment.amount = ZERO;
    rentPayment.paymentToken = ZERO_ADDRESS;
    rentPayment.validationDate = ZERO;
    rentPayment.rentPaymentDate = ZERO;
    rentPayment.rentPaymentLimitDate = ZERO;
    rentPayment.exchangeRate = ZERO;
    rentPayment.exchangeRateTimestamp = ZERO;
    rentPayment.withoutIssues = false;
    rentPayment.status = 'PENDING';
    rentPayment.save();
  }
  return rentPayment;
}
