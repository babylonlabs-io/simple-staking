"use client"; // Error components must be Client Components

import FourOFourErrorCharacter from "@/app/assets/404-error-character.svg";

import GenericError from "./components/Error/GenericError";

export default function Error() {
  return (
    <GenericError
      title="404"
      message="This page could not be found."
      image={FourOFourErrorCharacter}
    />
  );
}
