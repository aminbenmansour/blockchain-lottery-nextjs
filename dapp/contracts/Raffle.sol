// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error Raffle__NotEnoughEthEntered();

contract Raffle is VRFConsumerBaseV2 {

    uint256 private immutable entranceFee;
    address payable[] private players;

    event RaffleEnter(address indexed player);


    constructor(address vrfCoordinatorV2, uint256 _entranceFee) VRFConsumerBaseV2(vrfCoordinatorV2) {
        entranceFee = _entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < entranceFee) {
            revert Raffle__NotEnoughEthEntered();
        }

        players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function requestRandomWinner() external returns(address) {
        
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        
    }

    function getEntranceFee() public view returns (uint256) {
        return entranceFee;
    }

    function getPlayer(uint256 _index) public view returns (address) {
        return players[_index];
    }
    
}