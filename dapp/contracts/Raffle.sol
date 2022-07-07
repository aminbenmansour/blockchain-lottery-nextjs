// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

error Raffle__NotEnoughEthEntered();

contract Raffle {

    uint256 private immutable entranceFee;
    address payable[] private players;

    event RaffleEnter(address indexed player);
    constructor(uint256 _entranceFee) {
        entranceFee = _entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < entranceFee) {
            revert Raffle__NotEnoughEthEntered();
        }

        players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function pickRandomWinner() public returns(address) {
        
    }

    function getEntranceFee() public view returns (uint256) {
        return entranceFee;
    }

    function getPlayer(uint256 _index) public view returns (address) {
        return players[_index];
    }
    
}