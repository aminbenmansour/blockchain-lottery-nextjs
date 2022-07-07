// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/VRFCoordinatorV2Interface.sol";

error Raffle__NotEnoughEthEntered();

contract Raffle is VRFConsumerBaseV2 {

    uint256 private immutable entranceFee;
    address payable[] private players;
    VRFCoordinatorV2Interface private immutable vrfCoordinator;

    bytes32 private immutable gasLane // limit per gas unit
    uint64 private immutable subscriptionId;
    uint32 private immutable callbackGasLimit; // limit gas price for fulfillRandomWords
    uint16 private constant REQUEST_CONFIRMATIONS = 3; // blocks to wait for
    uint32 private constant NUM_WORDS = 1; // number of requested random numbers

    event RaffleEnter(address indexed player);

    constructor(address _vrfCoordinatorV2,
                uint256 _entranceFee,
                bytes32 _gasLane,
                uint64 _subscriptionId,
                uint32 _callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        entranceFee = _entranceFee;
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        gasLane = _gasLane;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit
    }

    function enterRaffle() public payable {
        if (msg.value < entranceFee) {
            revert Raffle__NotEnoughEthEntered();
        }

        players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function requestRandomWinner() external {
        uint256 requestId = vrfCoordinator.requestRandomWords(
            gasLane,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {}

    function getEntranceFee() public view returns (uint256) {
        return entranceFee;
    }

    function getPlayer(uint256 _index) public view returns (address) {
        return players[_index];
    }

}
