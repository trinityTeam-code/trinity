def claim_tokens():
    try:
        data = request.get_json()
        if not all(key in data for key in ("wallet","solanaWallet", "amount", "name")):
            return jsonify({"error": "wallet, amount, and name fields are required"}), 400

        recipient_wallet = data["wallet"]
        sol_recipient_wallet= data["solanaWallet"]
        amount = float(data["amount"])
        token_name = data["name"]

     
        tokens_collection = db["deployed"]
        token_data = tokens_collection.find_one({"TokenDynName": token_name})
        if not token_data or "TokenDynMint" not in token_data:
            return jsonify({"error": f"Token '{token_name}' not found or missing tokenDynMint"}), 404

   
        try:
            recipient_wallet_bytes = base58.b58decode(sol_recipient_wallet)
            recipient_pubkey = Pubkey(recipient_wallet_bytes)
            print("Recipient Wallet (Base58):", recipient_wallet)
            print("Recipient Pubkey:", recipient_pubkey)
        except Exception as e:
            return jsonify({"error": f"Invalid recipient wallet address: {e}"}), 400

     
        try:
            mint_address_bytes = base58.b58decode(token_data["TokenDynMint"])
            mint_address = Pubkey(mint_address_bytes)
            print("Mint Address (Base58):", token_data["TokenDynMint"])
            print("Mint Address:", mint_address)
        except Exception as e:
            return jsonify({"error": f"Invalid mint address: {e}"}), 400
     
        recipient_token_account = get_associated_token_address(
            owner=recipient_pubkey,
            mint=mint_address
        )
     
        response = solana_client.get_token_accounts_by_owner(
            recipient_pubkey,
            TokenAccountOpts(mint=mint_address)
        )

        transaction = Transaction()

        if response.value:
            print("ATA esistente:", response.value[0].pubkey)
        else:
            print("ATA non trovato. Creazione in corso...")
            transaction.add(
                create_associated_token_account(
                    payer=payer.pubkey(),
                    owner=recipient_pubkey,
                    mint=mint_address
                )
            )

    
        print("Recipient ATA Info:", solana_client.get_account_info(recipient_token_account))
        source_token_account = get_associated_token_address(
            owner=payer.pubkey(),
            mint=mint_address
        )
     
        decimals = token_data.get("decimals", 6)
        lamports = int(amount * (10**decimals))
      
        transaction.add(
            transfer_checked(
                TransferCheckedParams(
                    program_id=TOKEN_PROGRAM_ID,
                    source=source_token_account,
                    dest=recipient_token_account,
                    owner=payer.pubkey(),
                    mint=mint_address,
                    amount=lamports,
                    decimals=decimals,
                )
            )
        )

  
        blockhash_response = solana_client.get_latest_blockhash()
        transaction.recent_blockhash = blockhash_response.value.blockhash

  
        transaction.sign(payer)
        serialized_txn = transaction.serialize()

        response = solana_client.send_raw_transaction(serialized_txn)

        return jsonify({"success": True }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
