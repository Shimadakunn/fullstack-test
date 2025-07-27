import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import Button from "./ui/button";

export default function Header() {
  const navigate = useNavigate();
  const {
    connectors,
    connect,
    isSuccess: isConnected,
    error: connectError,
  } = useConnect();
  const {
    disconnect,
    isSuccess: isDisconnected,
    error: disconnectError,
  } = useDisconnect();
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address,
    unit: "ether",
  });

  useEffect(() => {
    if (isConnected) toast.success("Connected");
    if (connectError) toast.error("Error connecting");
  }, [isConnected, connectError]);

  useEffect(() => {
    if (isDisconnected) toast.error("Disconnected");
    if (disconnectError) toast.error("Error disconnecting");
  }, [isDisconnected, disconnectError]);

  return (
    <div className="p-4 flex flex-row justify-between items-center">
      <img
        src="/vite.svg"
        alt="logo"
        className="w-20 cursor-pointer"
        onClick={() => {
          navigate("/");
        }}
      />

      {address ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-semibold text-gray-500 px-2 py-1">
            {balance?.formatted ? Number(balance.formatted).toFixed(2) : ""}{" "}
            {balance?.symbol}
          </div>
          <div className="text-sm border border-black px-2 py-1">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <Button
            onClick={() => {
              disconnect();
            }}
            className="px-5 py-1 bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-red-500"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => {
            connect({ connector: connectors[0] });
          }}
          className="px-5 py-1"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
}
