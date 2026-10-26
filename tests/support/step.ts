import { test } from '@playwright/test';

type AsyncMethod<This, Args extends unknown[], Return> = (
  this: This,
  ...args: Args
) => Promise<Return>;

const PLACEHOLDER = /\{(\d+)\}/g;
const HIDDEN = '…';

export function step(title?: string) {
  return function <This, Args extends unknown[], Return>(
    target: AsyncMethod<This, Args, Return>,
    context: ClassMethodDecoratorContext<This, AsyncMethod<This, Args, Return>>
  ): AsyncMethod<This, Args, Return> {
    return async function (this: This, ...args: Args): Promise<Return> {
      const name = title
        ? fillTitle(title, args)
        : `${(this as object).constructor.name}.${String(context.name)}`;
      return await test.step(name, () => target.call(this, ...args), {
        box: true,
      });
    };
  };
}

function fillTitle(title: string, args: unknown[]): string {
  return title.replace(PLACEHOLDER, (_, index: string) => {
    const value = args[Number(index)];
    return typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : HIDDEN;
  });
}
