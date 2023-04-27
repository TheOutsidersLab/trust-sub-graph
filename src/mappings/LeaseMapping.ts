import {
  getOrCreateLease, getOrCreatePlatform, getOrCreateProposal, getOrCreateRentPayment, getOrCreateUser
} from "../getters";
import {
  CancellationRequested,
  LeaseCreated,
  LeaseReviewedByTenant,
  LeaseReviewedByOwner,
  UpdateLeaseStatus,
  RentPaymentIssueStatusUpdated,
  LeaseMetaDataUpdated,
  LeasePaymentDataUpdated,
  LeaseUpdated,
  ValidateLease,
  ProposalValidated,
  ProposalSubmitted,
  ProposalUpdated,
  OpenProposalSubmitted,
  OpenProposalUpdated,
  UpdateRentStatus
} from "../../generated/Lease/Lease";
import {generateIdFromTwoFields} from "../utils";
import {BigInt} from "@graphprotocol/graph-ts/index";
import {log} from "@graphprotocol/graph-ts";

export function handleLeaseCreated(event: LeaseCreated): void {
  //Create the lease
  const lease = getOrCreateLease(event.params.leaseId.toString());
  log.warning('Lease - handleLeaseCreated - LeaseId from entity just created: {}', [lease.id])
  log.warning('Lease - handleLeaseCreated - TenantId from entity linked to Lease: {}', [lease.tenant!.toString()])
  log.warning('Lease - handleLeaseCreated - OwnerId from entity linked to Lease: {}', [lease.owner!.toString()])
  lease.owner = getOrCreateUser(event.params.ownerId.toString()).id;
  lease.tenant = getOrCreateUser(event.params.tenantId.toString()).id;
  lease.totalNumberOfRents = BigInt.fromI32(event.params.totalNumberOfRents);
  lease.rentPaymentInterval = event.params.rentPaymentInterval;
  lease.startDate = event.params.startDate;
  lease.platform = getOrCreatePlatform(event.params.platformId.toString()).id;
  // lease.uri = event.params.uri;

  lease.createdAt = event.block.timestamp;
  lease.save();
}

export function handleLeaseUpdated(event: LeaseUpdated): void {
  //Create the lease
  const lease = getOrCreateLease(event.params.leaseId.toString());
  lease.owner = getOrCreateUser(event.params.ownerId.toString()).id;
  lease.tenant = getOrCreateUser(event.params.tenantId.toString()).id;
  lease.totalNumberOfRents = BigInt.fromI32(event.params.totalNumberOfRents);
  lease.startDate = event.params.startDate;
  lease.rentPaymentInterval = event.params.rentPaymentInterval;
  lease.uri = event.params.metadata;

  lease.updatedAt = event.block.timestamp;
  lease.save();
}

export function handleLeasePaymentDataUpdated(event: LeasePaymentDataUpdated): void {
  const lease = getOrCreateLease(event.params.leaseId.toString());
  lease.rentAmount = event.params.rentAmount;
  lease.paymentToken = event.params.paymentToken;
  lease.currencyPair = event.params.currencyPair;

  lease.updatedAt = event.block.timestamp;
  lease.save();
  log.warning('Lease - handleLeaseCreated - LeaseId after save() function: {}', [lease.id])
}

export function handleValidateLease(event: ValidateLease): void {
  const lease = getOrCreateLease(event.params.leaseId.toString());
  const tenantId = getOrCreateUser(lease.tenant!).id;
  const ownerId = getOrCreateUser(lease.owner!).id;

  lease.status = 'ACTIVE';

  //Create all payments linked to the lease
  for(let i = 0; i < lease.totalNumberOfRents.toI32(); i++) {
    const rentPaymentId = generateIdFromTwoFields(event.params.leaseId.toString(), i.toString());
    const rentPayment = getOrCreateRentPayment(rentPaymentId);
    // amount field not populated here, stays equal to 0 - only when paid
    rentPayment.paymentToken = lease.paymentToken;
    rentPayment.tenant = tenantId;
    rentPayment.owner = ownerId;
    rentPayment.lease = lease.id;
    rentPayment.rentPaymentDate = lease.startDate.plus(lease.rentPaymentInterval.times(BigInt.fromI32(i)));

    rentPayment.save();
  }

  lease.save();
  log.warning('Lease - handleLeaseCreated - LeaseId after save() function: {}', [lease.id])
}

export function handleProposalSubmitted(event: ProposalSubmitted): void {
  const lease = getOrCreateLease(event.params.leaseId.toString());
  const proposalId = generateIdFromTwoFields(event.params.leaseId.toString(), event.params.tenantId.toString());
  const proposal = getOrCreateProposal(proposalId);
  proposal.lease = getOrCreateLease(event.params.leaseId.toString()).id;
  proposal.tenant = getOrCreateUser(event.params.tenantId.toString()).id;
  proposal.owner = getOrCreateUser(lease.owner!).id;
  proposal.totalNumberOfRents = BigInt.fromI32(event.params.totalNumberOfRents);
  proposal.startDate = event.params.startDate;
  proposal.platform = getOrCreatePlatform(event.params.platformId.toString()).id;
  proposal.cid = event.params.metaData;
  proposal.save();
}

export function handleProposalUpdated(event: ProposalUpdated): void {
  const proposalId = generateIdFromTwoFields(event.params.leaseId.toString(), event.params.tenantId.toString());
  const proposal = getOrCreateProposal(proposalId);
  proposal.totalNumberOfRents = BigInt.fromI32(event.params.totalNumberOfRents);
  proposal.startDate = event.params.startDate;
  proposal.cid = event.params.cid;
  proposal.save();
}
export function handleProposalValidated(event: ProposalValidated): void {
  const proposalId = generateIdFromTwoFields(event.params.leaseId.toString(), event.params.tenantId.toString());
  const proposal = getOrCreateProposal(proposalId);
  proposal.status = 'Accepted';
  proposal.save();

  const lease = getOrCreateLease(event.params.leaseId.toString());
  lease.status = 'ACTIVE';
  lease.save();

  //Create all payments linked to the lease
  for(let i = 0; i < lease.totalNumberOfRents.toI32(); i++) {
    const rentPaymentId = generateIdFromTwoFields(event.params.leaseId.toString(), i.toString());
    const rentPayment = getOrCreateRentPayment(rentPaymentId);
    // amount field not populated here, stays equal to 0 - only when paid
    rentPayment.paymentToken = lease.paymentToken;
    rentPayment.tenant = getOrCreateUser(lease.tenant!).id;
    rentPayment.owner = getOrCreateUser(lease.owner!).id;
    rentPayment.lease = lease.id;
    rentPayment.rentPaymentDate = lease.startDate.plus(lease.rentPaymentInterval.times(BigInt.fromI32(i)));

    rentPayment.save();
  }
}

export function handleOpenProposalSubmitted(event: OpenProposalSubmitted): void {

}

export function handleOpenProposalUpdated(event: OpenProposalUpdated): void {}

export function handleRentPaymentIssueStatusUpdated(event: RentPaymentIssueStatusUpdated): void {
  const rentPaymentId = generateIdFromTwoFields(event.params.leaseId.toString(), event.params.rentId.toString());
  const rentPayment = getOrCreateRentPayment(rentPaymentId);

  rentPayment.withoutIssues = event.params.withoutIssues;

  rentPayment.save();
}

export function handleUpdateRentStatus(event: UpdateRentStatus): void {
  const rentPaymentId = generateIdFromTwoFields(event.params.leaseId.toString(), event.params.rentId.toString());
  const rentPayment = getOrCreateRentPayment(rentPaymentId);

  let status: string;
  switch (event.params.status) {
    case 0: status = 'Pending';
      break;
    case 1: status = 'Paid';
      break;
    case 2: status = 'Not_paid';
      break;
    case 3: status = 'Cancelled';
      break;
    case 4: status = 'Conflict';
      break;
  }

  rentPayment.status = status;
  rentPayment.save();
}


export function handleUpdateLeaseStatus(event: UpdateLeaseStatus): void {
  const lease = getOrCreateLease(event.params.leaseId.toString());
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

export function handleCancellationRequested(event: CancellationRequested): void {
  const lease = getOrCreateLease(event.params.leaseId.toString());
  lease.cancelledByOwner = event.params.cancelledByOwner;
  lease.cancelledByTenant = event.params.cancelledByTenant;

  lease.updatedAt = event.block.timestamp;
  lease.save();
}

export function handleLeaseReviewedByTenant(event: LeaseReviewedByTenant): void {
  const lease = getOrCreateLease(event.params.leaseId.toString());

  lease.tenantReviewUri = event.params.reviewUri;

  lease.updatedAt = event.block.timestamp;
  lease.save();
}

export function handleLeaseReviewedByOwner(event: LeaseReviewedByOwner): void {
  const lease = getOrCreateLease(event.params.leaseId.toString());

  lease.ownerReviewUri = event.params.reviewUri;

  lease.updatedAt = event.block.timestamp;
  lease.save();
}

export function handleLeaseMetaDataUpdated(event: LeaseMetaDataUpdated): void {
  const lease = getOrCreateLease(event.params.leaseId.toString());
  lease.uri = event.params.metaData;

  lease.save();
}

enum LeaseStatus {
  ACTIVE,
  PENDING,
  ENDED
}
