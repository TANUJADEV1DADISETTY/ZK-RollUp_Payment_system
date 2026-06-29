// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IZKVerifier.sol";

contract StubZKVerifier is IZKVerifier {
    /**
     * @dev A stub implementation that always returns true for validly formatted (non-empty) proofs.
     */
    function verifyProof(bytes memory _proof, uint256[] memory /*_publicInputs*/) external pure override returns (bool) {
        // Just require that the proof is not totally empty to simulate some basic check.
        return _proof.length > 0;
    }
}
