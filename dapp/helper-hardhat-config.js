const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        // entranceFee: ethers.utils.parseEther("0.04"), // BigNumber
        entranceFee: "400000000000000000", // 0.4 ETH
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "0",
        callBackGasLimit: "500000",
        interval: "30", // 30 seconds
    },
    31337: {
        name: "hardhat",
        entranceFee: "100000000000000000", // 0.1 ETH
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // Type whatever
        callbackGasLimit: "500000",
        interval: "30",
    }
}

const developmentChains = ["hardhat", "localhost"]


module.exports = {
    networkConfig,
    developmentChains
}