import { Ora } from 'ora';
export declare function createSpinner(text: string): Ora;
export declare function withSpinner<T>(spinnerText: string, task: () => Promise<T>, successText?: string): Promise<T>;
