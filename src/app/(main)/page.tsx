"use client";

import Container from "@/components/container";
import { Sparkle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import Marquee from "react-fast-marquee";

export default function Page() {
  const handleConnect = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    if (!clientId) {
      console.log(
        "Strava Client ID belum diset. Silakan setup environment variables terlebih dahulu."
      );
      return;
    }

    const redirectUri = encodeURIComponent(
      `${
        process.env.BASE_URL || "http://localhost:3000"
      }/api/auth/strava/callback`
    );
    const scope = "read,activity:read";

    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

    window.location.href = stravaAuthUrl;
  }, []);

  const items = [
    "Roast",
    "Motivate",
    "Inspirational",
    "Celebration",
    "Analyze",
    "Decode",
    "Reveal",
    "Uncover",
    "Challenge",
    "Push",
    "Elevate",
    "Transform",
    "Ignite",
    "Spark",
    "Fuel",
    "Drive",
  ];

  return (
    <div className=" min-h-screen w-full">
      <Container className=" py-4">
        <div className=" flex justify-between items-center w-full">
          <div className="flex gap-1 items-center ">
            <div className=" h-12 aspect-square relative">
              <Image
                src="/logo.png"
                fill
                className=" object-cover object-center"
                alt="roastrava"
              />
            </div>
            <p className=" text-lg font-semibold ">Roastrava</p>
          </div>
          <button
            onClick={handleConnect}
            className=" rounded-full overflow-hidden w-fit cursor-pointer  h-12 relative aspect-[474/96] "
          >
            <Image
              src="/btn_strava_connect_with_orange_x2.svg"
              fill
              className=" object-center object-cover"
              alt=""
            />
          </button>
        </div>
      </Container>

      <Container className=" p-4 h-full lg:h-[768px] py-10">
        <div className="flex items-center flex-col lg:flex-row h-full w-full justify-between gap-10">
          <div className="flex flex-col gap-4 max-w-2xl">
            <h1 className=" text-[64px] font-black leading-tight">
              Get <span className=" text-primary">Roasted</span>,
              <br />
              Get <span className=" text-primary">Better!</span>
            </h1>
            <p>
              Think you&apos;re fast? Think again. Upload your Strava profile
              and get brutally honest roasting based on cold, hard data. Your
              ego will hate us, but your friends will love sharing it.
            </p>
            <button
              onClick={handleConnect}
              className=" rounded-full overflow-hidden w-fit cursor-pointer  h-12 relative aspect-[474/96] "
            >
              <Image
                src="/btn_strava_connect_with_orange_x2.svg"
                fill
                className=" object-center object-cover"
                alt=""
              />
            </button>
          </div>

          <div className=" w-full lg:w-[480px] aspect-[1300/1436] relative">
            <Image
              src="/hero.png"
              fill
              alt=""
              className=" object-contain object-center"
            />
          </div>
        </div>
      </Container>
      <Marquee
        className=" gap-10 py-10 bg-primary/10 text-primary"
        speed={10 * items.length}
      >
        {items.map((item, i) => (
          <div key={i} className=" flex items-center">
            <p className=" text-5xl px-12 font-bold uppercase">{item}</p>
            <div className=" px-12">
              <Sparkle size={60} />
            </div>
          </div>
        ))}
      </Marquee>
      <div className=" w-full bg-black">
        <Container className="  py-10">
          <p className=" text-white">
            by{" "}
            <Link
              href="https://www.julianreza.com/"
              target="_blank"
              className=" font-medium"
            >
              Julian Reza
            </Link>
          </p>
        </Container>
      </div>
    </div>
  );
}
