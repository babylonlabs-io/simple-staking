import FourOFourErrorCharacter from "@/ui/common/assets/404-error-character.svg";

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
