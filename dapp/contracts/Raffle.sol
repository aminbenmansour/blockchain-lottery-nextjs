// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Raffle__NotEnoughEthEntered();
error Raffle__TransferFailed();
error Raffle__NotOpen();
error Raffle__UpkeppNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/** @title A sample Lottery contract
 *  @author Amine Ben Mansour
 *  @notice This contract is for creating untemperable decentralized smart contract
 *  @dev This implements Chainlink VRF v2 and Chainlink Keepers
 */
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    
    // Type declarations
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    // ChainLink Chains
    VRFCoordinatorV2Interface private immutable vrfCoordinator;

    // ChainLink VRF variables
    bytes32 private immutable gasLane; // limit per gas unit
    uint64 private immutable subscriptionId;
    uint32 private immutable callbackGasLimit; // limit gas price for fulfillRandomWords
    uint16 private constant REQUEST_CONFIRMATIONS = 3; // blocks to wait for
    uint32 private constant NUM_WORDS = 1; // number of requested random numbers
    
    // Lottery variables
    uint256 private lastTimestamp;
    uint256 private immutable entranceFee;
    address payable[] private players;
    address private recentWinner;
    uint256 private immutable interval;
    RaffleState private raffleState;

    // events
    event RaffleEnter(address indexed player);
    event RequestRandomWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(
        address _vrfCoordinatorV2,
        uint256 _entranceFee,
        bytes32 _gasLane,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit,
        uint256 _interval
    ) VRFConsumerBaseV2(_vrfCoordinatorV2) {
        entranceFee = _entranceFee;

        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinatorV2);
        gasLane = _gasLane;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
        raffleState = RaffleState.OPEN;

        lastTimestamp = block.timestamp;
        interval = _interval;
    }

    function enterRaffle() public payable {
        if (msg.value < entranceFee) {
            revert Raffle__NotEnoughEthEntered();
        }

        if (raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }

        players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev This is the function that the Chainlink Keeper ndes call
     * they look for the `UpkeepNeeded` to return true.
     * The following should be true:
     * 1. Our time interval should have passed
     * 2. The lottery should have at least one player and should have ETH
     * 3. The lottery should be in an "open" state
     * 4. Our subscription should be funded by LINK
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (raffleState == RaffleState.OPEN);
        bool timePassed = ((block.timestamp - lastTimestamp) > interval);
        bool hasPlayers = players.length != 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
    }

    function performUpkeep(bytes calldata /* performData */) external {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if(!upkeepNeeded) {
            revert Raffle__UpkeppNotNeeded(
                address(this).balance,
                players.length,
                uint256(raffleState)
            );
        }
        
        raffleState = RaffleState.CALCULATING;
        uint256 requestId = vrfCoordinator.requestRandomWords(
            gasLane,
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            callbackGasLimit,
            NUM_WORDS
        );

        emit RequestRandomWinner(requestId);
    }

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % players.length;
        address payable winner = players[indexOfWinner];
        recentWinner = winner;
        
        raffleState = RaffleState.OPEN;

        players = new address payable[](0);
        lastTimestamp = block.timestamp;

        (bool success, ) = winner.call{value: address(this).balance}("");

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

    function getRaffleState() public view returns (RaffleState) {
        return raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return block.timestamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return interval;
    }
}
