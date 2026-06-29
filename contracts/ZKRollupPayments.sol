// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IZKVerifier.sol";

contract ZKRollupPayments is Ownable {
    IZKVerifier public verifier;
    
    bytes32 public stateRoot;
    uint256 public batchCount;
    
    mapping(address => bool) public relayers;
    mapping(address => uint256) public pendingDeposits;

    event Deposited(address indexed user, uint256 amount);
    event BatchCommitted(uint256 indexed batchId, bytes32 newStateRoot, bytes32 batchHash);
    event Withdrawn(address indexed user, uint256 amount);
    event RelayerAdded(address indexed relayer);
    event RelayerRemoved(address indexed relayer);

    modifier onlyRelayer() {
        require(relayers[msg.sender], "Not a relayer");
        _;
    }

    constructor(address _verifier, address initialOwner) Ownable(initialOwner) {
        require(_verifier != address(0), "Invalid verifier address");
        verifier = IZKVerifier(_verifier);
        stateRoot = bytes32(0);
    }

    function addRelayer(address _relayer) external onlyOwner {
        relayers[_relayer] = true;
        emit RelayerAdded(_relayer);
    }

    function removeRelayer(address _relayer) external onlyOwner {
        relayers[_relayer] = false;
        emit RelayerRemoved(_relayer);
    }

    function isRelayer(address _relayer) external view returns (bool) {
        return relayers[_relayer];
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be > 0");
        pendingDeposits[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function commitBatch(
        bytes32 _oldStateRoot,
        bytes32 _newStateRoot,
        bytes32 _batchHash,
        bytes memory _proof,
        uint256[] memory _publicInputs
    ) external onlyRelayer {
        require(stateRoot == _oldStateRoot, "Invalid old state root");
        
        // In a real system, the public inputs would likely include the old/new roots and batch hash.
        require(verifier.verifyProof(_proof, _publicInputs), "Invalid proof");

        stateRoot = _newStateRoot;
        batchCount++;

        emit BatchCommitted(batchCount, _newStateRoot, _batchHash);
    }

    function withdraw(uint256 _amount, bytes memory _proof, uint256[] memory _publicInputs) external {
        // In a real ZK-Rollup, a withdrawal requires proving that the current stateRoot 
        // contains the user's balance and they are reducing it by _amount.
        require(verifier.verifyProof(_proof, _publicInputs), "Invalid withdrawal proof");
        
        // This is a simplified stub. A real implementation would verify the merkle proof 
        // of the user's balance in the L2 state, and update a local nullifier or equivalent.
        
        // Send ETH back
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, _amount);
    }
}
