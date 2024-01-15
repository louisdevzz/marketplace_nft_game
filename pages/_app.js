import '@/styles/globals.css'
import {  NFTMarketplaceProvider } from '@/context/NFTMarketContext';
const App = ({ Component, pageProps }) => (
    <NFTMarketplaceProvider>
        <Component {...pageProps} />
    </NFTMarketplaceProvider>
)

export default App;
