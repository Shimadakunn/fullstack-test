import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { NFT as NFTType } from "../types";
import { getGallery, getNFT } from "../lib";
import {
  NFTComponent,
  NFTComponentSkeleton,
  MainNFT,
  MainNFTSkeleton,
} from "../components";

export default function NFT() {
  const { id } = useParams();
  const { data } = useQuery({
    queryKey: ["nft", id],
    queryFn: () => getNFT(id as string),
  });
  return (
    <div className="flex flex-col space-y-2 p-16">
      {data ? <MainNFT nft={data} /> : <MainNFTSkeleton />}
      <OtherNFTs actualNFT={data} />
    </div>
  );
}

export const OtherNFTs = ({
  actualNFT,
}: {
  actualNFT: NFTType | undefined;
}) => {
  const { data } = useQuery({
    queryKey: ["gallery"],
    queryFn: getGallery,
  });
  return (
    <div className="flex flex-col space-y-4 mt-8">
      <h1 className="font-semibold">More from this collection</h1>
      <div className="flex flex-wrap gap-4  w-full justify-start items-center">
        {data
          ? actualNFT
            ? data
                .filter((nft: NFTType) => nft.id !== actualNFT?.id)
                .map((nft: NFTType) => (
                  <NFTComponent nft={nft} className="w-[calc(25%-0.75rem)]" />
                ))
            : data
                .slice(0, 4)
                .map((nft: NFTType) => (
                  <NFTComponent nft={nft} className="w-[calc(25%-0.75rem)]" />
                ))
          : Array.from({ length: 4 }).map((_, index) => (
              <NFTComponentSkeleton key={index} />
            ))}
      </div>
    </div>
  );
};
