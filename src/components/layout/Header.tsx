import { Menu } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
  const { user, isAuth } = useAuthStore();
  const filteredMenu = isAuth ? menu : [];

  return (
    <section className="py-4">
      {/* Desktop Menu */}
      <nav className="hidden justify-between lg:flex px-8 items-center">
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
        <div className="flex gap-2">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground flex items-center" data-test-id="header-user-email">
                {user.email}
              </span>
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="outline" size="sm" data-test-id="header-logout-button">
                  Wyloguj
                </Button>
              </form>
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
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between px-8">
          {/* Logo */}
          <a href={logo.url} className="flex items-center gap-2" data-test-id="header-logo-mobile">
            <img src={logo.src} className="max-h-8 dark:invert" alt={logo.alt} />
          </a>
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
                  {user ? (
                    <>
                      <span className="text-md text-muted-foreground" data-test-id="header-user-email-mobile">
                        {user.email}
                      </span>
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
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
