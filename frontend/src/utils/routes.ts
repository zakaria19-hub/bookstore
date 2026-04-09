import type { ComponentType } from 'react';

export type RouteConfig = {
  path: string;
  isPrivate: boolean;
  component: ComponentType;
};

export function isPrivate(path: string, configs: RouteConfig[]): boolean {
  const config = configs.find((c) => {
    const pattern = c.path.replace(/:\w+/g, '[^/]+');
    return new RegExp(`^${pattern}$`).test(path);
  });
  return config?.isPrivate ?? false;
}
