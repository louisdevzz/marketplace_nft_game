import '@/styles/globals.css'
import {  NFTMarketplaceProvider } from '@/context/NFTMarketContext';


const App = ({ Component, pageProps }) => (
    <div>
        <NFTMarketplaceProvider>
            <Component {...pageProps} />
        </NFTMarketplaceProvider>
    </div>
     
)

export default App;
