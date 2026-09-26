import chalk from 'chalk';

export const logger = {
  info: (msg: string) => console.log(chalk.blue('ℹ ') + msg),
  success: (msg: string) => console.log(chalk.green('✔ ') + msg),
  warning: (msg: string) => console.log(chalk.yellow('⚠ ') + msg),
  error: (msg: string) => console.error(chalk.red('✖ ') + msg),
  dim: (msg: string) => console.log(chalk.dim(msg)),
  bold: (msg: string) => console.log(chalk.bold(msg)),
  
  title: (msg: string) => {
    console.log();
    console.log(chalk.bgCyan.black.bold(` ${msg} `));
    console.log();
  },

  banner: () => {
    console.log(chalk.cyan.bold(`
  ____  ____ __    ____   ____ ____ ____
 |  _ \\|  _ \\  \\/  |/ ___| / ___/ ___/ ___|
 | |_) | |_) | |\\/| | |  _ | |  | |  | |   
 |  _ <|  __/| |  | | |_| || |__| |__| |___
 |_| \\_\\_|   |_|  |_|\\____(_)____\\____\\____|
`));
    console.log(chalk.dim(' Interactive, visual CLI wrapper for Git'));
    console.log();
  }
};
