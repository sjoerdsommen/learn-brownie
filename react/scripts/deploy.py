from dotenv import dotenv_values

from brownie import MyToken, MyTokenSale, KycContract, accounts, network


def main():
    # requires brownie account to have been created
    if network.show_active()=='development':
        # add these accounts to metamask by importing private key
        owner = accounts[0]
        token = MyToken.deploy(dotenv_values()["INITIAL_TOKENS"], {'from':accounts[0]})
        kyc = KycContract.deploy({'from':accounts[0]})
        token_sale = MyTokenSale.deploy(1, accounts[0], token, kyc, {'from':accounts[0]})
        token.transfer(token_sale, token.totalSupply(), {'from':accounts[0]})

        return token, token_sale, kyc

        
