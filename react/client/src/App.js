import React, { Component } from "react";
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"

import "./App.css";

class App extends Component {
  state = { loaded:false, kycAddress: "0x123...", tokenSaleAddress: null, userTokens:0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      const chainid = parseInt(await this.web3.eth.getChainId());

        // <=42 to exclude Kovan, <42 to include kovan
      if (chainid < 42) {
          // Wrong Network!
          return
      }
      console.log(chainid)
      
      var _chainID = 0;
      if (chainid === 42){
          _chainID = 42;
      }
      if (chainid === 1337){
          _chainID = "dev"
      }

      // load contracts
      const tokenArtifact = await import(`./artifacts/deployments/${_chainID}/${map[_chainID]["MyToken"][0]}.json`)
      this.tokenInstance = new this.web3.eth.Contract(tokenArtifact.abi, map[_chainID]["MyToken"][0])

      const tokenSaleArtifact = await import(`./artifacts/deployments/${_chainID}/${map[_chainID]["MyTokenSale"][0]}.json`)
      this.tokenSaleInstance = new this.web3.eth.Contract(tokenSaleArtifact.abi, map[_chainID]["MyTokenSale"][0])

      const KycContractArtifact = await import(`./artifacts/deployments/${_chainID}/${map[_chainID]["KycContract"][0]}.json`)
      this.KycContractInstance = new this.web3.eth.Contract(KycContractArtifact.abi, map[_chainID]["KycContract"][0])
      
      this.setState({loaded:true, tokenSaleAddress:map[_chainID]["MyTokenSale"][0]}, this.updateUserTokens);
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  updateUserTokens = async () => {
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens: userTokens});
  }

  listenToTokenTransfer = () => {
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data",this.updateUserTokens);
  }

  handleBuyTokens = async() => {
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: this.web3.utils.toWei("1","wei")});
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleKycWhitelisting = async () => {
    await this.KycContractInstance.methods.setKycCompleted(this.state.kycAddress).send({from: this.accounts[0]});
    alert("KYC for "+this.state.kycAddress+" is completed");
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>StarDucks Cappucino Token Sale</h1>
        <p>Get your Tokens today!</p>
        <h2>Kyc Whitelisting</h2>
        Address to allow: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange} />
        <button type="button" onClick={this.handleKycWhitelisting}>Add to Whitelist</button>
        <h2>Buy Tokens</h2>
        <p>If you want to buy tokens, send Wei to this address: {this.state.tokenSaleAddress}</p>
        <p>You currently have: {this.state.userTokens} CAPPU Tokens</p>
        <button type="button" onClick={this.handleBuyTokens}>Buy more tokens</button>
      </div>
    );
  }
}

export default App;
