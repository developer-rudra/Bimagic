import ora, { Ora } from 'ora';

export function createSpinner(text: string): Ora {
  return ora({
    text,
    color: 'cyan'
  });
}

export async function withSpinner<T>(
  spinnerText: string,
  task: () => Promise<T>,
  successText?: string
): Promise<T> {
  const spinner = createSpinner(spinnerText).start();
  try {
    const result = await task();
    if (successText) {
      spinner.succeed(successText);
    } else {
      spinner.stop();
    }
    return result;
  } catch (err) {
    spinner.fail();
    throw err;
  }
}
