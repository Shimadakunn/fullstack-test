import { describe, it, expect, beforeEach, mock } from "bun:test";
import { createPublicClient, http, type PublicClient } from "viem";
import { foundry } from "viem/chains";
import {
  deposit,
  NotEnoughBalanceError,
  MissingAllowanceError,
  AmountExceedsMaxDepositError,
  type DepositParams,
} from "./index";
import { readContract } from "viem/actions";
import { encodeFunctionData } from "viem";

// Mock viem functions
mock.module("viem/actions", () => ({
  readContract: mock(() => Promise.resolve(0n)),
}));

mock.module("viem", () => ({
  ...require("viem"),
  encodeFunctionData: mock(() => "0x1234567890abcdef"),
}));

describe("deposit function", () => {
  let client: PublicClient;
  let params: DepositParams;
  const mockReadContract = readContract as ReturnType<typeof mock>;
  const mockEncodeFunctionData = encodeFunctionData as ReturnType<typeof mock>;

  const MOCK_ADDRESSES = {
    wallet: "0x1234567890123456789012345678901234567890" as const,
    vault: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as const,
    asset: "0x9876543210987654321098765432109876543210" as const,
  };

  beforeEach(() => {
    // Create a mock client that points to anvil
    client = createPublicClient({
      chain: foundry,
      transport: http("http://127.0.0.1:8545"),
    });

    // Mock estimateGas method
    client.estimateGas = mock(() => Promise.resolve(21000n));

    params = {
      wallet: MOCK_ADDRESSES.wallet,
      vault: MOCK_ADDRESSES.vault,
      amount: 1000n,
    };

    // Reset all mocks
    mockReadContract.mockClear();
    mockEncodeFunctionData.mockClear();
  });

  it("should successfully create a deposit transaction", async () => {
    // Mock contract calls for successful path
    mockReadContract
      .mockResolvedValueOnce(MOCK_ADDRESSES.asset) // asset() call
      .mockResolvedValueOnce(5000n) // maxDeposit() call
      .mockResolvedValueOnce(2000n) // balanceOf() call
      .mockResolvedValueOnce(1500n); // allowance() call

    mockEncodeFunctionData.mockReturnValue("0xmockeddata");

    const result = await deposit(client, params);

    expect(result).toEqual({
      data: "0xmockeddata",
      from: MOCK_ADDRESSES.wallet,
      to: MOCK_ADDRESSES.vault,
      value: 0n,
      gas: 21000n,
    });

    // Verify contract calls were made in correct order
    expect(mockReadContract).toHaveBeenCalledTimes(4);

    // Check asset() call
    expect(mockReadContract).toHaveBeenNthCalledWith(1, client, {
      address: MOCK_ADDRESSES.vault,
      abi: expect.any(Array),
      functionName: "asset",
    });

    // Check maxDeposit() call
    expect(mockReadContract).toHaveBeenNthCalledWith(2, client, {
      address: MOCK_ADDRESSES.vault,
      abi: expect.any(Array),
      functionName: "maxDeposit",
      args: [MOCK_ADDRESSES.wallet],
    });

    // Check balanceOf() call
    expect(mockReadContract).toHaveBeenNthCalledWith(3, client, {
      address: MOCK_ADDRESSES.asset,
      abi: expect.any(Array),
      functionName: "balanceOf",
      args: [MOCK_ADDRESSES.wallet],
    });

    // Check allowance() call
    expect(mockReadContract).toHaveBeenNthCalledWith(4, client, {
      address: MOCK_ADDRESSES.asset,
      abi: expect.any(Array),
      functionName: "allowance",
      args: [MOCK_ADDRESSES.wallet, MOCK_ADDRESSES.vault],
    });

    // Check encodeFunctionData call
    expect(mockEncodeFunctionData).toHaveBeenCalledWith({
      abi: expect.any(Array),
      functionName: "deposit",
      args: [1000n, MOCK_ADDRESSES.wallet],
    });
  });

  it("should throw AmountExceedsMaxDepositError when amount exceeds max deposit", async () => {
    mockReadContract
      .mockResolvedValueOnce(MOCK_ADDRESSES.asset) // asset() call
      .mockResolvedValueOnce(500n); // maxDeposit() call - less than amount

    await expect(deposit(client, params)).rejects.toThrow(
      AmountExceedsMaxDepositError
    );

    expect(mockReadContract).toHaveBeenCalledTimes(2);
  });

  it("should throw NotEnoughBalanceError when wallet balance is insufficient", async () => {
    mockReadContract
      .mockResolvedValueOnce(MOCK_ADDRESSES.asset) // asset() call
      .mockResolvedValueOnce(5000n) // maxDeposit() call
      .mockResolvedValueOnce(500n); // balanceOf() call - less than amount

    await expect(deposit(client, params)).rejects.toThrow(
      NotEnoughBalanceError
    );

    expect(mockReadContract).toHaveBeenCalledTimes(3);
  });

  it("should throw MissingAllowanceError when allowance is insufficient", async () => {
    mockReadContract
      .mockResolvedValueOnce(MOCK_ADDRESSES.asset) // asset() call
      .mockResolvedValueOnce(5000n) // maxDeposit() call
      .mockResolvedValueOnce(2000n) // balanceOf() call
      .mockResolvedValueOnce(500n); // allowance() call - less than amount

    await expect(deposit(client, params)).rejects.toThrow(
      MissingAllowanceError
    );

    expect(mockReadContract).toHaveBeenCalledTimes(4);
  });

  it("should handle edge case where amount equals max deposit", async () => {
    const edgeParams = { ...params, amount: 1000n };

    mockReadContract
      .mockResolvedValueOnce(MOCK_ADDRESSES.asset) // asset() call
      .mockResolvedValueOnce(1000n) // maxDeposit() call - exactly equal to amount
      .mockResolvedValueOnce(2000n) // balanceOf() call
      .mockResolvedValueOnce(1500n); // allowance() call

    mockEncodeFunctionData.mockReturnValue("0xedgecase");

    const result = await deposit(client, edgeParams);

    expect(result.data).toBe("0xedgecase");
    expect(mockReadContract).toHaveBeenCalledTimes(4);
  });

  it("should handle edge case where amount equals balance", async () => {
    const edgeParams = { ...params, amount: 1000n };

    mockReadContract
      .mockResolvedValueOnce(MOCK_ADDRESSES.asset) // asset() call
      .mockResolvedValueOnce(5000n) // maxDeposit() call
      .mockResolvedValueOnce(1000n) // balanceOf() call - exactly equal to amount
      .mockResolvedValueOnce(1500n); // allowance() call

    mockEncodeFunctionData.mockReturnValue("0xbalanceedge");

    const result = await deposit(client, edgeParams);

    expect(result.data).toBe("0xbalanceedge");
    expect(mockReadContract).toHaveBeenCalledTimes(4);
  });

  it("should handle edge case where amount equals allowance", async () => {
    const edgeParams = { ...params, amount: 1000n };

    mockReadContract
      .mockResolvedValueOnce(MOCK_ADDRESSES.asset) // asset() call
      .mockResolvedValueOnce(5000n) // maxDeposit() call
      .mockResolvedValueOnce(2000n) // balanceOf() call
      .mockResolvedValueOnce(1000n); // allowance() call - exactly equal to amount

    mockEncodeFunctionData.mockReturnValue("0xallowanceedge");

    const result = await deposit(client, edgeParams);

    expect(result.data).toBe("0xallowanceedge");
    expect(mockReadContract).toHaveBeenCalledTimes(4);
  });

  it("should handle zero amount deposit", async () => {
    const zeroParams = { ...params, amount: 0n };

    mockReadContract
      .mockResolvedValueOnce(MOCK_ADDRESSES.asset) // asset() call
      .mockResolvedValueOnce(5000n) // maxDeposit() call
      .mockResolvedValueOnce(2000n) // balanceOf() call
      .mockResolvedValueOnce(1500n); // allowance() call

    mockEncodeFunctionData.mockReturnValue("0xzeroamount");

    const result = await deposit(client, zeroParams);

    expect(result.data).toBe("0xzeroamount");
    expect(result.value).toBe(0n);
    expect(mockEncodeFunctionData).toHaveBeenCalledWith({
      abi: expect.any(Array),
      functionName: "deposit",
      args: [0n, MOCK_ADDRESSES.wallet],
    });
  });

  it("should handle large amount deposit", async () => {
    const largeAmount = 2n ** 256n - 1n; // Max uint256
    const largeParams = { ...params, amount: largeAmount };

    mockReadContract
      .mockResolvedValueOnce(MOCK_ADDRESSES.asset) // asset() call
      .mockResolvedValueOnce(largeAmount) // maxDeposit() call
      .mockResolvedValueOnce(largeAmount) // balanceOf() call
      .mockResolvedValueOnce(largeAmount); // allowance() call

    mockEncodeFunctionData.mockReturnValue("0xlargeamount");

    const result = await deposit(client, largeParams);

    expect(result.data).toBe("0xlargeamount");
    expect(mockEncodeFunctionData).toHaveBeenCalledWith({
      abi: expect.any(Array),
      functionName: "deposit",
      args: [largeAmount, MOCK_ADDRESSES.wallet],
    });
  });

  it("should verify return transaction structure", async () => {
    mockReadContract
      .mockResolvedValueOnce(MOCK_ADDRESSES.asset)
      .mockResolvedValueOnce(5000n)
      .mockResolvedValueOnce(2000n)
      .mockResolvedValueOnce(1500n);

    mockEncodeFunctionData.mockReturnValue("0xstructuretest");

    const result = await deposit(client, params);

    // Verify all required fields are present
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("from");
    expect(result).toHaveProperty("to");
    expect(result).toHaveProperty("value");
    expect(result).toHaveProperty("gas");

    // Verify correct types
    expect(typeof result.data).toBe("string");
    expect(typeof result.from).toBe("string");
    expect(typeof result.to).toBe("string");
    expect(typeof result.value).toBe("bigint");
    expect(typeof result.gas).toBe("bigint");

    // Verify specific values
    expect(result.from).toBe(MOCK_ADDRESSES.wallet);
    expect(result.to).toBe(MOCK_ADDRESSES.vault);
    expect(result.value).toBe(0n);
  });
});

describe("Error classes", () => {
  it("should create NotEnoughBalanceError with correct message", () => {
    const error = new NotEnoughBalanceError();
    expect(error.message).toBe("Not enough balance");
    expect(error).toBeInstanceOf(Error);
  });

  it("should create MissingAllowanceError with correct message", () => {
    const error = new MissingAllowanceError();
    expect(error.message).toBe("Not enough allowance");
    expect(error).toBeInstanceOf(Error);
  });

  it("should create AmountExceedsMaxDepositError with correct message", () => {
    const error = new AmountExceedsMaxDepositError();
    expect(error.message).toBe("Amount exceeds max deposit");
    expect(error).toBeInstanceOf(Error);
  });
});
