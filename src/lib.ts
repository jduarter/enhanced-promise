import { getThrowableError } from 'throwable-error';
import type { ThrowableError } from 'throwable-error';

import type {
  PromiseExecutorRejectTypeLikeGlobal,
  RejectFnType,
  RejectIfFnType,
  ExecutorType,
  EnhancedPromiseHandler,
  EnhancedPromiseHandlersObjType,
} from './types';

export const AbortedOp = getThrowableError('AbortedOp', {
  mapperFn: (message, details?: { originalError: Error }) => ({
    message,
    originalError: details?.originalError,
  }),
});

const genReject =
  (
    reject: PromiseExecutorRejectTypeLikeGlobal,
    RejectDefaultErrorClass:
      | (new (...args: any[]) => ThrowableError)
      | undefined = undefined,
  ) =>
  (...args: any[]) => {
    const [firstArg, ...restOfArgs] = args;
    const errConstructorArgs = [
      typeof firstArg === 'function' ? firstArg() : firstArg,
      ...restOfArgs,
    ];
    const customErrorObj =
      typeof errConstructorArgs[0] === 'object' && errConstructorArgs[0];
    const err =
      customErrorObj ||
      new (RejectDefaultErrorClass || Error)(...errConstructorArgs);
    reject(err);
  };

const genRejectIf =
  (reject: RejectFnType): RejectIfFnType =>
  (cond, message, options) => {
    if (!cond) return;
    reject(message, options?.details);
    if (options?.post) options.post();
    throw new AbortedOp('Operation has been aborted');
  };

export const hoc = <R>(
  enhancedHandler: EnhancedPromiseHandler<R>,
  onUncaughtError: (e: Error, handlers: { reject: RejectFnType }) => void,
  rejectDefaultErrorClass:
    | (new (...args: any[]) => ThrowableError)
    | undefined = undefined,
): ExecutorType<R> => {
  const pExecutor: ExecutorType<R> = async (promiseResolve, promiseReject) => {
    const reject = genReject(promiseReject, rejectDefaultErrorClass);

    try {
      await enhancedHandler({
        resolve: promiseResolve,
        reject,
        rejectIf: genRejectIf(reject),
      });
    } catch (err) {
      if (err instanceof AbortedOp) {
        // console.log('-> op has been aborted');
      } else {
        onUncaughtError(err, { reject });
      }
    }
  };

  return pExecutor;
};

export const getEnhancedPromise = <T>(
  promiseBodyFn: EnhancedPromiseHandler<T>,
  onUncaughtError: (
    err: Error,
    handlers: Pick<EnhancedPromiseHandlersObjType<T>, 'reject'>,
  ) => void,
) => new Promise<T>(hoc(promiseBodyFn, onUncaughtError));
