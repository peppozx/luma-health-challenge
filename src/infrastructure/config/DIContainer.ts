import 'reflect-metadata';
import { Container } from 'typedi';

export const setupContainer = (): void => {
  // Container will automatically resolve dependencies due to @Service decorators
  // No manual registration needed for simple cases
};

export const getService = <T>(ServiceClass: new (...args: any[]) => T): T => {
  return Container.get(ServiceClass);
};
