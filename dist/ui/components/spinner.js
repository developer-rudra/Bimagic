import ora from 'ora';
export function createSpinner(text) {
    return ora({
        text,
        color: 'cyan'
    });
}
export async function withSpinner(spinnerText, task, successText) {
    const spinner = createSpinner(spinnerText).start();
    try {
        const result = await task();
        if (successText) {
            spinner.succeed(successText);
        }
        else {
            spinner.stop();
        }
        return result;
    }
    catch (err) {
        spinner.fail();
        throw err;
    }
}
