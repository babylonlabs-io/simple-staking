"use client";

import { Button, Heading, Text } from "@babylonlabs-io/bbn-core-ui";
import Image from "next/image";

import BitcoinBlock from "@/app/assets/bitcoin-block.svg";
import { Container } from "@/app/components/Container/Container";

import { Footer } from "../Footer/Footer";
import { SimplifiedHeader } from "../Header/SimplifiedHeader";

interface Props {
  title?: string;
  message?: string;
  image?: any;
}

export default function GenericError({
  title = "Oops! Something Went Wrong",
  message = `It looks like we’re experiencing a temporary issue on our end.
  Our team is already on it, and we’ll have things back to normal as soon as possible. 
  Please check back shortly, and thank you for your patience!`,
  image = BitcoinBlock,
}: Props) {
  return (
    <div className="h-full min-h-svh w-full flex flex-col justify-between">
      <SimplifiedHeader isMinimal />

      <Container className="py-12 px-6">
        <div className="flex flex-col items-center justify-center gap-8">
          <Image
            src={image}
            alt="Generic Error"
            className="w-full h-auto max-w-[120px]"
          />
          <Heading variant="h5" className="text-accent-primary">
            {title}
          </Heading>
          <div className="w-full max-w-[650px]">
            <Text variant="body1" className="text-center text-accent-primary">
              {message}
            </Text>
          </div>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => history.go()}
          >
            Back to homepage
          </Button>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
