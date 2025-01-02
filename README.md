# Memetoken Deployment and Distribution on Solana

This repository is dedicated to explaining and providing practical examples of how this project handles the deployment and distribution of **Memetokens** on the Solana blockchain. Code examples can be found in the `example` directory and are referenced below.

## Overview

The project includes two primary functionalities:

1. **Deployment of Memetokens on Solana**.
2. **Claiming tokens through the dApp**.

### 1. Deployment of Memetokens on Solana

After generating an image using an AI pipeline, the image is saved with a name related to its content. The deployment process is triggered automatically and involves the following steps:

1. **Metadata Preparation**: The deployment code retrieves the image and its name, composing the metadata to be sent to Jito.
2. **Metadata Submission**: The metadata is submitted to Jito, and upon successful submission:
   - **Token Deployment**: The token is deployed on the Solana blockchain using Jito, allocating **5M tokens** to the deployer's wallet. 
   - Deployment fees are covered by a project-owned wallet funded through fees collected from the **Trinity token** on Ethereum.
3. **Holder Data Collection**: The process reads the holders of the Trinity token on Ethereum and saves this data in the database for further use.
4. **DApp Integration**: Once deployed, the token is immediately available on the dApp.

Code examples:
- Metadata preparation and deployment: See `example/deploy.js`.
- Holder data collection: See `example/read_holders.js`.

---

### 2. Claiming Tokens

Token claiming is facilitated through the dApp by following these steps:

1. **Connect Wallet**: The user connects their wallet holding Trinity tokens on Ethereum.
2. **Claimable Tokens**: The dApp displays the list of Memetokens available for claim.
3. **Claim Process**:
   - The user enters a Solana wallet address and initiates the claim.
   - The backend executes the fund transfer to the specified Solana wallet.
   - On successful transfer, the database is updated to reflect the claim.
   - Fees for the transfer are paid by the project wallet funded through Trinity token fees.

Code examples:
- Token claiming backend logic: See `example/token_claim.py`.
- Database update logic: See `example/update_database.py`.

---

## Example Code

All example scripts and relevant resources can be found in the [`example`](./example) directory.

## Contributing

Contributions are welcome! Please ensure you follow the repository's coding standards and open a pull request for any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
