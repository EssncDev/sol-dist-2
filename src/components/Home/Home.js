import React from 'react'
import './Home.css';
import Header from '../Header/Header.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import toast, { Toaster } from 'react-hot-toast';

const notifyWaiting = () => toast.loading('Waiting...',{
  duration: 4000,
  position: 'bottom-left',
});
const notifySuccess = (text) => toast.success(text, {
  duration: 4000,
  position: 'bottom-left',
});
const notifyError = (text) => toast.error(text, {
  duration: 4000,
  position: 'bottom-left',
});

function HomeContent() {

  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const requestBuffer = async(amount) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("amount", amount * 1e9);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    fetch(`http://127.0.0.1:3099/createBuffer`, requestOptions)
        .then(async(r) => {
          const res = await r.json();
          return res.data;
        })
        .catch((error) => notifyError(error));
  }

  const sendRequest = async (recipient, amount) => {
    const { blockhash } = await connection.getLatestBlockhash();
    let trx = new Transaction({
      "feePayer": publicKey,
      "recentBlockhash": blockhash
    }).add(
      new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: recipient, isSigner: false, isWritable: true }
        ],
        programId: SystemProgram.programId, // System program
        data: await requestBuffer(amount) // Empty data field
      })
    )
    trx = await signTransaction(trx);
    if (trx.signatures.length > 0) {
      console.log(trx)
      notifySuccess(`Transaction signed!`)
      var waitingToast = notifyWaiting()
    }
    const signature = trx.signature;
    await connection.confirmTransaction(signature, "processed");
    toast.dismiss(waitingToast);
    notifySuccess(`Transaction send!`)
  }

  return (
    <div id="homeContent">
      <button onClick={() => (sendRequest('DoNdEgu9115aCCgY74iSzVeX2XHXe9uMovgPSGDwT65c', 0.0005))}>Test</button>
    </div>
  )
}

function Home() {
  return (
    <div className="Home">
      <div>
        <Header />
        <HomeContent />
      </div>
      <Toaster />
    </div>
  );
}

export default Home;
