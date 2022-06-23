import Head from 'next/head'
import Image from 'next/image'
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants/index";

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false)
  const [joinedWhitelist, setJoinedWhitelist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0)
  const web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner = false) => {
    
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 3) {
      window.alert("Change the network to Ropsten");
      throw new Error("Change network to Ropsten");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const getWhitelistContract = (providerOrSigner) => {
    return new Contract(WHITELIST_CONTRACT_ADDRESS, abi, providerOrSigner)
  }

  const addAddressToWhitelist = async () => {
    try {

      // Get signer and load contract
      const signer = await getProviderOrSigner(true)
      const whitelistContract = getWhitelistContract(signer)

      // Send add to whitelist transaction and wait
      const tx = await whitelistContract.addAddressToWhitelist()
      setLoading(true)
      await tx.wait()
      setLoading(false)

      await getNumberOfWhitelisted()
      setJoinedWhitelist(true)

    } catch (err) {
      console.log(err)
    }
  }

  const getNumberOfWhitelisted = async () => {
    try {

      const provider = await getProviderOrSigner(false)
      const whitelistContract = getWhitelistContract(provider)
      const _numOfWhitelisted = await whitelistContract.numAddressesWhitelisted()
      setNumberOfWhitelisted(_numOfWhitelisted);

    } catch (err) {
      console.log(err)
    }
  }

  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const whitelistContract = getWhitelistContract(signer)
      const address = await signer.getAddress();
      const isInWhitelist = await whitelistContract.whitelistedAddresses(address)
      setJoinedWhitelist(isInWhitelist)
    } catch (err) {
      console.log(err)
    }
  }

  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  const renderButtons = () => {
    if(walletConnected) {
      if(joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the whitelist!
          </div>
        )
      } else if (loading) {
        return <button className={styles.loading}>Loading...</button>
      } else {
        return (
          <button className={styles.button} onClick={addAddressToWhitelist}>
            Join the whitelist!
          </button>
        )
      }
    } else {
      return (
        <button className={styles.button} onClick={connectWallet}>
          Connect your wallet
        </button>
      )
    }
  }
  
  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'ropsten',
        providerOptions: {},
        disableInjectedProvider: false
      })
      connectWallet()
    }
  }, [walletConnected])

  

  return (
    <div>
      <Head>
        <title>Whitelist dApp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to JohnnyTime Dev!</h1>
          <div className={styles.description}>
            Its an NFT collection for JohnnyTime community.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the whitelist!
          </div>
          {renderButtons()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by JohnnyTime
      </footer>
    </div>
  )
}
