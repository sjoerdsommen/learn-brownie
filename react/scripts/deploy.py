from dotenv import dotenv_values

from brownie import MyToken, MyTokenSale, accounts, network


def main():
    # requires brownie account to have been created
    if network.show_active()=='development':
        # add these accounts to metamask by importing private key
        owner = accounts[0]
        token_address = MyToken.deploy(dotenv_values()["INITIAL_TOKENS"], {'from':accounts[0]})
        token_sale_address = MyTokenSale.deploy(1, accounts[0], token_address, {'from':accounts[0]})
        token_address.transfer(token_sale_address, token_address.totalSupply(), {'from':accounts[0]})

        
