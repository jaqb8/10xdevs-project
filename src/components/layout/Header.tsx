import { Menu, ChevronDown, LogOut, Settings } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/stores/auth.store";
import { usePointsStore } from "@/lib/stores/points.store";
import { useSettingsStore } from "@/lib/stores/settings.store";
import { isFeatureEnabled, isFeatureBeta } from "@/features/feature-flags.service";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { UserMenuThemeToggle } from "@/components/shared/UserMenuThemeToggle";
import { GamificationBadge } from "@/components/features/gamification/GamificationBadge";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
}

const getInitials = (email: string): string => {
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
};

const Navbar1 = ({
  logo = {
    url: "/",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
    alt: "Language Learning Buddy",
    title: "Language Learning Buddy",
  },
  menu = [
    { title: "Analiza", url: "/" },
    { title: "Moja lista", url: "/learning-list" },
  ],
}: Navbar1Props) => {
  const { user, isAuth, isAuthInitialized } = useAuthStore();
  const points = usePointsStore((state) => state.points);
  const { pointsEnabled: pointsSettingEnabled, isLoaded: areSettingsLoaded } = useSettingsStore();
  const isAuthFeatureEnabled = isFeatureEnabled("auth");
  const isLearningItemsFeatureEnabled = isFeatureEnabled("learning-items");
  const gamificationFeatureEnabled = isFeatureEnabled("gamification");
  const gamificationBetaTagEnabled = isFeatureBeta("gamification");

  const filteredMenu = isAuth && isLearningItemsFeatureEnabled ? menu : [];
  const shouldShowAuthControls = isAuthFeatureEnabled && isAuthInitialized;
  const shouldShowPointsSkeleton = gamificationFeatureEnabled && !areSettingsLoaded;
  const shouldShowPointsBadge =
    gamificationFeatureEnabled && areSettingsLoaded && pointsSettingEnabled && points !== null;

  return (
    <section className="py-4">
      {/* Desktop Menu */}
      <nav className="hidden justify-between lg:flex container mx-auto items-center">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <a href={logo.url} className="flex items-center gap-2" data-test-id="header-logo">
            <img src={logo.src} className="max-h-8 dark:invert" alt={logo.alt} />
            <span className="text-xl font-semibold tracking-tighter">{logo.title}</span>
          </a>
          {filteredMenu.length > 0 && (
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>{filteredMenu.map((item) => renderMenuItem(item))}</NavigationMenuList>
              </NavigationMenu>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {shouldShowAuthControls && (
            <>
              {user ? (
                <>
                  {shouldShowPointsSkeleton && <GamificationBadge isLoading />}
                  {shouldShowPointsBadge && (
                    <GamificationBadge points={points ?? undefined} showBeta={gamificationBetaTagEnabled} />
                  )}
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="group shadow-xs cursor-pointer flex items-center gap-2 border rounded-full py-1 pl-1 pr-3 dark:bg-secondary/50 hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        data-test-id="header-user-menu-trigger"
                      >
                        <Avatar className="size-6" data-test-id="header-user-avatar">
                          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.email} />
                          <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground font-medium" data-test-id="header-user-email">
                          {user.email}
                        </span>
                        <ChevronDown className="size-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 mt-2 shadow-lg border"
                      data-test-id="header-user-menu-content"
                    >
                      <DropdownMenuItem asChild>
                        <a href="/settings" className="cursor-pointer" data-test-id="header-settings-button">
                          <Settings className="size-4" />
                          <span>Ustawienia</span>
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <UserMenuThemeToggle />
                      <form action="/api/auth/logout" method="POST">
                        <DropdownMenuItem
                          asChild
                          variant="destructive"
                          className="cursor-pointer"
                          data-test-id="header-logout-button"
                        >
                          <button type="submit" className="w-full flex items-center gap-2">
                            <LogOut className="size-4" />
                            <span>Wyloguj</span>
                          </button>
                        </DropdownMenuItem>
                      </form>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" data-test-id="header-login-button">
                    <a href="/login">Zaloguj</a>
                  </Button>
                  <Button asChild size="sm" data-test-id="header-signup-button">
                    <a href="/signup">Zarejestruj</a>
                  </Button>
                </>
              )}
            </>
          )}
          {shouldShowAuthControls && (!isAuth || !user) ? <ModeToggle /> : null}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between px-4">
          {/* Logo */}
          <a href={logo.url} className="flex items-center gap-2" data-test-id="header-logo-mobile">
            <img src={logo.src} className="max-h-8 dark:invert" alt={logo.alt} />
          </a>

          <div className="flex items-center gap-2">
            {shouldShowAuthControls && user && (
              <>
                {shouldShowPointsSkeleton && <GamificationBadge isLoading />}
                {shouldShowPointsBadge && (
                  <GamificationBadge points={points ?? undefined} showBeta={gamificationBetaTagEnabled} />
                )}
              </>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" data-test-id="header-mobile-menu-trigger">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <img src={logo.src} className="max-h-8 dark:invert" alt={logo.alt} />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  {filteredMenu.length > 0 && (
                    <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
                      {filteredMenu.map((item) => renderMobileMenuItem(item))}
                    </Accordion>
                  )}

                  <div className="flex flex-col gap-3">
                    {shouldShowAuthControls && (
                      <>
                        {user ? (
                          <>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-10" data-test-id="header-user-avatar-mobile">
                                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.email} />
                                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                              </Avatar>
                              <span className="text-md text-muted-foreground" data-test-id="header-user-email-mobile">
                                {user.email}
                              </span>
                            </div>
                            <Button
                              asChild
                              variant="outline"
                              className="w-full"
                              data-test-id="header-settings-button-mobile"
                            >
                              <a href="/settings" className="flex items-center justify-center gap-2">
                                <Settings className="size-4" />
                                Ustawienia
                              </a>
                            </Button>
                            <form action="/api/auth/logout" method="POST">
                              <Button
                                type="submit"
                                variant="outline"
                                className="w-full"
                                data-test-id="header-logout-button-mobile"
                              >
                                Wyloguj
                              </Button>
                            </form>
                          </>
                        ) : (
                          <>
                            <Button asChild variant="outline" data-test-id="header-login-button-mobile">
                              <a href="/login">Zaloguj</a>
                            </Button>
                            <Button asChild data-test-id="header-signup-button-mobile">
                              <a href="/signup">Zarejestruj</a>
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <ModeToggle>Przełącz motyw</ModeToggle>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-lg font-medium transition-colors"
        data-test-id={`header-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">{item.title}</AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a
      key={item.title}
      href={item.url}
      className="text-md font-semibold"
      data-test-id={`header-nav-mobile-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="hover:bg-muted hover:text-accent-foreground flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && <p className="text-muted-foreground text-sm leading-snug">{item.description}</p>}
      </div>
    </a>
  );
};

export const Header = Navbar1;
