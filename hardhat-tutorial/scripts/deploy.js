const hre = require("hardhat");

async function main() {
  
  const Whitelist = await hre.ethers.getContractFactory("Whitelist");
  const whitelist = await Whitelist.deploy(10);

  await whitelist.deployed();

  console.log("whitelist deployed to:", whitelist.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
