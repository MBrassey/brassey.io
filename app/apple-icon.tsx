import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "#000102",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "96px",
          height: "96px",
          background: "#4B7F9B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotate(45deg)",
          boxShadow: "0 0 28px rgba(75, 127, 155, 0.5)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "10px solid #000102",
            display: "flex",
          }}
        />
      </div>
    </div>,
    {
      ...size,
    },
  )
}
