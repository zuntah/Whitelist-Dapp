//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist {

    uint8 public maxWhitelistedAddresses;

    mapping(address => bool) public whitelistedAddresses;

    uint8 public numAddressesWhitelisted;

    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    function addAddressToWhitelist() public {

        // Checks
        require(!whitelistedAddresses[msg.sender], "Sender is already on the whitelist");
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "Whitelist is full, sorry.");

        // Add sender to whitelist
        whitelistedAddresses[msg.sender] = true;

        // Incerement whitelist count
        numAddressesWhitelisted += 1;
    }

}