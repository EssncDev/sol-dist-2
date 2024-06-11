const { Transaction, PublicKey, SystemProgram } =  require("@solana/web3.js");

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
}

module.exports={TrxClient}