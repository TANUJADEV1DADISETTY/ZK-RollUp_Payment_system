// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IZKVerifier {
    /**
     * @dev Verifies a zero-knowledge proof.
     * @param _proof The zk-SNARK/STARK proof bytes.
     * @param _publicInputs The public inputs for the circuit.
     * @return True if the proof is valid, false otherwise.
     */
    function verifyProof(bytes memory _proof, uint256[] memory _publicInputs) external view returns (bool);
}
