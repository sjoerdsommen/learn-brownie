from brownie import accounts

def test_total_supply(token):
    assert token.balanceOf(accounts[0]) == 1000