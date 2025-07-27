import { useEffect } from "react";
import { toast } from "sonner";
import { type BaseError, useAccount, useReadContract } from "wagmi";
import { abi } from "../config";
import type { NFT } from "../types";

export const useBalance = (nft: NFT) => {
  const { address } = useAccount();
  const {
    data: balance,
    refetch,
    error,
  } = useReadContract({
    address: nft.tokenAddress as `0x${string}`,
    abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`, BigInt(nft.id)],
  });

  useEffect(() => {
    if (error)
      toast.error("Error fetching balance", {
        description:
          (error as unknown as BaseError).shortMessage || error.message,
      });
  }, [error]);

  return {
    balance,
    refetch,
  };
};
