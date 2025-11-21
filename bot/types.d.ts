/**
 * Type declarations for modules without @types packages
 */

declare module 'input' {
  export function text(prompt?: string): Promise<string>;
  export function password(prompt?: string): Promise<string>;
  export function confirm(prompt?: string): Promise<boolean>;
  export function select(prompt: string, choices: string[]): Promise<string>;
  export function multiselect(prompt: string, choices: string[]): Promise<string[]>;
  export function autocomplete(prompt: string, choices: string[]): Promise<string>;
  
  const input: {
    text: (prompt?: string) => Promise<string>;
    password: (prompt?: string) => Promise<string>;
    confirm: (prompt?: string) => Promise<boolean>;
    select: (prompt: string, choices: string[]) => Promise<string>;
    multiselect: (prompt: string, choices: string[]) => Promise<string[]>;
    autocomplete: (prompt: string, choices: string[]) => Promise<string>;
  };
  
  export default input;
}

declare module 'fs-extra' {
  import * as fs from 'fs';
  
  export * from 'fs';
  
  export interface PathExistsOptions {
    exists?: boolean;
  }
  
  export function pathExists(path: string): Promise<boolean>;
  export function ensureDir(path: string, options?: any): Promise<void>;
  export function readFile(path: string, encoding?: string): Promise<string>;
  export function writeFile(path: string, data: string, encoding?: string): Promise<void>;
  export function remove(path: string): Promise<void>;
  export function copy(src: string, dest: string, options?: any): Promise<void>;
  export function move(src: string, dest: string, options?: any): Promise<void>;
}

