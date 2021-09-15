from brownie import accounts, reverts

def test_total_supply(token):
    assert token.balanceOf(accounts[0]) == token.totalSupply()

def test_sending_tokens(token):
    sendToken = 1
    assert token.balanceOf(accounts[0]) == token.totalSupply()
    token.transfer(accounts[1], sendToken, {'from':accounts[0]})
    assert token.balanceOf(accounts[0]) == token.totalSupply() - sendToken
    assert token.balanceOf(accounts[1]) == sendToken

def test_sending_more_than_totalSupply(token): 
    assert token.balanceOf(accounts[0]) == token.totalSupply()
    with reverts():
        token.transfer(accounts[1], token.totalSupply() + 1, {'from':accounts[0]})
    
