import {getOrCreatePlatform} from "../getters";
import {ZERO} from "../constants";
import {
  CidUpdated,
  LeasePostingFeeUpdated,
  Mint,
  MintFeeUpdated,
  OriginLeaseFeeRateUpdated,
  OriginProposalFeeRateUpdated, ProposalPostingFeeUpdated
} from "../../generated/PlatformId/PlatformId";

export function handleMint(event: Mint): void {
  const platform = getOrCreatePlatform(event.params.platformId.toString());
  platform.name = event.params.platformName;
  platform.address = event.params.platformOwnerAddress;

  platform.createdAt = event.block.timestamp;
  platform.updatedAt = ZERO;
  platform.save();
}

export function handleCidUpdated(event: CidUpdated): void {
  const platform = getOrCreatePlatform(event.params.platformId.toString());
  platform.cid = event.params.newCid;
  
  platform.updatedAt = event.block.timestamp;
  platform.save();
}

export function handleMintFeeUpdated(event: MintFeeUpdated): void {
  //TODO this data will go in future "Protocol entity"
}

export function handleOriginLeaseFeeRateUpdated(event: OriginLeaseFeeRateUpdated): void {
  const platform = getOrCreatePlatform(event.params.platformId.toString());
  platform.originLeaseFeeRate = event.params.originLeaseFeeRate;
  platform.save();
}

export function handleOriginProposalFeeRateUpdated(event: OriginProposalFeeRateUpdated): void {
  const platform = getOrCreatePlatform(event.params.platformId.toString());
  platform.originProposalFeeRate = event.params.originProposalFeeRate;
  platform.save();
}

export function handleLeasePostingFeeUpdated(event: LeasePostingFeeUpdated): void {
  const platform = getOrCreatePlatform(event.params.platformId.toString());
  platform.leasePostingFee = event.params.leasePostingFee;
  platform.save();
}

export function handleProposalPostingFeeUpdated(event: ProposalPostingFeeUpdated): void {
  const platform = getOrCreatePlatform(event.params.platformId.toString());
  platform.proposalPostingFee = event.params.proposalPostingFee;
  platform.save();
}
