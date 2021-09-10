import React, {Component} from "react"
import './App.css'
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import {getEthereum} from "./getEthereum"

class App extends Component {

    state = { loaded:false }

    componentDidMount = async () => {

        // Get network provider and web3 instance.
        this.web3 = await getWeb3()

        // Try and enable accounts (connect metamask)
        try {
            this.ethereum = await getEthereum()
            this.ethereum.enable()
        } catch (e) {
            console.log(`Could not enable accounts. Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
            console.log(e)
        }

        // Use web3 to get the user's accounts
        this.accounts = await this.web3.eth.getAccounts()

        // Get the current chain id
        this.chainid = parseInt(await this.web3.eth.getChainId())

        this.setState({}, await this.loadInitialContracts)

    }

    loadInitialContracts = async () => {
        // <=42 to exclude Kovan, <42 to include kovan
        if (this.state.chainid < 42) {
            // Wrong Network!
            return
        }
        console.log(this.state.chainid)
        
        var _chainID = 0;
        if (this.state.chainid === 42){
            _chainID = 42;
        }
        if (this.state.chainid === 1337){
            _chainID = "dev"
        }
        console.log(_chainID)
        this.MyToken = await this.loadContract(_chainID,"MyToken")
        this.MyTokenSale = await this.loadContract(_chainID,"MyTokenSale")
        this.KycContract = await this.loadContract(_chainID,"KycContract")

        if (!this.MyToken || !this.MyTokenSale || !this.KycContract) {
            return
        }

        this.MyTokenValue = await this.MyToken.methods.get().call()
        this.MyTokenSaleValue = await this.MyTokenSale.methods.get().call()
        this.KycContractValue = await this.KycContract.methods.get().call()

        this.setState({
            loaded:true
        })
    }

    loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const {web3} = this.state

        // Get the address of the most recent deployment from the deployment map
        let address
        try {
            address = map[chain][contractName][0]
        } catch (e) {
            console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${chain}".`)
            return undefined
        }

        // Load the artifact with the specified address
        let contractArtifact
        try {
            contractArtifact = await import(`./artifacts/deployments/${chain}/${address}.json`)
        } catch (e) {
            console.log(`Failed to load contract artifact "./artifacts/deployments/${chain}/${address}.json"`)
            return undefined
        }

        return new web3.eth.Contract(contractArtifact.abi, address)
    }

    // changeVyper = async (e) => {
    //     const {accounts, vyperStorage, vyperInput} = this.state
    //     e.preventDefault()
    //     const value = parseInt(vyperInput)
    //     if (isNaN(value)) {
    //         alert("invalid value")
    //         return
    //     }
    //     await vyperStorage.methods.set(value).send({from: accounts[0]})
    //         .on('receipt', async () => {
    //             this.setState({
    //                 vyperValue: await vyperStorage.methods.get().call()
    //             })
    //         })
    // }

    // changeSolidity = async (e) => {
    //     const {accounts, solidityStorage, solidityInput} = this.state
    //     e.preventDefault()
    //     const value = parseInt(solidityInput)
    //     if (isNaN(value)) {
    //         alert("invalid value")
    //         return
    //     }
    //     await solidityStorage.methods.set(value).send({from: accounts[0]})
    //         .on('receipt', async () => {
    //             this.setState({
    //                 solidityValue: await solidityStorage.methods.get().call()
    //             })
    //         })
    // }

    render() {
        if (!this.state.loaded) {
            return <div>Loading Web3, accounts, and contracts...</div>
        }

        // <=42 to exclude Kovan, <42 to include Kovan
        if (isNaN(this.chainid) || this.chainid < 42) {
            return <div>Wrong Network! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
        }

        if (!this.MyToken || !this.MyTokenSale || !this.KycContract) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = this.accounts ? this.accounts.length > 0 : false

        return (<div className="App">
            <h1>Your Brownie Mix is installed and ready.</h1>
            <p>
                If your contracts compiled and deployed successfully, you can see the current
                storage values below.
            </p>
            {
                !isAccountsUnlocked ?
                    <p><strong>Connect with Metamask and refresh the page to
                        be able to edit the storage fields.</strong>
                    </p>
                    : null
            }
            <h2>My Token Contract</h2>
            <div>The stored value is: {this.MyTokenValue}</div>
            <br/>

            <h2>My TokenSale Contract</h2>
            <div>The stored value is: {this.MyTokenSaleValue}</div>
            <br/>

            <h2>My KYC Contract</h2>
            <div>The stored value is: {this.KycContractValue}</div>
            <br/>
        </div>)
    }
}

export default App
