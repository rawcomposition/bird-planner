import { MarkerIcon } from "lib/types";
import Marker from "icons/Marker";
import Star from "icons/Star";
import House from "icons/House";
import Airbnb from "icons/Airbnb";
import Campground from "icons/Campground";
import Bins from "icons/Bins";
import clsx from "clsx";

type Props = {
  icon: MarkerIcon;
  darkIcon?: boolean;
  color?: string;
  offset?: boolean;
  className?: string;
  showStroke?: boolean;
};

const iconMap: Record<MarkerIcon, any> = {
  [MarkerIcon.HOTSPOT]: Star,
  [MarkerIcon.HOUSE]: House,
  [MarkerIcon.TENT]: Campground,
  [MarkerIcon.AIRBNB]: Airbnb,
  [MarkerIcon.BINS]: Bins,
};

const defaultColors: Record<MarkerIcon, string> = {
  [MarkerIcon.HOTSPOT]: "#fac500",
  [MarkerIcon.HOUSE]: "#0369a1",
  [MarkerIcon.TENT]: "#65a30d",
  [MarkerIcon.AIRBNB]: "#ff385b",
  [MarkerIcon.BINS]: "#b45309",
};

export default function MarkerWithIcon({ icon, darkIcon, color, offset = true, showStroke = true, className }: Props) {
  const Icon = iconMap[icon];
  return (
    <div className={clsx("relative cursor-pointer", offset && "-mt-[16px]", className)}>
      <Marker color={color || defaultColors[icon]} showStroke={showStroke} className="w-[24px] h-[32px]" />
      <Icon
        className={clsx(
          "absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[14px]",
          darkIcon ? "text-gray-700" : "text-gray-100"
        )}
      />
    </div>
  );
}
