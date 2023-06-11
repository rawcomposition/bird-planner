import React from "react";
import Input from "components/Input";
import { LocationValue } from "lib/types";

declare global {
  interface Window {
    google: any;
  }
}

type Props = {
  value?: LocationValue;
  justUSA?: boolean;
  onChange: (value: LocationValue) => void;
  [key: string]: any;
};

export default function LocationSelect({ value, onChange, justUSA, ...props }: Props) {
  const label = value?.label || "";
  const inputRef = React.useRef<HTMLInputElement>();
  const isInitalizedRef = React.useRef<boolean>(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  React.useEffect(() => {
    if (isInitalizedRef.current || !window.google) {
      return;
    }
    const handlePlaceSelect = (googlePlaces: any) => {
      const place = googlePlaces.getPlace();
      onChange({
        label: place.formatted_address,
        lat: parseFloat(place.geometry.location.lat().toFixed(7)),
        lng: parseFloat(place.geometry.location.lng().toFixed(7)),
      });
    };

    const options = {
      componentRestrictions: justUSA ? { country: "us" } : undefined,
      fields: ["formatted_address", "geometry"],
    };

    const googlePlaces = new window.google.maps.places.Autocomplete(inputRef.current, options);
    googlePlaces.setFields(["formatted_address", "geometry"]);
    googlePlaces.addListener("place_changed", () => {
      handlePlaceSelect(googlePlaces);
    });
    isInitalizedRef.current = true;
  });

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = label || "";
    }
  }, [label]);

  return (
    <Input
      type="search"
      ref={inputRef}
      onKeyDown={handleKeyDown}
      defaultValue={label}
      placeholder="Enter a location"
      {...props}
    />
  );
}
