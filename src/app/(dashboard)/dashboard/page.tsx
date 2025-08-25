/* eslint-disable @next/next/no-img-element */
"use client";

import animation from "@/assets/animation/FTteNKBqLq.json";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCopy from "@/hooks/use-copy";
import {
  useCreateRoast,
  useGetActivities,
  useGetAthlete,
  useGetAthleteStats,
} from "@/services/hooks/use-strava.service";
import { Language } from "@/types/common.type";
import { RoastRequest } from "@/types/strava.type";
import axios from "axios";
import Lottie from "lottie-react";
import { Copy, CopyCheck, Download, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import Container from "@/components/container";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const router = useRouter();

  const [type, setType] = useState<"roast" | "motivate">("roast");
  const [intensity, setIntensity] = useState<number>(1);
  const [result, setResult] = useState<string>();
  const [language, setLanguage] = useState<Language>("id");
  const [isDownloading, setIsDownloading] = useState(false);

  const { handleCopy, isCopied } = useCopy();

  const { data: athlete, isLoading } = useGetAthlete();

  const { data: activities } = useGetActivities();
  const { data: stats } = useGetAthleteStats(
    { athlete_id: athlete?.id },
    { enabled: !!athlete?.id }
  );

  const createRoast = useCreateRoast({ onSuccess: (data) => setResult(data) });

  const handleLogout = useCallback(async () => {
    await axios.post("/api/auth/logout");
    router.push("/");
  }, [router]);

  const handleRoast = useCallback(async () => {
    if (athlete && activities && stats) {
      const payload: RoastRequest = {
        intensity,
        language,
        type,
        athlete: {
          username: athlete.username,
          firstname: athlete.firstname,
          lastname: athlete.lastname,
          city: athlete.city,
          state: athlete.state,
          country: athlete.country || "",
          follower_count: athlete.follower || 0,
          friend_count: athlete.friend || 0,
          weight: athlete.weight,
          ftp: athlete.ftp || null,
        },
        activities: activities.map((act) => ({
          name: act.name,
          distance: act.distance,
          moving_time: act.moving_time,
          total_elevation_gain: act.total_elevation_gain,
          type: act.type,
          average_speed: act.average_speed,
          max_speed: act.max_speed,
          average_heartrate: act.average_heartrate,
          max_heartrate: act.max_heartrate,
          suffer_score: act.suffer_score,
        })),
        stats: {
          recent_run_totals: stats.recent_run_totals,
          ytd_run_totals: stats.ytd_run_totals,
        },
      };

      createRoast.mutate(payload);
    }
  }, [athlete, activities, stats, createRoast, intensity, language, type]);

  const buttonText = {
    motivate: {
      idle: "Motivate",
      pending: "Motivating",
    },
    roast: {
      idle: "Roast",
      pending: "Roasting",
    },
  };

  const languages = [
    {
      label: "🇮🇩",
      value: "id",
    },
    {
      label: "🇬🇧",
      value: "en",
    },
  ];

  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      setIsDownloading(true);
      const imageBlob = await htmlToImage.toPng(cardRef.current, {
        backgroundColor: "#fe500d",
        cacheBust: true,
      });

      // Create download link
      const link = document.createElement("a");
      if (typeof imageBlob === "string") {
        link.href = imageBlob;
      } else {
        link.href = URL.createObjectURL(imageBlob);
      }
      link.download = `roastrava-${athlete?.username}.png`;
      link.click();

      if (typeof imageBlob !== "string") {
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("Failed to capture image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className=" flex flex-col gap-8 items-center pb-10 min-h-screen">
        <div className=" p-4 w-full flex justify-between">
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
          <Button
            variant="outline"
            onClick={handleLogout}
            className=" border-black rounded-full"
          >
            <LogOut />
            Logout
          </Button>
        </div>
        <div className=" max-w-2xl mx-auto flex flex-col p-4 gap-6 items-center justify-center">
          {isLoading ? (
            <div className="flex gap-2 items-center">
              <Skeleton className=" w-14 aspect-square rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className=" h-5 w-44" />
                <Skeleton className=" h-3 w-32" />
              </div>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <div className=" w-14 aspect-square rounded-full overflow-hidden bg-primary relative">
                <Image
                  key={athlete?.username || ""}
                  src={athlete?.profile_medium || ""}
                  alt={athlete?.username || ""}
                  fill
                  className=" object-center object-cover"
                />
              </div>
              <div className="flex flex-col">
                <p className=" font-semibold text-lg leading-tight">
                  {athlete?.firstname} {athlete?.lastname}
                </p>
                <p className=" leading-tight text-sm">@{athlete?.username}</p>
              </div>
            </div>
          )}

          <Tabs
            value={type}
            onValueChange={(value) => {
              if (value === "motivate" && intensity === 4) {
                setIntensity(3);
              }
              setType(value as "motivate" | "roast");
            }}
          >
            <TabsList className=" h-12 rounded-full">
              {["roast", "motivate"].map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className=" capitalize px-4 rounded-full text-base"
                >
                  {value} {value === "motivate" ? "✊" : "🔥"}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex gap-4 items-center w-full">
            <p className=" text-3xl">{type === "roast" ? "🧊" : "👍"}</p>
            <Slider
              value={[intensity]}
              onValueChange={(value) => setIntensity(value[0])}
              min={1}
              step={1}
              max={type === "motivate" ? 3 : 4}
              className=" w-[200px]"
            />
            <p className=" text-3xl">{type === "roast" ? "🌶️" : "🏆"}</p>
          </div>

          <Tabs
            value={language}
            onValueChange={(value) => setLanguage(value as Language)}
          >
            <TabsList className=" rounded-full">
              {languages.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className=" capitalize rounded-full text-base"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button
            onClick={handleRoast}
            disabled={
              createRoast.isPending || !athlete || !activities || !stats
            }
            size="lg"
            className=" rounded-full"
          >
            {createRoast.isPending
              ? `${buttonText[type].pending}...`
              : buttonText[type].idle}
          </Button>
        </div>
        {createRoast.isPending && (
          <Lottie
            animationData={animation}
            loop
            className="aspect-square w-24"
          />
        )}
        {!createRoast.isPending && result && (
          <div className=" w-full max-w-2xl">
            <div ref={cardRef} className=" w-full p-6">
              <div className=" bg-white   w-full border border-black rounded-3xl p-6 shadow-[6px_6px_0_#000] mx-auto flex flex-col gap-6">
                <div className="flex gap-2 items-center">
                  <div className=" w-14 aspect-square rounded-full overflow-hidden bg-primary relative">
                    <img
                      src={athlete?.profile_medium || ""}
                      alt={athlete?.username || ""}
                      className=" object-center object-cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className=" font-semibold leading-tight text-lg">
                      {athlete?.firstname} {athlete?.lastname}
                    </p>
                    <p className=" text-sm leading-tight">
                      @{athlete?.username}
                    </p>
                  </div>
                </div>
                <div
                  className=" whitespace-break-spaces text-justify text-base"
                  dangerouslySetInnerHTML={{
                    __html: result,
                  }}
                />
                <div className="flex gap-2 text-base">
                  <p>#roastrava</p>
                  <p>#strava</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className=" text-center">
                    {process.env.BASE_URL || "roastrava.com"}
                  </p>
                  <div className=" w-28 aspect-[342/147] relative ">
                    <img
                      src="/powered-by-strava.png"
                      key="powered-by-strava"
                      alt="powered-by-strava"
                      className=" object-center object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="  flex justify-center gap-4 mt-8">
              <Button
                className=" bg-white rounded-full border-black"
                size="lg"
                variant="outline"
                onClick={() => handleCopy(result + "\n\n#roastrava #strava")}
              >
                {isCopied ? <CopyCheck /> : <Copy />}

                {isCopied ? "Copied" : "Copy"}
              </Button>
              <Button
                className=" bg-white rounded-full border-black"
                size="lg"
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
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
    </>
  );
}
