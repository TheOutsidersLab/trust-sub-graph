import {getOrCreateTenant} from "../getters";
import {CidUpdated, Mint, TenantHasLeaseUpdated} from "../../generated/TenantId/TenantId";
import {ZERO} from "../constants";

export function handleMint(event: Mint): void {
  const tenant = getOrCreateTenant(event.params._tokenId.toString());
  tenant.handle = event.params._handle;
  tenant.address = event.params._address;

  tenant.createdAt = event.block.timestamp;
  tenant.updatedAt = ZERO;
  tenant.save();
}

export function handleCidUpdated(event: CidUpdated): void {
  const tenant = getOrCreateTenant(event.params._tokenId.toString());
  tenant.uri = event.params._newCid;
  
  tenant.updatedAt = event.block.timestamp;
  tenant.save();
}

export function handleTenantHasLeaseUpdated(event: TenantHasLeaseUpdated): void {
  const tenant = getOrCreateTenant(event.params.tokenId.toString());
  tenant.hasLease = event.params.hasLease;

  tenant.updatedAt = event.block.timestamp;
  tenant.save();
}
