// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialRegistry {
    struct Credential {
        bytes32 hash;
        string ipfsCid;
        address issuer;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Credential) public credentials;
    mapping(address => bool) public registeredIssuers;
    address public owner;

    event CredentialIssued(string credentialId, bytes32 hash, string ipfsCid, address issuer, uint256 timestamp);
    event IssuerUpdated(address indexed issuer, bool isRegistered);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyIssuer() {
        require(registeredIssuers[msg.sender], "Only registered issuers can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerIssuer(address issuer) public onlyOwner {
        registeredIssuers[issuer] = true;
        emit IssuerUpdated(issuer, true);
    }

    function unregisterIssuer(address issuer) public onlyOwner {
        registeredIssuers[issuer] = false;
        emit IssuerUpdated(issuer, false);
    }

    function issueCredential(string memory credentialId, bytes32 hash, string memory ipfsCid) public onlyIssuer {
        require(!credentials[credentialId].exists, "Credential already exists");

        credentials[credentialId] = Credential({
            hash: hash,
            ipfsCid: ipfsCid,
            issuer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit CredentialIssued(credentialId, hash, ipfsCid, msg.sender, block.timestamp);
    }

    function verifyCredential(string memory credentialId) public view returns (bytes32 hash, string memory ipfsCid, address issuer, uint256 timestamp, bool exists) {
        Credential memory cred = credentials[credentialId];
        return (cred.hash, cred.ipfsCid, cred.issuer, cred.timestamp, cred.exists);
    }
}
