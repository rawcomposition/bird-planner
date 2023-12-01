import React from "react";
import { Body } from "providers/modals";
import { Hotspot as HotspotT } from "lib/types";
import Button from "components/Button";
import Feather from "icons/Feather";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import DirectionsButton from "components/DirectionsButton";
import { translate, isRegionEnglish, fullMonths } from "lib/helpers";
import RecentSpeciesList from "components/RecentSpeciesList";
import HotspotStats from "components/HotspotStats";
import RecentChecklistList from "components/RecentChecklistList";
import clsx from "clsx";
import InputNotes from "components/InputNotes";
import { Menu } from "@headlessui/react";
import VerticalDots from "icons/VerticalDots";
import HotspotTargets from "components/HotspotTargets";
import HotspotFavs from "components/HotspotFavs";
import PlusIcon from "icons/Plus";

type Props = {
  hotspot: HotspotT;
  speciesName?: string;
};

export default function Hotspot({ hotspot, speciesName }: Props) {
  const {
    trip,
    canEdit,
    appendHotspot,
    removeHotspot,
    saveHotspotNotes,
    selectedSpeciesCode,
    setTranslatedHotspotName,
    resetTranslatedHotspotName,
  } = useTrip();
  const { id, lat, lng } = hotspot;
  const savedHotspot = trip?.hotspots.find((it) => it.id === id);
  const isSaved = !!savedHotspot;
  const name = savedHotspot?.name || hotspot.name;
  const notes = savedHotspot?.notes;
  const originalName = savedHotspot?.originalName;
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [tab, setTab] = React.useState(speciesName ? "checklists" : "needs");

  const tabs = [
    {
      label: "Recent Needs",
      title: "",
      id: "needs",
    },
    {
      label: "Checklists",
      title: "",
      id: "checklists",
    },
  ];

  if (isSaved) {
    tabs.push({
      label: hotspot?.targetsId ? "Targets" : "Import Targets",
      title: "",
      id: "targets",
    });
  }

  const handleSave = async () => {
    if (isSaved) {
      if (notes && !confirm("Are you sure you want to remove this hotspot from your trip? Your notes will be lost."))
        return;
      removeHotspot(id);
    } else {
      toast.success("Hotspot added to trip!");
      appendHotspot({ ...hotspot, species: hotspot.species || 0 });
    }
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    const translatedName = await translate(name);
    setIsTranslating(false);
    if (!translatedName) return;
    if (translatedName === name) {
      toast("No translation found");
      return;
    }
    setTranslatedHotspotName(id, translatedName);
  };

  const canTranslate = isSaved && !isRegionEnglish(trip?.region || "");
  const tripRangeLabel =
    trip?.startMonth && trip?.endMonth
      ? trip.startMonth === trip.endMonth
        ? fullMonths[trip.startMonth - 1]
        : `${fullMonths[trip.startMonth - 1]} - ${fullMonths[trip.endMonth - 1]}`
      : "";

  return (
    <>
      <div className="pl-4 sm:pl-6 pr-12 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-medium">{name}</h3>
        {canTranslate && (
          <div className="mt-0.5 text-[12px]">
            {!originalName && !isTranslating && (
              <button type="button" className="block text-sky-600" onClick={handleTranslate}>
                Translate
              </button>
            )}
            {isTranslating && <div className="text-gray-400">Translating...</div>}
            {originalName && (
              <div className="text-gray-500">
                Original: {originalName} -{" "}
                <button type="button" className="text-sky-600" onClick={() => resetTranslatedHotspotName(id)}>
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Body className="pb-10 sm:pb-4 relative">
        <div className="flex gap-2 mb-6">
          <Button
            href={`https://ebird.org/targets?r1=${id}&bmo=1&emo=12&r2=world&t2=life`}
            target="_blank"
            color="gray"
            size="sm"
          >
            <Feather className="mr-1 -mt-[3px] text-[#1c6900]" /> Targets
          </Button>
          <DirectionsButton lat={lat} lng={lng} hotspotId={id} />
          <Button
            href={`https://ebird.org/hotspot/${id}`}
            target="_blank"
            color="gray"
            size="sm"
            className="inline-flex items-center"
          >
            <img src="/ebird.png" width={48} />
          </Button>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="text-[14px] rounded text-gray-600 bg-gray-100 px-2 py-[10px] inline-flex items-center">
              <VerticalDots />
            </Menu.Button>
            <Menu.Items className="absolute text-sm -right-2 top-10 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-2">
              <Menu.Item>
                <a
                  href={`https://ebird.org/hotspot/${id}/media?yr=all&m=`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600"
                >
                  Illustrated Checklist
                </a>
              </Menu.Item>
              {canEdit && isSaved && (
                <Menu.Item>
                  <button type="button" onClick={handleSave} className="inline-flex items-center gap-1 text-red-700">
                    Remove from trip
                  </button>
                </Menu.Item>
              )}
            </Menu.Items>
          </Menu>
        </div>
        <HotspotStats id={id} speciesTotal={hotspot.species} />
        <HotspotFavs locId={id} />

        {canEdit && !isSaved && (
          <button
            type="button"
            onClick={handleSave}
            className="w-full text-left bg-sky-50 rounded-sm px-2 py-2 border text-sm font-bold border-sky-100 text-sky-600 mt-4 flex items-center gap-2"
          >
            <PlusIcon className="text-lg text-sky-600" /> Add to trip
          </button>
        )}

        {isSaved && <InputNotes key={id} value={notes} onBlur={(value) => saveHotspotNotes(id, value)} />}
        <div className="-mx-4 sm:-mx-6 mb-3">
          <nav className="mt-6 flex gap-4 bg-gray-100 px-6">
            {tabs.map(({ label, id, title }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={clsx(
                  "text-sm font-medium text-gray-900 border-b-2 transition-colors pb-3 pt-3",
                  tab === id ? "border-gray-500" : "border-transparent hover:border-gray-500"
                )}
                title={title}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="sm:-mx-1.5">
          {tab === "needs" && <RecentSpeciesList locId={id} />}
          {tab === "checklists" && (
            <RecentChecklistList locId={id} speciesCode={selectedSpeciesCode} speciesName={speciesName} />
          )}
          {tab === "targets" && <HotspotTargets locId={id} tripRangeLabel={tripRangeLabel} />}
        </div>
      </Body>
    </>
  );
}
