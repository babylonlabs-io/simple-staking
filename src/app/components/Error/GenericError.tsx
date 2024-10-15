import Image from "next/image";

import GenericErrorCharacter from "@/app/assets/generic-error-character.svg";

import { Footer } from "../Footer/Footer";
import { SimplifiedHeader } from "../Header/SimplifiedHeader";

interface Props {
  title?: string;
  message?: string;
  image?: any;
}

export default function GenericError({
  title = "Something goes wrong",
  message = "There was an unexpected error that caused the website to crash.  You can report the issue in our forum, or reach out via email for assistance. Together, we can enhance our platform’s reliability!",
  image = GenericErrorCharacter,
}: Props) {
  return (
    <div className="h-full min-h-svh w-full flex flex-col justify-between">
      <SimplifiedHeader />
      <div className="container mx-auto flex justify-center p-6">
        <div className="flex flex-row items-center justify-evenly">
          <div className="grow-[5] flex flex-col items-center gap-6">
            <div className="text-3xl font-semibold md:text-7xl">{title}</div>
            <div className="md:hidden">
              <Image src={GenericErrorCharacter} alt="Generic Error" />
            </div>
            <div className="divider my-1" />
            <div className="text-sm">{message}</div>
            <div className="flex flex-col gap-3 self-stretch md:flex-row md:w-[400px]">
              <button className="btn btn-primary flex-1">Email Us</button>
              <button className="btn btn-outline flex-1">Report the Bug</button>
            </div>
          </div>
          <div className="hidden grow-[3] md:flex">
            <Image src={image} alt="Generic Error" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
