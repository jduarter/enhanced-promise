export type RejectFnType = (
  ...args: any[] //@todo-type
) => void;

export type RejectIfFnType = (
  cond: boolean,
  message: string | (() => string),
  options?: {
    post?: null | (() => void);
    details?: Record<string, any>; //@todo-type
  },
) => void;

export interface EnhancedPromiseHandlersObjType<R> {
  rejectIf: RejectIfFnType;
  reject: RejectFnType;
  resolve: (r: R) => void;
}

export type EnhancedPromiseHandler<R> = (
  h: EnhancedPromiseHandlersObjType<R>,
) => void;

// @todo: check if there is any way to extract type from arguments of Promise<X>.resolve
type PromiseExecutorResolveTypeLikeGlobal<R> = (
  v: R | PromiseLike<R>,
  e?: Error,
) => void;

export type PromiseExecutorRejectTypeLikeGlobal = (e?: Error) => void;

export type ExecutorType<R> = (
  promiseResolve: PromiseExecutorResolveTypeLikeGlobal<R>,
  promiseReject: PromiseExecutorRejectTypeLikeGlobal,
) => ReturnType<EnhancedPromiseHandler<R>>;
