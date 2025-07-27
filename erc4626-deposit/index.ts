import type { PublicClient } from "viem";
import { readContract } from "viem/actions";
import { encodeFunctionData } from "viem";
import { ERC4626_ABI, ERC20_ABI } from "./abi";

export type DepositParams = {
  wallet: `0x${string}`;
  vault: `0x${string}`;
  amount: bigint;
};

type Transaction = {
  data: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  gas: bigint;
};

export class NotEnoughBalanceError extends Error {
  constructor() {
    super("Not enough balance");
  }
}

export class MissingAllowanceError extends Error {
  constructor() {
    super("Not enough allowance");
  }
}

export class AmountExceedsMaxDepositError extends Error {
  constructor() {
    super("Amount exceeds max deposit");
  }
}

/**
 * Deposit an amount of an asset into a given vault.
 *
 * @throws {NotEnoughBalanceError} if the wallet does not have enough balance to deposit the amount
 * @throws {MissingAllowanceError} if the wallet does not have enough allowance to deposit the amount
 * @throws {AmountExceedsMaxDepositError} if the amount exceeds the max deposit
 */
export async function deposit(
  client: PublicClient,
  { wallet, vault, amount }: DepositParams
): Promise<Transaction> {
  // Get the underlying asset address
  const assetAddress = await readContract(client, {
    address: vault,
    abi: ERC4626_ABI,
    functionName: "asset",
  });

  // Check max deposit limit
  const maxDeposit = await readContract(client, {
    address: vault,
    abi: ERC4626_ABI,
    functionName: "maxDeposit",
    args: [wallet],
  });

  if (amount > maxDeposit) throw new AmountExceedsMaxDepositError();

  // Check wallet balance
  const balance = await readContract(client, {
    address: assetAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [wallet],
  });

  if (amount > balance) throw new NotEnoughBalanceError();

  // Check allowance
  const allowance = await readContract(client, {
    address: assetAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [wallet, vault],
  });

  if (amount > allowance) throw new MissingAllowanceError();

  // Encode the deposit function call
  const data = encodeFunctionData({
    abi: ERC4626_ABI,
    functionName: "deposit",
    args: [amount, wallet],
  });

  // Estimate gas
  const gas = await client.estimateGas({
    to: vault,
    data,
  });

  return {
    data,
    from: wallet,
    to: vault,
    value: 0n,
    gas,
  };
}
