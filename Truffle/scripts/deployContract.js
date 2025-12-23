const { spawn } = require('child_process');

const run = async () => {
  console.log('📄 Deploying and updating contracts...');
  try {
    spawn(
      'cd Truffle && truffle migrate --config truffle-config.cjs --reset --compile-all --network develop && node scripts/contractInfo.js',
      {
        shell: true,
        stdio: 'inherit',
      }
    );
  } catch (e) {
    console.log(e);
  }
};
run();
