import React, { useState } from 'react';
import ReactDOM from 'react-dom';
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

  const [formCounter, setFormCounter] = useState(1);
  const [tokenData, setTokenData] = useState({});
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const requestTokenData = () => {

    const TokenDataComponent = ({ tokenData }) => {
      return (
        <div className='tokenData-box'>
          <div>
            <p>{`${tokenData.tokenAddress}...`}</p>
          </div>
          <div>
            <p>Decimals: {tokenData.decimals}</p>
            <p>Amount: {(tokenData.amount / Math.pow(10, tokenData.decimals)).toFixed(2)}</p>
          </div>
        </div>
      );
    };

    const waitingNotiy = notifyWaiting();
    const inputId = document.getElementById('searchBarInput');
    const elmtId = document.getElementById('token-box');

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("tokenAddress", inputId.value);
    urlencoded.append("walletAddress", publicKey.toString());

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    fetch(`http://127.0.0.1:3099/getTokenInfo`, requestOptions)
        .then(async(r) => {
          const res = await r.json();
          console.log(res);
          setTokenData(res.data);
          toast.dismiss(waitingNotiy);
          notifySuccess('Token Data retrieved!');

          // Render the TokenDataComponent into the elmtId element
          ReactDOM.render(
            <TokenDataComponent tokenData={res.data} />,
            elmtId
          );
        })
        .catch((error) => notifyError(error));

  }

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

  const BuildForm = () => {

    const addRow = () => {
      setFormCounter(formCounter + 1);
    };

    const delRow = () => {
      if (formCounter === 1) {return}
      setFormCounter(formCounter - 1);
    }

    const componentArray = [];
    for (let amount = 0; amount < formCounter; amount++) {
      componentArray.push(
        <div key={amount} className="form-row">
          <span>
            <label>Wallet Address:</label>
            <input type="text" placeholder={`abcd1234...`} />
          </span>
          <span>
            <label>Share:</label>
            <input type="number" min="0" placeholder={`amount of token`} />
          </span>
          <div>
            <label>Status</label>
            <p>X</p>
          </div>
          <button onClick={() => {notifySuccess('Button pressed!')}}>send</button>
        </div>
      )
    }

    return (
      <div className='form-box'>
        
        <div className='btn-box'>
          <button onClick={addRow}>Add Row</button>
          <button onClick={delRow}>Del Row</button>
        </div>
        {componentArray}
      </div>
    )
  }

  return (
    <div id="homeContent">
      <div id="token-box">
        <button onClick={() => {requestTokenData()}}>Request Token Data</button>
      </div>
      <BuildForm />
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
