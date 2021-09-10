from brownie import accounts

def test_total_supply_moved_to_contract(deployment):
    token, token_sale = deployment
    assert token.balanceOf(accounts[0]) == 0
    assert token.balanceOf(token_sale) == token.totalSupply()

def test_buying_tokens(deployment):
    token, token_sale = deployment
    balance_acc0_before = accounts[0].balance()
    balance_acc1_before = accounts[1].balance()
    accounts[1].transfer(token_sale, 1)
    assert token.balanceOf(accounts[1]) == 1
    assert token.balanceOf(token_sale) == token.totalSupply() - 1
    assert accounts[0].balance() == balance_acc0_before + 1
    assert accounts[1].balance() == balance_acc1_before - 1

