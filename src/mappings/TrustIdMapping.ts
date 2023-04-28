import {getOrCreateUser} from "../getters";
import {CidUpdated, LeaseContractAddressUpdated, Mint} from "../../generated/TrustId/TrustId";
import {ZERO} from "../constants";

export function handleMint(event: Mint): void {
  const user = getOrCreateUser(event.params._tokenId.toString());
  user.handle = event.params._handle;
  user.address = event.params._address;

  user.createdAt = event.block.timestamp;
  user.updatedAt = ZERO;
  user.save();
}

export function handleCidUpdated(event: CidUpdated): void {
  const tenant = getOrCreateUser(event.params._tokenId.toString());
  tenant.cid = event.params._newCid;
  
  tenant.updatedAt = event.block.timestamp;
  tenant.save();
}


export function handleLeaseContractAddressUpdated(event: LeaseContractAddressUpdated): void {

/**TODO - update the lease contract address in the lease entity
 * Create entity with contract addresses ?
 */
}
