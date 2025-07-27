import { Share, Heart } from "lucide-react";
import { getIpfsUrl, useBalance, useMint } from "../lib";
import Button from "./ui/button";
import { Info } from "./Info";
import type { NFT as NFTType } from "../types";

export const MainNFT = ({ nft }: { nft: NFTType }) => {
  const { balance, refetch } = useBalance(nft);
  const { mint, isLoading } = useMint(nft, refetch);

  return (
    <div className="flex space-x-8">
      {/* IMAGE */}
      <div className="w-1/2">
        <img
          src={getIpfsUrl(nft.metadata.image)}
          alt={nft.metadata.name}
          className="w-full object-cover"
        />
      </div>
      {/* INFO */}
      <div className="flex flex-col space-y-2 w-1/2">
        {/* NAME AND OWNERSHIP */}
        <div className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{nft.metadata.name}</h1>
            <h2 className="text-sm text-gray-500 font-light">
              You own {String(balance ?? 0)}
            </h2>
          </div>
          <div className="flex flex-row space-x-2">
            <div className="cursor-pointer border border-gray-200 p-2">
              <Share className="w-4 h-4" />
            </div>
            <div className="cursor-pointer border border-gray-200 p-2">
              <Heart className="w-4 h-4" />
            </div>
          </div>
        </div>
        {/* DESCRIPTION */}
        <p className=" text-gray-500 font-light mt-1">
          {nft.metadata.description}
        </p>
        {/* ATTRIBUTES */}
        <div className="flex flex-row space-x-2">
          {nft.metadata.attributes.map((attribute) => (
            <div className="flex flex-col space-x-2 border border-gray-200 px-4 py-2">
              <p className="text-sm text-gray-500 font-thin">
                {attribute.trait_type.toUpperCase()}
              </p>
              <p className="text-sm text-gray-500 font-light">
                {attribute.value}
              </p>
            </div>
          ))}
        </div>
        <div className="w-full h-[1px] bg-gray-200 mb-6 mt-4" />
        {/* MINT INFO */}
        <div className="bg-black text-white px-2 py-1 text-xs font-thin inline-block w-fit">
          Free Mint
        </div>
        <div className="flex flex-row space-x-1 items-center">
          <img src="/eth.svg" alt="ethereum" className="w-4 h-4" />
          <p className="text-xl font-semibold">0 ETH</p>
        </div>
        <Button
          className="w-full py-2"
          onClick={() => mint()}
          disabled={isLoading}
        >
          {isLoading ? "Claiming..." : "Claim Now"}
        </Button>
        <Info />
      </div>
    </div>
  );
};

export const MainNFTSkeleton = () => {
  return (
    <div className="flex space-x-8">
      {/* IMAGE */}
      <div className="w-1/2">
        <div className="w-full h-full bg-gray-200 animate-pulse rounded-sm"></div>
      </div>
      {/* INFO */}
      <div className="flex flex-col space-y-2 w-1/2">
        {/* NAME AND OWNERSHIP */}
        <div className="flex flex-row justify-between items-center">
          <div>
            <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse mt-2"></div>
            <h2 className="w-16 h-4 bg-gray-200 rounded-lg animate-pulse mt-2"></h2>
          </div>
          <div className="flex flex-row space-x-2">
            <div className="cursor-pointer border border-gray-200 p-2">
              <Share className="w-4 h-4" />
            </div>
            <div className="cursor-pointer border border-gray-200 p-2">
              <Heart className="w-4 h-4" />
            </div>
          </div>
        </div>
        {/* DESCRIPTION */}
        <p className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mt-2"></p>
        <p className="w-[70%] h-4 bg-gray-200 rounded-lg animate-pulse"></p>
        {/* ATTRIBUTES */}
        <div className="flex flex-row space-x-2">
          <div className="h-12 w-24 bg-gray-200 animate-pulse rounded-sm"></div>
          <div className="h-12 w-24 bg-gray-200 animate-pulse rounded-sm"></div>
        </div>
        <div className="w-full h-[1px] bg-gray-200 mb-6 mt-4" />
        {/* MINT INFO */}
        <div className="bg-black text-white px-2 py-1 text-xs font-thin inline-block w-fit">
          Free Mint
        </div>
        <div className="flex flex-row space-x-1 items-center">
          <img src="/eth.svg" alt="ethereum" className="w-4 h-4" />
          <p className="text-xl font-semibold">0 ETH</p>
        </div>
        <Button className="w-full py-2" onClick={() => {}}>
          Claim Now
        </Button>
        <Info />
      </div>
    </div>
  );
};
