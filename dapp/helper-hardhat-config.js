const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: rinkeby,
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        entranceFee: ethers.utils.parseEther("0.04"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x00" // Type whatever
    }
}

const developmentChains = ["hardhat", "localhost"]


module.exports = {
    networkConfig,
    developmentChains
}