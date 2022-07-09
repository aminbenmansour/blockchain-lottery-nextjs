// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

error Raffle__NotEnoughEthEntered();
error Raffle__TransferFailed();

contract Raffle is VRFConsumerBaseV2 {

    uint256 private immutable entranceFee;
    address payable[] private players;
    VRFCoordinatorV2Interface private immutable vrfCoordinator;

    bytes32 private immutable gasLane; // limit per gas unit
    uint64 private immutable subscriptionId;
    uint32 private immutable callbackGasLimit; // limit gas price for fulfillRandomWords
    uint16 private constant REQUEST_CONFIRMATIONS = 3; // blocks to wait for
    uint32 private constant NUM_WORDS = 1; // number of requested random numbers
    address private recentWinner;

    event RaffleEnter(address indexed player);
    event RequestRandomWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(address _vrfCoordinatorV2,
                uint256 _entranceFee,
                bytes32 _gasLane,
                uint64 _subscriptionId,
                uint32 _callbackGasLimit
    ) VRFConsumerBaseV2(_vrfCoordinatorV2) {
        entranceFee = _entranceFee;

        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinatorV2);
        gasLane = _gasLane;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
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
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            callbackGasLimit,
            NUM_WORDS
        );

        emit RequestRandomWinner(requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 indexOfWinner = randomWords[0] % players.length;
        address payable winner = players[indexOfWinner];
        recentWinner = winner;

        (bool success, ) = winner.call{ value: address(this).balance }("");

        if (!success) {
            revert Raffle__TransferFailed();
        }

        emit WinnerPicked(winner);
    }

    function getEntranceFee() public view returns (uint256) {
        return entranceFee;
    }

    function getPlayer(uint256 _index) public view returns (address) {
        return players[_index];
    }

    function getRecentWinner() public view returns (address) {
        return recentWinner;
    }

}
