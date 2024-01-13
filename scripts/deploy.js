const hre = require("hardhat");

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarketplace = await NFTMarketplace.deploy();

  await nftMarketplace.waitForDeployment();

  console.log(
   `NFTMarketplace deployed to address: ${nftMarketplace.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
