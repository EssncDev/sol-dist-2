const { PublicKey, Connection } = require('@solana/web3.js');
const { getMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');


const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=388777d1-d2d7-4689-aa8f-1914a3e0c159');


const main = async() => {
    const tokenAddress = new PublicKey('yso11zxLbHA3wBJ9HAtVu6wnesqz9A2qxnhxanasZ4N');
    const owner = new PublicKey("5VQLUSs6DsH6Yr7EWpetS7MbFzMUBzenekVLioh34EJh");
    const returnJson = {}

    const mintInfo = await getMint(connection, tokenAddress);

    if (!mintInfo) {
        return
    }

    returnJson['wallet'] = owner.toString();
    returnJson['tokenAddress'] = mintInfo.address.toString();
    returnJson['decimals'] = mintInfo.decimals;
    returnJson['supply'] = mintInfo.supply;

    const ataAddress = await getAssociatedTokenAddress(tokenAddress, owner)
    returnJson['ataAddress'] = ataAddress.toString();

    const ataInfo = await getOrCreateAssociatedTokenAccount(
        connection,
        owner,
        tokenAddress,
        owner
    )
    returnJson['amount'] = ataInfo.amount;
    returnJson['frozen'] = ataInfo.isFrozen;

    console.log(returnJson)
}

main()