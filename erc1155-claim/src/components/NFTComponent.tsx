import { useNavigate } from "react-router-dom";
import { getIpfsUrl } from "../lib";
import type { NFT } from "../types";

export function NFTComponent({
  nft,
  className,
}: {
  nft: NFT;
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-col items-start hover:scale-105 transition-all duration-300 cursor-pointer ${className} `}
      key={nft.id}
      onClick={() => {
        navigate(`/nft/${nft.id}`);
      }}
    >
      <img src={getIpfsUrl(nft.metadata.image)} alt={nft.metadata.name} />
      <h1 className="text-lg font-semibold mt-2">{nft.metadata.name}</h1>
      <h2 className="text-sm font-extralight text-gray-500">0.0 ETH</h2>
    </div>
  );
}

export function NFTComponentSkeleton() {
  return (
    <div className="flex flex-col items-start w-[calc(25%-0.75rem)]">
      <div className="aspect-square w-full bg-gray-200 animate-pulse"></div>
      <div className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mt-2"></div>
      <div className="w-1/2 h-4 bg-gray-200 rounded-lg animate-pulse mt-1"></div>
    </div>
  );
}
