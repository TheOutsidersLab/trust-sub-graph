import {
  getOrCreateLease,
  getOrCreateOwner, getOrCreatePlatform,
  getOrCreateRentPayment,
  getOrCreateUser
} from "../getters";
import {
  CancellationRequested,
  LeaseCreated,
  LeaseReviewedByTenant,
  LeaseReviewedByOwner,
  LeaseValidated,
  RentNotPaid,
  FiatRentPaid,
  CryptoRentPaid,
  UpdateLeaseStatus,
  RentPaymentIssueStatusUpdated,
  SetRentToPending,
  LeaseMetaDataUpdated, LeasePaymentDataUpdated
} from "../../generated/Lease/Lease";
import {generateIdFromTwoFields} from "../utils";
import {BigInt} from "@graphprotocol/graph-ts/index";
import {Lease, Owner, Tenant} from "../../generated/schema";
import {log} from "@graphprotocol/graph-ts";

export function handleLeaseCreated(event: LeaseCreated): void {
  // Get the platform, owner and tenant before creating the lease
  const tenantId = getOrCreateUser(event.params.tenantId.toString()).id;
  const ownerId = getOrCreateUser(event.params.ownerId.toString()).id;

  //Create the lease
  const lease = getOrCreateLease(event.params.leaseId.toString(), tenantId, ownerId);
  log.warning('Lease - handleLeaseCreated - LeaseId from entity just created: {}', [lease.id])
  log.warning('Lease - handleLeaseCreated - TenantId from entity linked to Lease: {}', [lease.tenant.toString()])
  log.warning('Lease - handleLeaseCreated - OwnerId from entity linked to Lease: {}', [lease.owner.toString()])
  lease.totalNumberOfRents = BigInt.fromI32(event.params.totalNumberOfRents);
  lease.rentPaymentInterval = event.params.rentPaymentInterval;
  lease.startDate = event.params.startDate;
  lease.platform = getOrCreatePlatform(event.params.platform).id;
  // lease.uri = event.params.uri;

  lease.createdAt = event.block.timestamp;
  lease.save();
}

export function handleLeasePaymentDataUpdated(event: LeasePaymentDataUpdated): void {
  const lease = getOrCreateLease(event.params.leaseId.toString(), tenantId, ownerId);
  lease.rentAmount = event.params.rentAmount;
  lease.paymentToken = event.params.paymentToken;
  lease.currencyPair = event.params.currencyPair;

  //TODO consider putting all this after Lease Validated event
  //Create all payments linked to the lease
  for(let i = 0; i < lease.totalNumberOfRents; i++) {
    const rentPaymentId = generateIdFromTwoFields(event.params.leaseId.toString(), i.toString());
    const rentPayment = getOrCreateRentPayment(rentPaymentId);
    // amount field not populated here, stays equal to 0 - only when paid
    rentPayment.paymentToken = event.params.paymentToken;
    rentPayment.tenant = Tenant.load(event.params.tenantId.toString())!.id;
    rentPayment.owner = Owner.load(event.params.ownerId.toString())!.id;
    rentPayment.lease = Lease.load(event.params.leaseId.toString())!.id;
    rentPayment.rentPaymentDate = event.params.startDate.plus(event.params.rentPaymentInterval.times(BigInt.fromI32(i)));
    rentPayment.rentPaymentLimitDate = event.params.startDate.plus(event.params.rentPaymentLimitTime.times(BigInt.fromI32(i)));

    rentPayment.save();
  }

  lease.save();
  log.warning('Lease - handleLeaseCreated - LeaseId after save() function: {}', [lease.id])
}

export function handleCancellationRequested(event: CancellationRequested): void {
  const lease = getOrCreateLease(event.params.leaseId.toString(), '0', '0');
  lease.cancelledByOwner = event.params.cancelledByOwner;
  lease.cancelledByTenant = event.params.cancelledByTenant;

  lease.updatedAt = event.block.timestamp;
  lease.save();
}

export function handleLeaseReviewedByTenant(event: LeaseReviewedByTenant): void {
  const lease = getOrCreateLease(event.params.leaseId.toString(), '0', '0');

  lease.tenantReviewUri = event.params.reviewUri;

  lease.updatedAt = event.block.timestamp;
  lease.save();
}

export function handleLeaseReviewedByOwner(event: LeaseReviewedByOwner): void {
  const lease = getOrCreateLease(event.params.leaseId.toString(), '0', '0');

  lease.ownerReviewUri = event.params.reviewUri;

  lease.updatedAt = event.block.timestamp;
  lease.save();
}

export function handleLeaseValidated(event: LeaseValidated): void {
  const lease = getOrCreateLease(event.params.leaseId.toString(), '0', '0');
  lease.status = 'ACTIVE';

  lease.updatedAt = event.block.timestamp;
  lease.save();
}

export function handleRentNotPaid(event: RentNotPaid): void {
  const rentPaymentId = generateIdFromTwoFields(event.params.leaseId.toString(), event.params.rentId.toString());
  const rentPayment = getOrCreateRentPayment(rentPaymentId);

  rentPayment.status = 'NOT_PAID';
  rentPayment.validationDate = event.block.timestamp;

  rentPayment.save();
}

export function handleUpdateLeaseStatus(event: UpdateLeaseStatus): void {
  const lease = getOrCreateLease(event.params.leaseId.toString(), '0', '0');
  let status: string;
  switch (event.params.status) {
    case 0: lease.status = 'ACTIVE';
      break;
    case 1: lease.status = 'PENDING';
      break;
    case 2: lease.status = 'ENDED';
      break;
    case 3: lease.status = 'CANCELLED';
      break;
  }

  lease.updatedAt = event.block.timestamp;
  lease.save();
}

export function handleRentPaymentIssueStatusUpdated(event: RentPaymentIssueStatusUpdated): void {
  const rentPaymentId = generateIdFromTwoFields(event.params.leaseId.toString(), event.params.rentId.toString());
  const rentPayment = getOrCreateRentPayment(rentPaymentId);

  rentPayment.withoutIssues = event.params.withoutIssues;

  rentPayment.save();
}

export function handleSetRentToPending(event: SetRentToPending): void {
  const rentPaymentId = generateIdFromTwoFields(event.params.leaseId.toString(), event.params.rentId.toString());
  const rentPayment = getOrCreateRentPayment(rentPaymentId);

  rentPayment.status = 'PENDING';

  rentPayment.save();
}

export function handleLeaseMetaDataUpdated(event: LeaseMetaDataUpdated): void {
  const lease = getOrCreateLease(event.params.leaseId.toString(), '0', '0');
  lease.uri = event.params.metaData;

  lease.save();
}

enum LeaseStatus {
  ACTIVE,
  PENDING,
  ENDED
}
