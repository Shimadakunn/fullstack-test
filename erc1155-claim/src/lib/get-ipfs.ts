export const getIpfsUrl = (imageUri: string) => {
  if (imageUri.startsWith("ipfs://")) {
    const ipfsHash = imageUri.replace("ipfs://", "");
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }
  return imageUri;
};
