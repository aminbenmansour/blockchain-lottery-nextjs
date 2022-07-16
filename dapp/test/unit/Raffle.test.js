const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", async () => {
        let chainId = network.config.chainId
        let raffle, vrfCoordinatorV2Mock, deployer, raffleEntranceFee, interval

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])

            raffle = await ethers.getContract("Raffle", deployer)
            raffleEntranceFee = raffle.getEntranceFee()
            interval = await raffle.getInterval()

            vrfCoordinatorV2Mock = ethers.getContract("VRFCoordinatorV2Mock", deployer)
        })

        describe("constructor", () => {
            it("initializes the raffle correctly", async () => {
                const raffleState = await raffle.getRaffleState()

                assert.equal(raffleState.toString(), "0")
                assert.equal(interval.toString(), networkConfig[chainId]["interval"])
            })
        })

        describe("enterRaffle", () => {
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

            it("emits event on enter", async () => {
                await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(raffle, "RaffleEnter")
            })

            it("doesn't allow entrance when raffle is calculating", async () => {
                await raffle.enterRaffle( {value: raffleEntranceFee} )
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                // await network.provider.request({method: "evm_mine"}, params: [])

                // checkUpkeep gives true, we can call performUpkeep
                await raffle.performUpkeep([])
                await expect(raffle.enterRaffle( {value: raffleEntranceFee} )).to.be.revertedWith("Raffle__NotOpen")
            })
        })

        describe("checkUpkeep", () => {
            it("returns false if people haven't sent any ETH", async () => {
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])

                // callStatic return read-only value instead of a transaction (similar to 'view' modifier)
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                assert(!upkeepNeeded)
            })

            it("returns false if raffle is not open", async () => {
                await raffle.enterRaffle( {value: raffleEntranceFee} )

                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])

                await raffle.performUpkeep([])
                const raffleState = await raffle.getRaffleState()
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])

                assert.equal(raffleState.toString(), "1")
                assert.equal(upkeepNeeded, false)
            })

            it("returns false if enough time hasn't passed", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(!upkeepNeeded)
            })
            it("returns true if enough time has passed, has players, eth, and is open", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(upkeepNeeded)
            })

            describe("performUpkeep", () => {
                it("can only run if checkupkeep is true", async () => {
                    await raffle.enterRaffle({ value: raffleEntranceFee })
                    await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                    await network.provider.request({ method: "evm_mine", params: [] })
                    const tx = await raffle.performUpkeep("0x") 
                    assert(tx)
                })
                it("reverts if checkup is false", async () => {
                    await expect(raffle.performUpkeep("0x")).to.be.revertedWith( 
                        "Raffle__UpkeepNotNeeded"
                    )
                })

                it("updates the raffle state and emits a requestId", async () => {
                    // Too many asserts in this test!
                    await raffle.enterRaffle({ value: raffleEntranceFee })
                    await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                    await network.provider.request({ method: "evm_mine", params: [] })
                    const txResponse = await raffle.performUpkeep("0x") // emits requestId
                    const txReceipt = await txResponse.wait(1) // waits 1 block
                    const raffleState = await raffle.getRaffleState() // updates state
                    const requestId = txReceipt.events[1].args.requestId
                    assert(requestId.toNumber() > 0)
                    assert(raffleState == 1) // 0 = open, 1 = calculating
                })
            })
           
        })

        describe("fulfillRandomWords", () => {
            beforeEach(async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
            })

            // reverting for fake requestIds
            it("only be called after performUpkeep", async () => {
                await expect(
                    vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address) // reverts if not fulfilled
                ).to.be.revertedWith("nonexistent request")

                await expect(
                    vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address) // reverts if not fulfilled
                ).to.be.revertedWith("nonexistent request")
            })

            it("picks a winner, resets the lottery and sends money", async () => {
                const additionalEntrances = 3
                const startingIndex = 1 // deployer = 0
                const accounts = await ethers.getSigners()


                for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) {
                    raffle = raffle.connect(accounts[i])
                    await raffle.enterRaffle({ value: raffleEntranceFee })
                }

                const startingTimeStamp = await raffle.getLatestTimeStamp()
                
                await new Promise(async (resolve, reject) => {
                    raffle.once("WinnerPicked", async () => {
                        try {
                            const recentWinner = await raffle.getRecentWinner()
                            const raffleState = await raffle.getRaffleState()
                            const winnerBalance = await accounts[2].getBalance()
                            const endingTimeStamp = await raffle.getLastTimeStamp()
                            await expect(raffle.getPlayer(0)).to.be.reverted

                            assert.equal(recentWinner.toString(), accounts[2].address)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerBalance.toString(), 
                                  startingBalance // startingBalance + ( (raffleEntranceFee * additionalEntrances) + raffleEntranceFee )
                                      .add(
                                          raffleEntranceFee
                                              .mul(additionalEntrances)
                                              .add(raffleEntranceFee)
                                      )
                                      .toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                        } catch (error) {
                            reject(error)
                        }

                        resolve()
                    })

                    const tx = await raffle.performUpkeep("0x")
                    const txReceipt = await tx.wait(1)
                    const startingBalance = await accounts[2].getBalance()
                    await vrfCoordinatorV2Mock.fulfillRandomWords(
                        txReceipt.events[1].args.requestId,
                        raffle.address
                    )
                })
            
            })
        })
    })