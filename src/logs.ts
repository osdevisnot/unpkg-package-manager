import chalk from 'chalk';

export const log = msg => console.log(chalk.gray(msg));
export const warn = msg => console.log(chalk.yellow(msg));
export const error = msg => console.log(chalk.red(msg));
export const success = msg => console.log(chalk.green(msg));
