const { assert } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", async () => {
        let chainId = network.config.chainId
        let raffle, vrfCoordinatorV2Mock

        beforeEach(async () => {
            const { deployer } = await getNamedAccounts()
            await deployments.fixture(["all"])

            raffle = await ethers.getContract("Raffle", deployer)
            vrfCoordinatorV2Mock = ethers.getContract("VRFCoordinatorV2Mock", deployer)
        })

        describe("constructor", async () => {
            it("initializes the raffle correctly", async () => {
                const raffleState = await raffle.getRaffleState()
                const interval = await raffle.getInterval()

                assert.equal(raffleState.toString(), "0")
                assert.equal(interval.toString(), networkConfig[chainId]["interval"])
            })
        })
    })