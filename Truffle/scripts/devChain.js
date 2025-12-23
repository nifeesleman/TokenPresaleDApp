const { spawn } = require('child_process');

const run = () => {
  console.log('🚀 Starting local dev chain...');
  try {
    spawn('ganache --database.dbPath data --chain.chainId 1337 --chain.networkId 1337 --server.port 7545 --wallet.deterministic', {
      shell: true,
      stdio: 'inherit',
    });
  } catch (e) {
    console.log(e);
  }
};
run();
