import Button from "./ui/button";
import { BadgeCheck, Twitter, Instagram, ArrowUpRight } from "lucide-react";

export const Info = () => {
  return (
    <div className="border border-gray-200 p-6 my-auto">
      {/* LOGO AND NAME */}
      <div className="flex flex-row space-x-2 items-center">
        {/* LOGO */}
        <div className="relative">
          <img
            src="/vite.svg"
            alt="kiln"
            className="rounded-full overflow-hidden border border-gray-200 w-16 aspect-square"
          />
          <BadgeCheck
            className="absolute bottom-0 right-0 text-white"
            fill="black"
            color="white"
            size={24}
          />
        </div>
        {/* NAME AND USERNAME */}
        <div className="flex flex-col items-start">
          <p className="text-lg font-semibold">KILN</p>
          <p className="text-sm text-gray-500 font-light">@Kiln</p>
        </div>
      </div>
      {/* DESCRIPTION */}
      <p className="text-sm text-gray-500 font-light mt-4">
        Hundreds of companies use Kiln to earn rewards on their digital assets,
        or to whitelabel earning functionality into their products.
      </p>
      {/* SOCIALS */}
      <div className="flex flex-row space-x-2 items-center mt-4">
        <div className="flex flex-row space-x-1 items-center">
          <Twitter size={20} fill="black" />
          <p className="text-sm font-semibold">@Kiln</p>
        </div>
        <div className="flex flex-row space-x-1 items-center">
          <Instagram size={20} fill="black" color="white" />
          <p className="text-sm font-semibold">@Kiln</p>
        </div>
      </div>
      {/* WEBSITE */}
      <div className="flex flex-row space-x-2 items-center mt-4">
        <Button
          className="w-full py-2"
          onClick={() => {
            window.open("https://kiln.fi", "_blank");
          }}
        >
          Website
        </Button>
        <div
          className="border border-gray-200 p-2 cursor-pointer"
          onClick={() => {
            window.open("https://kiln.fi", "_blank");
          }}
        >
          <ArrowUpRight size={24} />
        </div>
      </div>
    </div>
  );
};
