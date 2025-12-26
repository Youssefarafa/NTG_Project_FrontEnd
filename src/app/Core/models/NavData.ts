export interface NavLinks {
  label: string;
  link?: string;
  children?: NavLinks[];
}

export interface BrandInfo {
  name: string;
  logoUrl: string;
  Link?: string;
  logoAlt?: string;
}

export interface NavButtons {
  label: string;
  link?: string;
  Classes: string;
  activeClasses?: string[];
}

export interface AppNavigation {
  brand: BrandInfo;
  navLinks: NavLinks[];
  navButtons: NavButtons[];
}
