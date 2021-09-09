import pytest

from brownie import accounts, MyToken


@pytest.fixture(autouse=True)
def setup(fn_isolation):
    """
    Isolation setup fixture.
    This ensures that each test runs against the same base environment.
    """
    pass

@pytest.fixture(scope="module")
def token():
    return MyToken.deploy(1000, {'from':accounts[0]})