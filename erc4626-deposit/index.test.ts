import { beforeEach, expect, mock, test } from "bun:test";
import {
  createTestClient,
  encodeFunctionData,
  http,
  type PublicClient,
} from "viem";
import { readContract } from "viem/actions";
import { foundry } from "viem/chains";
import {
  AmountExceedsMaxDepositError,
  deposit,
  MissingAllowanceError,
  NotEnoughBalanceError,
} from "./index";

// Create anvil test client
const testClient = createTestClient({
  chain: foundry,
  mode: "anvil",
  transport: http(),
});

// Cast to PublicClient for compatibility with deposit function
const client = testClient as unknown as PublicClient;

// Mock viem functions for controlled testing
mock.module("viem/actions", () => ({
  readContract: mock(),
}));

mock.module("viem", () => ({
  encodeFunctionData: mock(),
}));

const mockReadContract = readContract as any;
const mockEncodeFunctionData = encodeFunctionData as any;

// Mock client methods that need controlled responses
const mockEstimateGas = mock();
(client as unknown as PublicClient).estimateGas = mockEstimateGas;

const defaultParams = {
  wallet: "0x1234567890123456789012345678901234567890" as `0x${string}`,
  vault: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`,
  amount: 1000n,
};

const assetAddress =
  "0x9876543210987654321098765432109876543210" as `0x${string}`;

beforeEach(() => {
  // Reset all mocks
  mockReadContract.mockReset();
  mockEncodeFunctionData.mockReset();
  mockEstimateGas.mockReset();
});

test("successful deposit", async () => {
  // Setup mocks for successful case
  mockReadContract
    .mockResolvedValueOnce(assetAddress) // asset() call
    .mockResolvedValueOnce(2000n) // maxDeposit() call
    .mockResolvedValueOnce(1500n) // balanceOf() call
    .mockResolvedValueOnce(1200n); // allowance() call

  mockEncodeFunctionData.mockReturnValue("0xencoded" as `0x${string}`);
  mockEstimateGas.mockResolvedValue(21000n);

  const result = await deposit(client, defaultParams);

  expect(result).toEqual({
    data: "0xencoded",
    from: defaultParams.wallet,
    to: defaultParams.vault,
    value: 0n,
    gas: 21000n,
  });

  // Verify all contract calls were made correctly
  expect(mockReadContract).toHaveBeenCalledTimes(4);
  expect(mockReadContract).toHaveBeenNthCalledWith(1, client, {
    address: defaultParams.vault,
    abi: expect.any(Array),
    functionName: "asset",
  });
  expect(mockReadContract).toHaveBeenNthCalledWith(2, client, {
    address: defaultParams.vault,
    abi: expect.any(Array),
    functionName: "maxDeposit",
    args: [defaultParams.wallet],
  });
  expect(mockReadContract).toHaveBeenNthCalledWith(3, client, {
    address: assetAddress,
    abi: expect.any(Array),
    functionName: "balanceOf",
    args: [defaultParams.wallet],
  });
  expect(mockReadContract).toHaveBeenNthCalledWith(4, client, {
    address: assetAddress,
    abi: expect.any(Array),
    functionName: "allowance",
    args: [defaultParams.wallet, defaultParams.vault],
  });

  expect(mockEncodeFunctionData).toHaveBeenCalledWith({
    abi: expect.any(Array),
    functionName: "deposit",
    args: [defaultParams.amount, defaultParams.wallet],
  });

  expect(client.estimateGas).toHaveBeenCalledWith({
    to: defaultParams.vault,
    data: "0xencoded",
  });
});

test("throws AmountExceedsMaxDepositError when amount exceeds max deposit", async () => {
  mockReadContract
    .mockResolvedValueOnce(assetAddress) // asset() call
    .mockResolvedValueOnce(500n); // maxDeposit() call returns less than amount

  await expect(deposit(client, defaultParams)).rejects.toThrow(
    AmountExceedsMaxDepositError
  );

  // Should only call asset() and maxDeposit()
  expect(mockReadContract).toHaveBeenCalledTimes(2);
});

test("throws NotEnoughBalanceError when wallet has insufficient balance", async () => {
  mockReadContract
    .mockResolvedValueOnce(assetAddress) // asset() call
    .mockResolvedValueOnce(2000n) // maxDeposit() call
    .mockResolvedValueOnce(500n); // balanceOf() call returns less than amount

  await expect(deposit(client, defaultParams)).rejects.toThrow(
    NotEnoughBalanceError
  );

  // Should call asset(), maxDeposit(), and balanceOf()
  expect(mockReadContract).toHaveBeenCalledTimes(3);
});

test("throws MissingAllowanceError when allowance is insufficient", async () => {
  mockReadContract
    .mockResolvedValueOnce(assetAddress) // asset() call
    .mockResolvedValueOnce(2000n) // maxDeposit() call
    .mockResolvedValueOnce(1500n) // balanceOf() call
    .mockResolvedValueOnce(500n); // allowance() call returns less than amount

  await expect(deposit(client, defaultParams)).rejects.toThrow(
    MissingAllowanceError
  );

  // Should call all 4 read functions
  expect(mockReadContract).toHaveBeenCalledTimes(4);
});

test("handles edge case where amount equals limits", async () => {
  const amount = 1000n;

  mockReadContract
    .mockResolvedValueOnce(assetAddress) // asset() call
    .mockResolvedValueOnce(amount) // maxDeposit() call - exactly equal
    .mockResolvedValueOnce(amount) // balanceOf() call - exactly equal
    .mockResolvedValueOnce(amount); // allowance() call - exactly equal

  mockEncodeFunctionData.mockReturnValue("0xencoded" as `0x${string}`);
  mockEstimateGas.mockResolvedValue(21000n);

  const result = await deposit(client, { ...defaultParams, amount });

  expect(result).toEqual({
    data: "0xencoded",
    from: defaultParams.wallet,
    to: defaultParams.vault,
    value: 0n,
    gas: 21000n,
  });
});

test("handles zero amount", async () => {
  const amount = 0n;

  mockReadContract
    .mockResolvedValueOnce(assetAddress) // asset() call
    .mockResolvedValueOnce(1000n) // maxDeposit() call
    .mockResolvedValueOnce(1000n) // balanceOf() call
    .mockResolvedValueOnce(1000n); // allowance() call

  mockEncodeFunctionData.mockReturnValue("0xencoded" as `0x${string}`);
  mockEstimateGas.mockResolvedValue(21000n);

  const result = await deposit(client, { ...defaultParams, amount });

  expect(result).toEqual({
    data: "0xencoded",
    from: defaultParams.wallet,
    to: defaultParams.vault,
    value: 0n,
    gas: 21000n,
  });
});
