import { Language } from "@/types/common.type";
import { RoastRequest } from "@/types/strava.type";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const payload = (await request.json()) as RoastRequest;

    let buildPrompt = "";

    if (payload.type === "motivate") {
      buildPrompt = buildPraisePrompt(
        { ...payload },
        payload.intensity,
        payload.language
      );
    } else {
      buildPrompt = buildRoastPrompt(
        { ...payload },
        payload.intensity,
        payload.language
      );
    }

    const result = await geminiModel.generateContent(buildPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate content",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

const buildRoastPrompt = (
  data: RoastRequest,
  intensity: number = 4,
  language: Language = "en"
): string => {
  let intensityDescription =
    language === "id"
      ? "Level Brutal - Roasting yang sangat sarkastik dan pedas, untuk yang berani tantangan maksimal"
      : "Brutal Level - Very sarcastic and spicy roasting, for those who dare the maximum challenge";

  if (intensity === 1) {
    intensityDescription =
      language === "id"
        ? "Level Ringan - Roasting yang sangat halus dan playful, lebih seperti godaan ringan antar teman"
        : "Light Level - Very gentle and playful roasting, more like friendly teasing";
  } else if (intensity === 2) {
    intensityDescription =
      language === "id"
        ? "Level Sedang - Roasting yang lucu tapi tetap sopan, dengan sedikit sindiran yang menghibur"
        : "Medium Level - Funny but polite roasting with entertaining subtle jabs";
  } else if (intensity === 3) {
    intensityDescription =
      language === "id"
        ? "Level Keras - Roasting yang lebih tajam dan sarkastik, tapi masih dalam batas wajar"
        : "Hard Level - Sharper and more sarcastic roasting, but still within reasonable limits";
  }

  const basePrompt =
    language === "id"
      ? `Kamu adalah seorang pelatih fitness yang sangat witty dan sarkastik yang suka mem-roast atlet berdasarkan data Strava mereka.`
      : `You are a very witty and sarcastic fitness coach who loves to roast athletes based on their Strava data.`;

  const dataSection =
    language === "id"
      ? `Data Atlet:
    Nama: ${data.athlete.firstname} ${data.athlete.lastname} (@${data.athlete.username})
    Lokasi: ${data.athlete.city}, ${data.athlete.state}, ${data.athlete.country}
    Followers: ${data.athlete.follower_count}
    Berat: ${data.athlete.weight}kg
    FTP: ${data.athlete.ftp}w
    
    Aktivitas Terbaru (${data.activities.length} aktivitas):`
      : `Athlete Data:
    Name: ${data.athlete.firstname} ${data.athlete.lastname} (@${data.athlete.username})
    Location: ${data.athlete.city}, ${data.athlete.state}, ${data.athlete.country}
    Followers: ${data.athlete.follower_count}
    Weight: ${data.athlete.weight}kg
    FTP: ${data.athlete.ftp}w
    
    Recent Activities (${data.activities.length} activities):`;

  const statsSection =
    language === "id"
      ? `Statistik:
    - Lari terbaru: ${data.stats.recent_run_totals.count} kali lari, total ${(
          data.stats.recent_run_totals.distance / 1000
        ).toFixed(1)}km
    - Year-to-Date: ${data.stats.ytd_run_totals.count} kali lari, total ${(
          data.stats.ytd_run_totals.distance / 1000
        ).toFixed(1)}km`
      : `Statistics:
    - Recent runs: ${data.stats.recent_run_totals.count} runs, total ${(
          data.stats.recent_run_totals.distance / 1000
        ).toFixed(1)}km
    - Year-to-Date: ${data.stats.ytd_run_totals.count} runs, total ${(
          data.stats.ytd_run_totals.distance / 1000
        ).toFixed(1)}km`;

  const instructions =
    language === "id"
      ? `INSTRUKSI ROASTING:
    
    Buat roasting dalam 4 paragraf dengan struktur:
    1. Pembukaan & sapaan sarkastik dengan nama dan username
    2. Analisis data mendalam dengan fokus pada aspek yang "menarik" 
    3. Roasting signature move dari aktivitas atau pola training
    4. Penutup dengan "pujian" terselubung atau nasihat sarkastik
    
    Pastikan roasting:
    - Menggunakan Bahasa Indonesia yang natural dan gaul
    - Berdasarkan data nyata yang diberikan
    - Sesuai dengan level roasting yang dipilih
    - Menghibur tanpa menyinggung secara personal
    - Menggunakan humor Indonesia yang relate
    - Setiap paragraf 2-3 kalimat
    - Total sekitar 8-12 kalimat
    - JANGAN GUNAKAN HEADER ATAU JUDUL PARAGRAF, langsung tulis teksnya saja
    
    Mulai roasting sekarang:`
      : `ROASTING INSTRUCTIONS:
    
    Create a roast in 4 paragraphs with this structure:
    1. Opening & sarcastic greeting with name and username
    2. Deep data analysis focusing on the most "interesting" aspect
    3. Roasting signature move from activities or training patterns
    4. Closing with disguised "praise" or sarcastic advice
    
    Make sure the roasting:
    - Uses natural and casual English
    - Is based on the actual data provided
    - Matches the selected roasting level
    - Is entertaining without being personally offensive
    - Uses relatable humor
    - Each paragraph 2-3 sentences
    - Total around 8-12 sentences
    - DON'T USE HEADERS OR PARAGRAPH TITLES, just write the text directly
    
    Start roasting now:`;

  return `
    ${basePrompt}
    
    ROASTING LEVEL: ${intensityDescription}
    
    ${dataSection}
    ${data.activities
      .map(
        (act, index) =>
          `${index + 1}. ${act.name}: ${(act.distance / 1000).toFixed(
            1
          )}km, ${Math.floor(act.moving_time / 60)} ${
            language === "id" ? "menit" : "minutes"
          }, ${act.total_elevation_gain}m ${
            language === "id" ? "elevasi" : "elevation"
          }, ${language === "id" ? "jenis" : "type"}: ${act.type}`
      )
      .join("\n")}
    
    ${statsSection}
    
    ${instructions}
    `;
};

const buildPraisePrompt = (
  data: RoastRequest,
  intensity: number = 1,
  language: Language = "en"
): string => {
  let intensityDescription =
    language === "id"
      ? "Motivasi - Dorongan semangat yang hangat dan mendukung"
      : "Motivation - Warm and supportive encouragement";

  if (intensity === 2) {
    intensityDescription =
      language === "id"
        ? "Celebration - Merayakan pencapaian dengan antusiasme tinggi"
        : "Celebration - Celebrating achievements with high enthusiasm";
  } else if (intensity === 3) {
    intensityDescription =
      language === "id"
        ? "Inspirational - Pujian mendalam yang menginspirasi dan mengangkat semangat"
        : "Inspirational - Deep praise that inspires and lifts spirits";
  }

  const basePrompt =
    language === "id"
      ? `Kamu adalah seorang pelatih fitness yang sangat supportive dan inspiring yang suka merayakan pencapaian atlet berdasarkan data Strava mereka.`
      : `You are a very supportive and inspiring fitness coach who loves to celebrate athletes' achievements based on their Strava data.`;

  const dataSection =
    language === "id"
      ? `Data Atlet:
    Nama: ${data.athlete.firstname} ${data.athlete.lastname} (@${data.athlete.username})
    Lokasi: ${data.athlete.city}, ${data.athlete.state}, ${data.athlete.country}
    Followers: ${data.athlete.follower_count}
    Berat: ${data.athlete.weight}kg
    FTP: ${data.athlete.ftp}w
    
    Aktivitas Terbaru (${data.activities.length} aktivitas):`
      : `Athlete Data:
    Name: ${data.athlete.firstname} ${data.athlete.lastname} (@${data.athlete.username})
    Location: ${data.athlete.city}, ${data.athlete.state}, ${data.athlete.country}
    Followers: ${data.athlete.follower_count}
    Weight: ${data.athlete.weight}kg
    FTP: ${data.athlete.ftp}w
    
    Recent Activities (${data.activities.length} activities):`;

  const statsSection =
    language === "id"
      ? `Statistik:
    - Lari terbaru: ${data.stats.recent_run_totals.count} kali lari, total ${(
          data.stats.recent_run_totals.distance / 1000
        ).toFixed(1)}km
    - Year-to-Date: ${data.stats.ytd_run_totals.count} kali lari, total ${(
          data.stats.ytd_run_totals.distance / 1000
        ).toFixed(1)}km`
      : `Statistics:
    - Recent runs: ${data.stats.recent_run_totals.count} runs, total ${(
          data.stats.recent_run_totals.distance / 1000
        ).toFixed(1)}km
    - Year-to-Date: ${data.stats.ytd_run_totals.count} runs, total ${(
          data.stats.ytd_run_totals.distance / 1000
        ).toFixed(1)}km`;

  const instructions =
    language === "id"
      ? `INSTRUKSI PUJIAN:
    
    Buat pujian dalam 4 paragraf dengan struktur:
    1. Opening positif dengan pengakuan tulus dan menyebutkan nama
    2. Highlight pencapaian spesifik dengan data yang detail
    3. Recognition kekuatan dan kebiasaan baik dari aktivitas mereka
    4. Motivasi dan encouragement untuk masa depan
    
    Pastikan pujian:
    - Menggunakan Bahasa Indonesia yang hangat dan natural
    - Berdasarkan data nyata yang diberikan
    - Sesuai dengan intensitas pujian yang dipilih
    - Tulus dan tidak berlebihan
    - Memotivasi untuk terus berkembang
    - Menggunakan tone yang positif dan mengangkat semangat
    - Setiap paragraf 2-3 kalimat
    - Total sekitar 8-12 kalimat
    - JANGAN GUNAKAN HEADER ATAU JUDUL PARAGRAF, langsung tulis teksnya saja
    
    Mulai pujian sekarang:`
      : `PRAISE INSTRUCTIONS:
    
    Create praise in 4 paragraphs with this structure:
    1. Positive opening with sincere recognition and mentioning their name
    2. Highlight specific achievements with detailed data
    3. Recognition of strengths and good habits from their activities
    4. Motivation and encouragement for the future
    
    Make sure the praise:
    - Uses warm and natural English
    - Is based on the actual data provided
    - Matches the selected praise intensity
    - Is genuine and not excessive
    - Motivates continued growth
    - Uses a positive and uplifting tone
    - Each paragraph 2-3 sentences
    - Total around 8-12 sentences
    - DON'T USE HEADERS OR PARAGRAPH TITLES, just write the text directly
    
    Start praising now:`;

  return `
    ${basePrompt}
    
    PRAISE INTENSITY: ${intensityDescription}
    
    ${dataSection}
    ${data.activities
      .map(
        (act, index) =>
          `${index + 1}. ${act.name}: ${(act.distance / 1000).toFixed(
            1
          )}km, ${Math.floor(act.moving_time / 60)} ${
            language === "id" ? "menit" : "minutes"
          }, ${act.total_elevation_gain}m ${
            language === "id" ? "elevasi" : "elevation"
          }, ${language === "id" ? "jenis" : "type"}: ${act.type}`
      )
      .join("\n")}
    
    ${statsSection}
    
    ${instructions}
    `;
};

//     const prompt = `You are a witty comedian and fitness enthusiast expert in analyzing Strava profiles. Your task is to create a humorous roast (comedy critique) of the given Strava profile.

// CONFIGURATION:
// Language: BAHASA_INDONESIA
// Roast Intensity: EXTRA_HOT
// Target Audience: GENERAL

// ROASTING INSTRUCTIONS:
// 1. Analyze the Strava profile in detail (name, profile photo, bio, activities, stats, trophy case)
// 2. Create roasting based on the intensity level selected
// 3. Focus on elements like:
//    - Activity consistency (or inconsistency)
//    - Sport choices and preferences
//    - Suspicious or funny statistics
//    - Weird activity photos
//    - Pretentious or overly humble bio
//    - Empty or overflowing trophy case
//    - Funny activity patterns
//    - Gear choices and obsessions
//    - Caption styles and motivational quotes

// INTENSITY LEVELS:

// 🌶️ MILD (Family-Friendly):
// - Gentle teasing and playful observations
// - Focus on cute contradictions
// - Wholesome humor suitable for all ages
// - Encouraging and supportive tone throughout
// - No sarcasm, just lighthearted fun

// 🌶️🌶️ MEDIUM (Standard Comedy):
// - Moderate sarcasm and witty observations
// - Point out funny patterns with gentle mockery
// - Some eye-rolling moments but still friendly
// - Balance between roast and encouragement
// - Social media appropriate

// 🌶️🌶️🌶️ SPICY (Savage but Fair):
// - Sharp wit and clever burns
// - Call out obvious contradictions boldly
// - Use humor to highlight absurdities
// - Still respectful but with more bite
// - Comedy club level material

// 🌶️🌶️🌶️🌶️ EXTRA HOT (Brutal Honesty):
// - Ruthless but hilarious observations
// - No mercy for silly patterns
// - Maximum comedy impact
// - Still avoid personal attacks
// - Roast master level content

// LANGUAGE-SPECIFIC TONE GUIDES:

// BAHASA INDONESIA:
// - Use casual, gaul language appropriate to intensity
// - Include relevant Indonesian memes/references
// - Emoji usage: moderate to high
// - Cultural references: Indonesian pop culture, daily life

// ENGLISH:
// - Use appropriate slang and contemporary references
// - Include fitness/gym culture jokes
// - Emoji usage: moderate
// - Cultural references: Western fitness culture, memes

// SPANISH:
// - Use casual Spanish with regional neutrality
// - Include Latino humor style
// - Emoji usage: high
// - Cultural references: Universal Latino experiences

// FRENCH:
// - Use casual French with light sophistication
// - Include French wit and irony
// - Emoji usage: minimal to moderate
// - Cultural references: French lifestyle, culture

// GERMAN:
// - Use direct German humor style
// - Include efficiency/precision jokes
// - Emoji usage: minimal
// - Cultural references: German stereotypes (playfully)

// JAPANESE:
// - Use polite but humorous Japanese
// - Include otaku/anime references if appropriate
// - Emoji usage: high (including Japanese emoticons)
// - Cultural references: Japanese work culture, hobbies

// KOREAN:
// - Use casual Korean with internet slang
// - Include K-pop/K-drama references
// - Emoji usage: very high
// - Cultural references: Korean internet culture

// FORMAT OUTPUT:
// - Catchy roasting title
// - 3-5 main roasting points
// - Fun facts or observations
// - Star rating (1-5) with funny reasoning
// - Encouraging or motivational closing

// Now roast this Strava profile: https://www.strava.com/athletes/96015494`;
