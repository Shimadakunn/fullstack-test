import { useEffect } from "react";
import {
  type BaseError,
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";
import { abi } from "../config";
import type { NFT } from "../types";

export const useMint = (nft: NFT, refetch: () => void) => {
  const { address } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const mint = () => {
    writeContract({
      address: nft.tokenAddress as `0x${string}`,
      abi,
      functionName: "claim",
      args: [
        address as `0x${string}`, // _receiver (address)
        BigInt(nft.id), // _tokenId (uint256)
        BigInt(1), // _quantity (uint256)
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // _currency (address)
        BigInt(0), // _pricePerToken (uint256)
        [
          [], // _allowlistProof.proof (bytes32[])
          "0", // _allowlistProof.quantityLimitPerWallet (uint256)
          "0", // _allowlistProof.pricePerToken (uint256)
          "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // _allowlistProof.currency (address)
        ],
        "0x", // _data (bytes)
      ],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("NFT minted");
      refetch();
    }
    if (error)
      toast.error("Error minting NFT", {
        description: (error as BaseError).shortMessage || error.message,
      });
  }, [isConfirmed, error, refetch]);

  return {
    mint,
    isLoading: isConfirming || isPending,
  };
};
