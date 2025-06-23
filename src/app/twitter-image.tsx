import { ImageResponse } from "next/og";
import { join } from "path";
import { readFile } from "fs/promises";

// Image metadata
export const alt = "UdyatAI: AI Career Guide & Resume Analyzer";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  // Fonts
  const interRegularData = readFile(
    join(process.cwd(), "src/assets/fonts/Inter-Regular.ttf")
  );
  const interSemiBoldData = readFile(
    join(process.cwd(), "src/assets/fonts/Inter-SemiBold.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          backgroundImage:
            "linear-gradient(to bottom right, #E0E7FF 25%, #ffffff 50%, #E0E7FF 75%)",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
            fontSize: 80,
            fontWeight: 700,
            fontFamily: '"Inter"',
            background:
              "linear-gradient(to bottom right, #000000 25%, #4a4a4a 100%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: "5rem",
            letterSpacing: "-0.02em",
          }}>
          UdyatAI
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            fontFamily: '"Inter"',
            background:
              "linear-gradient(to bottom right, #71717a 25%, #3f3f46 100%)",
            backgroundClip: "text",
            color: "transparent",
            padding: "0 50px",
            lineHeight: "2.5rem",
            letterSpacing: "-0.02em",
            textAlign: "center",
            marginTop: "20px",
          }}>
          AI Career Guide & Resume Analyzer
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await interRegularData,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: await interSemiBoldData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
