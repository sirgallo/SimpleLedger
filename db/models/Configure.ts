interface DBConf<T> {
  name: T;
  collections: Record<string, string>;
}

export type DBMap<T> = {
  [K in keyof T]: DBConf<K>;
}