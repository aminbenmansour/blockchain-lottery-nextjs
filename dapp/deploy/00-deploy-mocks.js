const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const GAS_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9

module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (chainId == 31337) {
        log("Local network detected! deploying mocks ...")
        
        args = [GAS_FEE, GAS_PRICE_LINK]
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args,
            log: true
        })
    
        log("Mocks deployed !")
        log("------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]

