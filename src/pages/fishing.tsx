import Head from "next/head";

import type { FishType } from "@/types/items";

import fishes from "@/data/fish.json";
import objects from "@/data/objects.json";
import achievements from "@/data/achievements.json";

import { useContext, useEffect, useState } from "react";
import { PlayersContext } from "@/contexts/players-context";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FilterButton } from "@/components/filter-btn";
import { FishSheet } from "@/components/sheets/fish-sheet";
import { BooleanCard } from "@/components/cards/boolean-card";
import { Command, CommandInput } from "@/components/ui/command";
import { AchievementCard } from "@/components/cards/achievement-card";

const reqs = {
  Fisherman: 10,
  "Ol' Mariner": 24,
  "Master Angler": Object.keys(fishes).length,
  "Mother Catch": 100,
};

export default function Fishing() {
  const [open, setIsOpen] = useState(false);
  const [fish, setFish] = useState<FishType | null>(null);
  const [fishCaught, setFishCaught] = useState<Set<number>>(new Set());

  const [search, setSearch] = useState("");
  const [_filter, setFilter] = useState("all");

  const { activePlayer } = useContext(PlayersContext);

  useEffect(() => {
    if (activePlayer) {
      setFishCaught(new Set(activePlayer?.fishing?.fishCaught ?? []));
    }
  }, [activePlayer]);

  const getAchievementProgress = (name: string) => {
    let completed = false;
    let additionalDescription = "";
    if (!activePlayer) {
      return { completed, additionalDescription };
    }

    if (name === "Mother Catch") {
      const totalCaught = activePlayer?.fishing?.totalCaught ?? 0;
      completed = totalCaught >= reqs[name];
      if (!completed) {
        additionalDescription = ` - ${reqs[name] - totalCaught} more`;
      }
    } else {
      completed = fishCaught.size >= reqs[name as keyof typeof reqs];
      if (!completed) {
        additionalDescription = ` - ${
          reqs[name as keyof typeof reqs] - fishCaught.size
        } more`;
      }
    }
    return { completed, additionalDescription };
  };

  return (
    <>
      <Head>
        <title>stardew.app | Fishing Tracker</title>
        <meta
          name="description"
          content="Track your Stardew Valley fishing progress and optimize your angling skills. Monitor your catch count, rare fish, and tackle usage to become a master angler. Discover the best fishing spots, seasons, and weather conditions for each fish. Take your fishing game to the next level and aim for 100% completion in Stardew Valley."
        />
        <meta
          name="og:description"
          content="Track your Stardew Valley fishing progress and optimize your angling skills. Monitor your catch count, rare fish, and tackle usage to become a master angler. Discover the best fishing spots, seasons, and weather conditions for each fish. Take your fishing game to the next level and aim for 100% completion in Stardew Valley."
        />
        <meta
          name="twitter:description"
          content="Track your Stardew Valley fishing progress and optimize your angling skills. Monitor your catch count, rare fish, and tackle usage to become a master angler. Discover the best fishing spots, seasons, and weather conditions for each fish. Take your fishing game to the next level and aim for 100% completion in Stardew Valley."
        />
        <meta
          name="keywords"
          content="stardew valley fishing tracker, stardew valley fish tracker, stardew valley fishing progress, stardew valley angler, stardew valley fishing spots, stardew valley fish checklist, stardew valley rare fish, stardew valley fishing seasons, stardew valley tackle usage, stardew valley fishing guide, stardew valley 100% completion, stardew valley perfection tracker, stardew valley, stardew, stardew fishing, stardew valley fish, stardew valley, stardew, stardew checkup, stardew bundles, stardew 100% completion, stardew perfection tracker, stardew, valley"
        />
      </Head>
      <main
        className={`flex min-h-screen md:border-l border-neutral-200 dark:border-neutral-800 pt-2 pb-8 px-5 md:px-8`}
      >
        <div className="mx-auto w-full space-y-4 mt-4">
          <h1 className="ml-1 text-2xl font-semibold text-gray-900 dark:text-white">
            Fishing Tracker
          </h1>
          {/* Achievements Section */}
          <Accordion type="single" collapsible defaultValue="item-1" asChild>
            <section className="space-y-3">
              <AccordionItem value="item-1">
                <AccordionTrigger className="ml-1 text-xl font-semibold text-gray-900 dark:text-white pt-0">
                  Achievements
                </AccordionTrigger>
                <AccordionContent asChild>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Object.values(achievements)
                      .filter((a) => a.description.includes("fish"))
                      .map((a) => {
                        const { completed, additionalDescription } =
                          getAchievementProgress(a.name);

                        return (
                          <AchievementCard
                            key={a.id}
                            achievement={a}
                            completed={completed}
                            additionalDescription={additionalDescription}
                          />
                        );
                      })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </section>
          </Accordion>
          {/* All Fish Section */}
          <section className="space-y-3">
            <h2 className="ml-1 text-xl font-semibold text-gray-900 dark:text-white">
              All Fish
            </h2>
            {/* Filters */}
            <div className="grid grid-cols-1 lg:flex justify-between gap-2">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:flex">
                <FilterButton
                  target={"0"}
                  _filter={_filter}
                  title={`Incomplete (${
                    Object.keys(fishes).length - fishCaught.size
                  })`}
                  setFilter={setFilter}
                />
                <FilterButton
                  target={"2"}
                  _filter={_filter}
                  title={`Completed (${fishCaught.size})`}
                  setFilter={setFilter}
                />
              </div>
              <Command className="border border-b-0 max-w-xs dark:border-neutral-800">
                <CommandInput
                  onValueChange={(v) => setSearch(v)}
                  placeholder="Search Fish"
                />
              </Command>
            </div>
            {/* Fish Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Object.values(fishes)
                .filter((f) => {
                  if (!search) return true;
                  const name =
                    objects[f.itemID.toString() as keyof typeof objects].name;
                  return name.toLowerCase().includes(search.toLowerCase());
                })
                .filter((f) => {
                  if (_filter === "0") {
                    return !fishCaught.has(f.itemID); // incompleted
                  } else if (_filter === "2") {
                    return fishCaught.has(f.itemID); // completed
                  } else return true; // all
                })
                .map((f) => (
                  <BooleanCard
                    key={f.itemID}
                    item={f as FishType}
                    completed={fishCaught.has(f.itemID)}
                    setIsOpen={setIsOpen}
                    setObject={setFish}
                    type="fish"
                  />
                ))}
            </div>
          </section>
        </div>
        <FishSheet open={open} setIsOpen={setIsOpen} fish={fish} />
      </main>
    </>
  );
}
