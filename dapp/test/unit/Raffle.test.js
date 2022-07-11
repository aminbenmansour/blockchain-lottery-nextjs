const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", async () => {
        let chainId = network.config.chainId
        let raffle, vrfCoordinatorV2Mock, deployer, raffleEntranceFee

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])

            raffle = await ethers.getContract("Raffle", deployer)
            raffleEntranceFee = raffle.getEntranceFee()

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

        describe("enterRaffle", async () => {
            it("reverts when you don't pay enough", async () => {
                await expect(raffle.enterRaffle()).to.be.revertedWith(
                    "Raffle__NotEnoughEthEntered"
                )

            })
            it("records players when they enter", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })

                const playerFromContract = await raffle.getPlayer(0)
                assert.equal(playerFromContract, deployer)
            })
        })
    })