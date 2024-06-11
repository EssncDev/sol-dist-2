import React, { useMemo } from 'react';
import {
    ConnectionProvider,
    WalletProvider
} from '@solana/wallet-adapter-react';
import {
    WalletModalProvider
} from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');

const WalletContextProvider = ({ children }) => {
    const endpoint = useMemo(() => 'https://mainnet.helius-rpc.com/?api-key=388777d1-d2d7-4689-aa8f-1914a3e0c159', []);
    const wallets = useMemo(() => [
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletContextProvider;
