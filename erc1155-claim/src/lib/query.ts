import { toast } from "sonner";
import type { NFT } from "../types";

const url = "https://mint-api-production-7d50.up.railway.app";

export const getGallery = async (): Promise<NFT[] | undefined> => {
  try {
    const response = await fetch(`${url}/nfts`);
    const data = await response.json();
    return data as NFT[];
  } catch {
    toast.error("Error fetching gallery");
    return undefined;
  }
};

export const getNFT = async (id: string): Promise<NFT | undefined> => {
  try {
    const response = await fetch(`${url}/nfts/${id}`);
    const data = await response.json();
    return data as NFT;
  } catch {
    toast.error("Error fetching NFT");
    return undefined;
  }
};
