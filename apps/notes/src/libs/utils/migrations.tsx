import { IPageProps } from "@pfl-wsr/ui";

/**
 * @reference https://nextjs.org/docs/app/building-your-application/upgrading/version-15#params--searchparams
 */
async function migratePageProps<T extends IPageProps>(props: T) {
  const ret = { ...props };
  if (ret.params instanceof Promise) {
    ret.params = await ret.params;
  }

  if (ret.searchParams instanceof Promise) {
    ret.searchParams = await ret.searchParams;
  }

  return ret;
}

/**
 * @reference https://nextjs.org/docs/app/building-your-application/upgrading/version-15#params--searchparams
 */
export function migratePage<T extends IPageProps>(
  Component: React.ComponentType<T>
) {
  async function fn(props: T) {
    const transformedProps = await migratePageProps(props);
    return <Component {...transformedProps} />;
  }

  fn.displayName = `migratePageProps(${Component.displayName})`;

  return fn;
}
