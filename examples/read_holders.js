async function calculateAndSave(tokenContractAddress, tokenDynName, tokenDynURI, tokenDynMint) {
  try {
    const response = await axios.get(`https://api.etherscan.io/api`, {
      params: {
        module: 'token',
        action: 'tokenholderlist',
        contractaddress: tokenContractAddress,
        page: 1,
        offset: 1000, 
        apikey: ETHERSCAN_API_KEY,
      },
    });

    const holders = response.data.result;

    if (!holders || holders.length === 0) {
      throw new Error("No holders found or invalid response from Etherscan");
    }


    const totalSupply = ;  //totalsupply

    if (!totalSupply || totalSupply === 0) {
      throw new Error("Supply error");
    }

    const claimers = {};
    const filteredAccounts = holders
      .map((holder) => {
        const owner = holder.TokenHolderAddress;
        const balance = parseFloat(holder.TokenHolderQuantity);

        if (!owner || isNaN(balance)) {
          console.warn(`wrong data: Owner: ${owner}, Balance: ${balance}`);
          return null;
        }
        return { owner, balance };
      })
      .filter((acc) => acc && acc.balance > //min balance);


    filteredAccounts.forEach((acc) => {
      const allocation = (acc.balance / totalSupply)  * 50000000;  //claim allocation for every user
      const roundedAllocation = parseFloat(percentage.toFixed(5));

      claimers[acc.owner] = roundedAllocation;
      
    });

    await mongoClient.connect();
    const db = mongoClient.db("DB");

    const tokenCollection = db.collection("deployed");
    await tokenCollection.insertOne({
      TokenDynName: tokenDynName,
      TokenDynURI: tokenDynURI,
      TokenDynMint: tokenDynMint,
      TotalHolders: filteredAccounts.length,
    });

    const walletCollection = db.collection("holders");
    for (const [walletAddress, allocation] of Object.entries(claimers)) {
      const result = await walletCollection.updateOne(
        { WalletAddress: walletAddress },
        {
          $setOnInsert: { WalletAddress: walletAddress },
          $set: { [`Claimable.${tokenDynAddress}`]: percentage },
        },
        { upsert: true }
      );
    }

    return { totalHolders: filteredAccounts.length, claimers };
  } catch (err) {
    console.error("Error saving or searching:", err.message);
    throw err;
  } finally {
    await mongoClient.close();
  }
}
