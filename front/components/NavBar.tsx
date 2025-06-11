"use client";

import * as React from "react";

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Catégories",
    href: "/categories",
    description:
      "Consulte toutes les catégories disponibles pour jouer au Petit Bac.",
  },
  {
    title: "Personnaliser",
    href: "/personnaliser",
    description:
      "Crée ou modifie tes propres catégories pour des parties sur mesure.",
  },
  {
    title: "Proposer une catégorie",
    href: "/proposer",
    description:
      "Suggère une nouvelle catégorie à ajouter au jeu et contribue à enrichir la base.",
  },
];

const homeLinks: { title: string; href: string; description: string }[] = [
  {
    title: "Découvrir les règles",
    description:
      "Un jeu de lettres pensé avec soin, pour des moments ludiques et stylés.",
    href: "/",
  },
  {
    title: "Comment jouer ?",
    description:
      "Un jeu rapide à comprendre : une lettre, des catégories, des idées à trouver.",
    href: "/",
  },
  {
    title: "Parcourir le dictionnaire",
    description: "Des mots validés, des idées neuves : ne séchez plus jamais.",
    href: "/",
  },
];

export function NavBar() {
  const [isActivate, setIsActivate] = React.useState<boolean>(false);
  const linksView = React.useRef<HTMLDivElement | null>(null);

  const onClick = () => {
    if (!linksView.current) return;
    const isShown = linksView.current?.style.transform === "translateY(100%)";

    if (!isShown) {
      linksView.current.style.transform = "translateY(100%)";
      setIsActivate(true);
    } else {
      linksView.current.style.transform = "translateY(0)";
      setIsActivate(false);
    }
  };

  return (
    <>
      <div className="hidden md:block fixed top-0 left-0 w-full">
        <div className="py-4 bg-white w-full">
          <NavigationMenu className="container mx-auto" viewport={true}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Home</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mt-4 mb-2 text-lg font-medium">
                            Petit-bac
                          </div>
                          <p className="text-muted-foreground text-sm leading-tight">
                            Un jeu de lettres pensé avec soin, pour des moments
                            ludiques et stylés.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/docs" title="Règles">
                      Un jeu rapide à comprendre : une lettre, des catégories,
                      des idées à trouver.
                    </ListItem>
                    <ListItem href="/docs/installation" title="Comment jouer ?">
                      Découvrez comment démarrer une partie, inviter vos amis et
                      jouer en quelques clics.
                    </ListItem>
                    <ListItem
                      href="/docs/primitives/typography"
                      title="Dictionnaire"
                    >
                      Des mots validés, des idées neuves : ne séchez plus
                      jamais.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Catégories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 lg:w-[500px] lg:grid-cols-2 xl:w-[600px]">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <a href="/">Docs</a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      <div className="block md:hidden fixed top-0 left-0 w-full z-50">
        <div className="py-4 bg-white w-full flex justify-end">
          <button
            className="flex flex-col items-center w-[50px] h-[30px] rounded-md p-2 mr-2 justify-between cursor-pointer relative"
            onClick={onClick}
          >
            <div
              className={cn(
                "w-full h-[2px] bg-black rounded-md duration-300 transition-transform",
                isActivate ? "w-[80%] rotate-45 top-1/2 absolute" : "rotate-0"
              )}
            />
            <div
              className={cn(
                "w-full h-[2px] bg-black rounded-md duration-300 transition-transform",
                isActivate ? "w-[80%] -rotate-45 top-1/2 absolute" : "rotate-0"
              )}
            />
          </button>
        </div>
      </div>
      <div
        ref={linksView}
        className="flex md:hidden bg-white size-full absolute -top-[100%] transition-transform duration-500 z-40 items-center justify-center"
      >
        <ul className="flex flex-col gap-2">
          <li>
            <Dialog>
              <DialogTrigger className="hover:underline">Home</DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="text-left">
                  <DialogTitle>Le petit-bac</DialogTitle>
                  <DialogDescription>
                    Un jeu de lettres pensé avec soin, pour des moments ludiques
                    et stylés.
                  </DialogDescription>
                </DialogHeader>

                <ul className="flex flex-col gap-2">
                  {homeLinks.map((link) => {
                    return (
                      <li className="relative before:content-[''] before:w-[2px] before:h-full before:absolute before:top-0 before:-left-2 before:bg-black">
                        <MobileListItem href={link.href} title={link.title}>
                          <p className="">{link.description}</p>
                        </MobileListItem>
                      </li>
                    );
                  })}
                </ul>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Annuler</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </li>
          <li>
            <Dialog>
              <DialogTrigger className="hover:underline">
                Catégories
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="text-left">
                  <DialogTitle>Le petit-bac</DialogTitle>
                  <DialogDescription>
                    Un jeu de lettres pensé avec soin, pour des moments ludiques
                    et stylés.
                  </DialogDescription>
                </DialogHeader>
                <ul className="flex flex-col gap-2">
                  {components.map((link) => {
                    return (
                      <li className="relative before:content-[''] before:w-[2px] before:h-full before:absolute before:top-0 before:-left-2 before:bg-black">
                        <MobileListItem href={link.href} title={link.title}>
                          <p className="">{link.description}</p>
                        </MobileListItem>
                      </li>
                    );
                  })}
                </ul>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Annuler</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </li>
          <li>
            <a href="/" className="hover:underline">
              Docs
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <a href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

function MobileListItem({
  title,
  children,
  href,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href}>
      <div className="text-sm leading-none font-medium">{title}</div>
      <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
        {children}
      </p>
    </a>
  );
}
