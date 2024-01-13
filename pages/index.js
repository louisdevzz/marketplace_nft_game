import Header from "@/components/Header/header";
import { NFTMarketplaceContext } from '@/context/NFTMarketContext';
import { useContext, useEffect } from "react";

const Home = () => {

  const {checkWalletConnected,currentAccount,connectWallet} = useContext(NFTMarketplaceContext);
 
  useEffect(() => {
    checkWalletConnected();
  },[])
  
  return (
    <div>
      <Header/>
      <h1>hello</h1>
      {currentAccount == ""?<button onClick={()=>connectWallet()}>Connection</button>:<button >Create NFT</button>}
      <form>
      <input type="file" placeholder="Upload image nft"/>
      <input type="text" placeholder="Enter NFT Name"/>
      </form>
    </div>
  )
}

export default Home;
