        wallets_collection = db["holders"]
        update_result = wallets_collection.update_one(
            {"WalletAddress": recipient_wallet},  
            {"$unset": {f"Claimable.{token_name}": ""}}  
        )

        if update_result.modified_count == 0:
            print("Warning: No fields updated. Either the record doesn't exist or the field was already removed.")
        else:
            print(f"Field '{token_name}' successfully removed from 'Claimable' for wallet {recipient_wallet}.")
