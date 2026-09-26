import chalk from 'chalk';
export const logger = {
    info: (msg) => console.log(chalk.blue('ℹ ') + msg),
    success: (msg) => console.log(chalk.green('✔ ') + msg),
    warning: (msg) => console.log(chalk.yellow('⚠ ') + msg),
    error: (msg) => console.error(chalk.red('✖ ') + msg),
    dim: (msg) => console.log(chalk.dim(msg)),
    bold: (msg) => console.log(chalk.bold(msg)),
    title: (msg) => {
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
