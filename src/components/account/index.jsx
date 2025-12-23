import { useWeb3React } from '@web3-react/core';
import Authenticated from './Authenticated';
import Unauthenticated from './Unauthenticated';

function Account() {
  const { library, account } = useWeb3React();

  if (account) return <Authenticated library={library} account={account} />;

  return <Unauthenticated />;
}

export default Account;
