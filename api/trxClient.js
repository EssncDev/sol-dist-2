const { Transaction, PublicKey, SystemProgram } =  require("@solana/web3.js");
const { getMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');


class TrxClient {

    constructor(){}

    async buildSingleTransaction(sender, receiver, amountInLamports) {
        const senderPubKey = new PublicKey(sender);
        const receiverPubKey = new PublicKey(receiver);

        return SystemProgram.transfer({
                fromPubkey: senderPubKey,
                toPubkey: receiverPubKey,
                lamports: amountInLamports * 10 ** 9
            })
    }


    async buildBundleTransaction(sender, receiverArray) {
        const trx = new Transaction();

        for (const index in receiverArray) {
            const receiverBlob = receiverArray[index];
            trx.add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(sender),
                    toPubkey: new PublicKey(receiverBlob.publicKey),
                    lamports: receiverBlob.amountInLamports * LAMPORTS_PER_SOL
                })
            )
        }
    }

    async getAssociatedTokenInfo(connection, walletAddressString, tokenAddressString) {
        const walletAddress = new PublicKey(walletAddressString);
        const tokenAddress = new PublicKey(tokenAddressString);

        const mintInfo = await getMint(connection, tokenAddress);
        if (!mintInfo) {
            return false;
        }

        const ataAddress = await getAssociatedTokenAddress(tokenAddress, walletAddress)
        if (!ataAddress) {
            return false;
        }
        const ataInfo = await getOrCreateAssociatedTokenAccount(
            connection,
            walletAddress,
            tokenAddress,
            walletAddress
        )
        if (!ataInfo) {
            return false;
        }

        return {
            wallet:  walletAddress.toString(),
            tokenAddress: mintInfo.address.toString(),
            decimals: Number(mintInfo.decimals),
            supply: Number(mintInfo.supply),
            ataAddress: ataAddress.toString(),
            amount: Number(ataInfo.amount),
            frozen: ataInfo.isFrozen
        }
    }
}

module.exports={TrxClient}