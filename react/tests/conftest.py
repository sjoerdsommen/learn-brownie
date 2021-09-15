import pytest

from dotenv import dotenv_values

from brownie import run


@pytest.fixture(autouse=True)
def setup(fn_isolation):
    """
    Isolation setup fixture.
    This ensures that each test runs against the same base environment.
    """
    pass

@pytest.fixture(scope="module")
def deployment():
    return run('deploy')

@pytest.fixture(scope="module")
def token(accounts, MyToken):
    token = MyToken.deploy(dotenv_values()["INITIAL_TOKENS"], {'from':accounts[0]})
    return token

@pytest.fixture(scope="module")
def token_sale(token, accounts, MyTokenSale):
    token_sale = MyTokenSale.deploy(1, accounts[0], token, {'from':accounts[0]})
    token.transfer(token_sale, token.totalSupply(), {'from':accounts[0]})
    return token_sale