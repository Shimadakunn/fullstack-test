import { useQuery } from "@tanstack/react-query";
import { getGallery } from "../lib";
import { NFTComponent, NFTComponentSkeleton } from "../components";
import type { NFT as NFTType } from "../types";

export default function Gallery() {
  const { data } = useQuery({
    queryKey: ["gallery"],
    queryFn: getGallery,
  });

  return (
    <div className="flex flex-wrap gap-4 p-16 w-full justify-start items-center">
      {data
        ? data.map((nft: NFTType) => (
            <NFTComponent nft={nft} className="w-[calc(25%-0.75rem)]" />
          ))
        : Array.from({ length: 5 }).map((_, index) => (
            <NFTComponentSkeleton key={index} />
          ))}
    </div>
  );
}
