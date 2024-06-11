import React, {useState} from 'react';
import './Header.css';
// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

function BuildLogoAndSearchBar() {

  const [ walletBalance, setWalletBalance] = useState();
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const getWalletBalance = () => {
    connection.getBalance(publicKey)
    .then((result) => {
      setWalletBalance(result)
    })
  }

  return(
    <div className="headerCol">
      <div id="searchBar">
        <input type="text" id="searchBarInput" placeholder="Insert the SPL Token Address here..."></input>
      </div>
      <div>
        <p>{(walletBalance) ? `Balance: ${(walletBalance / 10 ** 9).toFixed(4)} SOL` : undefined}</p>
        <button onClick={ () => getWalletBalance()} disabled={!publicKey}>Get Sol Balance</button>
        <WalletMultiButton />
      </div>
    </div>
  )
}

function Header() {
 
  return (
    <div id="navBar">
      <BuildLogoAndSearchBar />
    </div>
  );
}
 
export default Header;