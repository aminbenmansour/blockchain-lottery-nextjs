const { network } = require("hardhat")
const { developmentChains} = require("../helper-hardhat-config")

const GAS_FEE = ethers.utils.parse("0.25")
const GAS_PRICE_LINK = 1e9

module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy, logs } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
}

if (developmentChains.includes(network.name)) {
    log("Local network detected! deploying mocks ...")
    
    args = [GAS_FEE, GAS_PRICE_LINK]
    await deploy("VRFCoordinatorV2", {
        from: deployer,
        args: args,
        log: true
    })

    log("Mocks deployed !")
    log("------------------------------------------")
}

module.exports.tags = ["all", "mocks"]

