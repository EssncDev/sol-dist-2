import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './Home.css';
import Header from '../Header/Header.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction, SystemProgram, PublicKey, Connection } from '@solana/web3.js';
import toast, { Toaster } from 'react-hot-toast';

const notifyWaiting = () => toast.loading('Waiting...',{
  duration: 25000,
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

const notifyLink = (url) => {
  toast((t) => (
    <span>
      Transaction: 
      <a 
        href={url}
        target="_blank" 
        rel="noopener noreferrer"
        onClick={() => toast.dismiss(t.id)}
        style={{ color: 'blue', textDecoration: 'underline', marginLeft: '5px', duration: 4000,
          position: 'bottom-left'}}
      >
        Solscan
      </a>
    </span>
  ));
}

const sleeper = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const downloadJSON = async(data, modus, amount) => {
  if (!data) {return false};
  const newJson = {
    modus: modus,
    distData: data,
    amount: amount
  };

  const jsonStr = JSON.stringify(newJson, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "essnc_dev_distribution.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const requestBuffer = async(amount, instructionIndex) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("amount", amount );
  urlencoded.append("transferInstructionIndex", instructionIndex );

  const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
  };

  return fetch(`http://127.0.0.1:3099/createBuffer`, requestOptions)
    .then(async(r) => {
      const res = await r.json();
      return res.data;
    })
    .catch((error) => notifyError(error));
}

const buildTrx = async(publicKey) => {
  return new Transaction({
    feePayer: publicKey
  })
}

const addBlockInfoToTrx = async(connection, transaction) => {
  const blockhashResponse = await connection.getLatestBlockhashAndContext();
  const lastValidBlockHeight = blockhashResponse.context.slot + 150;
  transaction.recentBlockhash = blockhashResponse.value.blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  return transaction;
}

const requestAtaAddress = async(walletAddress, tokenAddress) => {

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams()
  urlencoded.append("tokenAddress", tokenAddress);
  urlencoded.append("walletAddress", walletAddress);

  const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
  };

  if (tokenAddress != 'So11111111111111111111111111111111111111111') {
    return fetch(`http://127.0.0.1:3099/getTokenInfo`, requestOptions)
      .then(async(r) => {
        const res = await r.json();
        return (res.data) ? res.data : undefined;
      })
      .catch((error) => {
        notifyError(error);
        return;
      });
  }
}

const requestSolTransferInstructions = async(sender, receiver, amount) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams()
  urlencoded.append("sender", sender);
  urlencoded.append("receiver", receiver);
  urlencoded.append("transferAmount", amount);

  const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
  };

  return fetch(`http://127.0.0.1:3099/transferInstructionSol`, requestOptions)
    .then(async(r) => {
      const res = await r.json();
      return (res.data) ? res.data : undefined;
    })
    .catch((error) => {
      notifyError(error);
      return;
    });
}

const requestSplTransferInstructions = async(sender, senderAta, receiverAta, amount) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams()
  urlencoded.append("sender", sender);
  urlencoded.append("senderAta", senderAta);
  urlencoded.append("receiverAta", receiverAta);
  urlencoded.append("transferAmount", amount);

  const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
  };

  return fetch(`http://127.0.0.1:3099/transferInstructionSpl`, requestOptions)
    .then(async(r) => {
      const res = await r.json();
      return (res.data) ? res.data : undefined;
    })
    .catch((error) => {
      notifyError(error);
      return;
    });
}

const requestTransactionInstructionsWithAtaCreation = async(sender, senderAta, receiver, receiverAta, tokenAddress, amount) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams()
  urlencoded.append("sender", sender);
  urlencoded.append("senderAta", senderAta);
  urlencoded.append("receiver", receiver);
  urlencoded.append("receiverAta", receiverAta);
  urlencoded.append("tokenAddress", tokenAddress);
  urlencoded.append("transferAmount", amount);

  const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
  };

  return fetch(`http://127.0.0.1:3099/transferInstructionWithAtaCreation`, requestOptions)
    .then(async(r) => {
      const res = await r.json();
      return (res.data) ? res.data : undefined;
    })
    .catch((error) => {
      notifyError(error);
      return;
    });
}

function HomeContent() {

  const [formCounter, setFormCounter] = useState(1);
  const [shareAllocation, setShareAllocation] = useState('Allocation');
  const [distributionArray, setDistributionArray] = useState({});
  const [tokenData, setTokenData] = useState({});
  const [formData, setFormData] = useState({});
  const { publicKey, signTransaction, confirmTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  

  const writeInputsInState = async() => {
    for (let index = 1; index <= formCounter; index++) {
      const walletInput = document.getElementById(`wallet-${index}`);
      const shareInput = document.getElementById(`share-${index}`);

      formData[`input-${index}`] = {
        wallet: walletInput.value,
        share: shareInput.value,
        status: false
      }
    }
    setFormData(formData);
    return
  }

  const prepareDownload = async() => {
    const waitingNotiy = notifyWaiting();
    await writeInputsInState();
    await downloadJSON(formData, shareAllocation, formCounter);
    toast.dismiss(waitingNotiy);
    notifySuccess('JSON downloaded!');
  }

  const uploadJsonFile = async(event) => {
    const file = event.target.files[0];
    const waitingNotiy = notifyWaiting();

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          setFormData(json.distData);
          setShareAllocation(json.modus);
          setFormCounter(json.amount)
          toast.dismiss(waitingNotiy);
          notifySuccess('JSON processed!');
        } catch (err) {
          toast.dismiss(waitingNotiy);
          notifyError('Could not parse JSON!');
        }
      };
      reader.readAsText(file);
    }
  }

  const requestTokenData = () => {
    const TokenDataComponent = ({ tokenData }) => {
      return (
        <div className='tokenData-box'>
          <div>
            <p>{`Token: ${tokenData.tokenAddress.slice(0, 10)}...`}</p>
          </div>
          <div>
            <p>Balance: {(tokenData.amount / Math.pow(10, tokenData.decimals)).toFixed(2)}</p>
          </div>
        </div>
      );
    };

    const inputId = document.getElementById('searchBarInput');
    const elmtId = document.getElementById('token-box');

    if (!inputId.value) {
      notifyError('Token Input missing');
      return
    }  

    const waitingNotiy = notifyWaiting();
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams()
    urlencoded.append("tokenAddress", inputId.value);
    urlencoded.append("walletAddress", publicKey.toString());

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    if (inputId.value != 'So11111111111111111111111111111111111111111') {
      fetch(`http://127.0.0.1:3099/getTokenInfo`, requestOptions)
        .then(async(r) => {
          const res = await r.json();
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
    } else {
        connection.getBalance(publicKey)
          .then(async(amount) => {
            const data = {
              wallet:  publicKey.toString(),
              tokenAddress: 'So11111111111111111111111111111111111111111',
              decimals: 9,
              supply: undefined,
              ataAddress: publicKey.toString(),
              amount: amount - 7.5 * 1e7,
              frozen: false
            } 
            
            setTokenData(data);
            toast.dismiss(waitingNotiy);
            notifySuccess('Token Data retrieved!');

            // Render the TokenDataComponent into the elmtId element
            ReactDOM.render(
              <TokenDataComponent tokenData={data} />,
              elmtId
            );
        })
        .catch((error) => notifyError(error));
      }

  }

  const rebuildTransferInstruction = async(transaction) => {
    if (!transaction) {return }

    if (!transaction.instructions.length > 0) {return }


    for (const index in transaction.instructions) {
      for (const keyIndex in transaction['instructions'][index]['keys']) {
        transaction['instructions'][index]['keys'][keyIndex]['pubkey'] = new PublicKey(transaction['instructions'][index]['keys'][keyIndex]['pubkey'])
      }
    }
    return transaction
    
  }

  const sendSingleTrx = async(receiverId, shareId, statusId) => {
    const tokenAddress = tokenData.tokenAddress;
    const receiver = document.getElementById(receiverId).value;
    const status = document.getElementById(statusId);
    let share = document.getElementById(shareId).value;

    if (!receiver || !share) {
      notifyError('Inputs faulty!');
      return;
    }

    if (shareAllocation == 'Share') {
      share = tokenData.amount * (share / 100);
    } else {
      share = share * 10 ** tokenData.decimals;
    }

    if (share > tokenData.amount) {
      notifyError('Not enough tokens to distribute!');
      return;
    }

    let transaction = await buildTrx(publicKey);
    if (tokenAddress === "So11111111111111111111111111111111111111111") {
      const instruction = await requestSolTransferInstructions(publicKey, receiver, share);
      transaction.add(
        JSON.parse(instruction)
      );
      
    } else {
      const senderAtaAddress = tokenData.ataAddress;
      const receiverAtaInfo = await requestAtaAddress(receiver, tokenAddress);

      if (receiverAtaInfo || receiverAtaInfo?.amount) {
        const instruction = await requestSplTransferInstructions(publicKey.toString(), senderAtaAddress, receiverAtaInfo.ataAddress, share);
        transaction.add(
          JSON.parse(instruction)
        );

      } else {
        const instruction = await requestTransactionInstructionsWithAtaCreation(publicKey, senderAtaAddress, receiver, receiverAtaInfo.ataAddress, tokenAddress, share);
        console.log(instruction);
      }
    }
    
    try {
      const rebuildTx = await rebuildTransferInstruction(transaction)
      const finalTrx = await addBlockInfoToTrx(connection, rebuildTx)
      const signedTransaction = await signTransaction(finalTrx);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);
      notifyLink(`https://solscan.io/tx/${signature}`);
      notifyWaiting()
      await sleeper(25*1000)
      requestTokenData()

      ReactDOM.render(
        <>
          <label>Status</label>
          <p>send!</p>
        </>,
        status
      );

    } catch(err) {
      console.error(err);
      notifyError('Signing transaction failed! Retry...');
    }
}

  const sendBundleTransaction = async() => {
    const tokenAddress = tokenData.tokenAddress;
    let transaction = await buildTrx(publicKey);

    for (const elmt of distributionArray) {
      const receiver = elmt.wallet;
      const share = elmt.amount;

      if (!receiver || !share) {
        notifyError('Inputs faulty!');
        return;
      }
  
      if (share > tokenData.amount) {
        notifyError('Not enough tokens to distribute!');
        return;
      }
  
      if (tokenAddress === "So11111111111111111111111111111111111111111") {
        const instruction = await requestSolTransferInstructions(publicKey, receiver, share);
        transaction.add(
          JSON.parse(instruction)
        );
        
      } else {
        const senderAtaAddress = tokenData.ataAddress;
        const receiverAtaInfo = await requestAtaAddress(receiver, tokenAddress);
  
        if (receiverAtaInfo || receiverAtaInfo?.amount) {
          const instruction = await requestSplTransferInstructions(publicKey.toString(), senderAtaAddress, receiverAtaInfo.ataAddress, share);
          transaction.add(
            JSON.parse(instruction)
          );
  
        } else {
          const instruction = await requestTransactionInstructionsWithAtaCreation(publicKey, senderAtaAddress, receiver, receiverAtaInfo.ataAddress, tokenAddress, share);
        }
      }
    }
    
    try {
      const rebuildTx = await rebuildTransferInstruction(transaction)
      const finalTrx = await addBlockInfoToTrx(connection, rebuildTx)
      const signedTransaction = await signTransaction(finalTrx);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);
      notifyLink(`https://solscan.io/tx/${signature}`);
      
      const formDataTemp = formData;
      let counter = 0;
      for (const index in formDataTemp) {
        counter += 1
        ReactDOM.render(
          <>
            <label>Status</label>
            <p>send!</p>
          </>,
          document.getElementById(`status-${counter}`)
        );
      }
      setFormData(formDataTemp);
      notifyWaiting()
      await sleeper(25*1000)
      requestTokenData()

    } catch(err) {
      console.error(err);
      notifyError('Signing transaction failed! Retry...');
    }
  }

  const BuildForm = () => {

    const ChangeShareToggle = () => {

      const disclaimerShare = '*Share distributions will be applied on the entire amount of tokens and is capped by 100% (Input 10% = 10)'
      const disclaimerAllocation = '*Allocation distribution is capped by the owned amount (Input 100 Tokens = 100)'

      if (shareAllocation == 'Allocation') {
        return (
          <div className='slider-box'>
            <button className='slider' onClick={() => {setShareAllocation('Share')}}>Distribute per share</button>
            <p className='slider-sidenote'>{disclaimerAllocation}</p>
          </div>
        )
      } else {
        return (
          <div className='slider-box'>
            <button className='slider' onClick={() => {setShareAllocation('Allocation')}}>Distribute per allocation</button>
            <p className='slider-sidenote'>{disclaimerShare}</p>
          </div>
        )
      }
    }

    const addRow = () => {
      writeInputsInState()
      .then(async() => {
        setFormCounter(formCounter + 1);
      })
    };

    const delRow = () => {
      if (formCounter === 1) {return}
      writeInputsInState()
      .then(async() => {
        setFormCounter(formCounter - 1);
        delete formData[`input-${formCounter}`]
      })
    }

    const componentArray = [];
    for (let amount = 1; amount <= formCounter; amount++) {
      componentArray.push(
        <div key={amount} className="form-row">
          <span>
            <label>{`${amount}.)`} Wallet Address:</label>
            <input type="text" id={`wallet-${amount}`} value={formData[`input-${amount}`]?.wallet}  onChange={() => {}} placeholder={`abcd1234...`} />
          </span>
          <span>
            <label>{`${shareAllocation}:`}</label>
            <input type="number" id={`share-${amount}`} min="0" value={formData[`input-${amount}`]?.share} onChange={() => {}} placeholder={`20`} />
            </span>
          <div id={`status-${amount}`}>
            <label>Status</label>
            <p>{`${formData[`input-${amount}`]?.status}`}</p>
          </div>
          <button onClick={() => {sendSingleTrx(`wallet-${amount}`, `share-${amount}`, `status-${amount}`)}}>send</button>
        </div>
      )
    }

    return (
      <div className='form-box'>
        <div className='btn-box'>
          <span>
            <button onClick={() => {prepareDownload()}}>Download JSON</button>
            <input type='file' accept=".json" id="file-input" style={{display: 'none'}} onChange={(event) => {uploadJsonFile(event)}}></input>
            <label htmlFor="file-input" className="file-input-label">
              Upload JSON 
            </label>
          </span>
          <span>
            <button onClick={delRow}>Row ( - )</button>
            <button onClick={addRow}>Row ( + )</button>
          </span>
          <span>
            <span>
              < ChangeShareToggle />
            </span>
          </span>
        </div>
        {componentArray}
      </div>
    )
  }

  const calcDistSum = async() => {

    const sendBundleTrx = async() => {
      if (!distributionArray.length > 0) {
        notifyError('Distribution likely to fail. Double check input values!');
        return
      }
      sendBundleTransaction()
    }

    const BuildDistributionBox = () => {
      const componentArray = [];
      let totalSumAllocation = 0;
      let totalSumPercentage = 0;
      for (const index in distributionArray) {
        const elmt = distributionArray[index];
        totalSumAllocation += elmt?.amount / 10 ** tokenData.decimals;
        totalSumPercentage += parseFloat(elmt?.share);
        componentArray.push(
          <div key={`dist-${index}`} className='distribution-box'>
            <span>
              <p>{`${parseInt(index) + 1}) ${(elmt?.wallet).slice(0, 7)}...`}</p>
            </span>
            <span>
              <p>Token amount:</p>
              <p>{`${(elmt?.amount / 10 ** tokenData.decimals).toFixed(2)}`}</p>
            </span>
            <span>
              <p>Share:</p>
              <p>{`${(parseFloat(elmt?.share)).toFixed(2)}%`}</p>
            </span>
          </div>
        )
      }

      componentArray.push(
        <div key={`dist-total`} className='distribution-box'>
            <p>{`Token amount: ${(totalSumAllocation).toFixed(2)}`}</p>
            <p>{`Share: ${(parseFloat(totalSumPercentage)).toFixed(2)}%`}</p>
          </div>
      )

      return (
        <div id='distribution-calc-box'>
          {componentArray}
          <button onClick={() => {sendBundleTrx()}}>Send bundled transaction</button>
        </div>
      )
    }

    if (!tokenData.wallet) {
      notifyError('Token data not available - request token data first');
      return 
    }

    await writeInputsInState();
    const distributionArray = [];
    const renderBox = document.getElementById("sum-btn");
    const tokenDataTemp = tokenData;
    const formDataTemp = formData;
    var amountSum = 0;

    for (const wallet in formDataTemp) {
      const elmt = formDataTemp[wallet];
      if (!elmt.share) { continue }
      if (shareAllocation == 'Share') {
        distributionArray.push({
          internalId: wallet,
          wallet: elmt.wallet,
          amount: (elmt.share / 100) * tokenDataTemp.amount,
          share: elmt.share
        })
      } else {
        distributionArray.push({
          internalId: wallet,
          wallet: elmt.wallet,
          amount: elmt.share * 10 ** tokenDataTemp.decimals,
          share: (elmt.share / tokenDataTemp.decimals)
        })
      }
      amountSum += parseFloat(elmt.share);
    }

    if (shareAllocation == 'Share' && amountSum > 100) {
      notifyError('Entire share is greater than 100%');
      return
    }

    if (shareAllocation == 'Allocation' && tokenDataTemp.amount < amountSum ) {
      notifyError(`Entire amount is greater than ${tokenDataTemp.amount / 10 ** tokenDataTemp.decimals}`);
      return
    }

    notifySuccess('Distribution processed!');
    setDistributionArray(distributionArray);

    // Render the TokenDataComponent into the elmtId element
    ReactDOM.render(
      <BuildDistributionBox />,
      renderBox
    );
  }

  

  return (
    <div id="homeContent">
      <div id="token-box">
        <button onClick={() => {requestTokenData()}}>Request Token Data</button>
      </div>
      <BuildForm />
      <div id='tokenSum'>
        <button onClick={() => {calcDistSum()}}>Sum up distribution</button>
        <div id="sum-btn">
        </div>
      </div>
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
