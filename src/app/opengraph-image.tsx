import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo-config";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          backgroundColor: "#09090b",
          backgroundImage: "radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.4 14.4L9.6 9.6M14.4 14.4L18.4 18.4M14.4 14.4L18.4 10.4M9.6 9.6L5.6 5.6M9.6 9.6L5.6 13.6M18.4 10.4V5.6H13.6M18.4 18.4H13.6V13.6M5.6 13.6H10.4V18.4M5.6 5.6H10.4V10.4"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: "#ffffff",
                margin: 0,
              }}
            >
              {siteConfig.name}
            </h1>
          </div>
          <p
            style={{
              fontSize: "32px",
              color: "#a1a1aa",
              margin: 0,
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            Track your workouts, analyze progress, and reach your fitness goals
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
