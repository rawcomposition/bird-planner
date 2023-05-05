import React from "react";
import { Header, Body } from "providers/modals";
import { Hotspot as HotspotT } from "lib/types";
import Button from "components/Button";
import Feather from "icons/Feather";
import Star from "icons/Star";
import StarOutline from "icons/StarOutline";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import ObsList from "components/ObsList";
import TextareaAutosize from "react-textarea-autosize";
import DirectionsButton from "components/DirectionsButton";
import { useUser } from "providers/user";

type Props = {
  hotspot: HotspotT;
  speciesName?: string;
};

type Info = {
  checklists: number;
  species: number;
};

export default function Hotspot({ hotspot, speciesName }: Props) {
  const { trip, appendHotspot, removeHotspot, saveNotes, selectedSpeciesCode } = useTrip();
  const [info, setInfo] = React.useState<Info>();
  const { id, name, lat, lng } = hotspot;
  const isSaved = trip?.hotspots.some((it) => it.id === id);
  const [notes, setNotes] = React.useState(trip?.hotspots.find((it) => it.id === id)?.notes);
  const { user } = useUser();
  const canEdit = user?.uid && trip?.userIds?.includes(user.uid);
  const [isEditing, setIsEditing] = React.useState(isSaved && !notes && canEdit);

  const handleSave = async () => {
    if (isSaved) {
      if (notes && !confirm("Are you sure you want to unsave this hotspot? Your notes will be lost.")) return;
      removeHotspot(id);
    } else {
      toast.success("Hotspot saved!");
      appendHotspot({ ...hotspot, species: hotspot.species || info?.species || 0 });
      if (!notes) setIsEditing(true);
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/hotspot-info?id=${id}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setInfo({ checklists: json.numChecklists, species: json.numSpecies });
      } catch (err) {
        console.log(err);
      }
    })();
  }, [id]);

  const handleSaveNotes = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    saveNotes(id, e.target.value);
  };

  const showNotes = isSaved && (isEditing || notes || canEdit);
  const showToggleBtn = canEdit && ((isEditing && !!notes) || !isEditing);

  return (
    <>
      <Header>{name}</Header>
      <Body className="max-h-[65vh] sm:max-h-full pb-10 sm:pb-4 relative min-h-[240px]">
        <div className="flex gap-2 mb-4">
          <Button
            href={`https://ebird.org/targets?r1=${id}&bmo=1&emo=12&r2=world&t2=life`}
            target="_blank"
            color="gray"
            size="sm"
          >
            <Feather className="mr-1 -mt-[3px] text-[#1c6900]" /> Targets
          </Button>
          <DirectionsButton lat={lat} lng={lng} hotspotId={id} />
          {canEdit && (
            <Button color="gray" size="sm" onClick={handleSave}>
              {isSaved ? (
                <>
                  <Star className="mr-1 -mt-[3px] text-sky-600" /> Saved
                </>
              ) : (
                <>
                  <StarOutline className="mr-1 -mt-[3px] text-sky-600" /> Save
                </>
              )}
            </Button>
          )}
        </div>
        <div className="flex gap-10 text-gray-500">
          <div className="flex flex-col text-[#1c6900]">
            <span className="text-3xl font-bold">{hotspot.species || info?.species || "--"}</span>
            <span className="text-xs">Species</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{info?.checklists?.toLocaleString() || "--"}</span>
            <span className="text-xs">Checklists</span>
          </div>
        </div>
        {showNotes && (
          <>
            <div className="flex items-center gap-3 mt-4">
              <h3 className="text-gray-700 font-bold">Notes</h3>
              {showToggleBtn && (
                <button
                  type="button"
                  onClick={() => setIsEditing((isEditing) => !isEditing)}
                  className="text-sky-600 text-[13px] font-bold px-2 border border-sky-600 rounded hover:text-sky-700 hover:border-sky-700 transition-colors"
                >
                  {isEditing ? "Done" : "Edit"}
                </button>
              )}
            </div>
            {isEditing ? (
              <TextareaAutosize
                className="mt-1 input -mx-2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
                minRows={2}
                maxRows={15}
              />
            ) : (
              <div className="mt-1 text-gray-700 text-sm relative group">{notes || "No notes"}</div>
            )}
          </>
        )}
        {selectedSpeciesCode && <ObsList locId={id} speciesCode={selectedSpeciesCode} speciesName={speciesName} />}
      </Body>
    </>
  );
}
