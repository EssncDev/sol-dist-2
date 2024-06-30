const { PublicKey, Connection } = require('@solana/web3.js');
const { getMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, createAssociatedTokenAccountInstruction } = require('@solana/spl-token');

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=388777d1-d2d7-4689-aa8f-1914a3e0c159');

const main = async() => {
    const tokenAddress = new PublicKey('yso11zxLbHA3wBJ9HAtVu6wnesqz9A2qxnhxanasZ4N');
    const owner = new PublicKey("BgQpjJuzYZGeiBhGuGHKFiFFNq6dJDfhCW6BsGwzWaSt");
    const returnJson = {}

    const mintInfo = await getMint(connection, tokenAddress);

    if (!mintInfo) {
        return
    }

    returnJson['wallet'] = owner.toString();
    returnJson['tokenAddress'] = mintInfo.address.toString();
    returnJson['decimals'] = mintInfo.decimals;
    returnJson['supply'] = mintInfo.supply;

    const ataAddress = await getAssociatedTokenAddress(tokenAddress, owner);
    console.log(ataAddress, '\n');
    returnJson['ataAddress'] = ataAddress.toString();

    const parsedAccInfo = await connection.getParsedAccountInfo(ataAddress);

    if (!parsedAccInfo?.value) {
        console.log('ATA not created!');
        return
    }

    const ataInfo = await getOrCreateAssociatedTokenAccount(
        connection,
        owner,
        tokenAddress,
        owner
    )
    returnJson['amount'] = ataInfo.amount;
    returnJson['frozen'] = ataInfo.isFrozen;

    console.log(returnJson);
}


(() => {
    const sender = new PublicKey('DLNJTvToDXvNcEyyqTgQKV7KJ2L9Kqk6FJkM1UoGNvfq');
    const receiverAta = new PublicKey('6Na1hjHnfkx7nGiyDxQMwQA6rUFYMuhrJD2Qouxjjgd5');
    const receiver = new PublicKey("BgQpjJuzYZGeiBhGuGHKFiFFNq6dJDfhCW6BsGwzWaSt");
    const tokenAddress = new PublicKey('yso11zxLbHA3wBJ9HAtVu6wnesqz9A2qxnhxanasZ4N');

    const instruction = createAssociatedTokenAccountInstruction(
        sender,
        receiverAta,
        receiver,
        tokenAddress
    );
    console.log(instruction)
})()

//main()