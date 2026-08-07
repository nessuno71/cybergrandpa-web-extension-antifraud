import type { Component, ComponentProps, Snippet } from 'svelte';

export type SvelteApp = Component<object> & ComponentProps<Component>;

export type AppsType = {
  [key: string]: SvelteApp;
};

export interface ButtonProps {
  children: Snippet;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  size?: 'small' | 'large';
  url?: string;
}

export interface HeaderProps {
  logoSize?: number;
  twoRows?: boolean;
}

export interface LogoProps {
  alt?: string;
  size?: number;
}

export interface ModalProps {
  autoShow?: boolean;
  children?: Snippet;
  loader?: boolean;
  logo?: boolean;
  onClose?: () => void;
  show?: boolean;
  src?: string;
  text?: string;
}

export interface RadioProps {
  checked?: boolean;
  group: string;
  label: string;
  value: string;
}

export interface ToggleProps {
  checked?: boolean;
  onClick?: () => void;
  color?: 'red' | 'green' | 'yellow';
}

export interface SendMessageParams {
  type: string;
  tabId?: number;
  command?: string;
}

export interface UrlService {
  count(): number;
  getRows(limit: number, offset?: number): string;
  seek(url: string): boolean;
  upsert(base64string: string): Promise<boolean>;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  date: string;
}
