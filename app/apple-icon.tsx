import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: "40px",
      }}
    >
      <div
        style={{
          fontFamily: "serif",
          fontSize: 120,
          fontWeight: 400,
          color: "#f5f5f5",
        }}
      >
        r
      </div>
    </div>,
    {
      ...size,
    },
  )
}
