const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialRegistry", function () {
  let credentialRegistry;
  let owner;
  let issuer;
  let otherAccount;

  beforeEach(async function () {
    [owner, issuer, otherAccount] = await ethers.getSigners();
    const CredentialRegistry = await ethers.getContractFactory(
      "CredentialRegistry",
    );
    credentialRegistry = await CredentialRegistry.deploy();
  });

  it("Should deploy and set owner", async function () {
    expect(await credentialRegistry.owner()).to.equal(owner.address);
  });

  it("Should register issuer", async function () {
    await credentialRegistry.registerIssuer(issuer.address);
    expect(await credentialRegistry.registeredIssuers(issuer.address)).to.be
      .true;
  });

  it("Should issue credential", async function () {
    await credentialRegistry.registerIssuer(issuer.address);
    const hash = ethers.keccak256(ethers.toUtf8Bytes("test data"));
    const ipfsCid = "QmTest";

    await expect(
      credentialRegistry
        .connect(issuer)
        .issueCredential("cred1", hash, ipfsCid),
    )
      .to.emit(credentialRegistry, "CredentialIssued")
      .withArgs(
        "cred1",
        hash,
        ipfsCid,
        issuer.address,
        (timestamp) => timestamp > 0,
      );
  });

  it("Should reject unregistered issuer", async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("test data"));
    const ipfsCid = "QmTest";

    await expect(
      credentialRegistry
        .connect(otherAccount)
        .issueCredential("cred1", hash, ipfsCid),
    ).to.be.revertedWith("Only registered issuers can call this");
  });

  it("Should allow owner to unregister issuer", async function () {
    await credentialRegistry.registerIssuer(issuer.address);
    expect(await credentialRegistry.registeredIssuers(issuer.address)).to.be
      .true;

    await credentialRegistry.unregisterIssuer(issuer.address);
    expect(await credentialRegistry.registeredIssuers(issuer.address)).to.be
      .false;
  });

  it("Should verify credential", async function () {
    await credentialRegistry.registerIssuer(issuer.address);
    const hash = ethers.keccak256(ethers.toUtf8Bytes("test data"));
    const ipfsCid = "QmTest";

    await credentialRegistry
      .connect(issuer)
      .issueCredential("cred1", hash, ipfsCid);

    const cred = await credentialRegistry.verifyCredential("cred1");
    expect(cred.hash).to.equal(hash);
    expect(cred.ipfsCid).to.equal(ipfsCid);
    expect(cred.issuer).to.equal(issuer.address);
    expect(cred.exists).to.be.true;
  });

  it("Should reject duplicate credential", async function () {
    await credentialRegistry.registerIssuer(issuer.address);
    const hash = ethers.keccak256(ethers.toUtf8Bytes("test data"));
    const ipfsCid = "QmTest";

    await credentialRegistry
      .connect(issuer)
      .issueCredential("cred1", hash, ipfsCid);

    await expect(
      credentialRegistry
        .connect(issuer)
        .issueCredential("cred1", hash, ipfsCid),
    ).to.be.revertedWith("Credential already exists");
  });
});
